import requests
import json

BASE_URL = "http://localhost:8001/api"

def test_topic_creation():
    print("Testing topic creation...")
    response = requests.post(f"{BASE_URL}/topics", json={"title": "Should AI be used in education?"})
    if response.status_code == 200:
        topic = response.json()
        print(f"✓ Topic created: {topic['title']} (ID: {topic['id']})")
        return topic['id']
    else:
        print(f"✗ Failed to create topic: {response.status_code}")
        return None

def test_get_topics():
    print("\nTesting get topics...")
    response = requests.get(f"{BASE_URL}/topics")
    if response.status_code == 200:
        topics = response.json()
        print(f"✓ Retrieved {len(topics)} topics")
        return topics
    else:
        print(f"✗ Failed to get topics: {response.status_code}")
        return []

def test_add_argument(topic_id):
    print(f"\nTesting add argument to topic {topic_id}...")
    argument = {
        "point": "AI can personalize learning experiences",
        "supporting_facts": ["Adaptive learning systems", "Individual pace adjustment"],
        "side": "for"
    }
    response = requests.post(f"{BASE_URL}/topics/{topic_id}/arguments", json=argument)
    if response.status_code == 200:
        topic = response.json()
        print(f"✓ Argument added. Topic now has {len(topic['arguments_for'])} for arguments")
        return True
    else:
        print(f"✗ Failed to add argument: {response.status_code}")
        return False

def test_ai_generation():
    print("\nTesting AI argument generation...")
    response = requests.post(f"{BASE_URL}/generate-arguments", json={"topic": "Should AI be used in education?"})
    if response.status_code == 200:
        data = response.json()
        print(f"✓ AI generated arguments for: {data['topic']}")
        print(f"  For arguments: {len(data['arguments_for'])}")
        print(f"  Against arguments: {len(data['arguments_against'])}")
        return True
    else:
        print(f"✗ Failed to generate AI arguments: {response.status_code}")
        print(response.text)
        return False

if __name__ == "__main__":
    print("=== Debate Prep Pad API Tests ===")

    # Test basic API
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"API Status: {response.json()['message']}")
    except Exception as e:
        print(f"API not accessible: {e}")
        exit(1)

    # Run tests
    topic_id = test_topic_creation()
    test_get_topics()
    if topic_id:
        test_add_argument(topic_id)
    test_ai_generation()

    print("\n=== Tests Complete ===")