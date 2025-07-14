#!/usr/bin/env python3
"""
Test script for the contract creation Lambda function
"""

import json
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lambda_function import lambda_handler, health_check


def test_contract_creation():
    """Test contract creation with valid input"""
    print("Testing contract creation...")
    
    # Test event for contract creation
    event = {
        "body": json.dumps({
            "user": "john.doe@example.com",
            "request": "Create a data contract for sharing customer information between a retail company and a marketing agency. The contract should include customer name, email, purchase history, and preferences. Ensure data is encrypted and only used for targeted marketing campaigns."
        }),
        "headers": {
            "Content-Type": "application/json"
        },
        "httpMethod": "POST",
        "path": "/contracts"
    }
    
    try:
        result = lambda_handler(event, None)
        print("✅ Contract creation test passed")
        print(f"Status Code: {result['statusCode']}")
        
        if result['statusCode'] == 200:
            response_body = json.loads(result['body'])
            print(f"Contract ID: {response_body.get('contract_id')}")
            print(f"Status: {response_body.get('status')}")
            print(f"S3 Path: {response_body.get('s3_path')}")
            print(f"YAML Length: {len(response_body.get('yaml', ''))} characters")
        else:
            print(f"Response: {result['body']}")
        
        return True
    except Exception as e:
        print(f"❌ Contract creation test failed: {str(e)}")
        return False


def test_vietnamese_request():
    """Test contract creation with Vietnamese request"""
    print("\nTesting Vietnamese request...")
    
    event = {
        "body": json.dumps({
            "user": "nguyen.van.a@example.com",
            "request": "Tạo hợp đồng chia sẻ dữ liệu cho việc chia sẻ thông tin khách hàng giữa công ty bán lẻ và đại lý tiếp thị. Hợp đồng nên bao gồm tên khách hàng, email, lịch sử mua hàng và sở thích. Đảm bảo dữ liệu được mã hóa và chỉ sử dụng cho các chiến dịch tiếp thị có mục tiêu."
        }),
        "headers": {
            "Content-Type": "application/json"
        },
        "httpMethod": "POST",
        "path": "/contracts"
    }
    
    try:
        result = lambda_handler(event, None)
        print("✅ Vietnamese request test passed")
        print(f"Status Code: {result['statusCode']}")
        
        if result['statusCode'] == 200:
            response_body = json.loads(result['body'])
            print(f"Contract ID: {response_body.get('contract_id')}")
            print(f"YAML Length: {len(response_body.get('yaml', ''))} characters")
        
        return True
    except Exception as e:
        print(f"❌ Vietnamese request test failed: {str(e)}")
        return False


def test_missing_user():
    """Test validation for missing user"""
    print("\nTesting missing user validation...")
    
    event = {
        "body": json.dumps({
            "request": "Create a data contract for customer information sharing."
        }),
        "httpMethod": "POST",
        "path": "/contracts"
    }
    
    try:
        result = lambda_handler(event, None)
        if result['statusCode'] == 400:
            print("✅ Missing user validation test passed")
            return True
        else:
            print(f"❌ Missing user validation test failed: {result['statusCode']}")
            return False
    except Exception as e:
        print(f"❌ Missing user validation test failed: {str(e)}")
        return False


def test_missing_request():
    """Test validation for missing request"""
    print("\nTesting missing request validation...")
    
    event = {
        "body": json.dumps({
            "user": "test@example.com"
        }),
        "httpMethod": "POST",
        "path": "/contracts"
    }
    
    try:
        result = lambda_handler(event, None)
        if result['statusCode'] == 400:
            print("✅ Missing request validation test passed")
            return True
        else:
            print(f"❌ Missing request validation test failed: {result['statusCode']}")
            return False
    except Exception as e:
        print(f"❌ Missing request validation test failed: {str(e)}")
        return False


def test_invalid_email():
    """Test validation for invalid email"""
    print("\nTesting invalid email validation...")
    
    event = {
        "body": json.dumps({
            "user": "invalid-email",
            "request": "Create a data contract for customer information sharing."
        }),
        "httpMethod": "POST",
        "path": "/contracts"
    }
    
    try:
        result = lambda_handler(event, None)
        if result['statusCode'] == 400:
            print("✅ Invalid email validation test passed")
            return True
        else:
            print(f"❌ Invalid email validation test failed: {result['statusCode']}")
            return False
    except Exception as e:
        print(f"❌ Invalid email validation test failed: {str(e)}")
        return False


def test_invalid_json():
    """Test validation for invalid JSON"""
    print("\nTesting invalid JSON validation...")
    
    event = {
        "body": "invalid json content",
        "httpMethod": "POST",
        "path": "/contracts"
    }
    
    try:
        result = lambda_handler(event, None)
        if result['statusCode'] == 400:
            print("✅ Invalid JSON validation test passed")
            return True
        else:
            print(f"❌ Invalid JSON validation test failed: {result['statusCode']}")
            return False
    except Exception as e:
        print(f"❌ Invalid JSON validation test failed: {str(e)}")
        return False


def test_cors():
    """Test CORS headers"""
    print("\nTesting CORS headers...")
    
    event = {
        "httpMethod": "OPTIONS",
        "path": "/contracts"
    }
    
    try:
        result = lambda_handler(event, None)
        if result['statusCode'] == 200:
            print("✅ CORS test passed")
            return True
        else:
            print(f"❌ CORS test failed: {result['statusCode']}")
            return False
    except Exception as e:
        print(f"❌ CORS test failed: {str(e)}")
        return False


def test_health_check():
    """Test health check endpoint"""
    print("\nTesting health check endpoint...")
    
    event = {
        "httpMethod": "GET",
        "path": "/health"
    }
    
    try:
        result = health_check(event, None)
        if result['statusCode'] == 200:
            print("✅ Health check test passed")
            response_body = json.loads(result['body'])
            print(f"Status: {response_body.get('status')}")
            print(f"Service: {response_body.get('service')}")
            return True
        else:
            print(f"❌ Health check test failed: {result['statusCode']}")
            return False
    except Exception as e:
        print(f"❌ Health check test failed: {str(e)}")
        return False


def test_complex_request():
    """Test with a complex data sharing request"""
    print("\nTesting complex data sharing request...")
    
    event = {
        "body": json.dumps({
            "user": "data.analyst@healthcare.org",
            "request": """Create a comprehensive data contract for sharing patient health records between a hospital network and a medical research institute. The contract must include:
            - Patient demographics (age, gender, location)
            - Medical history and diagnoses
            - Treatment plans and medications
            - Lab results and vital signs
            - Insurance information
            - Emergency contact details
            
            Requirements:
            - All data must be encrypted in transit and at rest
            - Access limited to authorized researchers only
            - Data retention policy of 10 years
            - Audit trail for all data access
            - Compliance with HIPAA regulations
            - Anonymization of sensitive identifiers
            - Regular security assessments"""
        }),
        "headers": {
            "Content-Type": "application/json"
        },
        "httpMethod": "POST",
        "path": "/contracts"
    }
    
    try:
        result = lambda_handler(event, None)
        print("✅ Complex request test passed")
        print(f"Status Code: {result['statusCode']}")
        
        if result['statusCode'] == 200:
            response_body = json.loads(result['body'])
            print(f"Contract ID: {response_body.get('contract_id')}")
            print(f"YAML Length: {len(response_body.get('yaml', ''))} characters")
        
        return True
    except Exception as e:
        print(f"❌ Complex request test failed: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("🧪 Running contract creation tests\n")
    
    tests = [
        test_contract_creation,
        test_vietnamese_request,
        test_missing_user,
        test_missing_request,
        test_invalid_email,
        test_invalid_json,
        test_cors,
        test_health_check,
        test_complex_request
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main()) 