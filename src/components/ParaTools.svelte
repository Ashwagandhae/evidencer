<script lang="ts">
  import Icon from './Icon.svelte';
  import Button from './Button.svelte';
  import ButtonGroup from './ButtonGroup.svelte';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { IPara } from '../types';

  let currentTool: Writable<null | 'highlight' | 'underline' | 'eraser'> =
    getContext('currentTool');
  export let floating: boolean;

  export let paras: IPara[];
  function condenseParas() {
    if (paras != null) {
      // combine all paras into one
      let finalPara: {
        text: string;
        underline: boolean;
        highlight: boolean;
      }[] = [];
      for (let para of paras) {
        if (para.length > 0) {
          let nextPara = [...para];
          let firstRun = nextPara[0];
          firstRun.text = firstRun.text.trimStart();
          if (finalPara.length > 0) {
            let lastRun = finalPara[finalPara.length - 1];
            lastRun.text.trimEnd();
            lastRun.text += ' ';
          }
          finalPara = [...finalPara, ...nextPara];
        }
      }
      paras = [finalPara];
    }
  }
</script>

<div class="toolbar levelOne">
  <ButtonGroup {floating}>
    <Button
      on:click={() => ($currentTool = null)}
      selected={$currentTool == null}
    >
      <Icon name="cursor" />
    </Button>
    <Button
      on:click={() => ($currentTool = 'highlight')}
      selected={$currentTool == 'highlight'}
    >
      <Icon name="highlight" />
    </Button>
    <Button
      on:click={() => ($currentTool = 'underline')}
      selected={$currentTool == 'underline'}
    >
      <Icon name="underline" />
    </Button>
    <Button
      on:click={() => ($currentTool = 'eraser')}
      selected={$currentTool == 'eraser'}
    >
      <Icon name="eraser" />
    </Button>
  </ButtonGroup>
  <ButtonGroup {floating}>
    <Button on:click={condenseParas} disabled={paras.length <= 1}>
      <Icon name="merge" />
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
