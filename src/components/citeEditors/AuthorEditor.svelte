<script lang="ts">
  import { onMount } from 'svelte';

  export let deleteSelf: () => void;

  export let author: { name: string; isPerson: boolean; description: string };
  let nameElement: HTMLElement;
  onMount(function () {
    if (author.name == '') {
      nameElement.focus();
    }
  });
</script>

<div class="top">
  <input bind:this={nameElement} type="text" bind:value={author.name} />
  <div class="right">
    <input type="checkbox" hidden bind:checked={author.isPerson} />
    <button
      class="isPerson"
      on:click={() => (author.isPerson = !author.isPerson)}
    >
      {#if author.isPerson}Person{:else}Organization{/if}
    </button>
    <button class="delete" on:click={deleteSelf}>Delete</button>
  </div>
</div>

<style>
  div.top {
    position: relative;
    width: 100%;
    height: auto;
    font-size: 1rem;
    font-weight: normal;
    display: flex;
    flex-direction: row;
    padding: 0;
    box-sizing: border-box;
    background: var(--background-secondary);
    align-items: center;
    justify-content: space-between;
    gap: var(--padding);
    color: var(--text);
  }
  div.right {
    position: relative;
    width: 50%;
    height: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    width: min-content;
  }
  input[type='text'] {
    border: none;
    outline: none;
    display: block;
    box-sizing: border-box;
    position: relative;
    width: 50%;
    font-size: inherit;
    font-weight: inherit;
    font-family: inherit;
    background: none;
    background: var(--background-select-weak-secondary);
    border-radius: var(--padding);
    padding: var(--padding);
    color: var(--text);
  }
  button {
    border: none;
    outline: none;
    display: block;
    box-sizing: border-box;
    position: relative;
    font-size: inherit;
    font-weight: inherit;
    font-family: inherit;
    background: none;
    cursor: pointer;
    white-space: nowrap;
    color: var(--text);
  }
  .isPerson {
    background: var(--background-select-weak-secondary);
    border-radius: var(--padding);
    padding: var(--padding);
  }
  .isPerson:active {
    background: var(--background-select-secondary);
  }
</style>
