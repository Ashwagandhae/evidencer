<script lang="ts">
  export let run: {
    text: string;
    underline: boolean;
    highlight: boolean;
  };
</script>

<span
  class:underline={run.underline}
  class:highlight={run.highlight}
  class:highlight-underline={run.underline && run.highlight}>{run.text}</span
>

<style>
  span {
    white-space: pre-wrap;
  }
  .underline {
    text-decoration: underline;
    color: var(--text-strong);
  }
  .highlight {
    background-color: var(--background-highlight);
    border-radius: var(--radius);
  }
  .highlight-underline {
    text-decoration: underline;
  }
</style>
