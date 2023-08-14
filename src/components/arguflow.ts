import type { IPara, IRun } from 'src/types';
import { get, writable } from 'svelte/store';

export let auth = writable({
  loggedIn: false,
});

let authInit = false;

chrome.storage.local.get(['loggedIn'], (result) => {
  auth.set({ loggedIn: result.loggedIn });
  authInit = true;
});

auth.subscribe((value) => {
  if (!authInit) return;

  chrome.storage.local.set({ loggedIn: value.loggedIn });
});

const URL = 'https://vault.arguflow.ai/';
const URL_USER = URL + 'user/';
const API_URL = 'https://api.arguflow.ai/api/';
const AUTH_URL = API_URL + 'auth';
const AUTO_CUT_URL = API_URL + 'card/cut';

export function autoLogin() {
  return new Promise<void>((resolve) => {
    chrome.storage.local.get(['arguflowLogin'], (result) => {
      if (result.arguflowLogin != null) {
        let { email, password } = result.arguflowLogin;
        resolve(login(email, password));
      } else {
        resolve();
      }
    });
  });
}

export function login(
  email: string,
  password: string,
  saveLogin = true
): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => {
        if (res.status === 204 && res.ok) {
          auth.set({ loggedIn: true });
          resolve();
          if (saveLogin) {
            chrome.storage.local.set({ arguflowLogin: { email, password } });
          }
        } else {
          auth.set({ loggedIn: false });
          reject(res.status);
        }
      })
      .catch((err) => {
        auth.set({ loggedIn: false });
        reject(err);
      });
  });
}
export function logout(): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(AUTH_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
      .then((res) => {
        if (res.status === 204 && res.ok) {
          auth.set({ loggedIn: false });
          resolve();
        } else {
          auth.set({ loggedIn: true });
          reject(res.status);
        }
      })
      .catch((err) => {
        auth.set({ loggedIn: true });
        reject(err);
      });
  });
}

export function autoCut(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fetch(AUTO_CUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uncut_card: text }),
    })
      .then((res) => {
        if (res.status === 200 && res.ok) {
          res.json().then((data) => {
            if (data.completion && typeof data.completion === 'string') {
              resolve(data.completion);
            } else {
              reject('Invalid response');
            }
          });
        } else {
          if (res.status === 401) {
            auth.set({ loggedIn: false });
          }
          reject(res.status);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getUserInfo(): Promise<{
  id: string;
  email: string;
  username: string;
  website: string;
  visible_email: boolean;
}> {
  return new Promise((resolve, reject) => {
    fetch(AUTH_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.status === 200 && res.ok) {
          res.json().then((data) => {
            resolve(data);
          });
        } else {
          if (res.status === 401) {
            auth.set({ loggedIn: false });
          }
          reject(res.status);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function getUserLink(): Promise<string> {
  return new Promise((resolve, reject) => {
    getUserInfo()
      .then((info) => {
        resolve(URL_USER + info.id);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function htmlToParas(html: string): IPara[] {
  console.log(html);
  html = cleanHtml(html);
  // parse html
  let node = document.createElement('div');
  node.innerHTML = html;
  // convert to paras
  let paras: IPara[] = [];
  for (let paraNode of node.querySelectorAll('p')) {
    let para: IPara = [];
    para.push(...nodeToRuns(paraNode));
    paras.push(para);
  }
  return paras;
}

function cleanHtml(html: string): string {
  // remove newlines
  html = html.replace(/\n/g, ' ');
  return html;
}

function nodeToRuns(
  node: Node,
  style: { underline: boolean; highlight: boolean } = {
    underline: false,
    highlight: false,
  }
): IRun[] {
  let runs: IRun[] = [];
  if (node instanceof Text) {
    runs.push({
      text: node.textContent,
      ...style,
    });
  } else if (node instanceof HTMLElement) {
    if (node.style.textDecoration === 'underline' || node.tagName === 'U') {
      style.underline = true;
    }
    if (node.style.fontWeight === 'bold' || node.tagName === 'B') {
      style.highlight = true;
    }

    for (let child of node.childNodes) {
      runs.push(...nodeToRuns(child, { ...style }));
    }
  }
  return runs;
}
