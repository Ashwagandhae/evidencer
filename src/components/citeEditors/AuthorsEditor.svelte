<script lang="ts">
  import type { ICard } from '../../types';
  import { validateAuthors } from '../citeFormatters';
  import AuthorEditor from './AuthorEditor.svelte';
  import type { Writable } from 'svelte/store';
  import { getContext } from 'svelte';
  import type { EditHistory } from '../history';
  import { transitionDuration } from '../transition';

  export let key: string;
  const card: Writable<ICard> = getContext('card');
  const history: EditHistory = getContext('history');

  function addAuthor() {
    history.action('addAuthor', {});
    setTimeout(function () {
      (element.parentNode as HTMLElement).scrollBy({
        top: (element.parentNode as HTMLElement).scrollHeight,
        behavior: 'smooth',
      });
    }, transitionDuration);
  }
  let valid: boolean;
  function validate() {
    valid = validateAuthors($card[key]);
  }

  let element: HTMLElement;
  $: $card[key], validate();
</script>

<div class="top levelOne" class:invalid={!valid} bind:this={element}>
  <ul>
    <!-- id must be based on index, otherwise authors will refresh every time you edit -->
    {#each $card[key] as author, index (author.id)}
      <li>
        <AuthorEditor {index} bind:author />
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
    transition: background var(--transition-duration),
      color var(--transition-duration), border var(--transition-duration);
  }
  button:hover {
    background: var(--background-select-weak-secondary);
    color: var(--text-strong);
  }
  button:active {
    transition: none;
    background: var(--background-select-secondary);
    border: 2px solid var(--background-select-secondary);
  }
</style>
