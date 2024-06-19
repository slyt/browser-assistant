async function testConnection() {
    const llmServer = "http://localhost:11434";
    const generateEndpoint = "/api/generate";
  
    const parameters = {
      model: "phi3",
      prompt: "Why is the sky blue? Answer in one concise sentence."
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
  
      const result = await response.json();
      console.log('LLM Response:', result);
      return result.response;
    } catch (error) {
      console.error('Error:', error);
      return 'An error occurred while communicating with the LLM server.';
    }
  }
  
  // Call this function to test the connection
  testConnection();
  