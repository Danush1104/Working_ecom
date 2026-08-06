import os
import uuid
from datetime import datetime
import boto3

# Hardcoded default categories from the original seeding logic
DEFAULT_CATEGORIES = [
    {"name": "Audio", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Audio"},
    {"name": "PC & Accessories", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=PC"},
    {"name": "Mobiles", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Mobiles"},
    {"name": "Home Appliances", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Home"},
    {"name": "Gaming", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Gaming"},
    {"name": "Cameras", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Camera"},
    {"name": "Laptops", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Laptops"},
    {"name": "Wearables", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Watch"},
    {"name": "Beauty Products", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Beauty"},
    {"name": "Electronics", "icon": "https://placehold.co/100x100/1e3a8a/ffffff?text=Tech"}
]

def seed_categories():
    print("Starting category seeding process...")
    # Initialize DynamoDB resource
    # Assuming table name is available in environment or hardcoded as ECommerce-Products
    table_name = os.environ.get("PRODUCTS_TABLE_NAME", "ECommerce-Products")
    dynamodb = boto3.resource('dynamodb', region_name=os.environ.get("AWS_REGION", "ap-southeast-1"))
    table = dynamodb.Table(table_name)

    # 1. First, get all existing categories so we don't duplicate
    try:
        response = table.scan(
            FilterExpression="entity_type = :etype",
            ExpressionAttributeValues={":etype": "CATEGORY"}
        )
        existing_items = response.get("Items", [])
        existing_names = {item.get("name").lower() for item in existing_items if item.get("name")}
        print(f"Found {len(existing_names)} existing categories.")
    except Exception as e:
        print(f"Error reading from DynamoDB table {table_name}. Make sure AWS credentials and table name are correct: {e}")
        return

    # 2. Add missing default categories
    added_count = 0
    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    for idx, cat in enumerate(DEFAULT_CATEGORIES):
        if cat["name"].lower() not in existing_names:
            category_id = f"CAT-{uuid.uuid4().hex}"
            item = {
                "product_id": category_id,
                "entity_type": "CATEGORY",
                "name": cat["name"],
                "description": f"Default category: {cat['name']}",
                "icon_url": cat["icon"],
                "banner_url": "",
                "product_count": 0,
                "display_order": idx + 1,
                "featured": False,
                "is_active": True,
                "created_at": now,
                "updated_at": now
            }
            
            try:
                table.put_item(
                    Item=item,
                    ConditionExpression="attribute_not_exists(product_id)"
                )
                print(f"Created category: {cat['name']}")
                added_count += 1
            except Exception as e:
                print(f"Failed to create category {cat['name']}: {e}")
        else:
            print(f"Category already exists (skipping): {cat['name']}")

    print(f"\nSeeding complete! Added {added_count} new categories.")

if __name__ == "__main__":
    seed_categories()
