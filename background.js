browser.runtime.onInstalled.addListener(() => {
    // Open the sidebar on install
    browser.sidebarAction.open();
  });
  
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageContent") {
      browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        browser.tabs.sendMessage(tabs[0].id, { action: "getPageContent" }, (response) => {
          sendResponse(response);
        });
      });
      return true; // Keep the message channel open for sendResponse
    }
  });
  
  // Toggle sidebar visibility
  let isSidebarOpen = false;

  browser.browserAction.onClicked.addListener(() => {
    if (isSidebarOpen) {
      browser.sidebarAction.close();
    } else {
      browser.sidebarAction.open();
    }
    isSidebarOpen = !isSidebarOpen;
  });