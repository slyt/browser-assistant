document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('clear-button').addEventListener('click', clearOutput);
document.getElementById('user-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

async function sendMessage() {
  const userInput = document.getElementById('user-input').value;
  if (userInput) {
    displayMessage('User', userInput);
    await getResponseFromLLM(userInput);
    document.getElementById('user-input').value = '';
  }
}

function displayMessage(sender, message) {
  const messagesContainer = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = `${sender}: ${message}`;
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function getResponseFromLLM(prompt) {
  const llmServer = document.getElementById('llmServer').value;
  const model = document.getElementById('model').value;
  const responseType = document.getElementById('responseType').value;
  const generateEndpoint = "/api/generate";

  const parameters = {
    model: model,
    prompt: prompt,
    stream: responseType === 'streaming'
  };

  try {
    const response = await fetch(llmServer + generateEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parameters)
    });

    if (responseType === 'streaming') {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let resultText = '';
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: !readerDone });
        resultText += chunk;

        const lines = resultText.split('\n');
        resultText = lines.pop(); // Keep the last incomplete line

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsedLine = JSON.parse(line);
              appendResponseChunk(parsedLine.response);
            } catch (error) {
              console.error('Error parsing JSON:', line, error);
            }
          }
        }
      }
    } else {
      const text = await response.text();
      console.log('Raw Server Response:', text);  // Log the raw response text

      let result;
      try {
        result = JSON.parse(text);
      } catch (error) {
        console.error('Response is not valid JSON:', text);
        throw new Error('Server response is not valid JSON');
      }

      if (!response.ok) {
        console.error('Server Error:', result);
        throw new Error(`Server Error: ${result.message}`);
      }

      console.log('LLM Response:', result);
      displayMessage('Bot', result.response);
      return result.response;
    }
  } catch (error) {
    console.error('Error:', error);
    displayMessage('Bot', `An error occurred: ${error.message}`);
    return 'An error occurred while communicating with the LLM server.';
  }
}

function appendResponseChunk(chunk) {
  const messagesContainer = document.getElementById('messages');
  const lastMessage = messagesContainer.lastChild;

  if (lastMessage && lastMessage.textContent.startsWith('Bot:')) {
    lastMessage.textContent += chunk;
  } else {
    const messageElement = document.createElement('div');
    messageElement.textContent = `Bot: ${chunk}`;
    messagesContainer.appendChild(messageElement);
  }

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function clearOutput() {
  document.getElementById('messages').innerHTML = '';
}
