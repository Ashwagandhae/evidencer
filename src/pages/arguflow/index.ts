import type { ArguflowRequestMessage, ChromeMessage } from '../../types';
import type { IPara, IRun } from 'src/types';

export const URL = 'https://vault.arguflow.ai/';
export const URL_USER = URL + 'user/';
export const API_URL = 'https://api.arguflow.ai/api/';
export const AUTH_URL = API_URL + 'auth';
export const AUTO_CUT_URL = API_URL + 'card/cut';
export const CARD_URL = API_URL + 'card';
export const COLLECTIONS_URL = API_URL + 'user/collections/';

export const ADD_CARD_TO_COLLECTION_URL = API_URL + 'card_collection/';

export function backgroundRequest(
  url: string,
  method: 'POST' | 'GET' | 'DELETE',
  body: any,
  expectedStatus = 200,
  parseResponse = true
): Promise<any> {
  let message: ArguflowRequestMessage = {
    message: 'arguflowRequest',
    url: url,
    method: method,
    body: body,
    parseResponse: parseResponse,
    expectedStatus: expectedStatus,
  };
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: ChromeMessage) => {
      if (response?.message === 'arguflowResponse') {
        resolve(response.response);
      } else if (response?.message === 'arguflowError') {
        reject(response.error);
      }
    });
  });
}

type UserInfo = {
  id: string;
  email: string;
  username: string;
  website: string;
  visible_email: boolean;
};

function makeRequest(
  url: string,
  method: 'POST' | 'GET' | 'DELETE',
  body: any,
  expectedStatus = 200,
  parseResponse = true,
  callbacks: {
    onSuccess?: () => void;
  } = {}
): Promise<any> {
  return new Promise((resolve, reject) => {
    backgroundRequest(url, method, body, expectedStatus, parseResponse)
      .then((res) => {
        callbacks?.onSuccess?.();
        resolve(res);
      })
      .catch((err) => {
        if (err === 401) {
          chrome.storage.local.set({ loggedIn: false });
          reject('Unauthorized');
        } else {
          reject(err);
        }
      });
  });
}

export function login(
  email: string,
  password: string,
  saveLogin = true
): Promise<null> {
  return makeRequest(AUTH_URL, 'POST', { email, password }, 204, false, {
    onSuccess: () => {
      chrome.storage.local.set({ loggedIn: true });
      if (saveLogin) {
        chrome.storage.session.set({ arguflowLogin: { email, password } });
      }
    },
  });
}
export function logout(): Promise<null> {
  return makeRequest(AUTH_URL, 'DELETE', {}, 204, false, {
    onSuccess: () => {
      chrome.storage.local.set({ loggedIn: false });
    },
  });
}

export function autoCut(text: string): Promise<{ completion: string }> {
  return makeRequest(AUTO_CUT_URL, 'POST', { uncut_card: text }, 200, true);
}

function getUserInfo(): Promise<UserInfo> {
  return makeRequest(AUTH_URL, 'GET', {}, 200, true);
}

export function getUserId(): Promise<string> {
  return new Promise((resolve, reject) => {
    getUserInfo()
      .then((info) => {
        resolve(info.id);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function htmlToParas(html: string): IPara[] {
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

export function uploadCard(
  cardHtml: string,
  link: string,
  isPrivate: boolean
): Promise<{
  card_metadata: {
    id: string;
    content: string;
    link: string;
    author_id: string;
    qdrant_point_id: string;
    created_at: string;
    updated_at: string;
    oc_file_path: string;
    card_html: string;
    private: boolean;
  };
  duplicate: boolean;
}> {
  return makeRequest(
    CARD_URL,
    'POST',
    {
      link: link,
      card_html: cardHtml,
      private: isPrivate,
    },
    200,
    true
  );
}

export type Collection = {
  id: string;
  author_id: string;
  name: string;
  is_public: boolean;
  description: string;
  created_at: string;
  updated_at: string;
  file_id: string;
};

export async function getCollections(
  page: number
): Promise<{ collections: Collection[]; total_pages: number }> {
  try {
    const info = await getUserInfo();
    return await makeRequest(
      COLLECTIONS_URL + info.id + '/' + page.toString(),
      'GET',
      {},
      200,
      true
    );
  } catch (err) {
    return await Promise.reject(err);
  }
}

export function addCardToCollection(cardId: string, collectionId: string) {
  return makeRequest(
    ADD_CARD_TO_COLLECTION_URL + collectionId,
    'POST',
    {
      card_metadata_id: cardId,
    },
    204,
    false
  );
}
