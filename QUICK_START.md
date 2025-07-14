# Quick Start Guide

## Step-by-Step Instructions

### Step 1: Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Serverless Framework (if not already installed)
npm install -g serverless
```

### Step 2: Configure AWS

```bash
# Configure AWS credentials
aws configure
```

**Enter your AWS credentials when prompted:**
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### Step 3: Request Bedrock Access

1. Go to [AWS Console → Amazon Bedrock](https://console.aws.amazon.com/bedrock/)
2. Click **"Model access"** in the left sidebar
3. Click **"Manage model access"**
4. Select `anthropic.claude-3-sonnet-20240229-v1:0`
5. Click **"Submit request"**
6. Wait for approval (5-30 minutes)

### Step 4: Test Locally

```bash
# Run the test script
python test_contract.py
```

### Step 5: Deploy to AWS

```bash
# Deploy the service
serverless deploy
```

### Step 6: Test the Deployed Service

```bash
# Get the API URL
serverless info

# Test with curl (replace with your actual URL)
curl -X POST https://your-api-gateway-url.amazonaws.com/dev/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "user": "test@example.com",
    "request": "Create a data contract for sharing customer information between a retail company and a marketing agency."
  }'
```

## Project Structure

```
gen-contract-hackathon/
├── lambda_function.py          # Main Lambda function
├── requirements.txt            # Python dependencies
├── serverless.yml             # Infrastructure config
├── test_contract.py           # Test script
├── test_event.json            # Sample test event
├── README.md                  # Documentation
├── .gitignore                 # Git ignore file
└── QUICK_START.md            # This file
```

## Troubleshooting

### Common Issues:

1. **"AccessDeniedException"** - Wait for Bedrock access approval
2. **"ModelNotFoundException"** - Check if model access is granted
3. **"Invalid credentials"** - Run `aws configure` again
4. **"Deployment failed"** - Check AWS permissions

### Check Status:

```bash
# Check AWS identity
aws sts get-caller-identity

# List Bedrock models (should work after access is granted)
aws bedrock list-foundation-models --region us-east-1

# Check Lambda logs
serverless logs -f createContract
```

## Success Indicators

✅ **Local test passes**: `python test_contract.py` shows all tests passed
✅ **Deployment successful**: `serverless deploy` completes without errors
✅ **API responds**: curl command returns contract data
✅ **S3 bucket created**: Check AWS Console → S3 → `gencontract-data`
✅ **DynamoDB table created**: Check AWS Console → DynamoDB → `ContractMetadata`

## Next Steps

After successful deployment:
1. Integrate with your frontend application
2. Add authentication if needed
3. Monitor usage in CloudWatch
4. Set up alerts for errors 