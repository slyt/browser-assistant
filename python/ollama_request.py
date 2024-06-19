# I don't know javascript, so I wrote this in python to have ChatGPT convert it's logic to javascript
# in order to get the project going

import requests
import json

llm_server = "http://localhost:11434" # Url of the locally running Ollama LLM server

generate_endpoint = "/api/generate"

parameters = {"model":"phi3", # LLM model to use
              "prompt":"Why is the sky blue? Answer in one concise sentence.", # Prompt to respond to
              "stream": True}

try:
    response = requests.post(llm_server + generate_endpoint, json=parameters, stream=True) # Send data to the LLM using streaming
    response.raise_for_status()
    for line in response.iter_lines(): # stream the response one token (word) at a time
        partial = json.loads(line) 
        print(partial) # response is formatted like: {'model': 'phi3', 'created_at': '2024-06-19T03:29:44.73187Z', 'response': ' The', 'done': False}
except requests.exceptions.RequestException as e:
    print(response.json())
    print(e)
    exit(1)

