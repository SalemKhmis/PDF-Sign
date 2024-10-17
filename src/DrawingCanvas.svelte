<script>
  import { createEventDispatcher } from "svelte";
  import { pannable } from "./utils/pannable.js";
  
  const dispatch = createEventDispatcher();
  let canvas;
  let x = 0;
  let y = 0;
  let path = "";
  let minX = Infinity;
  let maxX = 0;
  let minY = Infinity;
  let maxY = 0;
  let paths = [];
  let drawing = false;
  let strokeColor = "green"; // Default stroke color
  let strokeWidth = 2; // Default stroke width
  
  // Utility function to get the correct coordinates
  function getRelativePosition(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.detail.x - rect.left,
      y: event.detail.y - rect.top
    };
  }

  function handlePanStart(event) {
    if (event.detail.target !== canvas) return (drawing = false);
    drawing = true;
    
    const pos = getRelativePosition(event, canvas);
    x = pos.x;
    y = pos.y;
    
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    
    paths.push(["M", x, y]);
    path += `M${x},${y}`;
  }

  function handlePanMove(event) {
    if (!drawing) return;
    
    const pos = getRelativePosition(event, canvas);
    x = pos.x;
    y = pos.y;
    
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    
    paths.push(["L", x, y]);
    path += `L${x},${y}`;
  }

  function handlePanEnd() {
    drawing = false;
  }

  function finish() {
    if (!paths.length) return;
    
    const dx = -(minX - 10);
    const dy = -(minY - 10);
    const width = maxX - minX + 20;
    const height = maxY - minY + 20;

    dispatch("finish", {
      originWidth: width,
      originHeight: height,
      path: paths.reduce((acc, cur) => {
        return acc + cur[0] + (cur[1] + dx) + "," + (cur[2] + dy);
      }, "")
    });
  }

  function cancel() {
    dispatch("cancel");
  }
  let view = 1;
  let uploadedImageUrl = null; // To store the uploaded image URL
  let selectedPageIndex = 0; // Assuming this is already defined in your project
  let allObjects = []; // Assuming this is already defined in your project

  async function onUploadImage(e) {
    const file = e.target.files[0];
    if (file && selectedPageIndex >= 0) {
      addImage(file);
    }
    e.target.value = null; // Reset the input field
  }

  async function addImage(file) {
    try {
      const url = await readAsDataURL(file); // Get the image URL as a dataURL
      uploadedImageUrl = url; // Store the image URL
      const img = await readAsImage(url);
      const id = genID();
      const { width, height } = img;
      const object = {
        id,
        type: "image",
        width,
        height,
        x: 0,
        y: 0,
        payload: img,
        file
      };
      allObjects = allObjects.map((objects, pIndex) =>
        pIndex === selectedPageIndex ? [...objects, object] : objects
      );
    } catch (e) {
      console.log(`Fail to add image.`, e);
    }
  }

  // Other functions like setStrokeWidth, setStrokeColor, and setView remain unchanged
  function setView(value) {
    view = value;
  }

  // Helper functions for image handling (assuming you already have them)
  async function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function readAsImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
</script>

<div class="header_modal">
  <div class="flex title">
    Custom Signature 
    <div class="icon-close pointer" on:click={cancel}>X</div>
  </div>
  <div class="flex"> 
    <div class="slide_text {view === 3 ? 'activeTitle' : ''}" on:click={() => setView(3)}>Type</div>
    <div class="slide_text {view === 2 ? 'activeTitle' : ''}" on:click={() => setView(2)}>Upload</div>
    <div class="slide_text {view === 1 ? 'activeTitle' : ''}" on:click={() => setView(1)}>Draw</div>
  </div>
</div>

{#if view === 1}
<div class="signature-box">
  <div class="controls">
    <!-- Stroke size selection -->
    <div class="pen-size">
      <button class:active={strokeWidth === 2} on:click={() => setStrokeWidth(2)} class="pen-size-btn" style="width: 12px;height: 12px;" ></button>
      <button class:active={strokeWidth === 4} on:click={() => setStrokeWidth(4)} class="pen-size-btn" style="width: 16px;height: 16px;"></button>
      <button class:active={strokeWidth === 6} on:click={() => setStrokeWidth(6)} class="pen-size-btn" style="width: 20px;height: 20px;"></button>
    </div>
    
    <!-- Color selection -->
    <div class="color-selection">
      <button class:active={strokeColor === 'green'} on:click={() => setStrokeColor('green')} class="color-btn green"></button>
      <button class:active={strokeColor === 'black'} on:click={() => setStrokeColor('black')} class="color-btn black"></button>
      <button class:active={strokeColor === 'red'} on:click={() => setStrokeColor('red')} class="color-btn red"></button>
    </div>
  </div>
  <div bind:this={canvas}
    use:pannable
    on:panstart={handlePanStart}
    on:panmove={handlePanMove}
    on:panend={handlePanEnd}
    class="relative w-full h-full select-none">
  
    <svg class="w-full h-full pointer-events-none">
      <path
        stroke-width={strokeWidth}
        stroke-linejoin="round"
        stroke-linecap="round"
        d={path}
        stroke={strokeColor}
        fill="none" />
    </svg>
  </div>
  

<div class="flex"> 
  <button on:click={finish} class="done-btn">Choose Signature</button>
    <div class="actions">
      <button on:click={cancel} class="cancel-btn">Cancel</button>
    </div>
  </div>
</div>
{:else if view === 2}
<div >
  {#if !uploadedImageUrl}
  <div class="flex-grow flex justify-center items-center view2">
    <input
      type="file"
      name="pdf"
      id="pdf"
      on:change={onUploadImage}
      class="hidden" />
    <label
      class="font-bold text-3xl" style="cursor: pointer;"
      for="pdf">
      Upload Signature
      <br>
      <div>
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M31.6667 21V42" stroke="#878A93" stroke-width="3" stroke-linecap="round"/>
          <path d="M42 31.6665L21 31.6665" stroke="#878A93" stroke-width="3" stroke-linecap="round"/>
          <circle cx="32" cy="32" r="31" stroke="#878A93" stroke-width="2"/>
        </svg>
      </div>
    </label>
  </div>

  {:else if uploadedImageUrl}
    <!-- Display the uploaded image if it exists -->
    <div class="uploaded-image-container">
      <img src={uploadedImageUrl} alt="Uploaded Signature" class="uploaded-image" />
    </div>
  {/if}
  <div class="flex"> 
    <button on:click={finish} class="done-btn">Choose Signature</button>
      <div class="actions">
        <button on:click={cancel} class="cancel-btn">Cancel</button>
      </div>
    </div>
</div>
{:else if view === 3}
<div class="signature-box">
  <div class="controls">
    <!-- Stroke size selection -->
    <div class="pen-size">
      Select Font
    </div>
    
    <!-- Color selection -->
    <div class="color-selection">
      <button class:active={strokeColor === 'green'} on:click={() => setStrokeColor('green')} class="color-btn green"></button>
      <button class:active={strokeColor === 'black'} on:click={() => setStrokeColor('black')} class="color-btn black"></button>
      <button class:active={strokeColor === 'red'} on:click={() => setStrokeColor('red')} class="color-btn red"></button>
    </div>
  </div>
  <div bind:this={canvas}
    use:pannable
    on:panstart={handlePanStart}
    on:panmove={handlePanMove}
    on:panend={handlePanEnd}
    class="relative w-full h-full select-none">
  
    <svg class="w-full h-full pointer-events-none">
      <path
        stroke-width={strokeWidth}
        stroke-linejoin="round"
        stroke-linecap="round"
        d={path}
        stroke={strokeColor}
        fill="none" />
    </svg>
  </div>
  

<div class="flex"> 
  <button on:click={finish} class="done-btn">Choose Signature</button>
    <div class="actions">
      <button on:click={cancel} class="cancel-btn">Cancel</button>
    </div>
  </div>
</div>
{/if}
<style>
  .uploaded-image-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  .uploaded-image {
    max-width: 100%;
    border: 1px solid #ddd;
    padding: 5px;
    height: 30vh;
  }
  .view2{
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='black' stroke-width='2' stroke-dasharray='20%2c 15' stroke-dashoffset='16' stroke-linecap='square'/%3e%3c/svg%3e");
    margin: 3% 5% 3% 5%;
    color: #878A93;
    cursor: pointer;
    height: 30vh;
    align-content: center;
    text-align: -webkit-center;
  }
  .activeTitle{
    color: #3CA939!important;
    border-bottom: solid;
  }
   .flex{
    display: flex;
  }
  .header_modal{
    padding: 2% 5%;
    padding-bottom: initial;
    border-bottom: solid 1px #DBDBDB;
  }
  .slide_text{
    padding-right: 3%;
    padding-bottom: 1%;
    font-size: 20px;
    color: #878A93;
    font-weight: 600;
    cursor: pointer;
  }
  .icon-close{
    position: absolute;
    right: 5%;
    color: #3CA939;
    font-weight: 500;
  }
  .title{
    color: #53555A;
    font-weight: bold;
    font-size: 24px;
    margin-bottom: 2%;
  }
  .signature-box {
    width: 90%;
    position: relative;
    margin: 5%;
    background: #FAFAFA;
    padding: 2%;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }

  .pen-size {
    display: flex;
    gap: 10px;
    border: solid 1px #3CA939;
    border-radius: 15px;
    align-items: center;
    padding: 4px 14px;
  }

  .pen-size-btn {
    padding: 5px;
    background-color: #f0f0f0;
    border-radius: 10px;
  }

  .pen-size-btn.active {
    background-color: #3CA939;
    color: white;
  }

  .color-selection {
    display: flex;
    gap: 10px;
  }

  .color-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid black;
    cursor: pointer;
  }

  .color-btn.green {
    background-color: #3CA939;
  }

  .color-btn.black {
    background-color: black;
  }

  .color-btn.red {
    background-color: red;
  }

  .color-btn.active {
    border: 2px solid blue;
  }

  .actions {
    position: absolute;
    right: 0;
  }

  .cancel-btn {
    background-color: #EFEFEF;
    color: #878A93;
    padding: 5px 15px;
    border-radius: 5px;
    margin-right: 10px;
    font-weight: 600;
    font-size: 18px;
  }

  .done-btn {
    background-color: #3CA939;
    color: white;
    padding: 5px 15px;
    border-radius: 5px;
    font-weight: 600;
    font-size: 18px;
  }
</style>
