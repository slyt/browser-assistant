import requests
import json
import base64

chat_endpoint = "/api/chat"
llm_server = "http://localhost:11434" # Url of the locally running Ollama LLM server



parameters = {"model":"llava", # LLM model to use
              "prompt":"Why is the sky blue? Answer in one concise sentence.", # Prompt to respond to
              "stream": True}

# load image and encode in base64
with open("test_page_screenshot.png", "rb") as image_file:
    encoded_image = base64.b64encode(image_file.read()).decode('utf-8')


parameters = {
  "model": "llava-llama3",
  "messages": [
    {
      "role": "user",
      "content": "what is in this image?",
      "images": [encoded_image]
    }
  ],
  "stream": True
}

try:
    response = requests.post(llm_server + chat_endpoint, json=parameters, stream=True) # Send data to the LLM using streaming
    response.raise_for_status()
    for line in response.iter_lines(): # stream the response one token (word) at a time
        partial = json.loads(line) 
        # response is formatted like:{'model': 'llava', 'created_at': '2024-06-19T19:29:02.631639646Z', 'message': {'role': 'assistant', 'content': ' interface'}, 'done': False}

        print(partial['message']['content'], end='', flush=True)         # print without newline
except requests.exceptions.RequestException as e:
    print(response.json())
    print(e)
    exit(1)
