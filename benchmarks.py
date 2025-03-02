import requests
import json
import time

with open('output.txt', 'r') as f:
    output_text = f.read()

prompts = [
    "What is the average of row 11 Total COGS?",
    "What is the sum of row 11 Total COGS?", 
    "What is the average of row 23 Net Income?",
    "What is the sum of row 23 Net Income?",
    "What is the average of row 29 EBITDA?",
    "What is the sum of row 29 EBITDA?",
    "What is the average of row 27 D&A?",
    "What is the sum of row 27 D&A?",
    "What is the average of row 38 Deferred Revenue?",
    "What is the sum of row 38 Deferred Revenue?",
    "What is the average of row 39 Deferred Taxes?",
    "What is the sum of row 39 Deferred Taxes?",
    "What is the correlation between row 12 Gross Profit and row 13 R&D?",
    "What is the correlation between row 12 Gross Profit and row 14 S&M?",
    "What is the correlation between row 12 Gross Profit and row 16 Operating Expenses?",
    "What is the correlation between row 34 Net Income and row 39 Deferred Taxes?",
    "What is the correlation between row 34 Net Income and row 37 SBC?",
    "What is the correlation between row 50 Capex and row 51 M&A?",
]


def call_deepseek(prompt):
    url = "http://localhost:11434/api/generate"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "deepseek-r1:32b",
        "prompt": output_text + "\n" +  prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 40,
            "num_predict": 100,
            "repeat_penalty": 1.1
        }
    }

    start_time = time.time()
    response = requests.post(url, headers=headers, json=payload)
    end_time = time.time()
    
    if response.status_code == 200:
        result = response.json()
        result['time_taken'] = end_time - start_time
        return result
    else:
        raise Exception(f"Request failed with status code {response.status_code}")

if __name__ == "__main__":
    for task in prompts:
        result = call_deepseek(task)
        print(json.dumps(result, indent=2))
