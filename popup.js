document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['meaning', 'word'], (result) => {
    const meaningContainer = document.getElementById('meaning');
    const wordContainer = document.getElementById('word');
    if (result.word) {
      wordContainer.textContent = result.word;
    }
    if (result.meaning) {
      meaningContainer.innerHTML = result.meaning;
    } else {
      meaningContainer.textContent = 'No meaning found.';
    }
  });
});