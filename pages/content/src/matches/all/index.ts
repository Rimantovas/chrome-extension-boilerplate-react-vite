const FREEDIUM_BASE_URL = 'https://freedium.cfd/';
const CONTROLS_ID = 'freedium-redirect-controls';

const hasEditableFocus = () => {
  const active = document.activeElement as HTMLElement | null;
  if (!active || active === document.body) {
    return false;
  }

  if (active.closest('[contenteditable="true"]')) {
    return true;
  }

  const focusableSelector = 'input, textarea, select, [role="textbox"], [contenteditable="true"]';
  if (active.matches(focusableSelector)) {
    return true;
  }

  const tagName = active.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA';
};

const isMediumArticle = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    const hostMatches = parsed.hostname === 'medium.com' || parsed.hostname.endsWith('.medium.com');
    return hostMatches && parsed.pathname.length > 1;
  } catch {
    return false;
  }
};

const buildFreediumUrl = (url: string) => `${FREEDIUM_BASE_URL}${url}`;

const removeControls = () => {
  document.getElementById(CONTROLS_ID)?.remove();
};

const createButton = (label: string, onClick: () => void) => {
  const button = document.createElement('button');
  button.textContent = label;
  button.type = 'button';
  button.style.cssText = `
    display: block;
    width: 100%;
    margin: 0;
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    background-color: #1a8917;
    color: #ffffff;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transition: transform 0.12s ease, background-color 0.12s ease;
  `;
  button.onmouseenter = () => {
    button.style.transform = 'translateY(-1px)';
    button.style.backgroundColor = '#13730f';
  };
  button.onmouseleave = () => {
    button.style.transform = 'translateY(0)';
    button.style.backgroundColor = '#1a8917';
  };
  button.onclick = onClick;
  return button;
};

const renderControls = () => {
  if (!isMediumArticle(window.location.href)) {
    removeControls();
    return;
  }

  if (document.getElementById(CONTROLS_ID)) {
    return;
  }

  const freediumUrl = buildFreediumUrl(window.location.href);
  const container = document.createElement('div');
  container.id = CONTROLS_ID;
  container.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 240px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(25, 25, 25, 0.85);
    backdrop-filter: blur(6px);
    box-shadow: 0 20px 35px rgba(0, 0, 0, 0.35);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;

  const title = document.createElement('div');
  title.textContent = 'Freedium options';
  title.style.cssText = `
    font-size: 14px;
    font-weight: 600;
    color: #f3f4f6;
    text-align: center;
  `;

  const replaceButton = createButton('Open on Freedium ( / )', () => {
    window.location.href = freediumUrl;
  });

  const newTabButton = createButton('Open in new tab ( Cmd + / )', () => {
    window.open(freediumUrl, '_blank', 'noopener');
  });
  newTabButton.style.backgroundColor = '#4b5563';
  newTabButton.onmouseenter = () => {
    newTabButton.style.transform = 'translateY(-1px)';
    newTabButton.style.backgroundColor = '#374151';
  };
  newTabButton.onmouseleave = () => {
    newTabButton.style.transform = 'translateY(0)';
    newTabButton.style.backgroundColor = '#4b5563';
  };

  container.appendChild(title);
  container.appendChild(replaceButton);
  container.appendChild(newTabButton);

  (document.body ?? document.documentElement).appendChild(container);
};

const handleUrlChange = () => {
  removeControls();
  renderControls();
};

const init = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderControls, { once: true });
  } else {
    renderControls();
  }

  let lastHref = window.location.href;

  const observer = new MutationObserver(() => {
    const currentHref = window.location.href;
    if (currentHref !== lastHref) {
      lastHref = currentHref;
      handleUrlChange();
    }
  });

  observer.observe(document, { subtree: true, childList: true });

  const wrapHistoryMethod = <T extends 'pushState' | 'replaceState'>(type: T) => {
    const original = history[type];
    history[type] = function (...args: Parameters<typeof original>) {
      const result = original.apply(this, args);
      handleUrlChange();
      return result;
    } as typeof original;
  };

  wrapHistoryMethod('pushState');
  wrapHistoryMethod('replaceState');
  window.addEventListener('popstate', handleUrlChange);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat || hasEditableFocus()) {
      return;
    }

    if (event.key !== '/') {
      return;
    }

    if (!isMediumArticle(window.location.href)) {
      return;
    }

    const freediumUrl = buildFreediumUrl(window.location.href);

    if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
      window.open(freediumUrl, '_blank', 'noopener');
      return;
    }

    if (event.altKey || event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    window.location.href = freediumUrl;
  };

  window.addEventListener('keydown', onKeyDown, true);
};

init();
