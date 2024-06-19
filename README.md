# browser-assistent

An AI browser assistent addon for Firefox that can read the text on the screen and have a chat about it. Tested with LLM backend [Ollama](https://github.com/ollama/ollama) assumed to be hosted at `http://localhost:11434`.

## TODO
- [x] Talk to Ollama
- [ ] Send text on screen as part of input context
- [ ] Use vision model to dynamically generate enriched alt text for images to be sent as text to the input context.
- [ ] Make model and endpoint configurable


## Loading the extension in Firefox

Load the Extension in Firefox:

1. Install Firefox Developer Edition
2. Open Firefox and navigate to about:debugging.
3. Click on "This Firefox" on the left hand side and then "Load Temporary Add-on".
4. Select the `manifest.json` file from your extension directory.