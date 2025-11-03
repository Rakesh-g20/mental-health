// frontend/src/utils/whatsappParser.js
export function parseWhatsAppChat(text) {
  const lines = text.split("\n");
  const messages = [];

  // 🧩 Flexible regex: supports various dash and spacing styles
  const regex =
    /^(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2}\s?(?:am|pm|AM|PM))\s*[–-]\s*([^:]+):\s*(.+)$/u;

  console.log("Total lines:", lines.length);

  for (let line of lines) {
    // 🧼 normalize hidden characters
    line = line.replace(/\u200e|\u202f|\r/g, "").trim();

    const match = line.match(regex);
    if (match) {
      const [_, date, time, sender, message] = match;
      messages.push({ date, time, sender, message });
    } else {
      console.warn("❌ No match for line:", JSON.stringify(line));
    }
  }

  console.log("✅ Parsed Messages:", messages.length);
  return messages;
}
