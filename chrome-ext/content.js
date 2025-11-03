function getChatMessages() {
  const messages = [];
  document.querySelectorAll("div.message-in, div.message-out").forEach(msg => {
    const textSpan = msg.querySelector("span.selectable-text");
    if (textSpan) messages.push(textSpan.innerText);
  });
  return messages.join(" ");
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractChat") {
    const data = getChatMessages();
    sendResponse({ text: data });
  }
});
