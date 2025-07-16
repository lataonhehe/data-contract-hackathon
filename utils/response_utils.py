import json
import logging
from datetime import datetime, timezone

logger = logging.getLogger()

def create_response(status_code: int, body):
    """
    Create a standardized API Gateway response
    
    Args:
        status_code: HTTP status code
        body: Response body
        
    Returns:
        API Gateway response format
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE"
        },
        "body": json.dumps(body)
    }


def create_error_response(status_code: int, error: str, message: str):
    """
    Create a standardized error response
    
    Args:
        status_code: HTTP status code
        error: Error type
        message: Error message
        
    Returns:
        API Gateway error response format
    """
    return create_response(status_code, {
        "error": error,
        "message": message
    })


def create_success_response(data, message: str = "Success"):
    """
    Create a standardized success response
    
    Args:
        data: Response data
        message: Success message
        
    Returns:
        API Gateway success response format
    """
    return create_response(200, {
        "data": data,
        "message": message
    }) 