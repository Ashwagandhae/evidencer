import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { IMessage, IPopupKeys } from '../types';

export let tooltipState = writable({
  open: false,
  claimed: false,
});

export let popups: Writable<IPopupKeys[]> = writable([]);

class Messenger {
  messages: Writable<IMessage[]>;
  timeouts: NodeJS.Timeout[];
  constructor() {
    this.messages = writable([]);
    this.timeouts = [];
  }
  addMessage(text: string) {
    // add message and removes them after 5 seconds
    this._addMessage(text, false);
  }
  addError(text: string) {
    this._addMessage(text, true);
  }
  _addMessage(text: string, error: boolean) {
    this.messages.update((messages) => {
      messages.push({ text, id: Date.now(), error });
      // trim if longer than 5 seconds
      if (messages.length > 3) {
        messages.shift();
        clearTimeout(this.timeouts.shift());
      }
      this.timeouts.push(
        setTimeout(() => {
          this.messages.update((messages) => {
            messages.shift();
            return messages;
          });
          this.timeouts.shift();
        }, 5000)
      );
      return messages;
    });
  }
}

export let messenger = new Messenger();

export let messages = messenger.messages;
