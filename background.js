chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.text && sender.tab?.id) {
    const isParagraph = request.text.includes(' ') || request.text.length > 50;
    if (isParagraph) {
      getMeaningFromGemini(request.text, sender.tab.id, true);
    } else {
      getMeaningForWord(request.text, sender.tab.id);
    }
  }
  return true;
});

async function getMeaningForWord(word, tabId) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) {
      throw new Error(`Dictionary API error: ${response.status}`);
    }
    const data = await response.json();
    if (data.title === "No Definitions Found") {
      console.log(`No definition found for "${word}". Falling back to Gemini.`);
      getMeaningFromGemini(word, tabId, false);
      return;
    }
    const definitions = data[0]?.meanings[0]?.definitions;
    if (definitions && definitions.length > 0) {
      const meaning = definitions.map((def, index) => `${index + 1}. ${def.definition}`).join('<br>');
      chrome.storage.local.set({ meaning, word });
      chrome.tabs.sendMessage(tabId, { type: 'meaningResult', word, meaning });
    } else {
      console.log(`No definitions available for "${word}". Falling back to Gemini.`);
      getMeaningFromGemini(word, tabId, false);
    }
  } catch (error) {
    console.error("Dictionary API Error:", error);
    getMeaningFromGemini(word, tabId, false);
  }
}

async function getMeaningFromGemini(text, tabId, isParagraph) {
  const resultWord = isParagraph ? "Paragraph Summary" : text;
  const prompt = isParagraph
    ? `Summarize the following paragraph in simple terms:\n\n${text}`
    : `Define the following word: "${text}"`;

  chrome.storage.sync.get(['geminiApiKey'], async (result) => {
    const apiKey = result.geminiApiKey;
    let meaning;

    if (!apiKey) {
      meaning = "<strong>Error:</strong> Missing API Key.<br>Please set your Gemini API key in the extension options.";
      chrome.storage.local.set({ meaning, word: resultWord });
      chrome.tabs.sendMessage(tabId, { type: 'meaningResult', word: resultWord, meaning });
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorDetails = data?.error?.message || `HTTP error! Status: ${response.status}`;
        throw new Error(errorDetails);
      }

      if (data.promptFeedback?.blockReason) {
        throw new Error(`Content blocked due to: ${data.promptFeedback.blockReason}`);
      }

      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content?.parts[0]?.text) {
        throw new Error("No summary was generated. The response may have been empty or blocked.");
      }

      meaning = data.candidates[0].content.parts[0].text;

    } catch (error) {
      console.error("Gemini API Error:", error);
      meaning = `<strong>Gemini API Error:</strong><br><em>${error.message}</em><br><br>Please double-check your API key and ensure it is correctly configured.`;
    }

    chrome.storage.local.set({ meaning, word: resultWord });
    chrome.tabs.sendMessage(tabId, { type: 'meaningResult', word: resultWord, meaning });
  });
}
