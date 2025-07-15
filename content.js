let meaningButton = document.getElementById('meaning-button');
let meaningOverlay = document.getElementById('meaning-overlay');

// Create the button and overlay if they don't exist
if (!meaningButton) {
    meaningButton = document.createElement('div');
    meaningButton.id = 'meaning-button';
    meaningButton.textContent = 'Meaning';
    // Inject Lexend font if not already present
    if (!document.getElementById('lexend-font-link')) {
        const lexendFontLink = document.createElement('link');
        lexendFontLink.id = 'lexend-font-link';
        lexendFontLink.rel = 'stylesheet';
        lexendFontLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap';
        document.head.appendChild(lexendFontLink);
    }
    Object.assign(meaningButton.style, {
        position: 'absolute',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 15px',
        cursor: 'pointer',
        zIndex: '10000',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s, transform 0.2s',
        display: 'none',
        fontFamily: 'Lexend, sans-serif',
        fontStyle: 'normal',
        fontOpticalSizing: 'auto',
        lineHeight: '1.4',
        letterSpacing: '0.01em',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
    });
    document.body.appendChild(meaningButton);

    meaningButton.addEventListener('mouseenter', () => {
        meaningButton.style.backgroundColor = '#0056b3';
        meaningButton.style.transform = 'scale(1.05)';
    });
    meaningButton.addEventListener('mouseleave', () => {
        meaningButton.style.backgroundColor = '#007bff';
        meaningButton.style.transform = 'scale(1)';
    });
}

if (!meaningOverlay) {
    meaningOverlay = document.createElement('div');
    meaningOverlay.id = 'meaning-overlay';
    Object.assign(meaningOverlay.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
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

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    Object.assign(closeButton.style, {
        position: 'absolute', top: '10px', right: '10px', background: '#eee', 
        border: '1px solid #ccc', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer'
    });
    closeButton.onclick = () => meaningOverlay.style.display = 'none';

    meaningOverlay.innerHTML = '<h2 id="overlay-word"></h2><div id="overlay-meaning"></div>';
    meaningOverlay.appendChild(closeButton);
    document.body.appendChild(meaningOverlay);
}

let currentText = '';

meaningButton.addEventListener('click', () => {
  if (currentText) {
    chrome.runtime.sendMessage({ text: currentText });
    meaningOverlay.querySelector('#overlay-meaning').textContent = 'Loading...';
    meaningOverlay.style.display = 'block';
  }
  meaningButton.style.display = 'none';
});

document.addEventListener('mouseup', (event) => {
  if (meaningButton.contains(event.target) || meaningOverlay.contains(event.target)) return;

  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    currentText = selectedText;
    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    meaningButton.style.top = `${window.scrollY + rect.top - 45}px`;
    meaningButton.style.left = `${window.scrollX + rect.left + (rect.width / 2) - (meaningButton.offsetWidth / 2)}px`;
    meaningButton.style.display = 'block';
  } else {
    meaningButton.style.display = 'none';
  }
});

document.addEventListener('scroll', () => {
    if (meaningButton.style.display === 'block') meaningButton.style.display = 'none';
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'meaningResult') {
    meaningOverlay.querySelector('#overlay-word').textContent = request.word;
    meaningOverlay.querySelector('#overlay-meaning').innerHTML = request.meaning;
  }
});