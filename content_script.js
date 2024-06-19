browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageContent") {
      sendResponse({ content: document.body.innerText });
    }
  });
  