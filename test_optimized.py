#!/usr/bin/env python3
"""
Test script for the optimized Lambda function that can create DynamoDB tables and S3 buckets automatically.
"""

import json
import boto3
import os
from datetime import datetime

# Test configuration
AWS_REGION = 'us-east-1'

def create_test_event():
    """Create a test event for the Lambda function"""
    return {
        "httpMethod": "POST",
        "path": "/contracts",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "user": "test@example.com",
            "request": "Create a data contract for sharing customer information between departments. Include fields for customer ID, name, email, phone number, and purchase history. Add constraints to ensure data privacy and access control."
        })
    }

def test_optimized_lambda():
    """Test the optimized Lambda function"""
    print("🧪 Testing Optimized Lambda Function")
    print("=" * 50)
    
    # Import the Lambda function
    try:
        from lambda_function import lambda_handler
        print("✅ Successfully imported lambda_function")
    except ImportError as e:
        print(f"❌ Failed to import lambda_function: {e}")
        return
    
    # Create test event
    test_event = create_test_event()
    print("✅ Created test event")
    
    # Test the Lambda function
    try:
        print("\n🚀 Invoking Lambda function...")
        start_time = datetime.now()
        
        response = lambda_handler(test_event, None)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"✅ Lambda function completed in {duration:.2f} seconds")
        print(f"📊 Response Status: {response.get('statusCode', 'N/A')}")
        
        if response.get('statusCode') == 200:
            body = json.loads(response.get('body', '{}'))
            print(f"📝 Contract ID: {body.get('contract_id', 'N/A')}")
            print(f"📁 S3 Path: {body.get('s3_path', 'N/A')}")
            print(f"👤 Owner: {body.get('owner', 'N/A')}")
            print("🎉 Test PASSED - Lambda function works correctly!")
        else:
            print(f"❌ Test FAILED - Unexpected status code: {response.get('statusCode')}")
            print(f"📄 Response body: {response.get('body', 'N/A')}")
            
    except Exception as e:
        print(f"❌ Test FAILED - Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()

def check_aws_resources():
    """Check if AWS resources exist"""
    print("\n🔍 Checking AWS Resources")
    print("=" * 30)
    
    try:
        # Check DynamoDB table
        dynamodb = boto3.client('dynamodb', region_name=AWS_REGION)
        try:
            response = dynamodb.describe_table(TableName='ContractMetadata')
            print(f"✅ DynamoDB table 'ContractMetadata' exists")
            print(f"   Status: {response['Table']['TableStatus']}")
        except Exception as e:
            print(f"❌ DynamoDB table 'ContractMetadata' does not exist: {e}")
        
        # Check S3 bucket
        s3 = boto3.client('s3', region_name=AWS_REGION)
        try:
            s3.head_bucket(Bucket='gencontract-data')
            print(f"✅ S3 bucket 'gencontract-data' exists")
        except Exception as e:
            print(f"❌ S3 bucket 'gencontract-data' does not exist: {e}")
            
    except Exception as e:
        print(f"❌ Error checking AWS resources: {e}")

def main():
    """Main test function"""
    print("🚀 Starting Optimized Lambda Function Test")
    print("=" * 60)
    
    # Check AWS resources first
    check_aws_resources()
    
    # Test the Lambda function
    test_optimized_lambda()
    
    print("\n" + "=" * 60)
    print("🏁 Test completed!")

if __name__ == "__main__":
    main() 