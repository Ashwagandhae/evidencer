import type {
  ArguflowResponseMessage,
  ArguflowErrorMessage,
  ChromeMessage,
  InlineAutoCutMessage,
} from 'src/types';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  handleResponse(request, sender, sendResponse);
  return true;
});

async function handleResponse(
  request: ChromeMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: ChromeMessage) => void
) {
  if (request?.message == 'getCardData') {
    let tabs = await chrome.tabs.query({ active: true });
    // get url of current tab
    chrome.tabs.sendMessage(
      tabs[0].id,
      request,
      function (response: ChromeMessage) {
        if (response?.message == 'gotCardData') {
          sendResponse({
            message: 'gotCardData',
            card: response.card,
          });
        }
      }
    );
  } else if (request?.message == 'arguflowRequest') {
    makeRequest(
      request.url,
      request.method,
      request.body,
      request.expectedStatus,
      request.parseResponse
    )
      .then((response) => {
        let message: ArguflowResponseMessage = {
          message: 'arguflowResponse',
          response: response,
        };
        sendResponse(message);
      })
      .catch((error) => {
        let message: ArguflowErrorMessage = {
          message: 'arguflowError',
          error: error,
        };
        sendResponse(message);
      });
  }
}

function makeRequest(
  url: string,
  method: 'POST' | 'GET' | 'DELETE',
  body: any,
  expectedStatus = 200,
  parseResponse = true
): Promise<any> {
  return new Promise((resolve, reject) => {
    let fetchInit: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (method !== 'GET') {
      fetchInit.body = JSON.stringify(body);
    }
    fetch(url, fetchInit)
      .then((res) => {
        if (res?.ok && res?.status === expectedStatus) {
          if (parseResponse) {
            res
              .json()
              .then((json) => {
                resolve(json);
              })
              .catch((err) => {
                reject('Parsing failure');
              });
          } else {
            resolve(null);
          }
        } else {
          reject(res?.status);
        }
      })
      .catch((err) => {
        reject('Fetching failure');
      });
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: 'inlineAutoCut',
    title: 'Auto Cut Selection...',
    type: 'normal',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((item, tab) => {
  const id = item.menuItemId;
  if (id === 'inlineAutoCut') {
    let message: InlineAutoCutMessage = { message: 'inlineAutoCut' };
    chrome.tabs.sendMessage(tab.id!, message);
  }
});
