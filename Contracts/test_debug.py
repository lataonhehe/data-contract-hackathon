#!/usr/bin/env python3
"""
Debug test script for contract creation flow
"""

import json
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from handlers.contract_handler import handle_create_contract, handle_generate_contract

def test_generate_contract():
    """Test the generate contract endpoint"""
    print("Testing generate contract...")
    
    # Mock event for generate
    event = {
        'body': json.dumps({
            'description': 'Create a data contract for sharing customer information between a retail company and a marketing agency.'
        })
    }
    
    try:
        response = handle_generate_contract(event)
        print(f"Generate response: {json.dumps(response, indent=2)}")
        
        # Parse the body string to get the content
        body_str = response.get('body', '{}')
        body_data = json.loads(body_str)
        return body_data.get('content')
    except Exception as e:
        print(f"Generate failed: {str(e)}")
        return None

def test_create_contract(generated_content):
    """Test the create contract endpoint"""
    print("\nTesting create contract...")
    
    # Mock event for create
    event = {
        'body': json.dumps({
            'input_data': {
                'user': 'test@example.com',
                'request': 'Create a data contract for sharing customer information between a retail company and a marketing agency.'
            },
            'generated_content': generated_content
        })
    }
    
    try:
        response = handle_create_contract(event)
        print(f"Create response: {json.dumps(response, indent=2)}")
        return response
    except Exception as e:
        print(f"Create failed: {str(e)}")
        return None

def main():
    """Main test function"""
    print("=== Contract Creation Debug Test ===\n")
    
    # Test generate
    generated_content = test_generate_contract()
    
    if generated_content:
        print(f"\nGenerated content length: {len(generated_content)}")
        print(f"First 200 chars: {generated_content[:200]}...")
        
        # Test create with generated content
        result = test_create_contract(generated_content)
        
        if result:
            print("\n✅ SUCCESS: Contract creation works!")
        else:
            print("\n❌ FAILED: Contract creation failed!")
    else:
        print("\n❌ FAILED: Contract generation failed!")

if __name__ == "__main__":
    main() 