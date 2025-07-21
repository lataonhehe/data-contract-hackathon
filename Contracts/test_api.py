import requests

url = "http://localhost:3000/contracts/stream-generate"
payload = {"description": "Create a data contract for sharing customer information between a retail company and a marketing agency."}
headers = {"Content-Type": "application/json"}

with requests.post(url, json=payload, stream=True) as r:
    for chunk in r.iter_content(chunk_size=None):
        if chunk:
            print(chunk.decode("utf-8"), end="", flush=True)