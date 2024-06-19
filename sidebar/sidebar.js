document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const userInput = document.getElementById('user-input').value;
  if (userInput) {
    displayMessage('User', userInput);
    getResponseFromLLM(userInput);
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
  const llmServer = "http://localhost:11434";
  const generateEndpoint = "/api/generate";

  const parameters = {
    model: "phi3",
    prompt: prompt,
    stream: true
  };

  try {
    const response = await fetch(llmServer + generateEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parameters)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server Error:', errorData);
      throw new Error(`Server Error: ${errorData.message}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (readerDone) break;
      result += decoder.decode(value, { stream: true });

      const lines = result.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].trim()) {
          const partial = JSON.parse(lines[i]);
          if (partial.response) {
            appendResponseChunk(partial.response);
          }
          done = partial.done;
        }
      }
      result = lines[lines.length - 1];
    }

    return 'Response complete.';
  } catch (error) {
    console.error('Error:', error);
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
