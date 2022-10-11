<script lang="ts">
  import { onMount } from 'svelte';
  import type { ICard } from '../../types';
  import { validateDate } from '../citeFormatters';
  export let card: ICard;
  export let key: string;

  let validMonth: boolean;
  let validDay: boolean;
  let validYear: boolean;

  let month: string = card[key].month;
  let day: string = card[key].day;
  let year: string = card[key].year;

  function cleanInput(string: string) {
    // remove all non-numbers
    if (string == null) {
      return string;
    }
    return string.replace(/\D/g, '');
  }
  function monthChange() {
    month = cleanInput(month);
    card[key].month = month;
  }
  $: month, monthChange();
  function dayChange() {
    day = cleanInput(day);
    card[key].day = day;
  }
  $: day, dayChange();
  function yearChange() {
    year = cleanInput(year);
    card[key].year = year;
  }
  $: year, yearChange();

  function validate() {
    let valid = validateDate(card[key]);
    validMonth = valid.month;
    validDay = valid.day;
    validYear = valid.year;
  }
  $: card[key], validate();

  let monthInput: HTMLElement;
  let dayInput: HTMLElement;
  let yearInput: HTMLElement;
  onMount(function () {
    monthInput.focus();
  });
  function monthKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === '/') {
      e.preventDefault();
      dayInput.focus();
    }
  }
  function dayKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === '/') {
      e.preventDefault();
      yearInput.focus();
    }
  }
</script>

<div class="top">
  <input
    type="text"
    class:invalid={!validMonth}
    bind:value={month}
    placeholder={'Month'}
    bind:this={monthInput}
    on:keydown={monthKeydown}
  />
  <input
    type="text"
    class:invalid={!validDay}
    bind:value={day}
    placeholder={'Date'}
    bind:this={dayInput}
    on:keydown={dayKeydown}
  />
  <input
    type="text"
    class:invalid={!validYear}
    bind:value={year}
    placeholder={'Year'}
    bind:this={yearInput}
  />
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
    gap: var(--padding);
  }
  input {
    border: none;
    outline: none;
    display: block;
    box-sizing: border-box;
    position: relative;
    width: 33.33%;
    font-size: inherit;
    font-weight: inherit;
    font-family: inherit;
    border-radius: var(--padding);
    padding: var(--padding);
    background: var(--background-select-weak-secondary);
    color: var(--text);
  }
  input.invalid {
    background: var(--background-error-weak-secondary);
  }
  input::placeholder {
    color: var(--text-weak);
  }
  input.invalid::placeholder {
    color: var(--text-error-weak);
  }
</style>
