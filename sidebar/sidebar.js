document.getElementById('send-button').addEventListener('click', async () => {
  const userInput = document.getElementById('user-input').value;
  if (userInput) {
    const response = await getResponseFromLLM(userInput);
    displayMessage('User', userInput);
    displayMessage('Bot', response);
    document.getElementById('user-input').value = '';
  }
});

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
      throw new Error(`Error: ${errorData}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });

      // Attempt to parse the streaming response
      try {
        const partial = JSON.parse(result);
        displayMessage('Bot', partial.response);
      } catch (e) {
        // If parsing fails, continue reading
        continue;
      }
    }

    return result;
  } catch (error) {
    console.error('Error:', error);
    return 'An error occurred while communicating with the LLM server.';
  }
}
