import Main from 'src/components/Main.svelte';
import type { IStorage } from 'src/types';

function restoreMain() {
  const app = new Main({
    target: document.body,
    props: { context: 'options' },
  });
}

document.addEventListener('DOMContentLoaded', restoreMain);
