chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.text && sender.tab?.id) {
    const isParagraph = request.text.includes(' ') || request.text.length > 50;
    if (isParagraph) {
      getMeaningForParagraph(request.text, sender.tab.id);
    } else {
      getMeaningForWord(request.text, sender.tab.id);
    }
  }
  return true;
});

async function getMeaningForWord(word, tabId) {
  let meaning;
  let resultWord = word;
  let dictionaryApiFailed = false;
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) {
      dictionaryApiFailed = true;
      throw new Error(`Network response was not ok: ${response.statusText} (status: ${response.status})`);
    }
    const data = await response.json();
    if (data.title === "No Definitions Found") {
      meaning = `No definition found for "${word}".`;
    } else {
      const definitions = data[0]?.meanings[0]?.definitions;
      if (definitions && definitions.length > 0) {
        meaning = definitions.map((def, index) => `${index + 1}. ${def.definition}`).join('<br>');
      } else {
        meaning = "No definitions available.";
      } 
    }
  } catch (error) {
    console.error("Dictionary API Error:", error);
    dictionaryApiFailed = true;
    // Fallback to Gemini if dictionary API fails
    await getMeaningFromGeminiForWord(word, tabId);
    return;
  }
  chrome.storage.local.set({ meaning, word: resultWord });
  chrome.tabs.sendMessage(tabId, { type: 'meaningResult', word: resultWord, meaning });
}

// Fallback: Use Gemini API to get meaning for a single word
async function getMeaningFromGeminiForWord(word, tabId) {
  let geminiMeaning;
  const resultWord = word;
  chrome.storage.sync.get(['geminiApiKey'], async (result) => {
    const apiKey = result.geminiApiKey;
    if (!apiKey) {
      geminiMeaning = "<strong>Error:</strong> Missing API Key.<br>Please set your Gemini API key in the extension options.";
      chrome.storage.local.set({ meaning: geminiMeaning, word: resultWord });
      chrome.tabs.sendMessage(tabId, { type: 'meaningResult', word: resultWord, meaning: geminiMeaning });
      return;
    }
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Explain the meaning of the word: ${word} in simple terms.`
            }]
          }]
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
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No meaning was generated. The response may have been empty or blocked.");
      }
      geminiMeaning = data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API Error (Single Word):", error);
      geminiMeaning = `<strong>Gemini API Error:</strong><br><em>${error.message}</em><br><br>Please double-check your API key and ensure it is correctly configured in your Google Cloud project.`;
    }
    chrome.storage.local.set({ meaning: geminiMeaning, word: resultWord });
    chrome.tabs.sendMessage(tabId, { type: 'meaningResult', word: resultWord, meaning: geminiMeaning });
  });
}

async function getMeaningForParagraph(paragraph, tabId) {
  let summary;
  const resultWord = "Paragraph Summary";

  chrome.storage.sync.get(['geminiApiKey'], async (result) => {
    const apiKey = result.geminiApiKey;

    if (!apiKey) {
      summary = "<strong>Error:</strong> Missing API Key.<br>Please set your Gemini API key in the extension options.";
      chrome.storage.local.set({ meaning: summary, word: resultWord });
      chrome.tabs.sendMessage(tabId, { type: 'meaningResult', word: resultWord, meaning: summary });
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Summarize the following paragraph in simple terms:\n\n${paragraph}`
            }]
          }]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorDetails = data?.error?.message || `HTTP error! Status: ${response.status}`;
        throw new Error(errorDetails);
      }

      // Check for safety-related blocking
      if (data.promptFeedback?.blockReason) {
          throw new Error(`Content blocked due to: ${data.promptFeedback.blockReason}`);
      }

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No summary was generated. The response may have been empty or blocked.");
      }

      summary = data.candidates[0].content.parts[0].text;

    } catch (error) {
      console.error("Gemini API Error:", error);
      summary = `<strong>Gemini API Error:</strong><br><em>${error.message}</em><br><br>Please double-check your API key and ensure it is correctly configured in your Google Cloud project.`;
    }

    chrome.storage.local.set({ meaning: summary, word: resultWord });
    chrome.tabs.sendMessage(tabId, { type: 'meaningResult', word: resultWord, meaning: summary });
  });
}