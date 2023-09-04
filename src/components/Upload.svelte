<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { getContext, onDestroy, onMount } from 'svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';
  import TextButton from './TextButton.svelte';
  import type { ICard } from 'src/types';
  import { cardToHtml } from './clipboard';
  import {
    getCollections,
    uploadCard as uploadCardToArguflow,
    addCardToCollection,
    type Collection,
  } from '../pages/arguflow';
  import { messenger } from './stores';
  import { createTransition } from './transition';

  const card: Writable<ICard> = getContext('card');
  const shrunk: Writable<boolean> = getContext('shrunk');

  let uploadChoices: {
    isPrivate: boolean;
    includeDict: { [key: string]: boolean };
  } = {
    isPrivate: false,
    includeDict: {},
  };
  onMount(function () {
    chrome.storage.local.get('uploadChoices', (result) => {
      if (result.uploadChoices) {
        uploadChoices = result.uploadChoices;
      }
    });
  });

  export let closePopup: () => void;

  let bookmark = false;

  async function uploadCard() {
    let html = cardToHtml($card, $shrunk, false, false);
    messenger.addMessage('Uploading...');
    try {
      let cardData = await uploadCardToArguflow(
        html.innerHTML,
        $card.url,
        uploadChoices.isPrivate
      );
      if (includeArray.length > 0) {
        messenger.addMessage('Adding to collections...');
        for (let id of includeArray) {
          console.log(id, cardData.card_metadata.id);
          await addCardToCollection(cardData.card_metadata.id, id);
        }
      }
      if (cardData.duplicate) {
        messenger.addMessage('Done, card is a duplicate');
      } else {
        messenger.addMessage('Done!');
      }
      closePopup();
    } catch (err) {
      messenger.addError('upload', err);
    }
  }
  let includeArray: string[] = [];
  $: {
    includeArray = [];
    for (let id of Object.keys(uploadChoices.includeDict)) {
      if (uploadChoices.includeDict[id]) {
        includeArray.push(id);
      } else {
        delete uploadChoices.includeDict[id];
      }
    }
  }

  onDestroy(() => {
    chrome.storage.local.set({ uploadChoices });
  });

  let currentPage = 1;
  let currentLoadedPage = 1;

  let collectionsResp: {
    collections: Collection[];
    total_pages: number;
  } | null = null;

  $: bookmark, currentPage, onBookmarkChange();
  function onBookmarkChange() {
    if (bookmark) {
      getCollections(currentPage)
        .then((resp) => {
          collectionsResp = resp;
          currentLoadedPage = currentPage;
        })
        .catch((err) => {
          messenger.addError('get collections', err);
          bookmark = false;
        });
    }
  }
</script>

<h1>Upload to Arguflow</h1>
<div class="content" class:bookmark>
  {#if bookmark && collectionsResp != null}
    <div class="collectionsScroll">
      <div class="collections">
        {#each collectionsResp.collections as collection}
          <button
            class="collection"
            on:click={() => {
              uploadChoices.includeDict[collection.id] =
                !uploadChoices.includeDict[collection.id];
            }}
          >
            <label for={collection.name}>{collection.name}</label>
            {#if uploadChoices.includeDict[collection.id]}
              <Icon name="check" />
            {/if}
            <input
              type="checkbox"
              bind:checked={uploadChoices.includeDict[collection.id]}
              name={collection.name}
              hidden
            />
          </button>
        {/each}
        <div class="buttons">
          {#if currentLoadedPage != 1}
            <TextButton
              expand
              on:click={() => {
                currentPage--;
              }}
            >
              Previous
            </TextButton>
          {/if}
          {#if currentLoadedPage != collectionsResp.total_pages}
            <TextButton
              expand
              on:click={() => {
                currentPage++;
              }}
            >
              Next
            </TextButton>
          {/if}
        </div>
      </div>
    </div>
  {/if}
  <div class="buttons">
    <Button
      tooltip={{
        content: uploadChoices.isPrivate ? 'Private' : 'Public',
        layout: 'top',
      }}
      selected={uploadChoices.isPrivate}
      on:click={() => {
        uploadChoices.isPrivate = !uploadChoices.isPrivate;
        uploadChoices = uploadChoices;
      }}><Icon name="lock" /></Button
    >
    <TextButton expand on:click={() => (bookmark = !bookmark)}>
      {#if includeArray.length > 0}
        {includeArray.length}
        {#if includeArray.length == 1}collection{:else}collections{/if}
      {:else}
        Select collections
      {/if}
    </TextButton>
    {#if includeArray.length > 0}
      <Button
        tooltip={{ content: 'Clear collections', layout: 'top' }}
        on:click={() => {
          uploadChoices.includeDict = {};
          includeArray = [];
        }}><Icon name="delete" /></Button
      >
    {/if}
    <TextButton on:click={uploadCard} expand
      >Upload
      <Icon name="upload" />
    </TextButton>
  </div>
</div>

<style>
  h1 {
    margin: 0;
    font-weight: bold;
    font-size: 1rem;
    padding: var(--padding-big) var(--padding-big) 0 var(--padding-big);
  }
  .content {
    height: 100%;
    overflow: scroll;
    box-sizing: border-box;
    padding: 0 var(--padding-big) var(--padding-big) var(--padding-big);
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
  .buttons {
    display: flex;
    flex-direction: row;
    gap: var(--padding);
    align-items: center;
    justify-content: center;
  }

  .collectionsScroll {
    overflow: scroll;
    height: 100%;
    max-height: calc(100vh - 200px);
  }
  .collections {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .collection {
    border: none;
    outline: none;
    display: flex;
    box-sizing: border-box;
    position: relative;
    width: 100%;
    font-size: inherit;
    font-weight: inherit;
    font-family: inherit;
    border-radius: var(--padding);
    padding: var(--padding);
    color: var(--text);
    transition: background var(--transition-duration);
    justify-content: space-between;
    background: none;
    height: calc(1.2rem + var(--padding) * 2);
  }
  .collection > label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .collection:has(input:checked) {
    background: var(--background-select-secondary);
    color: var(--text-strong);
  }
  .collection:hover {
    background: var(--background-select-weak-secondary);
    color: var(--text-strong);
  }
</style>
