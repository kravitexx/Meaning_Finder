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
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        zIndex: '10001',
        display: 'none',
        padding: '20px',
        fontFamily: 'Lexend, sans-serif',
        fontStyle: 'normal',
        fontOpticalSizing: 'auto',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#222',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        letterSpacing: '0.01em',
    });

    meaningOverlay.innerHTML = '<h2 id="overlay-word"></h2><div id="overlay-meaning"></div>';

    const closeButtonWrapper = document.createElement('div');
    closeButtonWrapper.className = 'button-wrap';
    Object.assign(closeButtonWrapper.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        transform: 'scale(0.8)' // Scale down the button to fit the overlay
    });

    const closeButton = document.createElement('button');
    const closeSpan = document.createElement('span');
    closeSpan.textContent = 'Close';
    closeButton.appendChild(closeSpan);

    const closeShadow = document.createElement('div');
    closeShadow.className = 'button-shadow';

    closeButtonWrapper.appendChild(closeButton);
    closeButtonWrapper.appendChild(closeShadow);

    closeButton.onclick = () => meaningOverlay.style.display = 'none';

    meaningOverlay.appendChild(closeButtonWrapper);
    document.body.appendChild(meaningOverlay);
}

let currentText = '';

meaningButton.addEventListener('click', () => {
  if (currentText) {
    chrome.runtime.sendMessage({ text: currentText });
    meaningOverlay.querySelector('#overlay-meaning').textContent = 'Loading...';
    meaningOverlay.style.display = 'block';
  }
  meaningButtonWrapper.style.display = 'none';
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
    meaningOverlay.querySelector('#overlay-word').textContent = request.word;
    meaningOverlay.querySelector('#overlay-meaning').innerHTML = request.meaning;
  }
});