import json
import logging
import uuid
from typing import Dict, Any

from config import logger
from services.bedrock_service import generate_contract_with_bedrock, stream_contract_with_bedrock
from utils.aws_utils import (
    save_yaml_to_s3, 
    save_metadata_to_dynamodb, 
    get_contract, 
    update_contract, 
    delete_contract, 
    get_all_contracts
)
from utils.validators import validate_input
from utils.response_utils import create_response, create_error_response

def handle_generate_contract(event):
    """
    Handle contract generation (without saving)
    
    Args:
        event: API Gateway event
        
    Returns:
        API Gateway response with generated contract content
    """
    try:
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        
        description = body.get('description')
        if not description:
            return create_error_response(400, "Bad Request", "Description is required")
        
        logger.info(f"Generating contract for description: {description}")
        
        # Generate contract with Bedrock
        yaml_content = generate_contract_with_bedrock(description)
        
        response_body = {
            "content": yaml_content,
            "message": "Contract generated successfully"
        }
        
        logger.info("Contract generation completed")
        return create_response(200, response_body)
        
    except Exception as e:
        logger.error(f"Contract generation failed: {str(e)}")
        return create_error_response(500, "Contract Generation Failed", str(e))


def handle_stream_generate_contract(event):
    """
    Handle streaming contract generation (without saving)
    Args:
        event: API Gateway event
    Yields:
        Chunks of generated contract content
    """
    try:
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        description = body.get('description')
        if not description:
            yield json.dumps({"error": "Description is required"})
            return
        logger.info(f"Streaming contract generation for description: {description}")
        for chunk in stream_contract_with_bedrock(description):
            yield chunk
    except Exception as e:
        logger.error(f"Streaming contract generation failed: {str(e)}")
        yield json.dumps({"error": str(e)})


def handle_create_contract(event):
    """
    Handle contract creation
    
    Args:
        event: API Gateway event
        
    Returns:
        API Gateway response
    """
    try:
        input_data = validate_input(event)
        user = input_data['user']
        request = input_data['request']
        
        contract_id = str(uuid.uuid4())
        logger.info(f"Generated contract ID: {contract_id}")
        
        # Generate contract with Bedrock
        yaml_content = generate_contract_with_bedrock(request)
        
        # Save to S3
        s3_path = save_yaml_to_s3(contract_id, yaml_content)
        
        # Save metadata to DynamoDB
        save_metadata_to_dynamodb(contract_id, user, s3_path)
        
        response_body = {
            "contract_id": contract_id,
            "status": "DRAFT",
            "s3_path": s3_path,
            "yaml": yaml_content,
            "message": "Contract created successfully"
        }
        
        logger.info(f"Contract creation completed: {contract_id}")
        return create_response(200, response_body)
        
    except ValueError as e:
        logger.error(f"Input validation error: {str(e)}")
        return create_error_response(400, "Bad Request", str(e))
    except Exception as e:
        logger.error(f"Contract creation failed: {str(e)}")
        return create_error_response(500, "Contract Creation Failed", str(e))


def handle_get_all_contracts():
    """
    Handle getting all contracts
    
    Returns:
        API Gateway response
    """
    try:
        contracts = get_all_contracts()
        return create_response(200, {"contracts": contracts})
    except Exception as e:
        logger.error(f"Failed to fetch all contracts: {str(e)}")
        return create_error_response(500, "Fetch Failed", str(e))


def handle_get_contract(contract_id: str):
    """
    Handle getting a specific contract
    
    Args:
        contract_id: Contract ID
        
    Returns:
        API Gateway response
    """
    try:
        contract = get_contract(contract_id)
        return create_response(200, contract)
    except Exception as e:
        logger.error(f"Contract fetch failed: {str(e)}")
        return create_error_response(404, "Not Found", str(e))


def handle_update_contract(contract_id: str, event):
    """
    Handle contract update
    
    Args:
        contract_id: Contract ID
        event: API Gateway event
        
    Returns:
        API Gateway response
    """
    try:
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        
        updates = body if isinstance(body, dict) else {}
        if not updates:
            return create_error_response(400, "Bad Request", "No update fields provided")
        
        updated_contract = update_contract(contract_id, updates)
        return create_response(200, updated_contract)
    except Exception as e:
        logger.error(f"Contract update failed: {str(e)}")
        return create_error_response(400, "Update Failed", str(e))


def handle_delete_contract(contract_id: str):
    """
    Handle contract deletion
    
    Args:
        contract_id: Contract ID
        
    Returns:
        API Gateway response
    """
    try:
        delete_contract(contract_id)
        return create_response(200, {"message": f"Contract {contract_id} deleted successfully"})
    except Exception as e:
        logger.error(f"Contract delete failed: {str(e)}")
        return create_error_response(400, "Delete Failed", str(e)) 


def handle_save_generated_contract(event):
    """
    Save a contract with provided YAML/content and metadata (no generation).
    Args:
        event: API Gateway event
    Returns:
        API Gateway response
    """
    try:
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        user = body.get('user')
        request = body.get('request')
        yaml_content = body.get('content') or body.get('yaml')
        if not user or not request or not yaml_content:
            return create_error_response(400, "Bad Request", "user, request, and content are required")
        contract_id = str(uuid.uuid4())
        logger.info(f"Saving provided contract ID: {contract_id}")
        # Save to S3
        s3_path = save_yaml_to_s3(contract_id, yaml_content)
        # Save metadata to DynamoDB
        save_metadata_to_dynamodb(contract_id, user, s3_path)
        response_body = {
            "contract_id": contract_id,
            "status": "DRAFT",
            "s3_path": s3_path,
            "yaml": yaml_content,
            "message": "Contract saved successfully"
        }
        logger.info(f"Contract saved: {contract_id}")
        return create_response(200, response_body)
    except Exception as e:
        logger.error(f"Contract save failed: {str(e)}")
        return create_error_response(500, "Contract Save Failed", str(e)) 