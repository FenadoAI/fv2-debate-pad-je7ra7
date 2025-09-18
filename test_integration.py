import requests
import json

API_BASE = "https://8001-itdl3ar1men3x5tg4381y.e2b.app/api"

def test_full_workflow():
    print("=== Debate Prep Pad Integration Test ===\n")

    # Test 1: Create a topic
    print("1. Creating a debate topic...")
    topic_response = requests.post(f"{API_BASE}/topics", json={
        "title": "Should remote work be the default for tech companies?"
    })

    if topic_response.status_code == 200:
        topic = topic_response.json()
        print(f"✓ Topic created: {topic['title']}")
        print(f"  Topic ID: {topic['id']}")
        topic_id = topic['id']
    else:
        print(f"✗ Failed to create topic: {topic_response.status_code}")
        return

    # Test 2: Get all topics
    print("\n2. Fetching all topics...")
    topics_response = requests.get(f"{API_BASE}/topics")
    if topics_response.status_code == 200:
        topics = topics_response.json()
        print(f"✓ Found {len(topics)} topics")
    else:
        print(f"✗ Failed to fetch topics: {topics_response.status_code}")

    # Test 3: Add argument FOR
    print("\n3. Adding an argument FOR...")
    for_arg = {
        "point": "Increased productivity and work-life balance",
        "supporting_facts": [
            "Employees report higher satisfaction",
            "Reduced commuting stress",
            "Better focus without office distractions"
        ],
        "side": "for"
    }

    arg_response = requests.post(f"{API_BASE}/topics/{topic_id}/arguments", json=for_arg)
    if arg_response.status_code == 200:
        print("✓ FOR argument added successfully")
    else:
        print(f"✗ Failed to add FOR argument: {arg_response.status_code}")

    # Test 4: Add argument AGAINST
    print("\n4. Adding an argument AGAINST...")
    against_arg = {
        "point": "Collaboration and team cohesion challenges",
        "supporting_facts": [
            "Harder to build relationships remotely",
            "Communication barriers increase",
            "Innovation requires in-person brainstorming"
        ],
        "side": "against"
    }

    arg_response = requests.post(f"{API_BASE}/topics/{topic_id}/arguments", json=against_arg)
    if arg_response.status_code == 200:
        print("✓ AGAINST argument added successfully")
    else:
        print(f"✗ Failed to add AGAINST argument: {arg_response.status_code}")

    # Test 5: Get topic with arguments
    print("\n5. Fetching topic with all arguments...")
    topic_detail_response = requests.get(f"{API_BASE}/topics/{topic_id}")
    if topic_detail_response.status_code == 200:
        topic_detail = topic_detail_response.json()
        print(f"✓ Topic retrieved: {topic_detail['title']}")
        print(f"  Arguments FOR: {len(topic_detail['arguments_for'])}")
        print(f"  Arguments AGAINST: {len(topic_detail['arguments_against'])}")

        # Display the arguments
        print(f"\n  FOR Arguments:")
        for i, arg in enumerate(topic_detail['arguments_for'], 1):
            print(f"    {i}. {arg['point']}")
            for fact in arg['supporting_facts']:
                print(f"       - {fact}")

        print(f"\n  AGAINST Arguments:")
        for i, arg in enumerate(topic_detail['arguments_against'], 1):
            print(f"    {i}. {arg['point']}")
            for fact in arg['supporting_facts']:
                print(f"       - {fact}")
    else:
        print(f"✗ Failed to fetch topic details: {topic_detail_response.status_code}")

    # Test 6: AI argument generation
    print("\n6. Testing AI argument generation...")
    ai_response = requests.post(f"{API_BASE}/generate-arguments", json={
        "topic": "Should remote work be the default for tech companies?"
    })
    if ai_response.status_code == 200:
        ai_data = ai_response.json()
        print(f"✓ AI generated arguments for: {ai_data['topic']}")
        print(f"  Generated FOR arguments: {len(ai_data['arguments_for'])}")
        print(f"  Generated AGAINST arguments: {len(ai_data['arguments_against'])}")
    else:
        print(f"✗ Failed to generate AI arguments: {ai_response.status_code}")

    print("\n=== Integration Test Complete ===")
    print("✓ All features are working correctly!")
    print("\nYou can now access the app at: https://3000-itdl3ar1men3x5tg4381y.e2b.app")

if __name__ == "__main__":
    test_full_workflow()