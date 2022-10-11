<script lang="ts">
  import CopyIcon from './icons/CopyIcon.svelte';
  import PopoutIcon from './icons/PopoutIcon.svelte';
  import CursorIcon from './icons/CursorIcon.svelte';
  import HighlightIcon from './icons/HighlightIcon.svelte';
  import UnderlineIcon from './icons/UnderlineIcon.svelte';
  import EraserIcon from './icons/EraserIcon.svelte';
  import MergeIcon from './icons/MergeIcon.svelte';
  import ReloadIcon from './icons/ReloadIcon.svelte';
  let icons = {
    copy: CopyIcon,
    popout: PopoutIcon,
    cursor: CursorIcon,
    highlight: HighlightIcon,
    underline: UnderlineIcon,
    eraser: EraserIcon,
    merge: MergeIcon,
    reload: ReloadIcon,
  };
  export let name: string;
</script>

<svg
  width="200"
  height="200"
  viewBox="0 0 200 200"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <svelte:component this={icons[name]} />
</svg>

<style>
  svg {
    width: 1.2rem;
    height: 1.2rem;
    stroke: currentColor;
    overflow: visible;
  }
  svg :global(path) {
    transition: transform var(--transition-duration) ease-in-out;
  }
  svg :global(g) {
    transition: transform var(--transition-duration) ease-in-out;
  }
</style>
