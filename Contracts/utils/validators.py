import json
import logging

logger = logging.getLogger()

def validate_input(event):
    """
    Validate and extract input from the API Gateway event
    
    Args:
        event: API Gateway event
        
    Returns:
        Validated input data
        
    Raises:
        ValueError: If required fields are missing
    """
    try:
        # Parse the request body
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)
        
        # Check for nested input_data structure first
        if 'input_data' in body:
            input_data = body['input_data']
            user = input_data.get('user')
            request = input_data.get('request')
        else:
            # Fallback to direct fields for backward compatibility
            user = body.get('user')
            request = body.get('request')
        
        # Validate required fields
        if not user:
            raise ValueError("Missing required field: user")
        
        if not request:
            raise ValueError("Missing required field: request")
        
        # Validate user is an email
        if '@' not in user or '.' not in user:
            raise ValueError("User must be a valid email address")
        
        return {
            'user': user,
            'request': request
        }
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in request body: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error parsing request: {str(e)}") 