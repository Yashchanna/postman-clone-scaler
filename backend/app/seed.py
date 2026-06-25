from .database import SessionLocal, engine, Base
from . import models
import json

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if we already have collections
    if db.query(models.Collection).count() > 0:
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database...")

    # 1. Collections
    c1 = models.Collection(name="JSONPlaceholder API", description="Free fake API for testing and prototyping.")
    c2 = models.Collection(name="HTTPBin", description="A simple HTTP Request & Response Service.")
    db.add_all([c1, c2])
    db.commit()

    # 2. Requests for JSONPlaceholder
    r1 = models.SavedRequest(
        collection_id=c1.id,
        name="Get Posts",
        method="GET",
        url="https://jsonplaceholder.typicode.com/posts",
        headers="[]", params="[]", body="{}", body_type="none", auth="{}", auth_type="none"
    )
    r2 = models.SavedRequest(
        collection_id=c1.id,
        name="Get Single Post",
        method="GET",
        url="https://jsonplaceholder.typicode.com/posts/1",
        headers="[]", params="[]", body="{}", body_type="none", auth="{}", auth_type="none"
    )
    r3 = models.SavedRequest(
        collection_id=c1.id,
        name="Create Post",
        method="POST",
        url="https://jsonplaceholder.typicode.com/posts",
        headers="[{\"key\":\"Content-Type\",\"value\":\"application/json\",\"enabled\":true}]",
        params="[]",
        body="{\n  \"title\": \"foo\",\n  \"body\": \"bar\",\n  \"userId\": 1\n}",
        body_type="raw", auth="{}", auth_type="none"
    )
    
    # 3. Requests for HTTPBin
    r4 = models.SavedRequest(
        collection_id=c2.id,
        name="Get Headers",
        method="GET",
        url="{{base_url}}/headers",
        headers="[{\"key\":\"Authorization\",\"value\":\"Bearer {{api_key}}\",\"enabled\":true}]",
        params="[]", body="{}", body_type="none", auth="{}", auth_type="none"
    )
    r5 = models.SavedRequest(
        collection_id=c2.id,
        name="Post Form Data",
        method="POST",
        url="{{base_url}}/post",
        headers="[]", params="[]",
        body="[{\"key\":\"test_key\",\"value\":\"test_value\",\"enabled\":true}]",
        body_type="form-data", auth="{}", auth_type="none"
    )
    db.add_all([r1, r2, r3, r4, r5])

    # 4. Environments
    env1 = models.Environment(name="Development", is_active=True)
    env2 = models.Environment(name="Production", is_active=False)
    db.add_all([env1, env2])
    db.commit()

    # 5. Environment Variables
    ev1 = models.EnvironmentVariable(environment_id=env1.id, key="base_url", value="https://httpbin.org")
    ev2 = models.EnvironmentVariable(environment_id=env1.id, key="api_key", value="dev_secret_key_123")
    
    ev3 = models.EnvironmentVariable(environment_id=env2.id, key="base_url", value="https://httpbin.org")
    ev4 = models.EnvironmentVariable(environment_id=env2.id, key="api_key", value="prod_secret_key_999")
    db.add_all([ev1, ev2, ev3, ev4])
    
    db.commit()
    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_database()
