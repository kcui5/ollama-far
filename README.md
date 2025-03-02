Ollama FAR: Function Assisted Reasoning for Ollama

We benchmark ollama Deepseek-r1:32b on the task of spreadsheet analytics. 

Existing LLMs suffer from the large context window of spreadsheet data and the low precision numerical computation. Therefore, we add function calling during the inference of the LLM to inject efficient and deterministic computations such as MEAN(A1, B12) and CORRELATION(A1, B12, C1, D12) during inference to help LLM get the right answer faster (enabled by the ability to pass in sparse spreadsheet information instead of dense spreadsheet cells) and more accurately (enabled by deterministic computation).