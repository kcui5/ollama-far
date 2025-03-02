import requests
import json


def call_deepseek(prompt):
    url = "https://p05--studio-6--jk66pcv2czhp.code.run/api/generate"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "deepseek-r1:32b",
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 40,
            "num_predict": 5000,
            "repeat_penalty": 1.1
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Request failed with status code {response.status_code}")

if __name__ == "__main__":
    
    # Call the model twice with "hello"
    for _ in range(2):
        result = call_deepseek("hello")
        print(json.dumps(result, indent=2))
