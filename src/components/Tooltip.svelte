<script lang="ts">
  import { tick, onDestroy } from 'svelte';
  import { createTransition } from './transition';
  import { tooltipState } from './stores';

  export let exist: boolean = true;
  export let content: string = '';
  export let disabled: boolean = false;
  export let layout: string = 'bottom';
  export let shortcut: string | null = null;

  let isHovered: boolean = false;
  let x: number = 0;
  let y: number = 0;
  let element: HTMLElement;
  let tooltip: {
    offsetWidth: number;
    offsetHeight: number;
  };

  let transitionIn = createTransition((t, eased) => {
    return `
      transform: scale(${eased});
    `;
  }, 'sineOut');

  let transitionOut = createTransition((t, eased) => {
    return `
      transform: scale(${eased});
      z-index: -1;
    `;
  }, 'sineOut');

  let openTimeout: NodeJS.Timeout = null;
  async function openTooltip() {
    isHovered = true;
    mouseMove();
    await tick();
    $tooltipState.open = true;
  }
  function mouseOver() {
    if (!isHovered) {
      $tooltipState.claimed = true;
      if ($tooltipState.open) {
        openTooltip();
      } else {
        if (openTimeout == null) {
          openTimeout = setTimeout(openTooltip, 1000);
        }
      }
    }
  }
  function mouseMove() {
    if (tooltip) {
      let rect = element.getBoundingClientRect();
      if (layout == 'bottom' || layout == 'top') {
        x = rect.left - tooltip.offsetWidth / 2 + rect.width / 2;
        if (x < 4) {
          x = 4;
        } else if (x + tooltip.offsetWidth > window.innerWidth - 4) {
          x = window.innerWidth - tooltip.offsetWidth - 4;
        }
        if (layout == 'bottom') {
          y = rect.bottom + 4;
        } else if (layout == 'top') {
          y = rect.top - tooltip.offsetHeight - 4;
        }
      } else if (layout == 'left' || layout == 'right') {
        y = rect.top - tooltip.offsetHeight / 2 + rect.height / 2;
        if (y < 4) {
          y = 4;
        } else if (y + tooltip.offsetHeight > window.innerHeight - 4) {
          y = window.innerHeight - tooltip.offsetHeight - 4;
        }
        if (layout == 'left') {
          x = rect.left - tooltip.offsetWidth - 4;
        } else if (layout == 'right') {
          x = rect.right + 4;
        }
      }
    }
  }
  async function onContentChanged() {
    await tick();
    mouseMove();
  }
  $: tooltip, content, disabled, onContentChanged();
  function mouseLeave() {
    if (openTimeout != null) {
      clearTimeout(openTimeout);
      openTimeout = null;
    }
    $tooltipState.claimed = false;
    isHovered = false;
    setTimeout(function () {
      if (!$tooltipState.claimed) {
        $tooltipState.open = false;
      }
    }, 200);
  }
</script>

{#if content && exist}
  <div
    class="element"
    on:mouseover={mouseOver}
    on:focus={mouseOver}
    on:mouseleave={mouseLeave}
    on:blur={mouseLeave}
    on:mousemove={mouseMove}
    bind:this={element}
  >
    <slot />
  </div>

  {#if isHovered}
    <div
      bind:this={tooltip}
      style="top: {y}px; left: {x}px;"
      class="tooltip"
      class:disabled
      in:transitionIn
      out:transitionOut
    >
      <div class="content">
        {content}
        {#if shortcut != null}
          <span class="shortcut">{shortcut}</span>
        {/if}
      </div>
    </div>
  {/if}
{:else}
  <slot />
{/if}

<style>
  .element {
    width: min-content;
    height: min-content;
  }
  .tooltip {
    border: none;
    padding: var(--padding-small) var(--padding);
    color: var(--text-tooltip);
    background-color: var(--background-tooltip);
    border-radius: var(--radius-big);
    position: fixed;
    white-space: nowrap;
    z-index: 10000;
    font-size: 0.8rem;
    box-shadow: var(--shadow);
  }
  .tooltip.disabled {
    color: var(--text-tooltip-weak);
  }

  .content {
    display: flex;
    flex-direction: row;
    gap: var(--padding);
  }

  .shortcut {
    color: var(--text-tooltip-weak);
  }
</style>
