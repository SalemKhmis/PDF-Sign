<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { pannable } from "./utils/pannable.js";
  import { readAsArrayBuffer } from "./utils/asyncReader.js";

  export let originWidth;
  export let originHeight;
  export let width;
  export let x;
  export let y;
  export let pageScale = 1;
  export let path;
  export let strokeColor = "black"; // Default stroke color
  export let strokeWidth = 5; // Default stroke width
  export let text = "5dS6dsMLc56a6kM7";

  const dispatch = createEventDispatcher();
  let startX;
  let startY;
  let svg;
  let operation = "";
  let dx = 0;
  let dy = 0;
  let dw = 0;
  let direction = "";
  const ratio = originWidth / originHeight;

  async function render() {
    svg.setAttribute("viewBox", `0 0 ${originWidth} ${originHeight}`);
  }

  function handlePanMove(event) {
    const _dx = (event.detail.x - startX) / pageScale;
    const _dy = (event.detail.y - startY) / pageScale;
    if (operation === "move") {
      dx = _dx;
      dy = _dy;
    } else if (operation === "scale") {
      if (direction === "left-top") {
        let d = Infinity;
        d = Math.min(_dx, _dy * ratio);
        dx = d;
        dw = -d;
        dy = d / ratio;
      }
      if (direction === "right-bottom") {
        let d = -Infinity;
        d = Math.max(_dx, _dy * ratio);
        dw = d;
      }
    }
  }

  function handlePanEnd(event) {
    if (operation === "move") {
      dispatch("update", {
        x: x + dx,
        y: y + dy
      });
      dx = 0;
      dy = 0;
    } else if (operation === "scale") {
      dispatch("update", {
        x: x + dx,
        y: y + dy,
        width: width + dw,
        scale: (width + dw) / originWidth
      });
      dx = 0;
      dy = 0;
      dw = 0;
      direction = "";
    }
    operation = "";
  }

  function handlePanStart(event) {
    startX = event.detail.x;
    startY = event.detail.y;
    if (event.detail.target === event.currentTarget) {
      return (operation = "move");
    }
    operation = "scale";
    direction = event.detail.target.dataset.direction;
  }

  function onDelete() {
    dispatch("delete");
  }

  onMount(render);
</script>

<style>
  .operation {
    background-color: rgba(0, 0, 0, 0.1);
  }
  @media (max-width: 768px) {
  .resize-corner {
        width: 1rem!important;
        height: 1rem!important;
        background-color: #3CA939!important;
    }
    .delete-icon{
      width: 8%!important;
      height: auto!important;
    }
  }

  .css-12sxlyp {
  background: none; /* Ensure no background */
  border: none;
  font-size: 11px;
  font-weight: 500;
  line-height: 11px;
  min-width: 170px;
  padding-inline-start: 25px;
  position: relative;
  text-align: start;
  height: 54px;
}

.css-12sxlyp::before {
  border-bottom: 2px solid rgb(0, 92, 185);
  border-inline-start: 2px solid rgb(0, 92, 185);
  border-start-start-radius: 5px;
  border-end-start-radius: 5px;
  border-top: 2px solid rgb(0, 92, 185);
  content: "";
  display: block;
  height: 100%;
  inset-inline-start: 0px;
  position: absolute;
  width: 20px;
  top: 7px;
  background: none; /* Transparent */
}

.css-fv3lde {
  align-items: center;
  display: flex;
  padding: 10px;
  margin-left: -18px;
  font-size: 26px;
  padding-top: 5px;
}

.css-1j983t3 {
  position: absolute;
  white-space: nowrap;
  font-size: 11px;
  bottom: 0px;
  left: 25px;
}
</style>

<svelte:options immutable={true} />
<div
  class=" left-0 top-0 select-none"
  style="width: 200px; height: 66px; transform: translate({x + dx}px, {y + dy}px);position: relative;">
  <div
    use:pannable
    on:panstart={handlePanStart}
    on:panmove={handlePanMove}
    on:panend={handlePanEnd}
    class="absolute w-full h-full cursor-grab border border-gray-400 border-dashed" style="z-index: 999;"
    class:cursor-grabbing={operation === 'move'}
    class:operation>
    <div
      data-direction="left-top"
      class="absolute resize-corner left-0 top-0 w-10 h-10 bg-green-400 rounded-full cursor-nwse-resize transform -translate-x-1/2 -translate-y-1/2 md:scale-25" />
    <div
      data-direction="right-bottom"
      class="absolute resize-corner right-0 bottom-0 w-10 h-10 bg-green-400 rounded-full cursor-nwse-resize transform translate-x-1/2 translate-y-1/2 md:scale-25" />
  </div>
  <div
    on:click={onDelete}
    class="absolute left-0 top-0 right-0 w-12 h-12 m-auto rounded-full bg-white cursor-pointer transform -translate-y-1/2 md:scale-25 delete-icon">
    <img class="w-full h-full" src="/delete.svg" alt="delete object" />
  </div>
  <div class="custom_initial">
      <div class="css-12sxlyp ">
        <span>  Initial :</span>
        <div class="css-fv3lde">
      <svg bind:this={svg} width="100%" height="100%">
        <path
          stroke-width={strokeWidth} 
          stroke-linejoin="round"
          stroke-linecap="round"
          stroke={strokeColor}
          fill="none"
          d={path} />
      </svg>
      <!-- Text element added below the signature -->
      <div class="css-1j983t3">ds45sdf42sdf42sd</div>
    </div>
    
  </div>
</div>
</div>
