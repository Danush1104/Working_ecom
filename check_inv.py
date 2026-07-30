import boto3  
dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')  
table = dynamodb.Table('danush_inventory')  
res = table.get_item(Key={'product_id': 'PROD-0c4b9e26d131469b847ddddfc28c11dc'})  
print(res.get('Item'))  
