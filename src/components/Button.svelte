<script lang="ts">
  export let selected: boolean = false;
  export let disabled: boolean = false;

  let element: HTMLElement;
  function animateClick() {
    element.classList.remove('clicked');
    // trigger reflow
    void element.offsetWidth;
    element.classList.add('clicked');
  }
  function animateHover() {
    element.classList.remove('hovered');
    // trigger reflow
    void element.offsetWidth;
    element.classList.add('hovered');
  }
</script>

<button
  bind:this={element}
  on:click
  class:selected
  {disabled}
  on:click={animateClick}
  on:mouseenter={animateHover}
>
  <slot />
</button>

<style>
  button {
    background-color: var(--background);
    border-radius: 2rem;
    color: var(--text);
    cursor: pointer;
    font-size: 1rem;
    padding: var(--padding);
    border: none;
    outline: none;
    margin: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    width: min-content;
    transition: color var(--transition-duration),
      background var(--transition-duration);
  }
  button:hover {
    background-color: var(--background-select-weak);
    color: var(--text-strong);
  }
  button:active {
    background-color: var(--background-select);
    color: var(--text-strong);
  }
  :global(.levelOne) button {
    background-color: var(--background-secondary);
  }
  :global(.levelOne) button:hover {
    background-color: var(--background-select-weak-secondary);
  }
  :global(.levelOne) button:active {
    background-color: var(--background-select-secondary);
  }
  .selected,
  .selected:hover {
    background-color: var(--background-select);
    color: var(--text-strong);
  }
  :global(.levelOne) .selected,
  :global(.levelOne) .selected:hover {
    background-color: var(--background-select-secondary);
  }
  button:disabled {
    color: var(--text-weak);
    background-color: var(--background);
  }
  :global(.levelOne) button:disabled {
    background-color: var(--background-secondary);
  }
</style>
