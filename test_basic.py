#!/usr/bin/env python3
"""
Basic test script for the contract creation Lambda function
Tests validation and response formatting without AWS services
"""

import json
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mock AWS environment for testing
os.environ['AWS_REGION'] = 'us-east-1'

from lambda_function import create_response, validate_input


def test_validation():
    """Test input validation functions"""
    print("🧪 Testing input validation...")
    
    # Test valid input
    try:
        event = {
            "body": json.dumps({
                "user": "test@example.com",
                "request": "Create a data contract for customer information sharing."
            })
        }
        
        result = validate_input(event)
        print("✅ Valid input test passed")
        print(f"   User: {result['user']}")
        print(f"   Request: {result['request'][:50]}...")
        
    except Exception as e:
        print(f"❌ Valid input test failed: {str(e)}")
        return False
    
    # Test missing user
    try:
        event = {
            "body": json.dumps({
                "request": "Create a data contract."
            })
        }
        
        validate_input(event)
        print("❌ Missing user test failed - should have raised ValueError")
        return False
        
    except ValueError as e:
        if "Missing required field: user" in str(e):
            print("✅ Missing user validation test passed")
        else:
            print(f"❌ Missing user test failed: {str(e)}")
            return False
    
    # Test missing request
    try:
        event = {
            "body": json.dumps({
                "user": "test@example.com"
            })
        }
        
        validate_input(event)
        print("❌ Missing request test failed - should have raised ValueError")
        return False
        
    except ValueError as e:
        if "Missing required field: request" in str(e):
            print("✅ Missing request validation test passed")
        else:
            print(f"❌ Missing request test failed: {str(e)}")
            return False
    
    # Test invalid email
    try:
        event = {
            "body": json.dumps({
                "user": "invalid-email",
                "request": "Create a data contract."
            })
        }
        
        validate_input(event)
        print("❌ Invalid email test failed - should have raised ValueError")
        return False
        
    except ValueError as e:
        if "User must be a valid email address" in str(e):
            print("✅ Invalid email validation test passed")
        else:
            print(f"❌ Invalid email test failed: {str(e)}")
            return False
    
    # Test invalid JSON
    try:
        event = {
            "body": "invalid json content"
        }
        
        validate_input(event)
        print("❌ Invalid JSON test failed - should have raised ValueError")
        return False
        
    except ValueError as e:
        if "Invalid JSON" in str(e):
            print("✅ Invalid JSON validation test passed")
        else:
            print(f"❌ Invalid JSON test failed: {str(e)}")
            return False
    
    return True


def test_response_formatting():
    """Test response formatting functions"""
    print("\n🧪 Testing response formatting...")
    
    # Test success response
    try:
        response = create_response(200, {
            "contract_id": "test-id",
            "status": "DRAFT",
            "message": "Success"
        })
        
        if response['statusCode'] == 200:
            print("✅ Success response formatting test passed")
        else:
            print(f"❌ Success response test failed: {response['statusCode']}")
            return False
            
    except Exception as e:
        print(f"❌ Success response test failed: {str(e)}")
        return False
    
    # Test error response
    try:
        response = create_response(400, {
            "error": "Bad Request",
            "message": "Validation failed"
        })
        
        if response['statusCode'] == 400:
            print("✅ Error response formatting test passed")
        else:
            print(f"❌ Error response test failed: {response['statusCode']}")
            return False
            
    except Exception as e:
        print(f"❌ Error response test failed: {str(e)}")
        return False
    
    # Test CORS headers
    try:
        response = create_response(200, {"message": "OK"})
        headers = response['headers']
        
        required_headers = [
            'Content-Type',
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Methods'
        ]
        
        missing_headers = [h for h in required_headers if h not in headers]
        
        if not missing_headers:
            print("✅ CORS headers test passed")
        else:
            print(f"❌ CORS headers test failed - missing: {missing_headers}")
            return False
            
    except Exception as e:
        print(f"❌ CORS headers test failed: {str(e)}")
        return False
    
    return True


def test_vietnamese_input():
    """Test Vietnamese input handling"""
    print("\n🧪 Testing Vietnamese input...")
    
    try:
        event = {
            "body": json.dumps({
                "user": "nguyen.van.a@example.com",
                "request": "Tạo hợp đồng chia sẻ dữ liệu cho việc chia sẻ thông tin khách hàng giữa công ty bán lẻ và đại lý tiếp thị."
            })
        }
        
        result = validate_input(event)
        print("✅ Vietnamese input test passed")
        print(f"   User: {result['user']}")
        print(f"   Request: {result['request'][:50]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Vietnamese input test failed: {str(e)}")
        return False


def main():
    """Run all basic tests"""
    print("🧪 Running basic tests for contract creation function\n")
    
    tests = [
        test_validation,
        test_response_formatting,
        test_vietnamese_input
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All basic tests passed!")
        print("\n💡 Next steps:")
        print("1. Set AWS region: set AWS_REGION=us-east-1")
        print("2. Test with AWS services: python test_contract.py")
        print("3. Deploy to AWS: serverless deploy")
        return 0
    else:
        print("❌ Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main()) 