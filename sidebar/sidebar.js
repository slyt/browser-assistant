document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('clear-button').addEventListener('click', clearOutput);
document.getElementById('user-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

let chatHistory = [];

async function getPageContent() {
  return new Promise((resolve, reject) => {
    browser.tabs.query({active: true, currentWindow: true}, tabs => {
      browser.tabs.sendMessage(tabs[0].id, {action: "getPageContent"}, response => {
        if (response && response.content) {
          resolve(response.content);
        } else {
          reject('Failed to get page content');
        }
      });
    });
  });
}

async function sendMessage() {
  const userInput = document.getElementById('user-input').value;
  if (userInput) {
    displayMessage('User', userInput);
    chatHistory.push({ role: 'user', content: userInput });
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

async function getResponseFromLLM(userPrompt) {
  const pageContent = await getPageContent(); // Get the scraped content
  const fullPrompt = pageContent + '\n\n' + userPrompt; // Prepend it to the user's prompt

  console.log('Full prompt:', fullPrompt); // Log the full prompt
  // The rest of your existing code to send `fullPrompt` to the LLM server
  const llmServer = document.getElementById('llmServer').value;
  const model = document.getElementById('model').value;
  const responseType = document.getElementById('responseType').value;
  const chatEndpoint = "/api/chat";
  const parameters = {
    model: model,
    messages: [{role: 'system', content:"You are an LLM assitent in a Firefox extention. You answer questions about content on the page."}, {role: 'user', content: fullPrompt} ], // Use fullPrompt here
    stream: responseType === 'streaming'
  };

  try {
    const response = await fetch(llmServer + chatEndpoint, {
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
              appendResponseChunk(parsedLine.message.content);
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
      chatHistory.push({ role: 'assistant', content: result.message.content });
      displayMessage('Bot', result.message.content);
      return result.message.content;
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
  chatHistory = [];
}
