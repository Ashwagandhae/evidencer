<script lang="ts">
  import TextEditor from './citeEditors/TextEditor.svelte';
  import DateEditor from './citeEditors/DateEditor.svelte';
  import AuthorsEditor from './citeEditors/AuthorsEditor.svelte';
  import type { ICard } from '../types';
  import type { Writable } from 'svelte/store';
  import { getContext } from 'svelte';
  import { clickOutside } from './outclick';
  import { citeLabels } from './labels';

  export let key: string;
  let card: Writable<ICard> = getContext('card');
  let currentEditor: Writable<string | null> = getContext('currentEditor');

  let component: any;
  $: {
    if (key == 'authors') {
      component = AuthorsEditor;
    } else if (key == 'date' || key == 'accessDate') {
      component = DateEditor;
    } else {
      component = TextEditor;
    }
  }
  function handleOutclick() {
    console.log('detected outclick');
    $currentEditor = null;
  }
</script>

<div class="top" use:clickOutside on:outclick={handleOutclick}>
  <h1>Edit {citeLabels[key]}</h1>
  <div class="content">
    <svelte:component this={component} {key} bind:card={$card} />
  </div>
</div>

<style>
  .top {
    z-index: 1000;
    position: absolute;
    box-sizing: border-box;
    width: 100vw;
    height: 200px;
    bottom: 0;
    left: 0;
    background: var(--background-secondary);
    box-shadow: var(--shadow-big);
    border-radius: var(--radius-big) var(--radius-big) 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
  h1 {
    margin: 0;
    font-weight: bold;
    font-size: 1rem;
    padding: var(--padding-big) var(--padding-big) 0 var(--padding-big);
  }
  .content {
    height: 100%;
    overflow: scroll;
    box-sizing: border-box;
    padding: 0 var(--padding-big) var(--padding-big) var(--padding-big);
  }
</style>
