<script>
  import PDFPage from './PDFPage.svelte';
  import { createEventDispatcher } from 'svelte';

  export let pages = [];
  export let selectedPageIndex = 0;
  
  const dispatch = createEventDispatcher();
  const thumbnailScale = 0.2;
  
  function selectPage(index) {
    selectedPageIndex = index;
    dispatch('pageSelected', { index });
  }

  function deletePage(index, event) {
    event.stopPropagation(); // Prevent triggering the page selection
    dispatch('deletePage', { index });
  }
  function resetPage(index, event) {
    event.stopPropagation();
    dispatch('resetPage', { index });
  }
</script>

<style>
  .right-menu {
    padding: 20px;
    border-right: solid 1px #cbd5e0;
    background: white;
    margin-top: 6%;
    border-top-left-radius: 30px;
    width: 25%;
    overflow-y: auto;
    max-height: 90vh;
  }
  .thumbnail-container {
    margin: 10px 0;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    background: #C4C4C4;
    color: white;
    justify-self: center;
    font-weight: bold;
  }
  .thumbnail-container.selected {
    border-color: #38a53d;
    box-shadow: 0 0 10px rgba(56, 165, 61, 0.3);
    background: #38a53d;
  }
  .thumbnail-wrapper {
    width: 100%;
    overflow: hidden;
  }
  .title {
    font-size: 24px;
    color: #7D7E7E;
    margin-bottom: 15px;
  }
  .separator {
    border: solid 1.5px #E9E9E9;
    margin: 15px 0;
  }

  .page-item {
    position: relative;
    margin-bottom: 10px;
  }
  .delete-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .page-item:hover .delete-btn {
    opacity: 1;
  }
</style>

<div class="right-menu">
  <div class="title">Document Pages</div>
  <div class="separator"></div>
  
  {#each pages as page, index}
    <div 
      class="page-item thumbnail-container {selectedPageIndex === index ? 'selected' : ''}"
      on:click={() => selectPage(index)}
    >

      
      <div class="thumbnail-wrapper">
        <PDFPage 
          page={page} 
          scale={thumbnailScale}
          on:measure={() => {}}
        />
      </div>
      <div class="text-center mt-1 text-sm" style="height: 35px;align-content: center;">Page {index + 1} 
        <button style="float: right;" on:click|stopPropagation={e => deletePage(index, e)}>
          <svg class="w-6 h-6 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M20 10H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8ZM9 13v-1h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1Z" clip-rule="evenodd"/>
            <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2Z"/>
          </svg>

        </button>
        <button style="float: right;margin-right: 4px;" on:click|stopPropagation={e => resetPage(index, e)}>

          <svg class="w-6 h-6 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M9.484 6.743c.41-.368.443-1 .077-1.41a.99.99 0 0 0-1.405-.078L2.67 10.203l-.007.006A2.048 2.048 0 0 0 2 11.721a2.058 2.058 0 0 0 .662 1.51l5.584 5.09a.99.99 0 0 0 1.405-.07 1.003 1.003 0 0 0-.07-1.412l-5.577-5.082a.05.05 0 0 1 0-.072l5.48-4.942Zm6.543 9.199v-.42a4.168 4.168 0 0 1 2.715 2.415c.154.382.44.695.806.88a1.683 1.683 0 0 0 2.167-.571c.214-.322.312-.707.279-1.092V15.88c0-3.77-2.526-7.039-5.966-7.573V7.57a1.957 1.957 0 0 0-.994-1.838 1.931 1.931 0 0 0-2.153.184L7.8 10.164a.753.753 0 0 0-.012.011l-.011.01a2.098 2.098 0 0 0-.703 1.57 2.108 2.108 0 0 0 .726 1.59l5.08 4.25a1.933 1.933 0 0 0 2.929-.614c.167-.32.242-.68.218-1.04Z" clip-rule="evenodd"/>
          </svg>
          

        </button>
        
      </div>
    </div>
  {/each}
</div>