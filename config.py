import os
import boto3
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Get AWS region
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
logger.info(f"Using AWS Region: {AWS_REGION}")

# Initialize AWS clients with explicit region
try:
    bedrock_runtime = boto3.client(
        service_name='bedrock-runtime',
        region_name=AWS_REGION
    )
    logger.info("Successfully initialized Bedrock runtime client")
except Exception as e:
    logger.error(f"Failed to initialize Bedrock runtime client: {str(e)}")
    bedrock_runtime = None

try:
    s3_client = boto3.client('s3', region_name=AWS_REGION)
    logger.info("Successfully initialized S3 client")
except Exception as e:
    logger.error(f"Failed to initialize S3 client: {str(e)}")
    s3_client = None

try:
    dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
    dynamodb_client = boto3.client('dynamodb', region_name=AWS_REGION)
    logger.info("Successfully initialized DynamoDB clients")
except Exception as e:
    logger.error(f"Failed to initialize DynamoDB clients: {str(e)}")
    dynamodb = None
    dynamodb_client = None

# Constants
S3_BUCKET = 'gencontract-data'
DYNAMODB_TABLE = 'ContractMetadata'
BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'

# System message for contract generation
# SYSTEM_MESSAGE = """You are an expert in generating structured YAML data contracts. Given a user request, respond only with a valid YAML file that defines the contract. The YAML should contain contract_id, description, fields (with name and type), and constraints (field and rule). Do not include any explanation.""" 

SYSTEM_MESSAGE = """You are an expert data architect specializing in modern, machine-readable Data Contracts aligned with Data Mesh principles.

Given a user request describing a data asset, generate a complete and valid YAML-formatted Data Contract that includes the following components:

---

1. **Metadata (Header Information)**
   - `description`: Human-readable business context 
   - `classification`: Sensitivity level (e.g., Public, Internal, Confidential, PII)

2. **Schema Definition (Structure)**  
   For each field, include:  
   - `name`  
   - `type` (e.g., string, int64, timestamp_ntz, decimal(10,2))  
   - `description`  
   - `constraints`: List of rules such as NOT NULL, UNIQUE

3. **Semantic Guarantees (Meaning)**  
   - Field-level definitions (clarify business meaning)  
   - Enumerated values (if applicable)  
   - Business rules (e.g., order_total >= sum of line_items)

4. **Data Quality Rules (Integrity Checks)**  
   - `freshness`: Expected SLA for data latency  
   - `completeness`: Required record coverage (e.g., 99.9%)  
   - `validity_checks`: Include regex patterns or value ranges  
   - `custom_checks`: Additional logical rules

5. **Service Level Agreements (SLAs)**  
   - `availability`: e.g., 99.95%  
   - `update_cadence`: e.g., stream, hourly, daily  
   - `support`: Support contact and escalation plan

6. **Evolution and Versioning (Change Management)**  
   - `version`: In MAJOR.MINOR.PATCH format  
   - `deprecation_policy`: Describe deprecation timelines  
   - `change_type`: Specify if change is PATCH, MINOR, or MAJOR

---

**Instructions:**
- Only return valid YAML.  
- Do not include explanations or comments.  
- Ensure the output is suitable for automated contract enforcement and version control.  
- If any field is unknown, use a placeholder like `"<TBD>"`.

---
"""