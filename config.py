import os
import boto3
import logging

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