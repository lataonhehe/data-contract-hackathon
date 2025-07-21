from fastapi import APIRouter, Request, HTTPException, status, Response
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional
import json
import sys
import os

# Add Contracts/ to sys.path for imports if running as a module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from handlers.contract_handler import (
    handle_create_contract,
    handle_get_all_contracts,
    handle_get_contract,
    handle_update_contract,
    handle_delete_contract,
    handle_generate_contract,
    handle_stream_generate_contract,
    handle_save_generated_contract
)

router = APIRouter()

def parse_lambda_response(lambda_resp):
    # Lambda handlers return a dict with 'statusCode' and 'body' (JSON string)
    status_code = lambda_resp.get("statusCode", 200)
    body = lambda_resp.get("body", "{}")
    try:
        data = json.loads(body)
    except Exception:
        data = body
    return status_code, data

@router.post("/contracts")
async def create_contract(request: Request):
    body = await request.json()
    event = {"body": body}
    lambda_resp = handle_create_contract(event)
    status_code, data = parse_lambda_response(lambda_resp)
    return JSONResponse(content=data, status_code=status_code)

@router.get("/contracts")
async def get_all_contracts():
    lambda_resp = handle_get_all_contracts()
    status_code, data = parse_lambda_response(lambda_resp)
    return JSONResponse(content=data, status_code=status_code)

@router.get("/contracts/{contract_id}")
async def get_contract(contract_id: str):
    lambda_resp = handle_get_contract(contract_id)
    status_code, data = parse_lambda_response(lambda_resp)
    return JSONResponse(content=data, status_code=status_code)

@router.put("/contracts/{contract_id}")
async def update_contract(contract_id: str, request: Request):
    body = await request.json()
    event = {"body": body}
    lambda_resp = handle_update_contract(contract_id, event)
    status_code, data = parse_lambda_response(lambda_resp)
    return JSONResponse(content=data, status_code=status_code)

@router.delete("/contracts/{contract_id}")
async def delete_contract(contract_id: str):
    lambda_resp = handle_delete_contract(contract_id)
    status_code, data = parse_lambda_response(lambda_resp)
    return JSONResponse(content=data, status_code=status_code)

@router.post("/generate")
async def generate_contract(request: Request):
    body = await request.json()
    event = {"body": body}
    lambda_resp = handle_generate_contract(event)
    status_code, data = parse_lambda_response(lambda_resp)
    return JSONResponse(content=data, status_code=status_code)

@router.post("/generate/stream")
async def stream_generate_contract(request: Request):
    body = await request.json()
    event = {"body": body}
    def stream():
        for chunk in handle_stream_generate_contract(event):
            yield chunk
    return StreamingResponse(stream(), media_type="text/plain")

@router.post("/contracts/save")
async def save_generated_contract(request: Request):
    body = await request.json()
    event = {"body": body}
    lambda_resp = handle_save_generated_contract(event)
    status_code, data = parse_lambda_response(lambda_resp)
    return JSONResponse(content=data, status_code=status_code) 