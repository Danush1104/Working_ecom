import boto3

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('danush_products_table')

def get_all_items():
    response = table.scan()
    items = response.get('Items', [])
    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response.get('Items', []))
    return items

items = get_all_items()
categories = [i for i in items if i.get('product_id', '').startswith('CAT-')]
products = [i for i in items if i.get('product_id', '').startswith('PROD-')]

# Map norm_name -> [categories]
cat_map = {}
for cat in categories:
    norm_name = cat.get('name', '').strip().lower()
    if norm_name not in cat_map:
        cat_map[norm_name] = []
    cat_map[norm_name].append(cat)

for norm_name, cats in cat_map.items():
    # Primary is the first one, or the one with best data
    # Sort by whether they have icon_url, then created_at
    sorted_cats = sorted(cats, key=lambda x: (
        x.get('icon_url') is not None,
        x.get('banner_url') is not None,
        x.get('product_id')
    ), reverse=True)
    
    primary = sorted_cats[0]
    duplicates = sorted_cats[1:]
    
    # Calculate true product count based on normalized name
    true_count = sum(1 for p in products if p.get('category', '').strip().lower() == norm_name)
    
    # Update primary
    update_expr = "SET product_count = :count"
    expr_attrs = {':count': true_count}
    
    if len(cats) > 1:
        print(f"Resolving duplicate for '{norm_name}'...")
        print(f"Primary ID: {primary['product_id']}")
        
        # Merge best fields
        for dup in duplicates:
            if not primary.get('icon_url') and dup.get('icon_url'):
                update_expr += ", icon_url = :icon"
                expr_attrs[':icon'] = dup['icon_url']
                primary['icon_url'] = dup['icon_url']
            if not primary.get('banner_url') and dup.get('banner_url'):
                update_expr += ", banner_url = :banner"
                expr_attrs[':banner'] = dup['banner_url']
                primary['banner_url'] = dup['banner_url']
            
            print(f"Deleting duplicate ID: {dup['product_id']}")
            table.delete_item(Key={'product_id': dup['product_id']})
    
    # Update count on primary anyway
    print(f"Updating primary '{primary['name']}' ({primary['product_id']}) with count: {true_count}")
    table.update_item(
        Key={'product_id': primary['product_id']},
        UpdateExpression=update_expr,
        ExpressionAttributeValues=expr_attrs
    )

print("Backend deduplication and count update complete.")
