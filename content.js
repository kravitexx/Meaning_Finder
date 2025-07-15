let meaningButton = document.getElementById('meaning-button');
let meaningOverlay = document.getElementById('meaning-overlay');

// Create the button and overlay if they don't exist
// Inject Lexend Google Fonts stylesheet if not present
if (!document.getElementById('lexend-font-link')) {
    const lexendFontLink = document.createElement('link');
    lexendFontLink.id = 'lexend-font-link';
    lexendFontLink.rel = 'stylesheet';
    lexendFontLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap';
    document.head.appendChild(lexendFontLink);
}

if (!document.getElementById('meaning-btn-style')) {
    const style = document.createElement('style');
    style.id = 'meaning-btn-style';
    style.textContent = `
      #meaning-overlay #overlay-word {
        font-size: 1.35rem !important;
        font-weight: 700 !important;
        margin-bottom: 0.5em !important;
        color: #111 !important;
        font-family: "Lexend", Arial, sans-serif !important;
        font-optical-sizing: auto !important;
        font-style: normal !important;
        text-shadow: none !important;
        letter-spacing: 0 !important;
        line-height: 1.2 !important;
        background: none !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      #overlay-meaning {
        font-size: 1.08rem !important;
        font-family: "Lexend", Arial, sans-serif !important;
        font-optical-sizing: auto !important;
        font-style: normal !important;
        padding-top: 2.7em !important;
        color: #111 !important;
        text-shadow: none !important;
        letter-spacing: 0 !important;
        line-height: 1.5 !important;
        background: none !important;
        border: none !important;
        box-shadow: none !important;
      }
      .meaning-close-btn {
        all: unset !important;
        cursor: pointer !important;
        position: absolute !important;
        top: 18px !important;
        right: 22px !important;
        width: 68px !important;
        height: 36px !important;
        border-radius: 18px !important;
        background: #f5f5f5 !important;
        color: #222 !important;
        font-family: "Lexend", Arial, sans-serif !important;
        font-size: 1.08rem !important;
        font-weight: 500 !important;
        box-shadow: 0 2px 8px 0 rgba(31,38,135,0.07) !important;
        text-align: center !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 10002 !important;
        border: 1px solid #ddd !important;
        transition: background 0.18s !important;
        padding: 0 !important;
      }
      .meaning-close-btn:hover {
        background: #e1e1e1 !important;
      }
      .meaning-close-btn .button-outer, .meaning-close-btn .button-inner, .meaning-close-btn span {
        all: unset !important;
        font-family: inherit !important;
        color: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        text-align: center !important;
        display: inline !important;
        background: none !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      /* Larger style for paragraph summary overlays */
      #meaning-overlay.large-overlay #overlay-word {
        font-size: 1.65rem;
      }
      #meaning-overlay.large-overlay #overlay-meaning {
        font-size: 1.18rem;
      }
      #meaning-overlay.large-overlay .meaning-close-btn {
        font-size: 1.18rem !important;
      }

      #meaning-button .meaning-btn-ui {
        position: relative !important;
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
        cursor: pointer !important;
        outline-offset: 4px !important;
        transition: filter 250ms !important;
        user-select: none !important;
        touch-action: manipulation !important;
        box-shadow: none !important;
      }
      #meaning-button .shadow {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12px;
        background: hsl(0deg 0% 0% / 0.25);
        will-change: transform;
        transform: translateY(2px);
        transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
      }
      #meaning-button .edge {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12px;
        background: linear-gradient(
          to left,
          hsl(340deg 100% 16%) 0%,
          hsl(340deg 100% 32%) 8%,
          hsl(340deg 100% 32%) 92%,
          hsl(340deg 100% 16%) 100%
        );
      }
      #meaning-button .front {
        display: block;
        position: relative;
        padding: 10px 20px;
  border-radius: 12px;
  font-size: 1.50rem;
        color: white !important;
        background: hsl(345deg 100% 47%) !important;
        will-change: transform;
        transform: translateY(-4px);
        transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
      }
      #meaning-button .meaning-btn-ui:hover {
        filter: brightness(110%);
      }
      #meaning-button .meaning-btn-ui:hover .front {
        transform: translateY(-6px);
        transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
      }
      #meaning-button .meaning-btn-ui:active .front {
        transform: translateY(-2px);
        transition: transform 34ms;
      }
      #meaning-button .meaning-btn-ui:hover .shadow {
        transform: translateY(4px);
        transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
      }
      #meaning-button .meaning-btn-ui:active .shadow {
        transform: translateY(1px);
        transition: transform 34ms;
      }
      #meaning-button .meaning-btn-ui:focus:not(:focus-visible) {
        outline: none;
      }
    `;
    document.head.appendChild(style);
}

if (!meaningButton) {
    meaningButton = document.createElement('div');
    meaningButton.id = 'meaning-button';
    meaningButton.style.position = 'absolute';
    meaningButton.style.zIndex = '10000';
    meaningButton.style.display = 'none';
    meaningButton.innerHTML = `
      <button class="meaning-btn-ui">
        <span class="shadow"></span>
        <span class="edge"></span>
        <span class="front text">Meaning</span>
      </button>
    `;
    document.body.appendChild(meaningButton);

}

if (!document.getElementById('meaning-close-btn-style')) {
    const closeStyle = document.createElement('style');
    closeStyle.id = 'meaning-close-btn-style';
    closeStyle.textContent = `
      .meaning-close-btn {
        all: unset;
        cursor: pointer;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        position: absolute;
        top: 10px;
        right: 10px;
        border-radius: 100em;
        background-color: rgba(0, 0, 0, 0.75);
        box-shadow:
          -0.15em -0.15em 0.15em -0.075em rgba(5, 5, 5, 0.25),
          0.0375em 0.0375em 0.0675em 0 rgba(5, 5, 5, 0.1);
      }
      .meaning-close-btn::after {
        content: "";
        position: absolute;
        z-index: 0;
        width: calc(100% + 0.3em);
        height: calc(100% + 0.3em);
        top: -0.15em;
        left: -0.15em;
        border-radius: inherit;
        background: linear-gradient(
          -135deg,
          rgba(5, 5, 5, 0.5),
          transparent 20%,
          transparent 100%
        );
        filter: blur(0.0125em);
        opacity: 0.25;
        mix-blend-mode: multiply;
      }
      .meaning-close-btn .button-outer {
        position: relative;
        z-index: 1;
        border-radius: inherit;
        transition: box-shadow 300ms ease;
        will-change: box-shadow;
        box-shadow:
          0 0.05em 0.05em -0.01em rgba(5, 5, 5, 1),
          0 0.01em 0.01em -0.01em rgba(5, 5, 5, 0.5),
          0.15em 0.3em 0.1em -0.01em rgba(5, 5, 5, 0.25);
      }
      .meaning-close-btn:hover .button-outer {
        box-shadow:
          0 0 0 0 rgba(5, 5, 5, 1),
          0 0 0 0 rgba(5, 5, 5, 0.5),
          0 0 0 0 rgba(5, 5, 5, 0.25);
      }
      .meaning-close-btn .button-inner {
        --inset: 0.035em;
        position: relative;
        z-index: 1;
        border-radius: inherit;
        padding: 0.7em 1.3em;
        background-image: linear-gradient(
          135deg,
          rgba(230, 230, 230, 1),
          rgba(180, 180, 180, 1)
        );
        transition:
          box-shadow 300ms ease,
          clip-path 250ms ease,
          background-image 250ms ease,
          transform 250ms ease;
        will-change: box-shadow, clip-path, background-image, transform;
        overflow: clip;
        clip-path: inset(0 0 0 0 round 100em);
        box-shadow:
              /* 1 */
          0 0 0 0 inset rgba(5, 5, 5, 0.1),
          /* 2 */ -0.05em -0.05em 0.05em 0 inset rgba(5, 5, 5, 0.25),
          /* 3 */ 0 0 0 0 inset rgba(5, 5, 5, 0.1),
          /* 4 */ 0 0 0.05em 0.2em inset rgba(255, 255, 255, 0.25),
          /* 5 */ 0.025em 0.05em 0.1em 0 inset rgba(255, 255, 255, 1),
          /* 6 */ 0.12em 0.12em 0.12em inset rgba(255, 255, 255, 0.25),
          /* 7 */ -0.075em -0.25em 0.25em 0.1em inset rgba(5, 5, 5, 0.25);
      }
      .meaning-close-btn:hover .button-inner {
        clip-path: inset(
          clamp(1px, 0.0625em, 2px) clamp(1px, 0.0625em, 2px)
            clamp(1px, 0.0625em, 2px) clamp(1px, 0.0625em, 2px) round 100em
        );
        box-shadow:
              /* 1 */
          0.1em 0.15em 0.05em 0 inset rgba(5, 5, 5, 0.75),
          /* 2 */ -0.025em -0.03em 0.05em 0.025em inset rgba(5, 5, 5, 0.5),
          /* 3 */ 0.25em 0.25em 0.2em 0 inset rgba(5, 5, 5, 0.5),
          /* 4 */ 0 0 0.05em 0.5em inset rgba(255, 255, 255, 0.15),
          /* 5 */ 0 0 0 0 inset rgba(255, 255, 255, 1),
          /* 6 */ 0.12em 0.12em 0.12em inset rgba(255, 255, 255, 0.25),
          /* 7 */ -0.075em -0.12em 0.2em 0.1em inset rgba(5, 5, 5, 0.25);
      }
      .meaning-close-btn .button-inner span {
        position: relative;
        z-index: 4;
        font-family: "Inter", sans-serif;
        letter-spacing: -0.05em;
        font-weight: 500;
        color: rgba(0, 0, 0, 0);
        background-image: linear-gradient(
          135deg,
          rgba(25, 25, 25, 1),
          rgba(75, 75, 75, 1)
        );
        -webkit-background-clip: text;
        background-clip: text;
        transition: transform 250ms ease;
        display: block;
        will-change: transform;
        text-shadow: rgba(0, 0, 0, 0.1) 0 0 0.1em;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      .meaning-close-btn:hover .button-inner span {
        transform: scale(0.975);
      }
      .meaning-close-btn:active .button-inner {
        transform: scale(0.975);
      }
    `;
    document.head.appendChild(closeStyle);
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
        background: 'rgba(255,255,255,0.75)', // frosted glass base
        color: '#111',
        border: '1px solid rgba(180,180,180,0.28)',
        borderRadius: '18px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.17)',
        zIndex: '10001',
        display: 'none',
        padding: '24px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        overflow: 'hidden',
    });

    // Create new close button with custom UI
    const closeButton = document.createElement('button');
    closeButton.className = 'meaning-close-btn';
    closeButton.innerHTML = `
      <div class="button-outer">
        <div class="button-inner">
          <span>Close</span>
        </div>
      </div>
    `;
    closeButton.onclick = () => meaningOverlay.style.display = 'none';

    meaningOverlay.innerHTML = '<h2 id="overlay-word"></h2><div id="overlay-meaning"></div>';
    meaningOverlay.appendChild(closeButton);
    document.body.appendChild(meaningOverlay);
}

let currentText = '';

const meaningBtnUi = meaningButton.querySelector('.meaning-btn-ui');
meaningBtnUi.addEventListener('click', () => {
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
    meaningButton.style.top = `${window.scrollY + rect.top - 43}px`;
    meaningButton.style.left = `${window.scrollX + rect.left + (rect.width / 2) - (meaningButton.offsetWidth / 2)}px`;
    meaningButton.style.display = 'block';
  } else {
    meaningButton.style.display = 'none';
  }
});

document.addEventListener('scroll', () => {
    if (meaningButton.style.display === 'block') meaningButton.style.display = 'none';
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'meaningResult') {
    document.getElementById('overlay-word').textContent = request.word;
    document.getElementById('overlay-meaning').innerHTML = request.meaning;
    // Use larger overlay style for paragraph summary
    if (request.word && request.word.toLowerCase().includes('paragraph summary')) {
      meaningOverlay.classList.add('large-overlay');
    } else {
      meaningOverlay.classList.remove('large-overlay');
    }
    meaningOverlay.style.display = 'block';
    meaningButton.style.display = 'none';
  }
});