import boto3  
def fetch_logs(log_group):  
    client = boto3.client('logs', region_name='ap-southeast-1')  
    try:  
        streams = client.describe_log_streams(logGroupName=log_group, orderBy='LastEventTime', descending=True, limit=1)  
        for stream in streams.get('logStreams', []):  
            events = client.get_log_events(logGroupName=log_group, logStreamName=stream['logStreamName'], limit=50)  
            for event in events.get('events', []):  
                print(event['message'].strip())  
    except Exception as e:  
        print('Error: ' + str(e))  
print('=== ORDER ===')  
fetch_logs('/aws/lambda/Danush_order_service')  
