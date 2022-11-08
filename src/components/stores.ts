import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { IMessage } from '../types';

export let tooltipState = writable({
  open: false,
  claimed: false,
});

class Messenger {
  messages: Writable<IMessage[]>;
  constructor() {
    this.messages = writable([]);
  }
  addMessage(text: string) {
    // add message and removes them after 5 seconds
    this.messages.update((messages) => {
      messages.push({ text, id: Date.now() });
      // trim if longer than 5 seconds
      if (messages.length > 3) {
        messages.shift();
      }
      setTimeout(() => {
        this.messages.update((messages) => {
          messages.shift();
          return messages;
        });
      }, 5000);
      return messages;
    });
  }
}

export let messenger = new Messenger();

export let messages = messenger.messages;
