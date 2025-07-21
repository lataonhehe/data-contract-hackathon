import logging
from datetime import datetime, timezone
from botocore.exceptions import ClientError
from config import s3_client, dynamodb_client, dynamodb, S3_BUCKET, DYNAMODB_TABLE, AWS_REGION

logger = logging.getLogger()

def ensure_dynamodb_table_exists():
    """
    Ensure the DynamoDB table exists, create it if it doesn't
    
    Returns:
        bool: True if table exists or was created successfully
    """
    try:
        # Check if table exists
        try:
            dynamodb_client.describe_table(TableName=DYNAMODB_TABLE)
            logger.info(f"DynamoDB table {DYNAMODB_TABLE} already exists")
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                logger.info(f"DynamoDB table {DYNAMODB_TABLE} does not exist, creating...")
                
                # Create the table
                table_params = {
                    'TableName': DYNAMODB_TABLE,
                    'AttributeDefinitions': [
                        {
                            'AttributeName': 'contract_id',
                            'AttributeType': 'S'
                        }
                    ],
                    'KeySchema': [
                        {
                            'AttributeName': 'contract_id',
                            'KeyType': 'HASH'
                        }
                    ],
                    'BillingMode': 'PAY_PER_REQUEST'
                }
                
                dynamodb_client.create_table(**table_params)
                logger.info(f"Successfully created DynamoDB table: {DYNAMODB_TABLE}")
                
                # Wait for table to be active
                waiter = dynamodb_client.get_waiter('table_exists')
                waiter.wait(TableName=DYNAMODB_TABLE)
                logger.info(f"DynamoDB table {DYNAMODB_TABLE} is now active")
                
                return True
            else:
                logger.error(f"Error checking DynamoDB table: {str(e)}")
                return False
                
    except Exception as e:
        logger.error(f"Error ensuring DynamoDB table exists: {str(e)}")
        return False


def ensure_s3_bucket_exists():
    """
    Ensure the S3 bucket exists, create it if it doesn't
    
    Returns:
        bool: True if bucket exists or was created successfully
    """
    try:
        # Check if bucket exists
        try:
            s3_client.head_bucket(Bucket=S3_BUCKET)
            logger.info(f"S3 bucket {S3_BUCKET} already exists")
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                logger.info(f"S3 bucket {S3_BUCKET} does not exist, creating...")
                
                # Create the bucket
                if AWS_REGION == 'us-east-1':
                    s3_client.create_bucket(Bucket=S3_BUCKET)
                else:
                    s3_client.create_bucket(
                        Bucket=S3_BUCKET,
                        CreateBucketConfiguration={'LocationConstraint': AWS_REGION}
                    )
                
                logger.info(f"Successfully created S3 bucket: {S3_BUCKET}")
                return True
            else:
                logger.error(f"Error checking S3 bucket: {str(e)}")
                return False
                
    except Exception as e:
        logger.error(f"Error ensuring S3 bucket exists: {str(e)}")
        return False


def save_yaml_to_s3(contract_id: str, yaml_content: str) -> str:
    """
    Save YAML content to S3 bucket
    
    Args:
        contract_id: Unique contract identifier
        yaml_content: YAML content to save
        
    Returns:
        S3 path where the file was saved
        
    Raises:
        Exception: If S3 upload fails
    """
    try:
        # Ensure S3 bucket exists
        if not ensure_s3_bucket_exists():
            raise Exception("Failed to ensure S3 bucket exists")
        
        s3_key = f"contracts/{contract_id}.yaml"
        
        logger.info(f"Uploading YAML to S3: {S3_BUCKET}/{s3_key}")
        
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=yaml_content,
            ContentType='application/x-yaml'
        )
        
        s3_path = f"s3://{S3_BUCKET}/{s3_key}"
        logger.info(f"Successfully uploaded to S3: {s3_path}")
        
        return s3_path
        
    except ClientError as e:
        logger.error(f"S3 upload error: {str(e)}")
        raise Exception(f"Failed to upload YAML to S3: {str(e)}")
    except Exception as e:
        logger.error(f"Error saving to S3: {str(e)}")
        raise Exception(f"Error saving to S3: {str(e)}")


def save_metadata_to_dynamodb(contract_id: str, user: str, s3_path: str) -> None:
    """
    Save contract metadata to DynamoDB
    
    Args:
        contract_id: Unique contract identifier
        user: User email
        s3_path: S3 path where YAML is stored
        
    Raises:
        Exception: If DynamoDB operation fails
    """
    try:
        # Ensure DynamoDB table exists
        if not ensure_dynamodb_table_exists():
            raise Exception("Failed to ensure DynamoDB table exists")
        
        table = dynamodb.Table(DYNAMODB_TABLE)
        
        # Prepare metadata item
        metadata_item = {
            'contract_id': contract_id,
            'owner': user,
            'created_time': datetime.now(timezone.utc).isoformat(),
            'status': 'DRAFT',
            's3_path': s3_path
        }
        
        logger.info(f"Saving metadata to DynamoDB: {contract_id}")
        
        table.put_item(Item=metadata_item)
        
        logger.info("Successfully saved metadata to DynamoDB")
        
    except ClientError as e:
        logger.error(f"DynamoDB error: {str(e)}")
        raise Exception(f"Failed to save metadata to DynamoDB: {str(e)}")
    except Exception as e:
        logger.error(f"Error saving to DynamoDB: {str(e)}")
        raise Exception(f"Error saving to DynamoDB: {str(e)}")


def get_contract(contract_id: str):
    """
    Retrieve contract metadata from DynamoDB and YAML from S3
    Args:
        contract_id: Unique contract identifier
    Returns:
        Dict with contract metadata and YAML content
    Raises:
        Exception: If contract not found or AWS error
    """
    try:
        # Fetch metadata from DynamoDB
        table = dynamodb.Table(DYNAMODB_TABLE)
        response = table.get_item(Key={'contract_id': contract_id})
        item = response.get('Item')
        if not item:
            raise Exception(f"Contract {contract_id} not found in DynamoDB")
        # Fetch YAML from S3
        s3_key = f"contracts/{contract_id}.yaml"
        try:
            s3_obj = s3_client.get_object(Bucket=S3_BUCKET, Key=s3_key)
            yaml_content = s3_obj['Body'].read().decode('utf-8')
        except Exception as e:
            yaml_content = None  # YAML may be missing, but metadata exists
        return {
            **item,
            'yaml': yaml_content
        }
    except Exception as e:
        logger.error(f"Error fetching contract: {str(e)}")
        raise


def update_contract(contract_id: str, updates):
    """
    Update contract metadata in DynamoDB and/or YAML in S3.
    Args:
        contract_id: Unique contract identifier.
        updates: Dict with fields to update (e.g., {"status": "active", "yaml": "..."}).
    Returns:
        Updated contract metadata and YAML.
    Raises:
        Exception: If update fails.
    """
    try:
        # --- Step 1: Update YAML in S3 if provided ---
        if 'yaml' in updates:
            s3_key = f"contracts/{contract_id}.yaml"
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=updates['yaml'],
                ContentType='application/x-yaml'
            )

        # --- Step 2: Update metadata in DynamoDB ---
        update_expr = []
        expr_attr_values = {}
        expr_attr_names = {}

        reserved_keywords = set([
            'STATUS', 'ACTION', 'ADD', 'NAME', 'TYPE', 'VALUE', 'USER', 'DATE', 'TIME', 'TEXT', 'NUMBER'
        ])  # short list; add more if needed

        for k, v in updates.items():
            if k == 'yaml':
                continue  # YAML is handled via S3 only

            # Handle reserved keywords
            key_is_reserved = k.upper() in reserved_keywords
            attr_name = f"#{k}" if key_is_reserved else k
            if key_is_reserved:
                expr_attr_names[f"#{k}"] = k

            update_expr.append(f"{attr_name} = :{k}")
            
            # Infer DynamoDB type
            if isinstance(v, str):
                expr_attr_values[f":{k}"] = {'S': v}
            elif isinstance(v, bool):
                expr_attr_values[f":{k}"] = {'BOOL': v}
            elif isinstance(v, (int, float)):
                expr_attr_values[f":{k}"] = {'N': str(v)}
            elif isinstance(v, list):
                expr_attr_values[f":{k}"] = {'L': [{'S': str(item)} for item in v]}
            else:
                raise ValueError(f"Unsupported type for DynamoDB: {type(v)} in field '{k}'")

        if update_expr:
            update_expression = "SET " + ", ".join(update_expr)

            update_kwargs = {
                'TableName': DYNAMODB_TABLE,
                'Key': {'contract_id': {'S': contract_id}},
                'UpdateExpression': update_expression,
                'ExpressionAttributeValues': expr_attr_values
            }

            if expr_attr_names:
                update_kwargs['ExpressionAttributeNames'] = expr_attr_names

            dynamodb_client.update_item(**update_kwargs)

        # --- Step 3: Return updated contract ---
        return get_contract(contract_id)

    except Exception as e:
        logger.error(f"Error updating contract {contract_id}: {str(e)}")
        raise



def delete_contract(contract_id: str) -> None:
    """
    Delete contract metadata from DynamoDB and YAML from S3
    Args:
        contract_id: Unique contract identifier
    Raises:
        Exception: If delete fails
    """
    try:
        # Delete from DynamoDB
        dynamodb_client.delete_item(
            TableName=DYNAMODB_TABLE,
            Key={'contract_id': {'S': contract_id}}
        )
        # Delete YAML from S3
        s3_key = f"contracts/{contract_id}.yaml"
        try:
            s3_client.delete_object(Bucket=S3_BUCKET, Key=s3_key)
        except Exception as e:
            logger.warning(f"YAML file not found or already deleted: {str(e)}")
    except Exception as e:
        logger.error(f"Error deleting contract: {str(e)}")
        raise


def get_all_contracts():
    """
    Retrieve all contracts from DynamoDB
    Returns:
        List of contract metadata
    Raises:
        Exception: If fetch fails
    """
    try:
        table = dynamodb.Table(DYNAMODB_TABLE)
        response = table.scan()
        return response.get('Items', [])
    except Exception as e:
        logger.error(f"Error fetching all contracts: {str(e)}")
        raise 