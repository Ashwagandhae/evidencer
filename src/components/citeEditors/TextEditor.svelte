<script lang="ts">
  import type { ICard } from '../../types';
  import { onMount } from 'svelte';
  import { validateText } from '../citeFormatters';

  let textarea: HTMLElement;
  onMount(function () {
    textarea.focus();
  });

  let valid: boolean;

  function validate() {
    valid = validateText(card[key]);
  }

  export let card: ICard;
  export let key: string;

  $: card[key], validate();
</script>

<textarea
  bind:this={textarea}
  placeholder={'Type text here'}
  class:invalid={!valid}
  bind:value={card[key]}
/>

<style>
  textarea {
    font-size: inherit;
    font-weight: inherit;
    font-family: inherit;

    width: 100%;
    height: 100%;

    border-radius: var(--padding);
    padding: var(--padding);
    background: none;
    color: var(--text);
  }
  textarea:focus {
    background: var(--background-select-weak-secondary);
  }
  textarea.invalid {
    background: var(--background-error-weak-secondary);
  }
  textarea::placeholder {
    color: var(--text-weak);
  }
  textarea.invalid::placeholder {
    color: var(--text-error-weak);
  }
</style>
