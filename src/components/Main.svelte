<script lang="ts">
  import type {
    IStorage,
    ICard,
    ChromeMessage,
    GetCardDataMessage,
  } from '../types';
  import { onMount, setContext, SvelteComponent } from 'svelte';
  import { copyCard } from './clipboard';

  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { formatters } from './citeFormatters';
  import { EditHistory } from './history';
  import Text from './Text.svelte';
  import Popups from './Popups.svelte';
  import Cite from './Cite.svelte';
  import CiteEditor from './CiteEditor.svelte';
  import Paras from './Paras.svelte';
  import ParaTools from './ParaTools.svelte';
  import Icon from './Icon.svelte';
  import Button from './Button.svelte';
  import ButtonGroup from './ButtonGroup.svelte';
  import Messages from './Messages.svelte';
  import { createTransition, transitionDuration } from './transition';
  import { messenger, popups } from './stores';

  export let context: 'popup' | 'popout' | 'options';

  let currentTool: Writable<null | 'highlight' | 'underline' | 'eraser'> =
    writable(null);
  setContext('currentTool', currentTool);
  let currentEditor: Writable<string | null> = writable(null);
  setContext('currentEditor', currentEditor);

  let shrunk: Writable<boolean> = writable(false);
  setContext('shrunk', shrunk);

  let card: Writable<ICard | null> = writable(null);
  setContext('card', card);
  let history = new EditHistory(card);
  setContext('history', history);

  function requestCardData() {
    return new Promise<ICard | null>((resolve, reject) => {
      let message: GetCardDataMessage = {
        message: 'getCardData',
      };
      chrome.runtime.sendMessage(message, function (response: ChromeMessage) {
        if (response?.message == 'gotCardData') {
          resolve(response?.card ?? null);
        }
      });
    });
  }
  let cardElement: HTMLElement;
  let buttonsFloating = false;
  let paraToolsFloating = false;
  function handleScroll() {
    buttonsFloating = cardElement.scrollTop > 0;
  }
  let citeElement: HTMLElement;
  // create intersection observer for citeElement, and run if cite is invisible
  let citeObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].intersectionRatio == 0) {
        paraToolsFloating = true;
      } else {
        paraToolsFloating = false;
      }
    },
    {
      threshold: [0],
      root: cardElement,
    }
  );
  function startObserve() {
    citeObserver.disconnect();
    citeElement != null && citeObserver.observe(citeElement);
  }
  $: citeElement, startObserve();

  let colorThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  let updateDarkLightTheme = function () {
    document.body.classList.toggle('dark', colorThemeMediaQuery.matches);
  };
  updateDarkLightTheme();
  colorThemeMediaQuery.addEventListener('change', updateDarkLightTheme);

  async function popoutWindow() {
    let display = await chrome.system.display.getInfo();
    let width = display[0].bounds.width;
    chrome.windows.create({
      url: chrome.runtime.getURL('src/pages/options/index.html'),
      type: 'popup',
      width: 600,
      height: 800,
      left: width - 600,
      top: 0,
    });
    window.close();
  }

  let tagText: SvelteComponent;
  onMount(function () {
    requestCardData().then((cardData: ICard | null) => {
      card.set(cardData);
    });
  });
  function handleKeydown(e: KeyboardEvent) {
    if (e.key == 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      history.redo();
    } else if (e.key == 'z' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      history.undo();
    }
    // if not typing in textarea or input
    if (
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLInputElement
    ) {
      return;
    }
    if (e.key == 'c' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      copyAndMessage();
    }
    if (e.code == 'KeyP') {
      e.preventDefault();
      e.stopPropagation();
      $currentTool = null;
    }
    if (e.code == 'KeyH') {
      e.preventDefault();
      e.stopPropagation();
      $currentTool = 'highlight';
    } else if (e.code == 'KeyU') {
      e.preventDefault();
      e.stopPropagation();
      $currentTool = 'underline';
    } else if (e.code == 'KeyE') {
      e.preventDefault();
      e.stopPropagation();
      $currentTool = 'eraser';
    } else if (e.code == 'KeyS') {
      e.preventDefault();
      e.stopPropagation();
      if ($shrunk) {
        messenger.addMessage('Unshrunk paras');
      } else {
        messenger.addMessage('Shrunk paras');
      }
      $shrunk = !$shrunk;
    } else if (e.code == 'KeyM') {
      e.preventDefault();
      e.stopPropagation();
      if ($card.paras.length > 1) {
        history.action('condenseParas', {});
        messenger.addMessage('Merged paras');
      } else {
        messenger.addMessage('Paras already merged');
      }
    }
  }
  async function animateReload() {
    let animateTime = new Promise((resolve, reject) => {
      setTimeout(resolve, transitionDuration * 2);
    });
    cardElement.classList.remove('animateEndReload');
    cardElement.classList.add('animateStartReload');
    // trigger reflow
    cardElement.offsetWidth;
    Promise.all([animateTime, requestCardData()]).then(
      ([_, cardData]: [any, ICard | null]) => {
        messenger.addMessage('Card reset!');

        card.set(cardData);
        if (cardData == null) {
          return;
        }
        // scroll to top
        cardElement.scrollTop = 0;

        cardElement.classList.remove('animateStartReload');
        cardElement.classList.add('animateEndReload');
        // trigger reflow
        cardElement.offsetWidth;
      }
    );
  }
  function copyAndMessage() {
    copyCard($card, $shrunk);
    messenger.addMessage('Copied to clipboard!');
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="container" class:fixedWidth={context == 'popup'}>
  <Messages />
  <div class="buttons levelOne">
    <ButtonGroup floating={buttonsFloating}>
      {#if context == 'popup'}
        <Button on:click={popoutWindow} tooltip={'Popout'}
          ><Icon name="popout" /></Button
        >
      {/if}
      {#if $card != null}
        <Button tooltip={'Copy card'} on:click={copyAndMessage}
          ><Icon name="copy" /></Button
        >
      {/if}
      <Button on:click={animateReload} tooltip={'Reset card'}
        ><Icon name="reload" /></Button
      >
    </ButtonGroup>
  </div>
  {#if $card != null}
    <div class="card" on:scroll={handleScroll} bind:this={cardElement}>
      <div class="tag" class:moreWidth={context != 'popup'}>
        <Text
          bind:this={tagText}
          bind:text={$card.tag}
          placeholder="Type tag here..."
        />
      </div>
      <div class="cite" bind:this={citeElement}>
        <span class="bigCite">
          <Cite formatter={formatters.bigAuthors} />, <Cite
            formatter={formatters.bigDate}
          />
        </span>
        [<Cite formatter={formatters.authors} />. <Cite
          formatter={formatters.date}
        />. "<Cite formatter={formatters.title} />". <Cite
          formatter={formatters.siteName}
        />. <Cite formatter={formatters.url} />. <Cite
          formatter={formatters.accessDate}
        />.]
      </div>
      <div class="paras">
        <ParaTools
          paras={$card.paras}
          floating={paraToolsFloating}
          bind:shrunk={$shrunk}
        />
        <Paras shrunk={$shrunk} />
      </div>
    </div>
    {#if $popups.length > 0}
      <Popups
        name={$popups[0]}
        closePopup={() => {
          $popups = $popups.slice(1);
          $popups = $popups;
        }}
      />
    {:else if $currentEditor != null}
      <CiteEditor key={$currentEditor} />
    {/if}
  {/if}
</div>

<style>
  :global(:root) {
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  :global(body) {
    --padding-small: 4px;
    --padding: 8px;
    --padding-big: 16px;
    --radius: 8px;
    --radius-big: 16px;
    --transition-duration: 200ms;
  }
  @media (prefers-reduced-motion) {
    :global(body) {
      --transition-duration: 0ms;
    }
  }

  :global(body.dark) {
    --background-secondary: hsl(222, 10%, 30%);
    --background-select-weak-secondary: hsl(201, 20%, 37%);
    --background-select-secondary: hsl(201, 25%, 42%);
    --background-error-weak-secondary: hsl(0, 20%, 35%);
    --background-error-secondary: hsl(0, 30%, 45%);

    --background: hsl(222, 10%, 20%);
    --background-select-weak: hsl(201, 20%, 30%);
    --background-select: hsl(201, 40%, 35%);
    --background-error-weak: hsl(0, 20%, 30%);
    --background-error: hsl(0, 40%, 35%);

    --background-tooltip: hsl(0, 0%, 0%);
    --text-tooltip: hsl(209, 30%, 80%);
    --text-tooltip-weak: hsl(222, 12%, 50%);

    --background-highlight: hsl(60, 25%, 30%);
    --text-hover: hsl(201, 80%, 80%);
    --text-hover-weak: hsl(201, 50%, 75%);
    --text-error-weak: hsl(0, 50%, 75%);
    --text-error: hsl(0, 80%, 80%);
    --text-weak: hsl(222, 10%, 60%);
    --text: hsl(209, 30%, 80%);
    --text-strong: hsl(209, 80%, 95%);
    --shadow-big: rgba(0, 0, 0, 0.7) 0px 0px 30px;
    --shadow: rgba(0, 0, 0, 0.4) 0px 5px 15px;
  }
  :global(body) {
    --background-secondary: hsl(210, 50%, 94%);
    --background-select-weak-secondary: hsl(201, 60%, 86%);
    --background-select-secondary: hsl(201, 70%, 82%);
    --background-error-weak-secondary: hsl(0, 60%, 86%);
    --background-error-secondary: hsl(0, 70%, 80%);

    --background: hsl(210, 10%, 100%);
    --background-select-weak: hsl(201, 80%, 90%);
    --background-select: hsl(201, 80%, 80%);
    --background-error-weak: hsl(0, 80%, 90%);
    --background-error: hsl(0, 80%, 80%);

    --background-tooltip: hsl(222, 10%, 30%);

    --text-tooltip: hsl(209, 30%, 90%);
    --text-tooltip-weak: hsl(222, 10%, 70%);

    --background-highlight: hsl(55, 90%, 60%);
    --text-hover: hsl(201, 80%, 60%);
    --text-hover-weak: hsl(201, 50%, 65%);
    --text-error-weak: hsl(0, 50%, 65%);
    --text-error: hsl(0, 80%, 60%);
    --text-weak: hsl(210, 10%, 60%);
    --text: hsl(0, 0%, 15%);
    --text-strong: hsl(0, 0%, 0%);
    --shadow-big: rgba(0, 0, 0, 0.35) 0px 0px 15px;
    --shadow: rgba(0, 0, 0, 0.2) 0px 5px 15px;
  }
  :global(body) {
    /* use apple font */
    font-family: var(--font-family);
    margin: 0;
    font-size: 1rem;
    color: var(--text);
    background: var(--background);
  }
  :global(textarea) {
    box-sizing: border-box;
    resize: none;
    outline: none;
    display: block;
    overflow-y: scroll;
    margin: 0;
    line-height: 1.5em;
    border: none;
    word-wrap: break-word;
    box-sizing: border-box;
  }
  .container {
    width: 100vw;
    height: 100vh;
    position: relative;
    background-color: var(--background);
    overflow: hidden;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .container.fixedWidth {
    width: 450px;
    height: 550px;
  }

  .card {
    overflow: scroll;
    position: relative;
    height: 100%;
    width: 100%;
    padding: var(--padding) var(--padding);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
  @keyframes start-reload {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%) scale(0.7);
    }
  }
  @keyframes end-reload {
    0% {
      transform: translateX(100%) scale(0.7);
    }
    100% {
      transform: none;
    }
  }
  .card:global(.animateStartReload) {
    animation: start-reload calc(var(--transition-duration) * 2) ease;
    transform: translateX(-100%) scale(0.7);
  }
  .card:global(.animateEndReload) {
    animation: end-reload calc(var(--transition-duration) * 2) ease;
  }
  .tag {
    font-size: 1.2em;
    font-weight: bold;
    color: var(--text-strong);
    padding-right: calc(var(--padding) * 8 + 3rem);
  }
  .tag.moreWidth {
    padding-right: calc(var(--padding) * 5 + 2rem);
  }
  .cite {
    user-select: none;
    line-height: 1.6em;
    background: var(--background-secondary);
    padding: var(--padding);
    border-radius: var(--radius-big);
  }
  .paras {
    padding: 0;
  }
  .bigCite {
    font-size: 1.2em;
    font-weight: bold;
    color: var(--text-strong);
  }
  .buttons {
    position: absolute;
    top: 0;
    right: 0;
    padding: var(--padding);
    z-index: 1000;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
</style>
