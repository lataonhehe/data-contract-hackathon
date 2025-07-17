#!/usr/bin/env python3
"""
Complete flow test for contract generation and creation
"""

import json
import sys
import os
import traceback

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from handlers.contract_handler import handle_create_contract, handle_generate_contract

def test_complete_flow():
    """Test the complete flow: generate -> create"""
    print("=== Complete Contract Flow Test ===\n")
    
    # Step 1: Generate contract
    print("Step 1: Generating contract...")
    generate_event = {
        'body': json.dumps({
            'description': 'Create a data contract for sharing customer information between a retail company and a marketing agency.'
        })
    }
    
    try:
        generate_response = handle_generate_contract(generate_event)
        print("✅ Generate successful")
        
        # Parse the response body
        body_str = generate_response.get('body', '{}')
        body_data = json.loads(body_str)
        generated_content = body_data.get('content')
        
        if not generated_content:
            print("❌ No content generated")
            return False
            
        print(f"Generated content length: {len(generated_content)}")
        
    except Exception as e:
        print(f"❌ Generate failed: {str(e)}")
        traceback.print_exc()
        return False
    
    # Step 2: Create contract with generated content
    print("\nStep 2: Creating contract with generated content...")
    create_event = {
        'body': json.dumps({
            'input_data': {
                'user': 'test@example.com',
                'request': 'Create a data contract for sharing customer information between a retail company and a marketing agency.'
            },
            'generated_content': generated_content
        })
    }
    
    try:
        create_response = handle_create_contract(create_event)
        print("✅ Create successful")
        
        # Parse the response body
        body_str = create_response.get('body', '{}')
        body_data = json.loads(body_str)
        
        contract_id = body_data.get('contract_id')
        status = body_data.get('status')
        s3_path = body_data.get('s3_path')
        
        print(f"Contract ID: {contract_id}")
        print(f"Status: {status}")
        print(f"S3 Path: {s3_path}")
        
        if contract_id and status and s3_path:
            print("✅ Complete flow successful!")
            return True
        else:
            print("❌ Missing required fields in response")
            return False
            
    except Exception as e:
        print(f"❌ Create failed: {str(e)}")
        traceback.print_exc()
        return False

def test_create_without_generated_content():
    """Test create without pre-generated content (fallback)"""
    print("\n=== Testing Create Without Pre-generated Content ===\n")
    
    create_event = {
        'body': json.dumps({
            'input_data': {
                'user': 'test2@example.com',
                'request': 'Create a data contract for sharing employee performance data.'
            }
            # No generated_content - should fallback to generating new
        })
    }
    
    try:
        create_response = handle_create_contract(create_event)
        print("✅ Create without pre-generated content successful")
        
        # Parse the response body
        body_str = create_response.get('body', '{}')
        body_data = json.loads(body_str)
        
        contract_id = body_data.get('contract_id')
        status = body_data.get('status')
        
        print(f"Contract ID: {contract_id}")
        print(f"Status: {status}")
        
        return True
        
    except Exception as e:
        print(f"❌ Create without pre-generated content failed: {str(e)}")
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    print("Starting complete flow tests...\n")
    
    # Test complete flow
    success1 = test_complete_flow()
    
    # Test fallback flow
    success2 = test_create_without_generated_content()
    
    if success1 and success2:
        print("\n🎉 All tests passed!")
    else:
        print("\n❌ Some tests failed!")

if __name__ == "__main__":
    main() 