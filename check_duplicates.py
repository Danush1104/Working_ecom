import boto3
import json

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('danush_products_table')

response = table.scan()
items = response.get('Items', [])
while 'LastEvaluatedKey' in response:
    response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
    items.extend(response.get('Items', []))

categories = [item for item in items if item.get('product_id', '').startswith('CAT-')]
products = [item for item in items if item.get('product_id', '').startswith('PROD-')]

print('Total categories:', len(categories))
print('Total products:', len(products))

# Find duplicates
cat_map = {}
for cat in categories:
    norm_name = cat.get('name', '').strip().lower()
    if norm_name not in cat_map:
        cat_map[norm_name] = []
    cat_map[norm_name].append(cat)

duplicates = {k: v for k, v in cat_map.items() if len(v) > 1}

print('Duplicates found:')
for k, v in duplicates.items():
    print(f'Category: {k}')
    for c in v:
        print(f"  - ID: {c.get('product_id')} | count: {c.get('product_count')} | icon: {c.get('icon_url')} | name: {c.get('name')}")
