import json
import logging
from botocore.exceptions import ClientError, BotoCoreError
from config import bedrock_runtime, BEDROCK_MODEL_ID, SYSTEM_MESSAGE

logger = logging.getLogger()

def generate_contract_with_bedrock(request: str) -> str:
    """
    Generate YAML contract using Amazon Bedrock Claude 3 Sonnet
    
    Args:
        request: Natural language request describing data sharing requirements
        
    Returns:
        Generated YAML contract
        
    Raises:
        Exception: If Bedrock API call fails
    """
    try:
        # Prepare the request payload for Claude 3 Sonnet
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,
            "temperature": 0.3,
            "messages": [
                {
                    "role": "user",
                    "content": f"{SYSTEM_MESSAGE}\n\nUser request: {request}"
                }
            ]
        }
        
        logger.info(f"Invoking Bedrock model: {BEDROCK_MODEL_ID}")
        
        # Call Bedrock API
        response = bedrock_runtime.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_body)
        )
        
        # Parse the response
        response_body = json.loads(response['body'].read())
        generated_yaml = response_body['content'][0]['text']
        
        logger.info("Successfully generated contract with Bedrock")
        return generated_yaml
        
    except (ClientError, BotoCoreError) as e:
        logger.error(f"Bedrock API error: {str(e)}")
        raise Exception(f"Failed to generate contract with Bedrock: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating contract: {str(e)}")
        raise Exception(f"Error generating contract: {str(e)}") 

def stream_contract_with_bedrock(request: str):
    """
    Stream YAML contract generation using Amazon Bedrock Claude 3 Sonnet
    Args:
        request: Natural language request describing data sharing requirements
    Yields:
        Chunks of generated YAML contract as they are produced
    Raises:
        Exception: If Bedrock API call fails
    """
    try:
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,
            "temperature": 0.3,
            "messages": [
                {
                    "role": "user",
                    "content": f"{SYSTEM_MESSAGE}\n\nUser request: {request}"
                }
            ]
        }
        logger.info(f"Invoking Bedrock model (stream): {BEDROCK_MODEL_ID}")
        response = bedrock_runtime.invoke_model_with_response_stream(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(request_body),
            contentType="application/json"
        )
        for event in response["body"]:
            chunk = json.loads(event["chunk"]["bytes"])
            if chunk["type"] == "content_block_delta":
                yield chunk["delta"].get("text", "")
    except (ClientError, BotoCoreError) as e:
        logger.error(f"Bedrock API error (stream): {str(e)}")
        raise Exception(f"Failed to stream contract with Bedrock: {str(e)}")
    except Exception as e:
        logger.error(f"Error streaming contract: {str(e)}")
        raise Exception(f"Error streaming contract: {str(e)}") 