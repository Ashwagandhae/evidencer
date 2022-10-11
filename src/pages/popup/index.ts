import Options from 'src/components/Options.svelte';
import type { IStorage } from 'src/types';

function restoreOptions() {
  const app = new Options({
    target: document.body,
    props: { context: 'popup' },
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
