<script lang="ts">
  import Para from './Para.svelte';
  import { onMount } from 'svelte';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { ICard, IPara, IRun } from '../types';

  let currentTool: Writable<null | 'highlight' | 'underline' | 'eraser'> =
    getContext('currentTool');
  let card: Writable<ICard> = getContext('card');
  let parentElement: HTMLElement;

  // converts text nodes/span nodes/p nodes all to span, so that it is normalized
  function findCorrectParent(node: Node) {
    if (node.nodeName === 'SPAN') {
      return node;
    } else if (node.nodeName === 'P') {
      return findCorrectParent(node.firstChild);
    } else if (node.nodeName === '#text') {
      return findCorrectParent(node.parentNode);
    } else {
      throw new Error('Unexpected node type');
    }
  }
  function selectionDone() {
    if ($currentTool == null) return;
    const selection = window.getSelection();
    if (selection.rangeCount == 0) return;
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    // check if startContainer and endContainer descendants of parentElement
    if (
      !(
        parentElement.contains(startContainer) &&
        parentElement.contains(endContainer)
      )
    )
      return;
    // normalize startContainer and endContainer
    let startSpan = findCorrectParent(startContainer) as HTMLElement;
    let endSpan = findCorrectParent(endContainer) as HTMLElement;
    // get start p and end p
    let startP = startSpan.parentElement;
    let endP = endSpan.parentElement;
    // get start p index and end p index
    let startPIndex = Array.from(startP.parentElement.children).indexOf(startP);
    let endPIndex = Array.from(endP.parentElement.children).indexOf(endP);
    // get start span index and end span index
    let startSpanIndex = Array.from(startP.children).indexOf(startSpan);
    let endSpanIndex = Array.from(endP.children).indexOf(endSpan);

    let changeRunIndexes: [number, number][] = [];
    let newParas = [...$card.paras];
    // if highlight start and highlight end are in the same run
    if (startPIndex == endPIndex && startSpanIndex == endSpanIndex) {
      let run = newParas[startPIndex][startSpanIndex];
      let run1 = { ...run };
      let run2 = { ...run };
      let run3 = { ...run };
      run1.text = run.text.slice(0, startOffset);
      run2.text = run.text.slice(startOffset, endOffset);
      run3.text = run.text.slice(endOffset);
      changeRunIndexes.push([startPIndex, startSpanIndex + 1]);
      newParas[startPIndex] = [
        ...newParas[startPIndex].slice(0, startSpanIndex),
        run1,
        run2,
        run3,
        ...newParas[startPIndex].slice(startSpanIndex + 1),
      ];
    }
    // else do them individually
    else {
      // highlight start
      let run = newParas[startPIndex][startSpanIndex];
      console.log('startRun', run);
      let run1 = { ...run };
      let run2 = { ...run };
      run1.text = run.text.slice(0, startOffset);
      run2.text = run.text.slice(startOffset);
      changeRunIndexes.push([startPIndex, startSpanIndex + 1]);
      newParas[startPIndex] = [
        ...newParas[startPIndex].slice(0, startSpanIndex),
        run1,
        run2,
        ...newParas[startPIndex].slice(startSpanIndex + 1),
      ];
      // if both spans are in the same para, increase endSpanIndex by 1
      if (startPIndex == endPIndex) {
        endSpanIndex += 1;
      }
      // highlight end
      run = newParas[endPIndex][endSpanIndex];
      run1 = { ...run };
      run2 = { ...run };
      run1.text = run.text.slice(0, endOffset);
      run2.text = run.text.slice(endOffset);
      changeRunIndexes.push([endPIndex, endSpanIndex]);

      newParas[endPIndex] = [
        ...newParas[endPIndex].slice(0, endSpanIndex),
        run1,
        run2,
        ...newParas[endPIndex].slice(endSpanIndex + 1),
      ];
      // increase endSpanIndex by 1
      endSpanIndex += 1;
      // highlight middle
      for (let i = startPIndex; i < endPIndex + 1; i++) {
        for (let j = 0; j < newParas[i].length; j++) {
          if (i == startPIndex && j < startSpanIndex + 1) continue;
          if (i == endPIndex && j > endSpanIndex - 1) continue;
          changeRunIndexes.push([i, j]);
        }
      }
    }
    // check if all the runs are already highlighted
    let allHighlighted = true;
    for (let [i, j] of changeRunIndexes) {
      if (!newParas[i][j][$currentTool]) {
        if ($currentTool == 'eraser') {
          newParas[i][j].highlight = false;
          newParas[i][j].underline = false;
        } else {
          allHighlighted = false;
          break;
        }
      }
    }
    if ($currentTool != 'eraser') {
      for (let [i, j] of changeRunIndexes) {
        // if all highlighted, unhighlight
        if (allHighlighted) {
          newParas[i][j][$currentTool] = false;
        }
        // else highlight
        else {
          newParas[i][j][$currentTool] = true;
        }
      }
    }

    selection.empty();
    // combine simialar runs
    console.log(newParas);
    newParas = newParas.map(function (para) {
      let newPara: IPara = [];
      if (para.length == 0) return [];
      let prevRun = { ...para[0] };
      for (let i = 1; i < para.length; i++) {
        let run = para[i];
        if (run.text.length == 0) {
          continue;
        }
        if (
          run.highlight == prevRun.highlight &&
          run.underline == prevRun.underline
        ) {
          prevRun.text = prevRun.text.concat(run.text);
        } else {
          newPara.push({ ...prevRun });
          prevRun = { ...run };
        }
      }
      newPara.push({ ...prevRun });

      return newPara;
    });
    $card.paras = newParas;
  }

  onMount(function () {
    document.addEventListener('mouseup', selectionDone);
  });
</script>

<article bind:this={parentElement}>
  {#each $card.paras as para}
    <Para runs={para} />
  {/each}
</article>
