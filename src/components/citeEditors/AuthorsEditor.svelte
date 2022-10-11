<script lang="ts">
  import type { ICard } from '../../types';
  import { validateAuthors } from '../citeFormatters';
  import AuthorEditor from './AuthorEditor.svelte';

  export let card: ICard;
  export let key: string;

  function addAuthor() {
    card.authors.push({ name: '', isPerson: true, description: null });
    card = card;
  }
  let valid: boolean;
  function validate() {
    valid = validateAuthors(card[key]);
  }
  function deleteChild(index: number) {
    card.authors.splice(index, 1);
    card = card;
  }
  $: card[key], validate();
</script>

<div class="top" class:invalid={!valid}>
  <ul>
    {#each card[key] as author, index (author)}
      <li>
        <AuthorEditor deleteSelf={() => deleteChild(index)} bind:author />
      </li>
    {/each}
    <button on:click={addAuthor}>Add author</button>
  </ul>
</div>

<style>
  div.top {
    width: 100%;
    height: auto;
    font-size: 1rem;
    font-weight: normal;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  button {
    border: 2px solid var(--background-select-weak-secondary);
    box-sizing: border-box;
    outline: none;
    display: block;
    box-sizing: border-box;
    position: relative;
    font-size: inherit;
    font-weight: inherit;
    font-family: inherit;
    background: none;
    cursor: pointer;
    padding: var(--padding);
    border-radius: var(--radius);
    white-space: nowrap;
    color: var(--text);
  }
</style>
