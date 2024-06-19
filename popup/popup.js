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
  
  async function getResponseFromLLM(question) {
    const response = await fetch('http://localhost:port/path/to/ollama', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    return data.answer;
  }
  