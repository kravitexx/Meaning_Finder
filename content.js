let meaningButtonWrapper = document.getElementById('meaning-button-wrapper');
let meaningOverlay = document.getElementById('meaning-overlay');
let meaningButton;

// Create the button and overlay if they don't exist
if (!meaningButtonWrapper) {
    meaningButtonWrapper = document.createElement('div');
    meaningButtonWrapper.id = 'meaning-button-wrapper';
    meaningButtonWrapper.className = 'button-wrap';
    Object.assign(meaningButtonWrapper.style, {
        position: 'absolute',
        zIndex: '10000',
        display: 'none',
    });

    meaningButton = document.createElement('button');
    const span = document.createElement('span');
    span.textContent = 'Meaning';
    meaningButton.appendChild(span);

    const shadow = document.createElement('div');
    shadow.className = 'button-shadow';

    meaningButtonWrapper.appendChild(meaningButton);
    meaningButtonWrapper.appendChild(shadow);
    document.body.appendChild(meaningButtonWrapper);
} else {
    meaningButton = meaningButtonWrapper.querySelector('button');
}

if (!meaningOverlay) {
    meaningOverlay = document.createElement('div');
    meaningOverlay.id = 'meaning-overlay';
    meaningOverlay.className = 'glass-card';
    Object.assign(meaningOverlay.style, {
        position: 'fixed',
        width: '400px',
        zIndex: '10001',
        display: 'none',
        padding: '20px',
        fontFamily: 'Lexend, sans-serif',
        color: '#333',
    });
    document.body.appendChild(meaningOverlay);
}

let currentText = '';

function showMeaning(word, meaning, isParagraph, clickX, clickY) {
    meaningOverlay.innerHTML = ''; // Clear previous content

    const header = document.createElement('div');
    header.className = 'meaning-box-header';

    const title = document.createElement('h1');
    title.textContent = isParagraph ? 'Paragraph Summary' : word;

    const closeButtonWrapper = document.createElement('div');
    closeButtonWrapper.className = 'button-wrap';
    closeButtonWrapper.style.transform = 'scale(0.8)';

    const closeButton = document.createElement('button');
    const closeSpan = document.createElement('span');
    closeSpan.textContent = 'Close';
    closeButton.appendChild(closeSpan);

    const closeShadow = document.createElement('div');
    closeShadow.className = 'button-shadow';

    closeButtonWrapper.appendChild(closeButton);
    closeButtonWrapper.appendChild(closeShadow);

    closeButton.onclick = () => { meaningOverlay.style.display = 'none'; };

    header.appendChild(title);
    header.appendChild(closeButtonWrapper);

    const meaningDiv = document.createElement('div');
    meaningDiv.id = 'meaning';
    meaningDiv.innerHTML = meaning;

    meaningOverlay.appendChild(header);
    meaningOverlay.appendChild(meaningDiv);

    meaningOverlay.style.left = `${clickX + 5}px`;
    meaningOverlay.style.top = `${clickY + 5}px`;
    meaningOverlay.style.display = 'block';
}

let lastClick = { x: 0, y: 0 };

meaningButton.addEventListener('click', (e) => {
  lastClick = { x: e.clientX, y: e.clientY };
  if (currentText) {
    const isParagraph = currentText.includes(' ') || currentText.length > 50;
    showMeaning(currentText, 'Loading...', isParagraph, lastClick.x, lastClick.y);
    chrome.runtime.sendMessage({ text: currentText });
    meaningButtonWrapper.style.display = 'none';
  }
});

document.addEventListener('mouseup', (event) => {
  if (meaningButtonWrapper.contains(event.target) || meaningOverlay.contains(event.target)) return;

  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    currentText = selectedText;
    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    meaningButtonWrapper.style.top = `${window.scrollY + rect.top - 70}px`; 
    meaningButtonWrapper.style.left = `${window.scrollX + rect.left + (rect.width / 2) - (meaningButtonWrapper.offsetWidth / 2)}px`;
    meaningButtonWrapper.style.display = 'block';
  } else {
    meaningButtonWrapper.style.display = 'none';
  }
});

document.addEventListener('scroll', () => {
    if (meaningButtonWrapper.style.display === 'block') meaningButtonWrapper.style.display = 'none';
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'meaningResult') {
    const isParagraph = request.word.includes(' ') || request.word.length > 50;
    // Call showMeaning to rebuild the overlay with the final content.
    // lastClick is used to position it at the same spot where the user clicked.
    showMeaning(request.word, request.meaning, isParagraph, lastClick.x, lastClick.y);
  }
});