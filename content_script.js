browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    const elementsHTML = [...document.querySelectorAll('h1, h2, h3, p, table')]
      .map(element => element.outerHTML)
      .join('\n');
    sendResponse({ content: elementsHTML });
  }
});