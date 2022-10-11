# Svelte Typescript Chrome Extension Boilerplate

An extension that lets you scrape, highlight/underline, and export articles you see online as debate cards.

Based off [this template](https://github.com/NekitCorp/chrome-extension-svelte-typescript-boilerplate) by [@NekitCorp](https://github.com/NekitCorp).

## Built with

- [Svelte](https://svelte.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Better than JavaScript
- [Vite](https://vitejs.dev/) - Bundler
- [Chrome Extensions Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) - Chrome extension standard
- [Readability](https://github.com/mozilla/readability) - Webpage scraper

## Usage

1. Build extension

```bash
# install dependencies
npm i

# build files to `/dist` directory
npm run build
```

2. Open the Extension Management page by navigating to `chrome://extensions`.
3. Enable Developer Mode by clicking the toggle switch next to `Developer mode`.
4. Click the `LOAD UNPACKED` button and select the `/dist` directory.

## Develop

```bash
# install dependencies
npm i
# build files to `/dist` directory
# vite.build.watch rebuilds when modules have changed on disk
npm run dev

```
