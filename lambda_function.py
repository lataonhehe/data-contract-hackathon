import json
import logging
import os
import uuid
import boto3
from datetime import datetime, timezone
from botocore.exceptions import ClientError, BotoCoreError
from typing import Dict, Any, Optional

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Get AWS region
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')

# Initialize AWS clients with explicit region
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name=AWS_REGION
)

s3_client = boto3.client('s3', region_name=AWS_REGION)
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
dynamodb_client = boto3.client('dynamodb', region_name=AWS_REGION)

# Constants
S3_BUCKET = 'gencontract-data'
DYNAMODB_TABLE = 'ContractMetadata'
BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'

# System message for contract generation
SYSTEM_MESSAGE = """You are an expert in generating structured YAML data contracts. Given a user request, respond only with a valid YAML file that defines the contract. The YAML should contain contract_id, description, fields (with name and type), and constraints (field and rule). Do not include any explanation."""


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


def validate_input(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and extract input from the API Gateway event
    
    Args:
        event: API Gateway event
        
    Returns:
        Validated input data
        
    Raises:
        ValueError: If required fields are missing
    """
    try:
        # Parse the request body
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        
        # Validate required fields
        user = body.get('user')
        if not user:
            raise ValueError("Missing required field: user")
        
        request = body.get('request')
        if not request:
            raise ValueError("Missing required field: request")
        
        # Validate user is an email
        if '@' not in user or '.' not in user:
            raise ValueError("User must be a valid email address")
        
        return {
            'user': user,
            'request': request
        }
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in request body: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error parsing request: {str(e)}")


def generate_contract_with_bedrock(request: str) -> str:
    """
    Generate YAML contract using Amazon Bedrock Claude 3 Sonnet
    
    Args:
        request: Natural language request describing data sharing requirements
        
    Returns:
        Generated YAML contract
        
    Raises:
        Exception: If Bedrock API call fails
    """
    try:
        # Prepare the request payload for Claude 3 Sonnet
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,
            "temperature": 0.3,
            "messages": [
                {
                    "role": "user",
                    "content": f"{SYSTEM_MESSAGE}\n\nUser request: {request}"
                }
            ]
        }
        
        logger.info(f"Invoking Bedrock model: {BEDROCK_MODEL_ID}")
        
        # Call Bedrock API
        response = bedrock_runtime.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_body)
        )
        
        # Parse the response
        response_body = json.loads(response['body'].read())
        generated_yaml = response_body['content'][0]['text']
        
        logger.info("Successfully generated contract with Bedrock")
        return generated_yaml
        
    except (ClientError, BotoCoreError) as e:
        logger.error(f"Bedrock API error: {str(e)}")
        raise Exception(f"Failed to generate contract with Bedrock: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating contract: {str(e)}")
        raise Exception(f"Error generating contract: {str(e)}")


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


def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a standardized API Gateway response
    
    Args:
        status_code: HTTP status code
        body: Response body
        
    Returns:
        API Gateway response format
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        },
        "body": json.dumps(body)
    }


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler function for contract creation
    
    Args:
        event: Lambda event object from API Gateway
        context: Lambda context object
        
    Returns:
        API Gateway response with contract details
    """
    try:
        logger.info(f"Event received: {json.dumps(event, indent=2)}")
        
        # Handle OPTIONS request for CORS
        if event.get('httpMethod') == 'OPTIONS':
            return create_response(200, {"message": "OK"})
        
        # Validate input
        try:
            input_data = validate_input(event)
            user = input_data['user']
            request = input_data['request']
        except ValueError as e:
            logger.error(f"Input validation error: {str(e)}")
            return create_response(400, {
                "error": "Bad Request",
                "message": str(e)
            })
        
        # Generate contract ID
        contract_id = str(uuid.uuid4())
        logger.info(f"Generated contract ID: {contract_id}")
        
        # Generate YAML contract using Bedrock
        try:
            yaml_content = generate_contract_with_bedrock(request)
        except Exception as e:
            logger.error(f"Contract generation failed: {str(e)}")
            return create_response(500, {
                "error": "Contract Generation Failed",
                "message": str(e)
            })
        
        # Save YAML to S3
        try:
            s3_path = save_yaml_to_s3(contract_id, yaml_content)
        except Exception as e:
            logger.error(f"S3 upload failed: {str(e)}")
            return create_response(500, {
                "error": "S3 Upload Failed",
                "message": str(e)
            })
        
        # Save metadata to DynamoDB
        try:
            save_metadata_to_dynamodb(contract_id, user, s3_path)
        except Exception as e:
            logger.error(f"DynamoDB save failed: {str(e)}")
            # Note: We don't fail the entire request if DynamoDB fails
            # The contract is still created and saved to S3
            logger.warning("Contract created but metadata save failed")
        
        # Prepare success response
        response_body = {
            "contract_id": contract_id,
            "status": "DRAFT",
            "s3_path": s3_path,
            "yaml": yaml_content,
            "message": "Contract created successfully"
        }
        
        logger.info(f"Contract creation completed: {contract_id}")
        
        return create_response(200, response_body)
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(500, {
            "error": "Internal Server Error",
            "message": "An unexpected error occurred"
        })


def health_check(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Health check endpoint
    
    Args:
        event: Lambda event object
        context: Lambda context object
        
    Returns:
        Health check response
    """
    return create_response(200, {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "createContract"
    }) 