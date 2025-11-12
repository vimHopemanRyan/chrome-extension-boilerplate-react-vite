import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';

const keysToRemove = ['vimAccessToken', 'vimRefreshToken'];
const Popup = () => {
  const onClick = async () => {
    console.log('onClick');
    // get storage of current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab.id || !tab.url) {
      console.error('No tab id found');
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: ({ keys }: { keys: string[] }) => {
        const allKeys = Object.keys(localStorage);

        allKeys.forEach(key => {
          console.log(key);
          if (key.includes('auth0') || keys.includes(key)) {
            localStorage.removeItem(key);
          }
        });
      },
      args: [{ keys: keysToRemove }],
    });

    chrome.cookies.getAll({ domain: 'getvim.us.auth0.com' }, async function (cookies) {
      console.log(cookies);
      for (let i = 0; i < cookies.length; i++) {
        await chrome.cookies.remove({ url: 'https://getvim.us.auth0.com' + cookies[i].path, name: cookies[i].name });
      }
    });
    setTimeout(() => {
      chrome.tabs.reload(tab.id!);
    }, 1000);
  };
  return (
    <div className="App">
      <button onClick={onClick}>Click me</button>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
