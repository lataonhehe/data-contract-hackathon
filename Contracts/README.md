# AWS Lambda Contract Generation Service

This project contains an AWS Lambda function that creates structured YAML data contracts using Amazon Bedrock's Claude 3 Sonnet model. The service accepts natural language requests in English or Vietnamese and generates comprehensive data sharing contracts.

## Features

- 🤖 **AI-Powered Contract Generation** - Uses Claude 3 Sonnet for intelligent contract creation
- 🌐 **Multi-Language Support** - Accepts requests in English and Vietnamese
- 📄 **YAML Output** - Generates structured YAML contracts with fields and constraints
- 💾 **S3 Storage** - Automatically saves contracts to S3 bucket
- 🗄️ **DynamoDB Metadata** - Stores contract metadata for tracking
- 🔧 **Auto-Infrastructure** - Automatically creates DynamoDB tables and S3 buckets if they don't exist
- 🔒 **Secure** - Proper IAM permissions and encryption
- 🚀 **Serverless** - Deployed with Serverless Framework
- 🧪 **Comprehensive Testing** - Full test suite included

## Architecture

```
API Gateway → Lambda Function → Bedrock → S3 + DynamoDB
```

### Components:
- **API Gateway**: REST API endpoint for contract creation
- **Lambda Function**: Python 3.11 function handling requests
- **Amazon Bedrock**: Claude 3 Sonnet for contract generation
- **S3 Bucket**: `gencontract-data` for storing YAML contracts
- **DynamoDB Table**: `ContractMetadata` for contract metadata

### Auto-Infrastructure Features:
- **DynamoDB Table Creation**: Automatically creates `ContractMetadata` table if it doesn't exist
- **S3 Bucket Creation**: Automatically creates `gencontract-data` bucket if it doesn't exist
- **Resource Validation**: Checks and creates required AWS resources before processing requests
- **Error Recovery**: Handles resource creation failures gracefully

## Prerequisites

- AWS CLI configured with appropriate credentials
- Python 3.11 or later
- Serverless Framework installed globally: `npm install -g serverless`
- Access to Amazon Bedrock (request access in AWS Console)

## Installation

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Serverless Framework plugins:**
   ```bash
   npm install -g serverless
   npm install --save-dev serverless-offline
   ```

## Configuration

### AWS Credentials

Ensure your AWS credentials are configured:
```bash
aws configure
```

### Bedrock Access

Make sure you have access to Amazon Bedrock in your AWS account:
1. Go to AWS Console → Amazon Bedrock
2. Request access to `anthropic.claude-3-sonnet-20240229-v1:0`
3. Wait for approval (usually takes a few minutes to hours)

## Deployment

### Deploy to AWS

```bash
# Deploy to AWS
serverless deploy

# Deploy to specific stage
serverless deploy --stage prod
```

### Local Development

```bash
# Start local development server
serverless offline
```

The function will be available at `http://localhost:3000`

## API Usage

### Create Contract

**Endpoint:** `POST /contracts`

**Request Body:**
```json
{
  "user": "john.doe@example.com",
  "request": "Create a data contract for sharing customer information between a retail company and a marketing agency. The contract should include customer name, email, purchase history, and preferences. Ensure data is encrypted and only used for targeted marketing campaigns."
}
```

**Response:**
```json
{
  "contract_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "DRAFT",
  "s3_path": "s3://gencontract-data/contracts/550e8400-e29b-41d4-a716-446655440000.yaml",
  "yaml": "contract_id: 550e8400-e29b-41d4-a716-446655440000\ndescription: Data sharing contract for customer information...\nfields:\n  - name: customer_name\n    type: string\n  - name: email\n    type: string\nconstraints:\n  - field: email\n    rule: must_be_valid_email\n  - field: customer_name\n    rule: required",
  "message": "Contract created successfully"
}
```

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "createContract"
}
```

## Example Requests

### English Request
```json
{
  "user": "data.analyst@company.com",
  "request": "Create a data contract for sharing employee performance metrics between HR and management. Include employee ID, performance scores, department, and review dates. Ensure data is anonymized and used only for performance analysis."
}
```

### Vietnamese Request
```json
{
  "user": "nguyen.van.a@company.vn",
  "request": "Tạo hợp đồng chia sẻ dữ liệu cho việc chia sẻ thông tin khách hàng giữa công ty bán lẻ và đại lý tiếp thị. Hợp đồng nên bao gồm tên khách hàng, email, lịch sử mua hàng và sở thích. Đảm bảo dữ liệu được mã hóa và chỉ sử dụng cho các chiến dịch tiếp thị có mục tiêu."
}
```

### Complex Healthcare Request
```json
{
  "user": "healthcare.admin@hospital.org",
  "request": "Create a comprehensive data contract for sharing patient health records between a hospital network and a medical research institute. The contract must include patient demographics, medical history, treatment plans, lab results, insurance information, and emergency contacts. Requirements: All data must be encrypted, access limited to authorized researchers, 10-year retention policy, audit trail, HIPAA compliance, anonymization, and regular security assessments."
}
```

## Generated YAML Structure

The AI generates YAML contracts with the following structure:

```yaml
contract_id: 550e8400-e29b-41d4-a716-446655440000
description: Data sharing contract for customer information between retail company and marketing agency
fields:
  - name: customer_name
    type: string
    description: Full name of the customer
  - name: email
    type: string
    description: Customer email address
  - name: purchase_history
    type: array
    description: List of previous purchases
  - name: preferences
    type: object
    description: Customer preferences and interests
constraints:
  - field: email
    rule: must_be_valid_email
  - field: customer_name
    rule: required
  - field: purchase_history
    rule: max_length_1000
security:
  encryption: required
  access_control: authorized_only
  retention_policy: 5_years
  audit_trail: enabled
```

## Testing

### Run All Tests

```bash
# Run contract creation tests
python test_contract.py

# Run local tests
python test_local.py
```

### Test with curl

```bash
# Test contract creation
curl -X POST http://localhost:3000/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "user": "test@example.com",
    "request": "Create a data contract for sharing customer information between a retail company and a marketing agency."
  }'

# Test health check
curl -X GET http://localhost:3000/health
```

### Test with Python

```python
import requests
import json

# Test contract creation
url = "http://localhost:3000/contracts"
payload = {
    "user": "john.doe@example.com",
    "request": "Create a data contract for sharing customer information between a retail company and a marketing agency."
}

response = requests.post(url, json=payload)
print(json.dumps(response.json(), indent=2))
```

## AWS Resources Created

### S3 Bucket
- **Name**: `gencontract-data`
- **Purpose**: Store generated YAML contracts
- **Security**: Private access, versioning enabled
- **Lifecycle**: 30-day version retention

### DynamoDB Table
- **Name**: `ContractMetadata`
- **Partition Key**: `contract_id` (String)
- **Purpose**: Store contract metadata
- **Billing**: Pay-per-request

### Lambda Function
- **Runtime**: Python 3.11
- **Memory**: 512 MB
- **Timeout**: 30 seconds
- **Permissions**: Bedrock, S3, DynamoDB access

## Error Handling

The function includes comprehensive error handling:

- **400 Bad Request**: Missing or invalid input fields
- **500 Internal Server Error**: Bedrock API failures, S3 upload errors
- **Validation**: Email format, required fields, JSON parsing
- **Graceful Degradation**: Contract creation succeeds even if DynamoDB fails

## Monitoring

- **CloudWatch Logs**: Detailed function logs
- **CloudWatch Metrics**: Invocation count, duration, errors
- **X-Ray**: Enable for detailed tracing
- **S3 Access Logs**: Monitor contract storage
- **DynamoDB Metrics**: Monitor metadata operations

## Security Best Practices

1. **IAM Permissions**: Least privilege access
2. **S3 Security**: Private bucket with encryption
3. **DynamoDB Security**: Encryption at rest and in transit
4. **API Gateway**: Request validation and throttling
5. **Lambda Security**: VPC isolation if needed
6. **Bedrock Security**: Model access controls

## Troubleshooting

### Common Issues

1. **AccessDeniedException**: Ensure Bedrock access is granted
2. **ModelNotFoundException**: Verify model ID is correct
3. **S3 Upload Errors**: Check bucket permissions
4. **DynamoDB Errors**: Verify table exists and permissions
5. **Timeout Errors**: Increase Lambda timeout for complex requests

### Debug Mode

Enable detailed logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Resources

```bash
# List S3 objects
aws s3 ls s3://gencontract-data/contracts/

# Query DynamoDB
aws dynamodb scan --table-name ContractMetadata

# Check Lambda logs
serverless logs -f createContract
```

## Development

### Code Structure

- `lambda_function.py`: Main Lambda function
- `serverless.yml`: Infrastructure configuration
- `requirements.txt`: Python dependencies
- `test_contract.py`: Contract creation tests
- `test_event.json`: Sample test event

### Adding Features

1. **New Contract Types**: Update system message in `lambda_function.py`
2. **Additional Validation**: Add validation functions
3. **Enhanced Metadata**: Extend DynamoDB schema
4. **Custom YAML Format**: Modify Bedrock prompt

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Test locally
python test_contract.py

# Deploy to dev
serverless deploy --stage dev

# Deploy to prod
serverless deploy --stage prod
```

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting guide
2. Review CloudWatch logs
3. Test with the provided test scripts
4. Contact the development team 

## Contract CRUD API

The Lambda function now supports full CRUD operations for contracts via API Gateway:

### Create Contract
- **POST** `/contract`
- **Body:** `{ "user": "user@email.com", "request": "Describe your contract..." }`
- **Response:** `{ "contract_id": ..., "status": ..., "s3_path": ..., "yaml": ..., "message": ... }`

### Read Contract
- **GET** `/contract/{contract_id}`
- **Response:** `{ "contract_id": ..., "owner": ..., "created_time": ..., "status": ..., "s3_path": ..., "yaml": ... }`

### Update Contract
- **PUT** `/contract/{contract_id}`
- **Body:** `{ "status": "NEW_STATUS", "yaml": "...optional new YAML..." }`
- **Response:** Updated contract object

### Delete Contract
- **DELETE** `/contract/{contract_id}`
- **Response:** `{ "message": "Contract {contract_id} deleted successfully" }`

**Note:** All responses are JSON. Errors return an `error` and `message` field. 

## FastAPI Backend (Local Development)

A new folder `fastapi_backend/` will be created to provide a FastAPI-based backend with the same contract CRUD and generation functionality as the AWS Lambda backend. This allows for local development, testing, and running the backend without AWS Lambda or API Gateway.

- All endpoints and logic will mirror the Lambda implementation.
- Uses the same service and utility modules for contract generation, S3, and DynamoDB.
- Run locally with `uvicorn`. 