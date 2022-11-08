<script lang="ts">
  import Icon from './Icon.svelte';
  import Button from './Button.svelte';
  import ButtonGroup from './ButtonGroup.svelte';
  import { getContext } from 'svelte';
  import type { Readable, Writable } from 'svelte/store';
  import type { IPara } from '../types';
  import type { EditHistory } from './history';

  let currentTool: Writable<null | 'highlight' | 'underline' | 'eraser'> =
    getContext('currentTool');
  const history: EditHistory = getContext('history');

  export let floating: boolean;
  export let shrunk: boolean;

  export let paras: IPara[];
  function condenseParas() {
    history.action('condenseParas', {});
  }
</script>

<div class="toolbar levelOne">
  <ButtonGroup {floating}>
    <Button
      on:click={() => ($currentTool = null)}
      selected={$currentTool == null}
      tooltip="Default"
    >
      <Icon name="cursor" />
    </Button>
    <Button
      on:click={() => ($currentTool = 'highlight')}
      selected={$currentTool == 'highlight'}
      tooltip="Highlight"
    >
      <Icon name="highlight" />
    </Button>
    <Button
      on:click={() => ($currentTool = 'underline')}
      selected={$currentTool == 'underline'}
      tooltip="Underline"
    >
      <Icon name="underline" />
    </Button>
    <Button
      on:click={() => ($currentTool = 'eraser')}
      selected={$currentTool == 'eraser'}
      tooltip="Eraser"
    >
      <Icon name="eraser" />
    </Button>
  </ButtonGroup>
  <ButtonGroup {floating}>
    <Button
      on:click={condenseParas}
      disabled={paras.length <= 1}
      tooltip={paras.length <= 1 ? 'Paragraphs merged' : 'Merge paragraphs'}
    >
      <Icon name="merge" />
    </Button>
    <Button
      on:click={() => (shrunk = !shrunk)}
      selected={shrunk}
      tooltip={shrunk ? 'Expand text' : 'Shrink text'}
    >
      <Icon name="shrink" />
    </Button>
  </ButtonGroup>
</div>

<style>
  .toolbar {
    display: flex;
    flex-direction: row;
    position: sticky;
    top: 0;
    gap: var(--padding);
  }
</style>
