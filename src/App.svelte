<script>
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import Tailwind from "./Tailwind.svelte";
  import PDFPage from "./PDFPage.svelte";
  import Image from "./Image.svelte";
  import Text from "./Text.svelte";
  import Drawing from "./Drawing.svelte";
  import DrawingCanvas from "./DrawingCanvas.svelte";
  import prepareAssets, { fetchFont } from "./utils/prepareAssets.js";
  import LeftMenu from "./LeftMenu.svelte"; 
  import RightMenu from "./RightMenu.svelte"; 
  import Login from './Login.svelte';
  import Register from './Register.svelte';
  import ProfilePage from './Profile.svelte';
  import html2canvas from "html2canvas";


  import {
    readAsArrayBuffer,
    readAsImage,
    readAsPDF,
    readAsDataURL
  } from "./utils/asyncReader.js";
  import { ggID } from "./utils/helper.js";
  import { save } from "./utils/PDF.js";
  
  const genID = ggID();
  let pdfFile;
  let pdfName = "";
  let pages = [];
  let pagesScale = [];
  let allObjects = [];
  let currentFont = "Times-Roman";
  let focusId = null;
  let selectedPageIndex = -1;
  let saving = false;
  let addingDrawing = false;
  let logoutMenu= false;

  // for test purpose
  onMount(async () => {
    try {
      const res = await fetch("/test.pdf");
      const pdfBlob = await res.blob();
      await addPDF(pdfBlob);
      selectedPageIndex = 0;
      setTimeout(() => {
        fetchFont(currentFont);
        prepareAssets();
      }, 5000);
    } catch (e) {
      console.log(e);
    }
  });
  function handleInitialsClick() {
    console.log("Initials div clicked");
    onAddDrawing();
  }
  function handleSignlick() {
    console.log("sign div clicked");
    const htmlElement = document.querySelector(".sign-block");
    addHtmlBlockAsImage(htmlElement);
  }
  async function onUploadPDF(e) {
    const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
    const file = files[0];
    if (!file || file.type !== "application/pdf") return;
    selectedPageIndex = -1;
    try {
      await addPDF(file);
      selectedPageIndex = 0;
    } catch (e) {
      console.log(e);
    }
  }
  async function addPDF(file) {
    try {
      const pdf = await readAsPDF(file);
      pdfName = file.name;
      pdfFile = file;
      const numPages = pdf.numPages;
      pages = Array(numPages)
        .fill()
        .map((_, i) => pdf.getPage(i + 1));
      allObjects = pages.map(() => []);
      pagesScale = Array(numPages).fill(1);
    } catch (e) {
      console.log("Failed to add pdf.");
      throw e;
    }
  }
  async function onUploadImage(e) {
    const file = e.target.files[0];
    if (file && selectedPageIndex >= 0) {
      addImage(file);
    }
    e.target.value = null;
  }
  async function addImage(file) {
    try {
      // get dataURL to prevent canvas from tainted
      const url = await readAsDataURL(file);
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
  function onAddTextField() {
    if (selectedPageIndex >= 0) {
      addTextField();
    }
  }
  function addTextField(text = "New Text Field") {
    const id = genID();
    fetchFont(currentFont);
    const object = {
      id,
      text,
      type: "text",
      size: 16,
      width: 0, // recalculate after editing
      lineHeight: 1.4,
      fontFamily: currentFont,
      x: 0,
      y: 0
    };
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex === selectedPageIndex ? [...objects, object] : objects
    );
  }
  function addTextEmail(text = "salemkhmis003@gmail.com") {
    const id = genID();
    fetchFont(currentFont);
    const object = {
      id,
      text,
      type: "text",
      size: 16,
      width: 0, // recalculate after editing
      lineHeight: 1.4,
      fontFamily: currentFont,
      x: 0,
      y: 0
    };
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex === selectedPageIndex ? [...objects, object] : objects
    );
  }
  function addTextName(text = "Salem Khmis") {
    const id = genID();
    fetchFont(currentFont);
    const object = {
      id,
      text,
      type: "text",
      size: 16,
      width: 0, // recalculate after editing
      lineHeight: 1.4,
      fontFamily: currentFont,
      x: 0,
      y: 0
    };
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex === selectedPageIndex ? [...objects, object] : objects
    );
  }
  function onAddDrawing() {
    if (selectedPageIndex >= 0) {
      addingDrawing = true;
    }
  }
  function addDrawing(originWidth, originHeight, path, scale = 1) {
  const id = genID();
  const object = {
    id,
    path,
    type: "drawing",
    x: 0,
    y: 0,
    originWidth,
    originHeight,
    width: originWidth * scale,
    scale,
    text: localStorage.getItem("codeSign")
  };
  allObjects = allObjects.map((objects, pIndex) =>
    pIndex === selectedPageIndex ? [...objects, object] : objects
  );
}
  function selectFontFamily(event) {
    const name = event.detail.name;
    fetchFont(name);
    currentFont = name;
  }
  function selectPage(index) {
    selectedPageIndex = index;
  }
  function updateObject(objectId, payload) {
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex == selectedPageIndex
        ? objects.map(object =>
            object.id === objectId ? { ...object, ...payload } : object
          )
        : objects
    );
  }
  function deleteObject(objectId) {
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex == selectedPageIndex
        ? objects.filter(object => object.id !== objectId)
        : objects
    );
  }
  function onMeasure(scale, i) {
    pagesScale[i] = scale;
  }
  // FIXME: Should wait all objects finish their async work
  async function savePDF() {
    if (!pdfFile || saving || !pages.length) return;
    saving = true;
    try {
      await save(pdfFile, allObjects, pdfName, pagesScale);
    } catch (e) {
      console.log(e);
    } finally {
      saving = false;
    }
  }
  let authenticated = false;
  let showRegister = false;
  let profile = false;
  

  function handleLogin(event) {
    authenticated = true;
  }

  function handleGoToRegister() {
    showRegister = true;
  }
  function handleGoToProfile() {
    profile = true;
  }

  function handleGoToLogin() {
    showRegister = false;
  }
  function handleGoToHome() {
    profile = false;
    logoutMenu = false;
  }

  async function addHtmlBlockAsImage(htmlElement) {
  try {
    
    // Render HTML to canvas
    const canvas = await html2canvas(htmlElement);
    
    // Convert canvas to data URL (image)
    const imgUrl = canvas.toDataURL("image/png");

    // Create a new image object
    const img = await readAsImage(imgUrl);
    const id = genID();
    const { width, height } = img;

    // Create the object for the PDF
    const object = {
      id,
      type: "image",
      width,
      height,
      x: 0,
      y: 0,
      payload: img,
      file: imgUrl // Optional: If you want to store the image data
    };

    // Add the image object to the current page's objects
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex === selectedPageIndex ? [...objects, object] : objects
    );
  } catch (e) {
    console.log("Failed to add HTML block as image.", e);
  }
}
</script>

<svelte:window
  on:dragenter|preventDefault
  on:dragover|preventDefault
  on:drop|preventDefault={onUploadPDF} />
<Tailwind />
{#if authenticated}

  {#if profile} 


  <main class="flex flex-row min-h-screen bg-gray-100">
    <LeftMenu class="flex-shrink-0" on:initialsClicked={handleInitialsClick} on:signClicked={handleSignlick} 
    on:emailClicked={()=>  { if(selectedPageIndex >= 0){ addTextEmail(); }}} 
    on:nameClicked={() => {if (selectedPageIndex >= 0) {addTextName(); }}} />
    <ProfilePage on:goToHome={handleGoToHome}/>
  </main>
  {:else}
  <main class="flex flex-row min-h-screen bg-gray-100">
    <LeftMenu class="flex-shrink-0" on:initialsClicked={handleInitialsClick} on:signClicked={handleSignlick}
      on:emailClicked={()=>  { if(selectedPageIndex >= 0){ addTextEmail(); }}} 
      on:nameClicked={() => {if (selectedPageIndex >= 0) {
      addTextName();
    }}}/>
    <div
      class="absolute z-10 top-0 left-0 right-0 h-12 flex justify-center items-center tab-menu" style="border-style: hidden;margin-top: 25px;text-align-last: center;  width: 80%;justify-self: right;
    float: right;">

      <div class="justify-center mr-3 w-full max-w-xs  block_name">
        <input
          placeholder="File Name"
          type="text"
          class="flex-grow bg-transparent"
          bind:value={pdfName} />
      </div>
      <div class="block_top2  h-12 flex justify-center items-center tab-menu">
      <button
        on:click={savePDF}
        class="w-20 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3
        md:px-4 mr-3 md:mr-4 rounded" style="background: #3ba83a!important;"
        class:cursor-not-allowed={pages.length === 0 || saving || !pdfFile}
        class:bg-blue-700={pages.length === 0 || saving || !pdfFile}>
        {saving ? 'Saving' : 'Save'}
      </button>
      <div class="flex block-top" style="background: white;
      border-radius: 29px;">
      <!-- <div
      class="relative mr-3 flex rounded-sm overflow-hidden
      md:mr-4">
      <label
        class="flex items-center justify-center m-3 hover:bg-gray-500
        cursor-pointer"
        for="image"
        class:cursor-not-allowed={selectedPageIndex < 0}
        class:bg-gray-500={selectedPageIndex < 0}>
        <img src="image.svg" alt="An icon for adding images" />
      </label>
      <label
        class="flex items-center justify-center m-3 hover:bg-gray-500
        cursor-pointer"
        for="text"
        class:cursor-not-allowed={selectedPageIndex < 0}
        class:bg-gray-500={selectedPageIndex < 0}
        on:click={onAddTextField}>
        <img src="notes.svg" alt="An icon for adding text" />
      </label>
      <label
        class="flex items-center justify-center m-3 hover:bg-gray-500
        cursor-pointer"
        on:click={onAddDrawing}
        class:cursor-not-allowed={selectedPageIndex < 0}
        class:bg-gray-500={selectedPageIndex < 0}>
        <img src="gesture.svg" alt="An icon for adding drawing" />
      </label>
    </div> -->

        <div class="m-3"><svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M15.0013 0C15.5536 0 16.0013 0.44772 16.0013 1V6C16.0013 6.55228 15.5536 7 15.0013 7H10.0013C9.44904 7 9.00134 6.55228 9.00134 6C9.00134 5.44772 9.44904 5 10.0013 5H12.4751C10.622 2.92318 7.50684 2.35728 5.00133 3.80385C2.13158 5.4607 1.14833 9.1302 2.80518 12C4.46204 14.8698 8.13154 15.853 11.0013 14.1962C11.4796 13.92 12.0912 14.0839 12.3673 14.5622C12.6435 15.0405 12.4796 15.6521 12.0013 15.9282C8.17504 18.1373 3.28227 16.8263 1.07313 13C-1.13601 9.1737 0.174993 4.28093 4.00133 2.07179C7.35784 0.13391 11.5349 0.90478 14.0013 3.70614V1C14.0013 0.44772 14.449 0 15.0013 0Z" fill="#BCBCBC"/>
          </svg>
          </div>
        <div class="m-3">
          <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1 0C1.55228 0 2 0.44772 2 1V3.70615C4.46639 0.90478 8.6435 0.13391 12 2.0718C15.8263 4.28094 17.1373 9.1737 14.9282 13C12.7191 16.8263 7.8263 18.1373 4 15.9282C3.52171 15.6521 3.35783 15.0405 3.63397 14.5622C3.91012 14.0839 4.52171 13.92 5 14.1962C7.8698 15.853 11.5393 14.8698 13.1962 12C14.853 9.1302 13.8698 5.4607 11 3.80385C8.4945 2.35729 5.37931 2.92318 3.52624 5H6C6.5523 5 7 5.44772 7 6C7 6.55228 6.5523 7 6 7H1C0.44772 7 0 6.55228 0 6V1C0 0.44772 0.44772 0 1 0Z" fill="#3CA939"/>
            </svg>
            
        </div>
        <div class="m-3">
          100%
        </div>

        <div class="m-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3 2C2.44772 2 2 2.44772 2 3V15.4948C2 15.9443 2.54689 16.1655 2.85939 15.8424L3.57817 16.5377L2.85939 15.8424L5.69166 12.9143C6.25687 12.3299 7.035 12 7.848 12H15C15.5523 12 16 11.5523 16 11V3C16 2.44772 15.5523 2 15 2H3ZM0 3C0 1.34315 1.34315 0 3 0H15C16.6569 0 18 1.34315 18 3V11C18 12.6569 16.6569 14 15 14H7.848C7.577 14 7.3176 14.11 7.1292 14.3048L4.29694 17.2329C2.73447 18.8483 0 17.7422 0 15.4948V3ZM4 5C4 4.44772 4.44772 4 5 4H9C9.5523 4 10 4.44772 10 5C10 5.55228 9.5523 6 9 6H5C4.44772 6 4 5.55228 4 5ZM4 8C4 7.4477 4.44772 7 5 7H7C7.5523 7 8 7.4477 8 8C8 8.5523 7.5523 9 7 9H5C4.44772 9 4 8.5523 4 8Z" fill="#BCBCBC"/>
            </svg>
        </div>
      </div>
      <div class="flex top_right">
        <div class="mr-8">
          <svg width="26" height="29" viewBox="0 0 26 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.50113 3.05499C6.86554 1.36484 9.201 0 13 0C16.799 0 19.1344 1.36484 20.4988 3.05499C21.8094 4.67848 22.0756 6.41858 22.1312 6.97923C22.136 7.02642 22.139 7.06041 22.1416 7.0878C22.1456 7.1318 22.1482 7.15871 22.1529 7.19586L23.3452 16.6212C23.3701 16.8178 23.4348 17.0072 23.5355 17.1777L25.7982 21.0108C26.0628 21.459 26.0674 22.0152 25.8106 22.4679C25.5537 22.9204 25.0745 23.2 24.5555 23.2H20.0778C19.4086 26.5092 16.4941 29 13 29C9.50594 29 6.59141 26.5092 5.92225 23.2H1.44444C0.92547 23.2 0.446377 22.9204 0.189439 22.4679C-0.0674987 22.0152 -0.0627754 21.459 0.201803 21.0108L2.46452 17.1777C2.56517 17.0072 2.62994 16.8178 2.65482 16.6212L3.8471 7.19586C3.8518 7.15871 3.8543 7.13178 3.85838 7.08777C3.86093 7.0604 3.86409 7.02641 3.86877 6.97923C3.92441 6.41858 4.19056 4.67848 5.50113 3.05499ZM8.91324 23.2C9.50811 24.8895 11.1133 26.1 13 26.1C14.8867 26.1 16.4919 24.8895 17.0868 23.2H8.91324Z" fill="#D0D0D0"/>
            </svg>
        </div>
        <div class="flex pointer">
          <div class="mr-2" on:click={() => logoutMenu = !logoutMenu}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="23.5418" cy="23.5418" r="23.5418" fill="#FFC145"/>
              <mask id="mask0_66_149" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
              <circle cx="23.5418" cy="23.5418" r="23.5418" fill="#FFC145"/>
              </mask>
              <g mask="url(#mask0_66_149)">
              <mask id="mask1_66_149" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
              <circle cx="23.5418" cy="23.5418" r="23.5418" fill="#FFC145"/>
              </mask>
              <g mask="url(#mask1_66_149)">
              <path d="M38.0902 49.8882V45.0791C38.0902 42.5282 37.3238 40.0818 35.9596 38.278C34.5954 36.4743 32.7452 35.4609 30.8159 35.4609H16.2674C14.3382 35.4609 12.4879 36.4743 11.1237 38.278C9.75956 40.0818 8.99316 42.5282 8.99316 45.0791V49.8882" fill="#197BBD"/>
              <path d="M23.5396 28.1857C27.5571 28.1857 30.8139 24.9289 30.8139 20.9115C30.8139 16.894 27.5571 13.6372 23.5396 13.6372C19.5222 13.6372 16.2654 16.894 16.2654 20.9115C16.2654 24.9289 19.5222 28.1857 23.5396 28.1857Z" fill="white"/>
              </g>
              </g>
              </svg>
          </div>
          <div on:click={() => logoutMenu = !logoutMenu}>
            <div style="font-weight: bold;font-size: 14px;">Andrew</div>
            <p style="color: #AEAEAE;font-size: 14px;">ESign Manager</p>
          </div>
          {#if logoutMenu == true}
          <div class="right-menu">
            <ul>
              <li on:click={() => profile = true} style="    margin-bottom: 6px;">Profile</li>
              <li  style="border-top: solid 1px #38a53d63;     margin-bottom: 6px;" >My files</li>
              <li on:click={() => {authenticated = false; logoutMenu = false; showRegister = false}} style="border-top: solid 1px #38a53d63;" >Logout</li>
            </ul>
          </div>
          {/if}
        </div>
      </div>
      </div>
      <div>

      </div>
    </div>
    {#if addingDrawing}
      <div
        transition:fly={{ y: -200, duration: 500 }}
        class="fixed top-0 left-0 right-0 border-b border-gray-300 bg-white modal-sign
        shadow-lg"
        style="z-index: 99;">
        <DrawingCanvas
          on:finish={e => {
            const { originWidth, originHeight, path } = e.detail;
            let scale = 1;
            if (originWidth > 500) {
              scale = 500 / originWidth;
            }
            addDrawing(originWidth, originHeight, path, scale);
            addingDrawing = false;
          }}
          on:cancel={() => (addingDrawing = false)} />
      </div>
    {/if}
    {#if pages.length>1}
      <!-- <div class="flex justify-center px-5 w-full md:hidden">
        <img src="/edit.svg" class="mr-2" alt="a pen, edit pdf name" />
        <input
          placeholder="Rename your PDF here"
          type="text"
          class="flex-grow bg-transparent"
          bind:value={pdfName} />
      </div> -->
      <div class="w-full pages" style="    width: 80%;    margin-left: 20%;
    float: right;">
        {#each pages as page, pIndex (page)}
          <div
            class="p-5 w-full flex flex-col items-center overflow-hidden"
            on:mousedown={() => selectPage(pIndex)}
            on:touchstart={() => selectPage(pIndex)}>
            <div
              class="relative shadow-lg"
              class:shadow-outline={pIndex === selectedPageIndex}>
              <PDFPage
                on:measure={e => onMeasure(e.detail.scale, pIndex)}
                {page} />
              <div
                class="absolute top-0 left-0 transform origin-top-left"
                style="transform: scale({pagesScale[pIndex]}); touch-action: none;">

                {#each allObjects[pIndex] as object (object.id)}
                  {#if object.type === 'image'}
                    <Image
                      on:update={e => updateObject(object.id, e.detail)}
                      on:delete={() => deleteObject(object.id)}
                      file={object.file}
                      payload={object.payload}
                      x={object.x}
                      y={object.y}
                      width={object.width}
                      height={object.height}
                      pageScale={pagesScale[pIndex]} />
                  {:else if object.type === 'text'}
                    <Text
                      on:update={e => updateObject(object.id, e.detail)}
                      on:delete={() => deleteObject(object.id)}
                      on:selectFont={selectFontFamily}
                      text={object.text}
                      x={object.x}
                      y={object.y}
                      size={object.size}
                      lineHeight={object.lineHeight}
                      fontFamily={object.fontFamily}
                      pageScale={pagesScale[pIndex]} />
                  {:else if object.type === 'drawing'}
                    <Drawing
                      on:update={e => updateObject(object.id, e.detail)}
                      on:delete={() => deleteObject(object.id)}
                      path={object.path}
                      x={object.x}
                      y={object.y}
                      width={object.width}
                      originWidth={object.originWidth}
                      originHeight={object.originHeight}
                      pageScale={pagesScale[pIndex]}
                      text={object.text} />
                  {/if}
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
    <div  class="w-full justify-center items-center choose_text" style="    width: 80%;float: right;    margin-left: 20%;" for="pdf">
      <div class="flex-grow flex justify-center items-center">
        <input
        type="file"
        name="pdf"
        id="pdf"
        on:change={onUploadPDF}
        class="hidden" />
      <input
        type="file"
        id="image"
        name="image"
        class="hidden"
        on:change={onUploadImage} />
      <label
        class="font-bold text-3xl" style="cursor: pointer;"
        for="pdf">
        Choose File
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

    </div>

    {/if}
    <RightMenu class="flex-shrink-0" />
    <div class="sign-block"  style="height: 64px;width: 200px;position: absolute;
    top: -70px;">
      <div class="css-12sxlyp ">
        <span>Doc signed by:</span>
        <div class="css-fv3lde">
          <span class="css-po3aid" style="font-family: Mistral;">Salem Khmis</span>
          <div class="css-1j983t3">ds45sdf42sdf42sd</div>
        </div>
        
      </div>
    </div>
  </main>
  {/if}
{:else if showRegister}
  <Register on:register={handleLogin} on:goToLogin={handleGoToLogin} />
{:else}
  <Login on:login={handleLogin} on:goToRegister={handleGoToRegister} />
{/if}

<style>
  .modal-sign{
    height: 65%;
    /* z-index: 99;
    width: 60%;
    place-self: center;
    border-radius: 15px; */
  }
  .choose_text{
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='black' stroke-width='2' stroke-dasharray='20%2c 15' stroke-dashoffset='16' stroke-linecap='square'/%3e%3c/svg%3e");
    margin: 8% 5% 1% 8%;
    color: #878A93;
    cursor: pointer;
    align-content: center;
    text-align: -webkit-center;
  }
  .block_name{
    border-left: solid 1px #84C988;
    padding-left: 15px;
    font-size: 26px;
  }
  .top_right{
    position: absolute;
    right: 70px;
    align-items: center;
  }
  .right-menu{
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    width: 170px;
    position: absolute;
    top: 119%;
    color: #878a93;
  }
  .pointer{
    cursor: pointer;
  }

  .css-12sxlyp {
    background: none;
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
  }
  .css-fv3lde {
    -webkit-box-align: center;
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
  .css-1achfvd:nth-of-type(2n+1) {
    background-color: rgb(249, 249, 249);
}
.resize-corner.svelte-y5b9ho {
      width: 1rem!important;
      height: 1rem!important;
      background-color: #3CA939!important;
  }
@media (max-width: 768px) {
  .top_right{
    display: none;
  }
  .choose_text, .pages{
    margin-top: 108px;
  }
}
@media (max-width: 600px) {
    .tab-menu{
      justify-content: right!important;
    }
    .block-top{
      font-size: 11px;
    }
    .block-top svg{
      width: 10px!important;
    }
    .block_name{
      margin-top: 70px;
      font-size: 14px;
    }
    .block_top2{
      position: absolute;
    }

  }
</style>
