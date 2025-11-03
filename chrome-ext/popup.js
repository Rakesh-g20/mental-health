// popup.js
document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { action: "extractChat" }, async (response) => {
    const text = response?.text || "";
    if (!text) {
      document.getElementById("output").innerText = "❌ No chat text found!";
      return;
    }

    document.getElementById("output").innerText = "Analyzing...";

    try {
      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      document.getElementById("output").innerHTML = `
        Stress: <b>${data.category}</b><br>
         Score: ${data.stress_score}<br>
         Tip: ${data.suggestion}
      `;
    } catch (err) {
      document.getElementById("output").innerText = "⚠️ Error: " + err.message;
    }
  });
});
