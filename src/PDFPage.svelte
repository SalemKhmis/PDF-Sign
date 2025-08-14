<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  export let page;
  export let scale = 1; // Add scale prop with default value 1
  
  const dispatch = createEventDispatcher();
  let canvas;
  let width;
  let height;
  
  function measure() {
    dispatch("measure", {
      scale: canvas.clientWidth / width
    });
  }
  
  async function render() {
    const _page = await page;
    const context = canvas.getContext("2d");
    const viewport = _page.getViewport({ scale, rotation: 0 }); // Use the scale prop
    width = viewport.width;
    height = viewport.height;
    
    await _page.render({
      canvasContext: context,
      viewport
    }).promise;
    
    measure();
    window.addEventListener("resize", measure);
  }
  
  onMount(render);
  onDestroy(() => {
    window.removeEventListener("resize", measure);
  });
</script>

<div class="thumbnail-canvas">
  <canvas
    bind:this={canvas}
    class="max-w-full"
    style="width: {width}px;"
    {width}
    {height} />
</div>