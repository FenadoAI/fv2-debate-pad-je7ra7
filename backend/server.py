from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import json
# import google.generativeai as genai


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure Gemini AI
# genai.configure(api_key=os.environ['GEMINI_API_KEY'])
# model = genai.GenerativeModel("gemini-2.0-flash-exp")

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Argument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    point: str
    supporting_facts: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Topic(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    arguments_for: List[Argument] = []
    arguments_against: List[Argument] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TopicCreate(BaseModel):
    title: str

class ArgumentCreate(BaseModel):
    point: str
    supporting_facts: List[str] = []
    side: str  # "for" or "against"

class AIGenerateRequest(BaseModel):
    topic: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Debate Prep Pad API"}

# Topic Routes
@api_router.post("/topics", response_model=Topic)
async def create_topic(topic_input: TopicCreate):
    topic = Topic(title=topic_input.title)
    await db.topics.insert_one(topic.dict())
    return topic

@api_router.get("/topics", response_model=List[Topic])
async def get_topics():
    topics_data = await db.topics.find().sort("created_at", -1).to_list(1000)
    return [Topic(**topic) for topic in topics_data]

@api_router.get("/topics/{topic_id}", response_model=Topic)
async def get_topic(topic_id: str):
    topic_data = await db.topics.find_one({"id": topic_id})
    if not topic_data:
        raise HTTPException(status_code=404, detail="Topic not found")
    return Topic(**topic_data)

@api_router.delete("/topics/{topic_id}")
async def delete_topic(topic_id: str):
    result = await db.topics.delete_one({"id": topic_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Topic not found")
    return {"message": "Topic deleted successfully"}

# Argument Routes
@api_router.post("/topics/{topic_id}/arguments", response_model=Topic)
async def add_argument(topic_id: str, argument_input: ArgumentCreate):
    topic_data = await db.topics.find_one({"id": topic_id})
    if not topic_data:
        raise HTTPException(status_code=404, detail="Topic not found")

    topic = Topic(**topic_data)
    new_argument = Argument(
        point=argument_input.point,
        supporting_facts=argument_input.supporting_facts
    )

    if argument_input.side == "for":
        topic.arguments_for.append(new_argument)
    elif argument_input.side == "against":
        topic.arguments_against.append(new_argument)
    else:
        raise HTTPException(status_code=400, detail="Side must be 'for' or 'against'")

    topic.updated_at = datetime.utcnow()
    await db.topics.replace_one({"id": topic_id}, topic.dict())
    return topic

@api_router.delete("/topics/{topic_id}/arguments/{argument_id}")
async def delete_argument(topic_id: str, argument_id: str):
    topic_data = await db.topics.find_one({"id": topic_id})
    if not topic_data:
        raise HTTPException(status_code=404, detail="Topic not found")

    topic = Topic(**topic_data)

    # Remove from arguments_for
    topic.arguments_for = [arg for arg in topic.arguments_for if arg.id != argument_id]
    # Remove from arguments_against
    topic.arguments_against = [arg for arg in topic.arguments_against if arg.id != argument_id]

    topic.updated_at = datetime.utcnow()
    await db.topics.replace_one({"id": topic_id}, topic.dict())
    return {"message": "Argument deleted successfully"}

# AI Generation Route - Temporarily using mock data
@api_router.post("/generate-arguments")
async def generate_arguments(request: AIGenerateRequest):
    # Mock data for now
    return {
        "topic": request.topic,
        "arguments_for": [
            {
                "point": "Personalized learning experiences",
                "supporting_facts": ["AI can adapt to individual learning styles", "Provides customized pace of learning"]
            },
            {
                "point": "24/7 availability for student support",
                "supporting_facts": ["AI tutors don't need breaks", "Instant feedback and help"]
            },
            {
                "point": "Enhanced accessibility for special needs",
                "supporting_facts": ["Text-to-speech capabilities", "Visual recognition for learning disabilities"]
            }
        ],
        "arguments_against": [
            {
                "point": "Lack of human emotional connection",
                "supporting_facts": ["Students need empathy and understanding", "AI cannot provide emotional support"]
            },
            {
                "point": "Over-dependence on technology",
                "supporting_facts": ["Reduces critical thinking skills", "Creates technology addiction"]
            },
            {
                "point": "Privacy and data security concerns",
                "supporting_facts": ["Student data collection issues", "Potential misuse of personal information"]
            }
        ]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
