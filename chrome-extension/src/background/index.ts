import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

const ALLOWED_URL_PATTERN = 'http://localhost:3014';

function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.origin === ALLOWED_URL_PATTERN;
  } catch {
    return false;
  }
}

async function updateActionState(tabId?: number): Promise<void> {
  try {
    if (tabId === undefined) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        await chrome.action.setPopup({ popup: '' });
        await chrome.action.disable();
        return;
      }
      tabId = tabs[0].id;
    }

    if (tabId === undefined) {
      await chrome.action.setPopup({ popup: '' });
      await chrome.action.disable();
      return;
    }

    const tab = await chrome.tabs.get(tabId);
    const isValid = isValidUrl(tab.url);

    if (isValid) {
      await chrome.action.setPopup({ popup: 'popup/index.html' });
      await chrome.action.enable();
    } else {
      await chrome.action.setPopup({ popup: '' });
      await chrome.action.disable();
    }
  } catch (error) {
    await chrome.action.setPopup({ popup: '' });
    await chrome.action.disable();
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateActionState(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    await updateActionState(tabId);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    await updateActionState();
  }
});

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

updateActionState();

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
