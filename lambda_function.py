import json
import logging
from typing import Dict, Any
from datetime import datetime, timezone

from config import logger
from handlers.contract_handler import (
    handle_create_contract,
    handle_get_all_contracts,
    handle_get_contract,
    handle_update_contract,
    handle_delete_contract
)
from utils.response_utils import create_response, create_error_response


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler function for contract CRUD operations
    Args:
        event: Lambda event object from API Gateway
        context: Lambda context object
    Returns:
        API Gateway response
    """
    try:
        logger.info(f"Event received: {json.dumps(event, indent=2)}")

        # Handle OPTIONS request for CORS
        if event.get('httpMethod') == 'OPTIONS':
            return create_response(200, {"message": "OK"})

        method = event.get('httpMethod')
        path = event.get('resource') or event.get('path')
        path_params = event.get('pathParameters') or {}
        contract_id = path_params.get('contract_id') if path_params else None

        # CREATE (POST /contracts)
        if method == 'POST' and path == '/contracts':
            return handle_create_contract(event)

        # GET ALL (GET /contracts)
        if method == 'GET' and path == '/contracts':
            return handle_get_all_contracts()

        # READ (GET /contracts/{contract_id})
        if method == 'GET' and path == '/contracts/{contract_id}' and contract_id:
            return handle_get_contract(contract_id)

        # UPDATE (PUT /contracts/{contract_id})
        if method == 'PUT' and path == '/contracts/{contract_id}' and contract_id:
            return handle_update_contract(contract_id, event)

        # DELETE (DELETE /contracts/{contract_id})
        if method == 'DELETE' and path == '/contracts/{contract_id}' and contract_id:
            return handle_delete_contract(contract_id)

        # If no route matched
        return create_error_response(404, "Not Found", "Invalid route or method")

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_error_response(500, "Internal Server Error", "An unexpected error occurred")


def health_check(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Health check endpoint
    
    Args:
        event: Lambda event object
        context: Lambda context object
        
    Returns:
        Health check response
    """
    return create_response(200, {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "createContract"
    }) 