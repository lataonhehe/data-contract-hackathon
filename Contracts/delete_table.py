import boto3
import os
import sys
from botocore.exceptions import ClientError

TABLE_NAME = "ContractMetadata"
PARTITION_KEY = os.getenv('DYNAMODB_PARTITION_KEY', 'contract_id')
# SORT_KEY = os.getenv('DYNAMODB_SORT_KEY', 'created_time')  # Uncomment if your table has a sort key

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table(TABLE_NAME)

def delete_all_items():
    print(f"Scanning table: {TABLE_NAME}")
    projection = PARTITION_KEY
    # projection = f"{PARTITION_KEY}, {SORT_KEY}"  # Uncomment if using sort key
    deleted_count = 0
    try:
        response = table.scan(ProjectionExpression=projection)
        items = response.get('Items', [])
        while True:
            if not items:
                break
            with table.batch_writer() as batch:
                for item in items:
                    key = {
                        PARTITION_KEY: item[PARTITION_KEY]
                        # , SORT_KEY: item[SORT_KEY]  # Uncomment if using sort key
                    }
                    batch.delete_item(Key=key)
                    deleted_count += 1
            print(f"Deleted {len(items)} items (total: {deleted_count})")
            # Check for more data
            if 'LastEvaluatedKey' in response:
                response = table.scan(
                    ProjectionExpression=projection,
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
                items = response.get('Items', [])
            else:
                break
        print(f"All items deleted. Total deleted: {deleted_count}")
    except ClientError as e:
        print(f"Error deleting items: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    delete_all_items()

if __name__ == "__main__":
    main()
