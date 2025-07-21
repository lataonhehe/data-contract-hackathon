import boto3
import json

# --- Configuration ---
REGION = "us-east-1"
MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"
PROMPT = "Create a data contract for sharing customer information between a retail company and a marketing agency."

# --- Bedrock Client ---
client = boto3.client("bedrock-runtime", region_name=REGION)

# --- Request Payload ---
request_body = {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 512,
    "temperature": 0.5,
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": PROMPT
                }
            ]
        }
    ]
}

# --- Streaming Call ---
response = client.invoke_model_with_response_stream(
    modelId=MODEL_ID,
    body=json.dumps(request_body),
    contentType="application/json"
)

print("Streaming response:\n")
for event in response["body"]:
    chunk = json.loads(event["chunk"]["bytes"])
    if chunk["type"] == "content_block_delta":
        print(chunk["delta"].get("text", ""), end="", flush=True)
print("\n\n--- Stream complete ---")