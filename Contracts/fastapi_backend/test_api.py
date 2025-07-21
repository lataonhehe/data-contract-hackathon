import requests
import json

BASE_URL = "http://localhost:8000"

# Test data
test_user = "john.doe@example.com"
test_request = "Create a data contract for sharing customer information between a retail company and a marketing agency."

def print_response(resp):
    print(f"Status: {resp.status_code}")
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text)
    print("\n" + "-"*40 + "\n")

def test_create_contract():
    print("Testing: POST /contracts (create contract)")
    payload = {"user": test_user, "request": test_request}
    resp = requests.post(f"{BASE_URL}/contracts", json=payload)
    print_response(resp)
    return resp.json().get("contract_id")

def test_get_all_contracts():
    print("Testing: GET /contracts (get all contracts)")
    resp = requests.get(f"{BASE_URL}/contracts")
    print_response(resp)

def test_get_contract(contract_id):
    print(f"Testing: GET /contracts/{{contract_id}} (get contract by id)")
    resp = requests.get(f"{BASE_URL}/contracts/{contract_id}")
    print_response(resp)

def test_update_contract(contract_id):
    print(f"Testing: PUT /contracts/{{contract_id}} (update contract)")
    payload = {"status": "UPDATED"}
    resp = requests.put(f"{BASE_URL}/contracts/{contract_id}", json=payload)
    print_response(resp)

def test_delete_contract(contract_id):
    print(f"Testing: DELETE /contracts/{{contract_id}} (delete contract)")
    resp = requests.delete(f"{BASE_URL}/contracts/{contract_id}")
    print_response(resp)

def test_generate_contract():
    print("Testing: POST /generate (generate contract, no save)")
    payload = {"description": test_request}
    resp = requests.post(f"{BASE_URL}/generate", json=payload)
    print_response(resp)

def test_stream_generate_contract():
    print("Testing: POST /contracts/stream-generate (stream contract generation)")
    payload = {"description": test_request}
    with requests.post(f"{BASE_URL}/contracts/stream-generate", json=payload, stream=True) as r:
        print(f"Status: {r.status_code}")
        for chunk in r.iter_content(chunk_size=None):
            if chunk:
                print(chunk.decode("utf-8"), end="", flush=True)
        print("\n" + "-"*40 + "\n")

def test_put_update_contract(contract_id):
    print(f"Testing: PUT /contracts/{{contract_id}} (update contract, reserved and non-reserved fields)")
    # Reserved keyword
    payload_reserved = {"status": "ACTIVE"}
    resp_reserved = requests.put(f"{BASE_URL}/contracts/{contract_id}", json=payload_reserved)
    print("Update reserved field 'status':")
    print_response(resp_reserved)
    # Non-reserved keyword
    payload_non_reserved = {"custom_field": "custom_value"}
    resp_non_reserved = requests.put(f"{BASE_URL}/contracts/{contract_id}", json=payload_non_reserved)
    print("Update non-reserved field 'custom_field':")
    print_response(resp_non_reserved)

def main():
    contract_id = test_create_contract()
    test_get_all_contracts()
    if contract_id:
        test_get_contract(contract_id)
        test_put_update_contract(contract_id)
        test_update_contract(contract_id)
        test_delete_contract(contract_id)
    test_generate_contract()
    test_stream_generate_contract()

if __name__ == "__main__":
    main() 