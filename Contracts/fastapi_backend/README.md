# FastAPI Backend for Contract Service

This folder provides a FastAPI-based backend that mirrors the AWS Lambda contract service. It allows local development and testing of contract CRUD and generation endpoints.

## Features
- Same endpoints as the Lambda backend
- Uses the same contract, S3, and DynamoDB logic
- Easy to run locally with Uvicorn

## Running Locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the server:
   ```bash
   uvicorn main:app --reload
   ```
3. The API will be available at `http://localhost:8000`

## Endpoints
- `POST /contracts` - Create contract
- `GET /contracts` - List all contracts
- `GET /contracts/{contract_id}` - Get contract by ID
- `PUT /contracts/{contract_id}` - Update contract
- `DELETE /contracts/{contract_id}` - Delete contract
- `POST /generate` - Generate contract (no save)
- `POST /contracts/stream-generate` - Stream contract generation
- `GET /health` - Health check 