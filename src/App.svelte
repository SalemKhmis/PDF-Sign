

<script>
  import { onMount } from "svelte";
  import { fly, scale } from "svelte/transition";
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
  import PricingModal from './PricingModal.svelte';
  import Payment from './Payment.svelte';
  import html2canvas from "html2canvas";
  import LogoMenu from "./components/LogoMenu.svelte";
  // import echo from "./echo.js"; 
  import {
    readAsArrayBuffer,
    readAsImage,
    readAsPDF,
    readAsDataURL
  } from "./utils/asyncReader.js";
  import { ggID } from "./utils/helper.js";
  import { save, getPDFAsBlob, saveAndGetPDF } from "./utils/PDF.js";
  	import { currentLang,translations, translateAll } from './stores/translation.js';
    
	let loadingTrans = false;
  let showModal = false;
let messages = "Déverrouiller l'accès\nPour des raisons de sécurité, votre accès est limité.\nDemandez un nouveau lien pour accéder aux documents."
// ip adress : 83.199.131.217  192.168.2.61 172.17.0.1
	const textsToTranslate = [
		'Choose File', 'Save', 'Profile', 'My files', 'File name', 'Logout', 'Pricing'
	];


	// Reactively watch language changes
  $: if ($currentLang) {
      translateAll(textsToTranslate, 'en', $currentLang, val => loadingTrans = val);
        //   const formData = new FormData();
        // formData.append('pdf', pdfFile);
        // formData.append('target', $currentLang);
        // formData.append('source', 'fr'); // or auto-detect if needed

        // const res =  fetch('http://tplussgest.ddns.net:32147/api/extract-pdf-translated', {
        //   method: 'POST',
        //   body: formData,
        // });

        // const data =  res.json();
        // pdfText = data.pages;
    }
  let pdfPages = [];
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
  let detailsPage;
  let showTicket=true;
  let showTicketDate=true;
  let btnText="Sign"
let showShare=false;
  let username = localStorage.getItem("username");
  let email = localStorage.getItem("email");
  let codeSign = localStorage.getItem("codeSign");
  let initial = localStorage.getItem("initial");
  let font = localStorage.getItem("font");
  let selectedColor = localStorage.getItem("selectedColor");
  let selectedColorBorder = localStorage.getItem("selectedColorBorder");
  let colorSign = '#000';
  let colorSignBorder = '#2473c3';
  let autoChecked =false;
let zoomLevel = 100;
let pdfId = null;
  let date = null;
    let isAccessRestricted = false;
  let today = new Date();
  // for test purpose
  let showPricingModal=false;

  onMount(async () => {
//  showPricingModal=true;
 const params = new URLSearchParams(window.location.search);
  pdfId = params.get('id');
   date = params.get('date');

    if (date) {
      const inputDate = new Date(date);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 10);
      
      // Check if date is more than 10 days from today
      isAccessRestricted = inputDate > maxDate;

    }

//     echo.connector.pusher.connection.bind('connected', () => {
//   console.log("✅ WebSocket connected");
// });

// echo.connector.pusher.connection.bind('error', e => {
//   console.error("❌ WS error", e);
// });

// const channel = echo.channel(`pdf.${pdfId}`);

// console.log("subscribing to", `pdf.${pdfId}`);

// channel.subscribed(() => {
//   console.log("✅ subscribed to channel");
// });
// // if (pdfId) {
//       echo.channel(`pdf.${pdfId}`)
//         .listen(".pdf.updated", e => {
//           console.log("📩 event received", e);
//           handleRemoteChange(e);
//         });
//   // }

  if (pdfId && !isAccessRestricted) {
    console.log('PDF ID from URL:', pdfId);
    loadPdfFromApi(pdfId);
  }
  		translateAll(textsToTranslate, 'en', $currentLang, val => loadingTrans = val);

    try {
        if (selectedColor) {
          colorSign=selectedColor;
        }
         if (selectedColorBorder) {
          colorSignBorder=selectedColorBorder;
        }
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

  async function loadPdfFromApi(id) {
  try {
    const res = await fetch(`http://tplussgest.ddns.net:32147/api/get-pdf/${id}`);
    if (!res.ok) throw new Error('Failed to fetch PDF');

    const blob = await res.blob();

    // Convert blob to File so you can reuse your existing function
    const file = new File([blob], `pdf_${id}.pdf`, { type: 'application/pdf' });

    // Now use it like a normal uploaded file
    await onUploadFile({ target: { files: [file] } });

  } catch (e) {
    console.error('Error loading PDF by ID:', e);
    alert('Unable to load PDF');
  }
}


  async function loadPdfFromId(id) {
  try {
    const res = await fetch(`http://tplussgest.ddns.net:32147/api/pdf/${id}`);

    const blob = await res.blob();

    const file = new File([blob], `pdf_${id}.pdf`, {
      type: "application/pdf"
    });

    // reuse your logic
    await handleFile(file);

  } catch (e) {
    console.error("Error loading pdf:", e);
  }
}

async function handleFile(file) {
  countFile = 0;

  if (!file) return;

  countFile = 1;

  try {
    if (file.type === "application/pdf") {
      await addPDF(file);

    } else if (
      file.type.includes("word") ||
      file.type.includes("powerpoint") ||
      file.type.includes("officedocument")
    ) {
      loading = true;
      const convertedFile = await convertWordToPdf(file);
      if (convertedFile) {
        await addPDF(convertedFile);
        loading = false;
        file = convertedFile;
      }
    }

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('target', $currentLang);
    formData.append('source', 'fr');

    const res = await fetch('http://tplussgest.ddns.net:32147/api/extract-pdf-translated', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    pdfText = data.pages;
    console.log(pdfText[0].pageNumber);

  } catch (e) {
    console.error(e);
  }
}


  function handleInitialsClick() {
    if (countFile==0) {
      message="You must upload file first";
      showMessage=true;
    }else{
      const htmlElement = document.querySelector(".sign-block-two");
      addHtmlBlockAsImage(htmlElement,'sign');
    }

  }
  function addInitials() {
      if (countFile==0) {
    message="You must upload file first";
    showMessage=true;
  }else{
    const htmlElement = document.querySelector(".sign-block-two");
    addHtmlBlockInAllPages(htmlElement,'sign');
  }

  }
  function handleSignClick() {
  if (countFile==0) {
    message="You must upload file first";
    showMessage=true;
  }else{
    const htmlElement = document.querySelector(".sign-block");
    addHtmlBlockAsImage(htmlElement,'sign');
  }

  }
  function handleManuelleClick() {
        if (countFile==0) {
      message="You must upload file first";
      showMessage=true;
    }else{
      onAddDrawing();
    }
     
    }
      let showModalStamp=false;

  function handleStampClick(){
        if (countFile==0) {
      message="You must upload file first";
      showMessage=true;
    }else{
      showModalStamp=true;

    }
  }
  async function onUploadStamp() {
  if (selectedPageIndex < 0) return;

  try {
    const response = await fetch('./images/stamp.png');
    const blob = await response.blob();
    const img = await createImageBitmap(blob);

    const paddingTop = 15;
    const paddingBottom = 15;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height + paddingTop + paddingBottom;

    const ctx = canvas.getContext('2d');

    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image with vertical offset
    ctx.drawImage(img, 0, paddingTop);

    // Make white pixels transparent
    const imageData = ctx.getImageData(0, paddingTop, canvas.width, img.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 240 && g > 240 && b > 240) data[i + 3] = 0;
    }
    ctx.putImageData(imageData, 0, paddingTop);

    // Add today's date (top-center)
    const today = new Date().toLocaleDateString();
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'top';
    const dateTextWidth = ctx.measureText(today).width;
    ctx.fillText(today, (canvas.width - dateTextWidth) / 2, 5);

    // Add identifier below image (bottom-center)
    const identifier = '558Tue5d38d';
    const idTextWidth = ctx.measureText(identifier).width;
    ctx.textBaseline = 'bottom';
    ctx.font = 'bold 10px Arial';
    ctx.fillText(identifier, (canvas.width - idTextWidth) / 2, canvas.height - 5);

    // Convert canvas to file
    const modifiedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const file = new File([modifiedBlob], 'stamp-modified.png', { type: 'image/png' });

    addImage(file);

  } catch (e) {
    console.log('Failed to load or modify image', e);
  }
}


  function handleSignFunc(){
    selectedPageIndex= pages.length-1;
    let type= localStorage.getItem("typeSign");
    
    if (type=="auto") {
        handleSignClick();
    }
    if (type=="manuel") {
      autoChecked=false;
      handleManuelleClick();
    }
    if (type=="initial") {
      autoChecked=false;
      handleManuelleClick();
    }
    if (type=="initialAuto") {
      handleInitialsClick();
    }
    if (type=="auto+manuel") {
      autoChecked=true;
      handleManuelleClick();
    }
     showTicket=false;
  }

  function handleDeletePage(event) {
    const { index } = event.detail;
    
    // Remove the page from all relevant arrays
    pages = pages.filter((_, i) => i !== index);
    // allObjects = allObjects.filter((_, i) => i !== index);
    pagesScale = pagesScale.filter((_, i) => i !== index);
    
    // Adjust selected page index if needed
    if (selectedPageIndex >= index) {
      selectedPageIndex = Math.max(0, selectedPageIndex - 1);
    }
  }
  let showModalReset=false;
  let resetIndex;
  function handleResetPage(event) {
    showModalReset=true;
    const { index } = event.detail;
    resetIndex=index;
    
    
  }
  function handleChoiceReset(choice) {
    userChoice = choice;
    showModalReset = false;
    showModal = false;
    if (choice == "yes") {
      allObjects[resetIndex]=[];
    }
  }
    function handleChoiceStamp(choice) {
    showModalStamp = false;
    if (choice == "default") {
        onUploadStamp();
    }
    // if (choice == "upload") {
    //     onUploadImage(e);
    // }
  }
    async function addInitialsByApi(withColor = false,file) {
// console.log('azzaeazez');

    showModal3 = false;

    const formData = new FormData();
    formData.append('file', file);
    if (!signatureImage) {
          formData.append('initials_image', initialImage);
    }else{
          formData.append('initials_image', initialImage);
    }
    formData.append('position','right');
    formData.append('page_number', 0);
    formData.append('width', 80);
    formData.append('height', 40);
    
    if (withColor) {
      formData.append('initials_color', '0,128,0');
    }

    try {
      const response = await fetch('http://tplussgest.ddns.net:33125/insert-image/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Convert binary response to blob
      const blob = await response.blob();
      await onUploadFileFromAPI(blob, 'processed_document.pdf');
            
    } catch (err) {
      console.error('Error:', err);
    } finally {
    }
  }

  async function onUploadFileFromAPI(apiFileBlob, originalFileName = 'document.pdf') {
  countFile = 0;
  
  // Create a File object from the Blob returned by the API
  const file = new File([apiFileBlob], originalFileName, { 
    type: 'application/pdf',
    lastModified: Date.now()
  });

  if (!file) {
    return;
  } else {
    countFile = 1;
  }

  try {
    // Since the API returns a PDF, we can directly use addPDF
    if (file.type === "application/pdf") {
      await addPDF(file);
    } else {
      // Handle other file types if needed (though API should return PDF)
      loading = true;
      const convertedFile = await convertWordToPdf(file);
      if (convertedFile) {
        await addPDF(convertedFile);
        setTimeout(() => {
          loading = false;
        });
      }
      file = convertedFile;
    }
    
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('target', $currentLang);
    formData.append('source', 'fr'); // or auto-detect if needed

    const res = await fetch('http://tplussgest.ddns.net:32147/api/extract-pdf-translated', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    pdfText = data.pages;
    console.log(pdfText[0].pageNumber);
    

  } catch (e) {
    console.error(e);
  }
}

  let countFile=0;
  let loading=false;
let pdfText=[];
  async function onUploadFile(e) {
  countFile = 0;
  const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
  const file = files[0];

  if (!file) {
    return;
  } else {
    countFile = 1;
  }


  try {
    if (file.type === "application/pdf") {
      await addPDF(file);
      

    } else if (file.type.includes("word") || file.type.includes("powerpoint")|| file.type.includes("officedocument")) {
      loading=true;
      const convertedFile = await convertWordToPdf(file);
      if (convertedFile) {
        await addPDF(convertedFile);
        setTimeout(() => {
          loading=false;
        });
      }
      file=convertedFile;
    }
    
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('target', $currentLang);
    formData.append('source', 'fr'); // or auto-detect if needed

    const res = await fetch('http://tplussgest.ddns.net:32147/api/extract-pdf-translated', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    pdfText = data.pages;
    console.log(pdfText[0].pageNumber);
    

  } catch (e) {
    console.error(e);
  }
}



// this is convertWordToPdf function witch you sended to me
async function convertWordToPdf(wordFile) {
  const formData = new FormData();
  formData.append("file", wordFile);

  try {
    const response = await fetch("http://tplussgest.ddns.net:32147/api/convert-word-to-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to convert file");
    }

    const blob = await response.blob();

    // Create a new File object from the blob
    const fileResponse = new File([blob], "converted.pdf", {
      type: blob.type,
    });


    // Optional: Validate the PDF structure by passing it through PDF.js
    try {
      await readAsPDF(fileResponse).then(res => setTimeout(() => {addTextDate()}
    ));
     
    } catch (validationError) {
      console.error("PDF validation failed:", validationError);
      throw new Error("Invalid PDF structure");
    }

    return fileResponse;
  } catch (error) {
    console.error(error);
    alert("An error occurred while converting the file");
  }
}

let pageWidth;
let pageHeight;


async function addPDF(file) {
  try {
    const pdf = await readAsPDF(file);
    pdfName = file.name;
    pdfFile = file;
    const numPages = pdf.numPages;

    // Store the actual page objects
    pdfPages = Array(numPages)
      .fill()
      .map((_, i) => pdf.getPage(i + 1));

    // Wait for the first page to resolve to get size
    const firstPage = await pdf.getPage(1);
    const viewport = firstPage.getViewport({ scale: 1 });

    // Use actual PDF page size
    pageWidth = viewport.width;
    pageHeight = viewport.height;

    pages = [...pdfPages];
    allObjects = pages.map(() => []);
    pagesScale = Array(numPages).fill(1);

  } catch (e) {
    throw e;
  }
}

let message='';
let showMessage= false;
  let currentStep = 1;
  
  const totalSteps = 3;
  
  function nextStep() {
    if (currentStep < totalSteps) {
      currentStep += 1;
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      currentStep -= 1;
    }
  }
  
  function closeModal() {
    showModal = false;
    currentStep = 1; // Reset to first step when closing
  }
  function closeModalMessage() {
    showMessage = false;
  }
  
let showModal2 = false;
  let userChoice = null;
  function handleStartClick(sign) {
    localStorage.setItem("typeSign", sign);
    if (sign=="initial"||sign == "initialAuto") {
            btnText="Initial";
    }else       btnText="Sign";

  }

  function handleAllInitialsClick() {
    if (countFile==0) {
      message="You must upload file first";
      showMessage=true;
    }else{
      showModal2 = true;
    }
    
  }
  let signatureImage= false;
    function handleAllInitialsImage(type) {
       signatureImage= false;
    if (countFile==0) {
      message="You must upload file first";
      showMessage=true;
    }else{
      if (type=='sig') {
        signatureImage=true;
      }
      showModal3 = true;
    }
    
  }
    let showModal3= false;
    let initialImage=null;
      async function uploadInitialImage(e) {
        countFile = 0;
        const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
        const file = files[0];



        try {
          showModal3 = false;
          initialImage = file;
          addInitialsByApi(false,pdfFile);
            

        } catch (e) {
          console.error(e);
        }
      }

  //   function uploadInitialImage(e) {
      
  //       const file = e.target.files[0];
  //       console.log(' e.target',  e.target);
        
  //       saveInitialImage(file);
  // }
  // function saveInitialImage(file) {
  //           initialImage = file;
  // }
    function handleChoiceImage() {
      
          showModal3 = false;

        // addInitialsByApi(false,pdfFile,initialImage);

  }
  function handleChoice(choice) {
    userChoice = choice;
    showModal2 = false;
    if (choice == "yes") {
      addInitialsByApi(false,pdfFile);
      scrollToPage(pages.length-1)
    }
    selectedPageIndex= pages.length-1;
    scrollToPage(pages.length-1)
    closeModal()
  }
function renderHTMLToCanvas(htmlContent) {
  // Use DOMParser to convert HTML string into a DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Convert the HTML content to an image that can be drawn on canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Example: Drawing text onto the canvas, in this case, you can customize rendering
  context.font = '16px Arial';
  context.fillText(doc.body.textContent, 10, 50);

  // If you want to support more complex HTML content, consider using a library like html2canvas
}


// async function addPowerPointFile(file) {
//   const reader = new FileReader();
  
//   reader.onload = async function(event) {
//     const arrayBuffer = event.target.result;

//     // Create a new presentation from the file
//     const pptx = new PptxGenJS();
//     await pptx.load(arrayBuffer);
    
//     // Loop through each slide and render it as an image on the canvas
//     pptx.slides.forEach((slide, index) => {
//       const imgDataUrl = slide.toDataURL(); // Convert slide to image data URL
//       renderImageToCanvas(imgDataUrl, index);
//     });
//   };
  
//   reader.readAsArrayBuffer(file);
// }

async function addPowerPointFile(file) {
  // try {
  //   const dataURL = await readAsDataURL(file);
    
  //   // Convert the PowerPoint file to HTML
  //   console.log("Data URL:", dataURL);
  //   const slides = await pptx2html(dataURL);
    
  //   // Assuming slides is an array of image URLs or canvas elements
  //   pages = await Promise.all(slides.map(async (slide) => {
  //     // Create a canvas for each slide
  //     const canvas = document.createElement('canvas');
  //     const context = canvas.getContext('2d');
      
  //     // Load the slide image into the canvas
  //     const img = new Image();
  //     img.src = slide; // Assuming slide is a URL to the image
      
  //     return new Promise((resolve) => {
  //       img.onload = () => {
  //         canvas.width = img.width;
  //         canvas.height = img.height;
  //         context.drawImage(img, 0, 0);
  //         resolve(canvas); // Resolve the promise with the canvas
  //       };
  //       img.onerror = (error) => {
  //         console.error("Image loading error:", error);
  //         resolve(null); // Resolve with null if there's an error
  //       };
  //     });
  //   }));

  //   // Filter out any null canvases in case of loading errors
  //   pages = pages.filter(canvas => canvas !== null);

  //   // Initialize allObjects for each page
  //   allObjects = Array(pages.length).fill().map(() => []);
    
  // } catch (e) {
  //   console.error("Failed to add PowerPoint file.", e);
  //   throw e;
  // }
}
function renderImageToCanvas(imageDataUrl, index) {
  const img = new Image();
  
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match the image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw the image onto the canvas
    context.drawImage(img, 0, 0);
    
    document.body.appendChild(canvas); // Append canvas to DOM or handle it as needed
  };
  
  img.src = imageDataUrl;
}

function handleImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    images = [...images, { src: reader.result }];
  };
  reader.readAsDataURL(file);
}

async function onUploadImage(e) {
  const file = e.target.files[0];
  if (!file || selectedPageIndex < 0) return;

  try {
    const img = await createImageBitmap(file);

    const paddingTop = 15;
    const paddingBottom = 15;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height + paddingTop + paddingBottom;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the uploaded image
    ctx.drawImage(img, 0, paddingTop);

    // Make white pixels transparent (optional)
    const imageData = ctx.getImageData(0, paddingTop, canvas.width, img.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 240 && g > 240 && b > 240) data[i + 3] = 0;
    }
    ctx.putImageData(imageData, 0, paddingTop);

    // Add today's date at top-center
    const today = new Date().toLocaleDateString();
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'top';
    const dateTextWidth = ctx.measureText(today).width;
    ctx.fillText(today, (canvas.width - dateTextWidth) / 2, 2);

    // Add identifier at bottom-center
    const identifier = '558Tue5d38d';
    const idTextWidth = ctx.measureText(identifier).width;
    ctx.textBaseline = 'bottom';
    ctx.font = 'bold 10px Arial';
    ctx.fillText(identifier, (canvas.width - idTextWidth) / 2, canvas.height - 2);

    // Convert canvas to File
    const modifiedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const modifiedFile = new File([modifiedBlob], file.name.replace(/\.\w+$/, '-modified.png'), {
      type: 'image/png'
    });

    addImage(modifiedFile);
  } catch (err) {
    console.error('Failed to process uploaded image:', err);
  }

  // Reset input
  e.target.value = null;
}

  async function addImage(file) {
  try {
      const url = await readAsDataURL(file);
      const img = await readAsImage(url);
      const id = genID();
      const { width, height } = img;

      // Align image to bottom-right corner
      const x = pageWidth - width-15;
      const y = pageHeight - height-15;
      showModalStamp = false;

      const object = {
        id,
        type: "image",
        width,
        height,
        x,
        y,
        payload: img,
        file
      };
          const objectToServer = {
      id,
        type: "image",
        width,
        height,
        x,
        y,
        file,
      owner: username,
      color: generateColorFromName(username)
    };

      allObjects = allObjects.map((objects, pIndex) =>
        pIndex === selectedPageIndex ? [...objects, object] : objects
      );
          syncToServer("add", {
  ...objectToServer,
  pageIndex: selectedPageIndex
});
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
  function addTextDate() {
    const id = genID();
    fetchFont(currentFont);
    const object = {
      id,
      text: 'Signed with TilscoSign on ' +new Date().toISOString().split("T")[0]+ ' ID: ' + codeSign,
      type: "text",
      size: 11,
      width: 0, // recalculate after editing
      lineHeight: 1.4,
      fontFamily: currentFont,
      x: 20,
      y: 5,
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
      text: email,
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
    text: username,
    type: "text",
    size: 16,
    x: 0,
    y: 0,
    owner: username,
    color: generateColorFromName(username)
  };

  allObjects = allObjects.map((objects, pIndex) =>
    pIndex === selectedPageIndex ? [...objects, object] : objects
  );

      syncToServer("add", {
  ...object,
  pageIndex: selectedPageIndex
});
  }
  function generateColorFromName(name) {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += value.toString(16).padStart(2, "0");
  }

  return color;
}
  function scrollToPage(index) {
    const pageElement = document.getElementById(`page-${index}`);
    if (pageElement) {
      pageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
  function onAddDrawing() {
    if (selectedPageIndex >= 0) {
      const imgUrl = localStorage.getItem(`savedImage_manuelle`);
      const imgUrlInitial = localStorage.getItem(`savedImage_initial`);
      if (localStorage.getItem("typeSign")=='initial') {
        loadSavedImage('initial');
      }else
      if (imgUrl) {
        loadSavedImage('manuelle');
      }else if(imgUrlInitial){
        loadSavedImage('initial');
      }else{
        addingDrawing = true;
      }
      
    }
  }
//   function addDrawing(originWidth, originHeight, path, scale = 1) {
//   const id = genID();
//   const object = {
//     id,
//     path,
//     type: "drawing",
//     x: 0,
//     y: 0,
//     originWidth,
//     originHeight,
//     width: originWidth * scale,
//     scale,
//     text: '6ZDsd6'
//   };
//   allObjects = allObjects.map((objects, pIndex) =>
//     pIndex === selectedPageIndex ? [...objects, object] : objects
//   );
// }

function addDrawing(originWidth, originHeight, path, scale = 1, strokeColor, strokeWidth) {
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
    strokeColor,  // New field
    strokeWidth,  // New field
    text: '6ZDsd6'
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
    scrollToPage(index);
  }
  function updateObject(objectId, payload) {
  allObjects = allObjects.map((objects, pIndex) =>
    pIndex == selectedPageIndex
      ? objects.map(o => o.id === objectId ? { ...o, ...payload } : o)
      : objects
  );

  syncToServer("update", { id: objectId, ...payload });
  }
  function deleteObject(objectId) {
      allObjects = allObjects.map((objects, pIndex) =>
    pIndex == selectedPageIndex
      ? objects.filter(o => o.id !== objectId)
      : objects
  );

  syncToServer("delete", { id: objectId });
  }

  async function syncToServer(action, object) {
  await fetch(`http://tplussgest.ddns.net:32147/api/pdf-sync/${pdfId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      object
    })
  });
}
async function handleRemoteChange(e) {

  const { action, object } = e;

  if (action === "add") {

    if (object.type === "image") {

      // recreate the image from base64
      const img = await readAsImage(object.file);

      const newObject = {
        ...object,
        payload: img
      };

      allObjects[object.pageIndex] = [
        ...allObjects[object.pageIndex],
        newObject
      ];

    } else {

      // text or other objects
      allObjects[object.pageIndex] = [
        ...allObjects[object.pageIndex],
        object
      ];

    }

  }

}
  function onMeasure(scale, i) {
    pagesScale[i] = scale;
  }
  // FIXME: Should wait all objects finish their async work

  
  // Get email from user
  let recipientEmail = '';
  let emailSubject = 'PDF Shared by Salem Khmis';
  let emailMessage = 'Please find the attached PDF document.';
    let senderName = 'TilscoSign';
  let senderEmail = 'salemkhmis003@gmail.com';
  let replyToEmail = 'support@tilscoSign.com';
  // Your original save function (unchanged)
  async function savePDF() {
    if (!pdfFile || saving || !pages.length) return;
    saving = true;
    try {
      await save(pdfFile, allObjects, pdfName);
    } catch (e) {
      console.log(e);
    } finally {
      saving = false;
    }
  }
  
  // NEW: Send PDF to Laravel backend
  async function sendToBackend() {
    if (!pdfFile || saving || !pages.length) return;
    saving = true;
    
    try {
      // Get PDF as blob
      const pdfBlob = await getPDFAsBlob(pdfFile, allObjects, pdfName);
      
      // Create FormData
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `${pdfName}.pdf`);
      formData.append('filename', pdfName);
      formData.append('metadata', JSON.stringify({
        pageCount: pages.length,
        timestamp: new Date().toISOString()
      }));
      
      // Send to Laravel
      const response = await fetch('http://tplussgest.ddns.net:32147/api/save-pdf', {
        method: 'POST',
        body: formData,
        // If you have authentication, add headers
        headers: {
          'Accept': 'application/json',
          // Add CSRF token if needed
          // 'X-CSRF-TOKEN': getCsrfToken()
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      console.log('PDF saved to backend:', result);
      return result;
      
    } catch (error) {
      console.error('Error sending to backend:', error);
      alert('Failed to send PDF to server: ' + error.message);
      throw error;
    } finally {
      saving = false;
    }
  }
  
 async function sendPDFByEmail() {
    if (!pdfFile || saving || !pages.length) return;
    if (!recipientEmail) {
      alert('Please enter recipient email address');
      return;
    }
    
    saving = true;
    
    try {
      const pdfBlob = await getPDFAsBlob(pdfFile, allObjects, pdfName);
      
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `${pdfName}.pdf`);
      formData.append('recipient_email', recipientEmail);
      formData.append('sender_name', senderName);
      formData.append('sender_email', senderEmail);
      formData.append('reply_to', replyToEmail);
      formData.append('subject', emailSubject);
      formData.append('message', emailMessage);
      formData.append('filename', pdfName);

      const storeResponse = await fetch('http://tplussgest.ddns.net:32147/api/store-pdf', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      const storeData = await storeResponse.json();
      const pdfId = storeData.id;
      console.log(pdfId);
      
      
      formData.append('pdf_id', pdfId);
      const response = await fetch('http://tplussgest.ddns.net:32147/api/send-pdf-email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      
      // const response = await fetch('http://tplussgest.ddns.net:32147/api/send-pdf-email', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Accept': 'application/json',
      //   }
      // });

      // await fetch('http://tplussgest.ddns.net:32147/api/store-pdf', {
      //   method: 'POST',
      //   headers: {
      //     'Accept': 'application/json'
      //   },
      //   body: formData
      // });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      alert('PDF sent to email successfully!');
      return result;
      
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email: ' + error.message);
      throw error;
    } finally {
      saving = false;
    }
  }
  
  // NEW: Combined function - save locally and send to backend/email
  async function saveAndSend(options = {}) {
    const { 
      saveLocal = true, 
      sendBackend = false, 
      sendEmail = false 
    } = options;
    
    if (!pdfFile || saving || !pages.length) return;
    saving = true;
    
    try {
      let results = {};
      
      // Get PDF bytes once (reusable)
      const pdfBytes = await saveAndGetPDF(pdfFile, allObjects, pdfName);
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Save to backend if requested
      if (sendBackend) {
        const backendFormData = new FormData();
        backendFormData.append('pdf', pdfBlob, `${pdfName}.pdf`);
        backendFormData.append('filename', pdfName);
        
        const backendResponse = await fetch('http://tplussgest.ddns.net:32147/api/save-pdf', {
          method: 'POST',
          body: backendFormData,
        });
        
        results.backend = await backendResponse.json();
      }
      
      // Send email if requested
      if (sendEmail && recipientEmail) {
        const emailFormData = new FormData();
        emailFormData.append('pdf', pdfBlob, `${pdfName}.pdf`);
        emailFormData.append('email', recipientEmail);
        emailFormData.append('subject', emailSubject);
        emailFormData.append('message', emailMessage);
        
        const emailResponse = await fetch('http://tplussgest.ddns.net:32147/api/send-pdf-email', {
          method: 'POST',
          body: emailFormData,
        });
        
        results.email = await emailResponse.json();
      }
      
      return results;
      
    } catch (error) {
      console.error('Error in saveAndSend:', error);
      throw error;
    } finally {
      saving = false;
    }
  }
  
  // Helper function to get CSRF token (if using Laravel Sanctum or similar)
  function getCsrfToken() {
    // If using meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) return metaTag.getAttribute('content');
    
    // If using cookie
    const token = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (token) return decodeURIComponent(token[1]);
    
    return null;
  }






  let authenticated = false;
  let showRegister = false;
  let profile = false;
  let pricing = false;
  let payment = false;
  let showTranslate=true;

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
    pricing= false;
    payment =false;
    showPricingModal= false;
    logoutMenu = false;
    authenticated=true;
  }
    function handleGoToPayment() {
    profile = false;
    pricing= false;
    payment =true;
    showPricingModal= false;
    logoutMenu = false;
    authenticated=true;
  }
  async function loadSavedImage(typeSign) {
  const imgUrl = localStorage.getItem(`savedImage_${typeSign}`);
  if (!imgUrl) return null;

    // Create a new image object
    const img = await readAsImage(imgUrl); // Assume you have a function to handle this
    const id = genID();
    const { width, height } = img;

    // Create the object for the PDF
    const object = {
      id,
      type: "image",
      width,
      height,
      x: (typeSign=='initial'|| btnText=='Initial') ? 0 :  pageWidth - width-15,
      y: pageHeight - height-15,
      payload: img,
      file: imgUrl // Optional: If you want to store the image data
    };

    // Add the image object to the current page's objects
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex === selectedPageIndex ? [...objects, object] : objects
    );
}
function handleShare(){
  showShare=!showShare;
}
  async function addHtmlBlockAsImage(htmlElement,typeSign) {
  try {
    // Render HTML to canvas with transparent background
    const canvas = await html2canvas(htmlElement, {
      backgroundColor: null, // Ensures transparency
      useCORS: true, // Handles cross-origin images if any
    });

    // Convert canvas to data URL (image)
    const imgUrl = canvas.toDataURL("image/png");
    // if (typeSign!="initial") {
      localStorage.setItem(`savedImage_${typeSign}`, imgUrl);
    // }

    // Create a new image object
    const img = await readAsImage(imgUrl); // Assume you have a function to handle this
    const id = genID();
    
    const { width, height } = img;

    // Create the object for the PDF
    const objectToServer = {
      id,
      type: "image",
      width,
      height,
      x: typeSign=='initial'|| btnText=='Initial' ? 0 :  pageWidth - width-15,
      y: pageHeight - height-15,
       file: imgUrl,
      owner: username,
      color: generateColorFromName(username)
    };

        const object = {
      id,
      type: "image",
      width,
      height,
      x: typeSign=='initial'|| btnText=='Initial' ? 0 :  pageWidth - width-15,
      y: pageHeight - height-15,
      payload: img,
      file: imgUrl // Optional: If you want to store the image data
    };

    // Add the image object to the current page's objects
    allObjects = allObjects.map((objects, pIndex) =>
      pIndex === selectedPageIndex ? [...objects, object] : objects
    );
    syncToServer("add", {
  ...objectToServer,
  pageIndex: selectedPageIndex
});
  } catch (e) {
    console.log("Failed to add HTML block as image.", e);
  }
}
async function addHtmlBlockInAllPages(htmlElement, typeSign) {
  try {
    // Render HTML to full-size canvas
    const originalCanvas = await html2canvas(htmlElement, {
      backgroundColor: null,
      useCORS: true,
    });

    // Create a smaller canvas (1/2 size)
    const scaleFactor = 0.5;
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = originalCanvas.width * scaleFactor;
    scaledCanvas.height = originalCanvas.height * scaleFactor;

    const ctx = scaledCanvas.getContext("2d");
    ctx.scale(scaleFactor, scaleFactor);
    ctx.drawImage(originalCanvas, 0, 0);

    // Get the scaled image as data URL
    const imgUrl = scaledCanvas.toDataURL("image/png");
    const img = await readAsImage(imgUrl); // your custom function to load image

    const id = genID();

    const object = {
      id,
      type: "image",
      width: img.width / 1.5,
      height: img.height,
      x: 5,
      y: pageHeight - height-15,
      payload: img,
      file: imgUrl,
    };

    allObjects = allObjects.map((objects, pIndex) =>
      pIndex < allObjects.length - 1 ? [...objects, object] : objects
    );
  } catch (e) {
    console.log("Failed to add HTML block as image.", e);
  }
}

</script>

<svelte:window
  on:dragenter|preventDefault
  on:dragover|preventDefault
  on:drop|preventDefault={onUploadFile} />
<Tailwind />
{#if isAccessRestricted }
<div class="access-restricted-container">
  <div class="access-restricted-card">
    <div class="icon-wrapper">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lock-icon">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    </div>
    
    <h1 class="title">Accès Restreint</h1>
    
    <div class="message-box">
      {#each messages.split('\n') as line}
        <p class="message-line">{line}</p>
      {/each}
    </div>
    
    <div class="actions">
      <button class="primary-btn" on:click={() => window.location.href = '/request-new-link'}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        Demander un nouveau lien
      </button>
      
      <button class="secondary-btn" on:click={() => window.history.back()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
        Retour
      </button>
    </div>
    
    <div class="footer">
      <p class="footer-text">Besoin d'aide ? <a href="/contact" class="help-link">Contactez le support</a></p>
    </div>
  </div>
</div>
{:else if authenticated}
  {#if pricing} 


  <main class="flex flex-row min-h-screen bg-gray-100">
    <LeftMenu class="flex-shrink-0" on:initialsClicked={handleInitialsClick} on:allInitialsClicked={() => handleAllInitialsImage('initial')} on:handleAllInitialsImage={() => handleAllInitialsImage('sig')} on:manuelleClicked={handleManuelleClick} on:StampClicked={handleStampClick}  on:signClicked={handleSignClick} 
    on:emailClicked={()=>  { if(selectedPageIndex >= 0){ addTextEmail(); }}} 
    on:nameClicked={() => {if (selectedPageIndex >= 0) {addTextName(); }}} />
        <PricingModal on:goToHome={handleGoToHome} on:goToPayment={handleGoToPayment}/>
  </main>
  {:else if payment} 


  <main class="flex flex-row min-h-screen bg-gray-100">
    <LeftMenu class="flex-shrink-0" on:initialsClicked={handleInitialsClick} on:allInitialsClicked={() => handleAllInitialsImage('initial')} on:handleAllInitialsImage={() => handleAllInitialsImage('sig')} on:manuelleClicked={handleManuelleClick} on:StampClicked={handleStampClick}  on:signClicked={handleSignClick} 
    on:emailClicked={()=>  { if(selectedPageIndex >= 0){ addTextEmail(); }}} 
    on:nameClicked={() => {if (selectedPageIndex >= 0) {addTextName(); }}} />
      <Payment on:goToHome={handleGoToHome}/>
  </main>

  {:else if profile} 


  <main class="flex flex-row min-h-screen bg-gray-100">
    <LeftMenu class="flex-shrink-0" on:initialsClicked={handleInitialsClick} on:allInitialsClicked={() => handleAllInitialsImage('initial')} on:handleAllInitialsImage={() => handleAllInitialsImage('sig')} on:manuelleClicked={handleManuelleClick} on:StampClicked={handleStampClick}  on:signClicked={handleSignClick} 
    on:emailClicked={()=>  { if(selectedPageIndex >= 0){ addTextEmail(); }}} 
    on:nameClicked={() => {if (selectedPageIndex >= 0) {addTextName(); }}} />
    <ProfilePage on:goToHome={handleGoToHome}/>
  </main>
  {:else}
  <main class="flex flex-row min-h-screen bg-gray-100">
    <LeftMenu class="flex-shrink-0" on:initialsClicked={handleInitialsClick} on:allInitialsClicked={() => handleAllInitialsImage('initial')} on:handleAllInitialsImage={() => handleAllInitialsImage('sig')} on:manuelleClicked={handleManuelleClick} on:StampClicked={handleStampClick} on:signClicked={handleSignClick}
      on:emailClicked={()=>  { if(selectedPageIndex >= 0){ addTextEmail(); }}} 
      on:nameClicked={() => {if (selectedPageIndex >= 0) {
      addTextName();
    }}}/>
    <div
      class="absolute z-10 top-0 left-0 right-0 h-12 flex justify-center items-center tab-menu" style="border-style: hidden;margin-top: 25px;text-align-last: center;  width: 80%;justify-self: right;
    float: right;">

      <div class="justify-center mr-3 w-full max-w-xs  block_name">
        <input
          placeholder={$translations['File name']}
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
        {saving ? $translations['Saving'] : $translations['Save']}
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
       <div class="m-3 flex items-center gap-2">
         <!-- <div>
          <select id="lang" bind:value={lang}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div> -->
        <button 
          on:click={() => zoomLevel = Math.max(50, zoomLevel - 10)} 
          disabled={zoomLevel <= 50}
          class="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">
          -
        </button>
        
        <span>{zoomLevel}%</span>
        
        <button 
          on:click={() => zoomLevel = Math.min(150, zoomLevel + 10)} 
          disabled={zoomLevel >= 150}
          class="px-2 py-1 bg-gray-200 rounded disabled:opacity-50">
          +
        </button>
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
              <li on:click={() => profile = true} style="    margin-bottom: 6px;">{$translations['Profile']}</li>
              <li on:click={() => pricing = true} style="  border-top: solid 1px #38a53d63;   margin-bottom: 6px;">{$translations['Pricing']}</li>
              <li  style="border-top: solid 1px #38a53d63;     margin-bottom: 6px;" > {$translations['My files']}</li>
              <li on:click={() => {authenticated = false; logoutMenu = false; showRegister = false; localStorage.removeItem("session");  localStorage.removeItem("token");}} style="border-top: solid 1px #38a53d63;" >{$translations['Logout']}</li>
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
        style="z-index: 999;">
        <DrawingCanvas
        checked={autoChecked} 
          on:finish={e => {
            const { originWidth, originHeight, path ,strokeColor, strokeWidth,htmlElement,htmlElement2} = e.detail;
            let scale = 1;
            if (originWidth > 500) {
              scale = 500 / originWidth;
            }
            if(htmlElement){addHtmlBlockAsImage(htmlElement,'manuelle');}
            if(htmlElement2){ addHtmlBlockAsImage(htmlElement2,'initial');}
            // addDrawing(originWidth, originHeight, path, scale,strokeColor,strokeWidth);
            addingDrawing = false;
          }}
          on:cancel={() => (addingDrawing = false)} />
      </div>
    {/if}
    {#if pages.length > 0&&countFile==1} 
    <div class="w-full pages" style="width: 80%; margin-top: 10%; float: right;overflow-y: auto
    max-height: 90vh; transform: scale({zoomLevel /100});">
      <div class="flex-grow flex justify-center items-center">
        <input type="file" name="file" id="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.pptm,.opt" on:change={onUploadImage} class="hidden" />
        <label class="font-bold otherFile" for="file">
          <div class="mr-2">
            <svg width="25" height="25" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M31.6667 21V42" stroke="#878A93" stroke-width="3" stroke-linecap="round"/>
              <path d="M42 31.6665L21 31.6665" stroke="#878A93" stroke-width="3" stroke-linecap="round"/>
              <circle cx="32" cy="32" r="31" stroke="#878A93" stroke-width="2"/>
            </svg>
          </div>
          Add image 
        </label>
      </div>

      <div class="flex-grow flex justify-center items-center mt-4 mb-4" style="    float: left;
    margin-left: 20px;" on:click={handleShare}>
        <label class="font-bold otherFile" >
          <div class="mr-2">
            
          </div>
          Share PDF
        </label>
      </div>
      {#if showShare} 
        <div class="email-section" style="margin-top: 20px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <!-- <h3 style="margin-top: 0;">Send PDF by Email</h3> -->
    
    <!-- Sender Information (can be hidden if using defaults) -->
    <details style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
        <summary style="cursor: pointer; font-weight: bold;">Sender Information</summary>
        <div style="margin-top: 10px;">
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                    Sender Name:
                </label>
                <input 
                    type="text" 
                    bind:value={senderName}
                    placeholder="Your Application Name"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                />
            </div>
            
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                    Sender Email (From):
                </label>
                <input 
                    type="email" 
                    bind:value={senderEmail}
                    placeholder="noreply@yourdomain.com"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                />
            </div>
            
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                    Reply-To Email:
                </label>
                <input 
                    type="email" 
                    bind:value={replyToEmail}
                    placeholder="support@yourdomain.com"
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                />
            </div>
        </div>
    </details>
    
    <!-- Recipient Information -->
    <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
            Recipient Email:
        </label>
        <input 
            type="email" 
            bind:value={recipientEmail}
            placeholder="recipient@example.com"
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
            required
        />
    </div>
    
    <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
            Subject:
        </label>
        <input 
            type="text" 
            bind:value={emailSubject}
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
        />
    </div>
    
    <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
            Message:
        </label>
        <textarea 
            bind:value={emailMessage}
            rows="4"
            style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"
            placeholder="Please find the attached PDF document."
        />
    </div>
    
    <button 
        on:click={sendPDFByEmail} 
        disabled={saving || !recipientEmail}
        style="background-color: #4CAF50; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
    >
        {saving ? 'Sending...' : 'Send PDF via Email'}
    </button>
    
    <!-- Preview sender info -->
    <div style="margin-top: 15px; padding: 10px; background: #e8f5e9; border-radius: 5px; font-size: 14px;">
        <strong>Email will be sent:</strong>
        <div>From: {senderName} &lt;{senderEmail}&gt;</div>
        <div>To: {recipientEmail || 'Not specified'}</div>
        <div>Reply-To: {replyToEmail}</div>
    </div>
</div>
      {/if}
      <!-- <div class="ticket" style="top: 70px;cursor: pointer;"
      on:click={() => showModal = true}
      >Start</div> -->
          {#each pages as page, pIndex (page)}
          <div
            id={`page-${pIndex}`}
            class="p-5 w-full flex flex-col items-center overflow-hidden"
            on:mousedown={() => selectPage(pIndex)}
            on:touchstart={() => selectPage(pIndex)}>

            <div
              class="relative shadow-lg"  style="margin-left: {showTranslate ? 'auto' : '0'}"
              class:shadow-outline={pIndex === selectedPageIndex}>
            {#if pIndex === 0}
              <div
                class="ticket"
                style="cursor:pointer; left:-80px; position:absolute; z-index:10;"
                on:click|stopPropagation={() => {
                  showModal = true;
                  console.log('tttt');
                }}
                on:mousedown|stopPropagation
                on:touchstart|stopPropagation
              >
                Start
              </div>
            {/if}
                                            <div style="position: absolute; left: -200px;margin-top: {pIndex === 0 ? '37px' : '0'};" >
                        <div on:click={() => showTranslate = !showTranslate} style="right: -200px;background: #38a53d;cursor: pointer;
                width: 20px;
                color: white;
                position: absolute;
                z-index: 2;
                text-align: center;"> {showTranslate? 'X' : '<'}</div>
                        {#if pdfText.length>0&&showTranslate}   
                          <div style="        width: 200px;
                background: rgb(226 255 227);
                position: absolute;
                padding: 8px;
                font-size: 11px;
                color: rgb(32 131 36);
                border-radius: 8px;

            ">
                  {pdfText[pIndex].content}
                </div>
              {/if}
            </div>
              <PDFPage
                on:measure={e => {onMeasure(e.detail.scale, pIndex); detailsPage=e.detail}}
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
                      strokeColor={object.strokeColor}
                      strokeWidth={object.strokeWidth}  
                      pageScale={pagesScale[pIndex]} />
                  {/if}
                {/each}
              
              </div>

                {#if pIndex === pages.length-1}
                  <div class="ticket" style="    bottom: 6%;
                      cursor: pointer;
                      left: -80px;
                      position: absolute;
                      z-index: 10;
                      ">End</div>

                            {#if showTicket===true} 
      <div class="ticket-sign" style="bottom: 60px; right: {btnText='Initial'? '65%' : '20%' }" >
        <div  style=" cursor: pointer;
    font-size: 14px;    height: 36px;
    border-radius: 8px;
    background-image: linear-gradient(140deg, rgb(47 148 46), rgb(139 241 97));
    display: flex;    align-items: center;
    justify-content: center;" on:click={()=>handleSignFunc()} >
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 64 64" fill="white">
      <path d="M23 62c0 .8.6 1.5 1.5 1.5h20c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5h-20C23.6 60.5 23 61.2 23 62zM10.9 55.5l-.4 6.5c-.1.5.3 1.1.8 1.4.3.2.5.2.8.2.3 0 .6-.1.9-.3l5.4-3.5c2.8-1.8 5.1-4.3 6.8-7.2l15.2-26.2c.4-.7.2-1.6-.5-2s-1.7-.1-2 .5L22.4 51c-1.5 2.5-3.5 4.6-5.9 6.2l-2.9 1.9.2-3.5c.1-2.8 1-5.7 2.4-8.2l15.1-26.2c.4-.7.1-1.6-.5-2-.7-.4-1.6-.1-2 .5L13.8 46C12.1 48.9 11.1 52.2 10.9 55.5zM43.3 20.9l1.8-3.3c.8-1.5 1.1-3.3.7-4.9-.5-1.7-1.5-3.1-3-3.9s-3.3-1.1-5-.6c-1.7.4-3.1 1.6-4 3.1L32 14.4c-.4.7-.1 1.6.5 2l8.6 5c.3.1.5.2.8.2.2 0 .3 0 .4 0C42.8 21.5 43 21.2 43.3 20.9zM52 60.5A1.5 1.5 0 1052 63.5 1.5 1.5 0 1052 60.5z"></path>
    </svg>
    
            {btnText} 
            <!-- <svg style="justify-self: anchor-center;" width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16V3M12 3L16 7.375M12 3L8 7.375" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg> -->



          </div>
      </div>
      {/if}
                {/if}

            </div>

          </div>

        {/each}



      <!-- <div class="ticket" style="bottom: 210px;">Date</div>
      {#if showTicketDate===true} 
      <div class="ticket-sign" style="    bottom: 250px; right: 70px;height: 55px;">
        <div  style="cursor: pointer;
        background: #3ba83a;
        height: 50px;
        width: 56px; font-size: 14px;
        border-radius: 8px;" on:click={()=>{addTextDate(); showTicketDate=false;}} >
            Date 
            <svg style="justify-self: anchor-center;" width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16V3M12 3L16 7.375M12 3L8 7.375" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
          </div>
      </div>
      {/if} -->

    </div>
  {:else}
    <div class="w-full justify-center items-center choose_text" style="width: 80%; float: right; margin-left: 20%;" for="file">
      <div class="flex-grow flex justify-center items-center">
        <input type="file" name="file" id="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.pptm,.opt" on:change={onUploadFile} class="hidden" />
        <label class="font-bold text-3xl" style="cursor: pointer;" for="file">
          {$translations['Choose File']}
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
      <RightMenu 
      pages={pages} 
      bind:selectedPageIndex
      on:pageSelected={e => selectPage(e.detail.index)}
      on:deletePage={handleDeletePage}
      on:resetPage={handleResetPage}
    />
    <div class="sign-block"  style="height: 64px;width: 220px;position: absolute;top: -70px;color: {colorSign}:">
      <div class="css-12sxlyp " style="color: {colorSign};--border-color: {colorSignBorder}" >
        <span>
          <span >{new Date().toISOString().split("T")[0]}</span>  
          Doc signed by:</span>
        <div class="css-fv3lde" style="color: {colorSign}">
          <span class="css-po3aid" style="font-family: {font ? font : 'Mistral'};color: {colorSign};">{username}</span>
          <div class="css-1j983t3" style="color: {colorSign}">{codeSign}</div>
        </div>
        
      </div>
    </div> 

    <div class="sign-block-two"  style="height: 64px;width: 170pxpx;position: absolute;top: -70px;">
      <div class="css-12sxlyp " style="--border-color: {colorSignBorder}">
        <span style="color: {colorSign}">Initial by:</span>
        <div class="css-fv3lde" style="padding-left: 35px;width: min-content;color: {colorSign}">
          <span class="css-po3aid" style="font-family: {font ? font : 'Mistral'};color: {colorSign};">
             {initial}
          </span>
          <div class="css-1j983t3" style="color: {colorSign}">{codeSign}</div>
        </div>
        
      </div>
    </div>
    


  </main>
  {/if}
{:else if showRegister}
  <Register on:register={handleLogin} on:goToLogin={handleGoToLogin} />
{:else}
  <Login on:login={handleLogin} on:goToRegister={handleGoToRegister}  on:goToHome={handleGoToHome}/>
{/if}
{#if showModal2}
<div class="modal-backdrop">
  <div class="modal">
    <p>You want to add initials in all pages?</p>
    <div class="modal-buttons">
      <button class="choise" on:click={() => handleChoice('yes')}>Yes</button>
      <button class="choise" on:click={() => handleChoice('no')}>No</button>
    </div>
  </div>
</div>
{/if}
{#if showModal3}
<div class="modal-backdrop">
  <div class="modal">
    <p>Please select an initial image</p>
    <div class="modal-buttons">
      <br>
      <div class="flex-grow flex justify-center items-center">
                <input type="file" name="file" id="file" on:change={uploadInitialImage}  />
        <!-- <label class="font-bold otherFile" for="file">
          <div class="mr-2">
            <svg width="25" height="25" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M31.6667 21V42" stroke="#878A93" stroke-width="3" stroke-linecap="round"/>
              <path d="M42 31.6665L21 31.6665" stroke="#878A93" stroke-width="3" stroke-linecap="round"/>
              <circle cx="32" cy="32" r="31" stroke="#878A93" stroke-width="2"/>
            </svg>
          </div>
          Add image 
        </label> -->
      </div>

          <div class="modal-buttons">
      <button class="choise" on:click={() => {handleChoiceImage()}}>Save</button>
  </div>

    </div>
  </div>
</div>
{/if}
{#if showModalReset}
<div class="modal-backdrop">
  <div class="modal">
    <p>Do you want to reset all changes of this page?</p>
    <div class="modal-buttons">
      <button class="choise" on:click={() => {handleChoiceReset('yes');nextStep()}}>Yes</button>
      <button class="choise" on:click={() => {handleChoiceReset('no');nextStep()}}>No</button>
    </div>
  </div>
</div>
{/if}
{#if showModal}
  <div class="modal-overlay">
    <div class="modal-content">
      <!-- Step 1 -->
      {#if currentStep === 1}
      <div class="modal-backdrop">
        <div class="modal">
          <p>What type of signature you prefer</p>
          <div class="modal-buttons">
            <button class="choise" on:click={() => {handleStartClick('auto');nextStep()}}>Signature auto</button>
            <button class="choise" on:click={() => {handleStartClick('manuel');nextStep()}}>Signature manuelle</button>
            <button class="choise" on:click={() => {handleStartClick('initial');nextStep()}}>Initial Manuelle</button>
            <button class="choise" on:click={() => {handleStartClick('initialAuto');nextStep()}}>Initial Auto</button>
            <button class="choise" on:click={() => {handleStartClick('auto+manuel');nextStep()}}>Signature auto + Signature manuelle</button>

          </div>
        </div>
      </div>
      {/if}
      
      <!-- Step 2 -->
      {#if currentStep === 2}
      <div class="modal-backdrop">
        <div class="modal">
          <p>You want to add initials in all pages?</p>
          <div class="modal-buttons">
            <button class="choise" on:click={() => {handleChoice('yes')}}>Yes</button>
            <button class="choise" on:click={() => {handleChoice('no')}}>No</button>
          </div>
        </div>
      </div>
      {/if}
      
    </div>
  </div>
{/if}

{#if showMessage}
  <div class="modal-overlay">
    <div class="modal-content">
      <!-- Step 1 -->
      <div class="modal-backdrop">
        <div class="modal">
          <p>{message}</p>
          <div class="modal-buttons">
            <button class="choise" style="width: 80px;height: 50px;" on:click={() => {closeModalMessage()}}>Ok</button>
          </div>
        </div>
      </div>
      
    </div>
  </div>
{/if}
{#if loading}
  <div class="loader-overlay">
    <div class="loader-wrapper">
      <!-- Logo at the top -->
      <div class="logo-container">
        <LogoMenu />
      </div>

      <!-- Loader animation -->
      <div class="dots-loader">
        <div></div>
        <div></div>
        <div></div>
      </div>

      <!-- Loading message -->
      <p class="loader-text">Upload in progress, please wait</p>
    </div>
  </div>
{/if}

{#if showModalStamp}
<div class="modal-backdrop">
  <div class="modal" style="position: absolute;">
    <span on:click={() => { showModalStamp = false;}} style="
    cursor: pointer;position: absolute;
    top: 15px;
    right: 30px;
">X</span>
    <p>Do you want to reset all changes of this page?</p>
    <div class="modal-buttons">
      <button class="choise" on:click={() => {handleChoiceStamp('default')}}>Add default Stamp</button>
      <button class="choise" >
        <input type="file" name="file" id="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.pptm,.opt" on:change={onUploadImage} class="hidden" />
        <label  for="file">
          Upload Stamp
        </label>
        </button>
    </div>
  </div>
</div>
{/if}

{#if showPricingModal}
  <PricingModal on:goToHome={handleGoToHome}/>
{/if}
{#if loadingTrans}
	<div class="loader-overlay">
		<div class="spinner"></div>
	</div>
{/if}
<style>
   .access-restricted-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }
  
  .access-restricted-card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .icon-wrapper {
    margin-bottom: 24px;
  }
  
  .lock-icon {
    color: rgb(59, 168, 58);
    width: 80px;
    height: 80px;
  }
  
  .title {
    color: #2d3436;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  .message-box {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
    border-left: 4px solid rgb(59, 168, 58);
  }
  
  .message-line {
    color: #495057;
    font-size: 16px;
    line-height: 1.6;
    margin: 8px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  .actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 24px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  .primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
  
  .secondary-btn {
    background: #f1f3f5;
    color: #495057;
  }
  
  .secondary-btn:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }
  
  .btn-icon {
    width: 20px;
    height: 20px;
  }
  
  .footer {
    border-top: 1px solid #e9ecef;
    padding-top: 20px;
  }
  
  .footer-text {
    color: #6c757d;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  .help-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
  }
  
  .help-link:hover {
    text-decoration: underline;
  }
    .loader-text {
    margin-top: 1rem;
    font-size: 1.5rem;
    color: #38a53d;
  }
.loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .loader-wrapper {
    text-align: center;
  }

  .logo-container {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
  }

  .logo-container :global(svg) {
    width: 80px;
    height: auto;
  }

  .dots-loader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 60px;
    margin: 0 auto;
  }

  .dots-loader div {
    width: 14px;
    height: 14px;
    background-color: #38a53d;
    border-radius: 50%;
    animation: bounce 0.6s infinite ease-in-out;
  }

  .dots-loader div:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dots-loader div:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    } 
    40% {
      transform: scale(1);
    }
  }

  /* .loader-text {
    margin-top: 1rem;
    font-size: 1rem;
    color: #333;
  } */

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    } 
    40% {
      transform: scale(1);
    }
  }
   

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
  }

  
  .step {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
    .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .choise{
    background: linear-gradient(140deg, rgb(47 148 46), rgb(139 241 97));
    color: white;
    border-radius: 10px;
    margin-top: 15px;
    width: 34%;
    cursor: pointer;
    height: 80px;
  }
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .pdf-actions{
    margin: 30px;
  }
  button {
    transition: opacity 0.2s;
  }
  
  button:hover:not(:disabled) {
    opacity: 0.9;
  }
  .modal {
    background: white;
    padding: 50px 0px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
    font-size: 20px;
    width: 45%;
  }

  .modal-buttons button {
    padding: 5px 15px;
    cursor: pointer;
  }
  .modal-sign{
    height: 65%;
    /* z-index: 99;
    width: 60%;
    place-self: center;
    border-radius: 15px; */
  }
  .ticket{
    position: relative;
    z-index: 99;
    right: 44px;
    background-image: linear-gradient(140deg, rgb(47 148 46), rgb(139 241 97));
    color: white;
    width: 80px;
    height: 36px;
    text-align: center;
    border-bottom-left-radius: 7px;
    border-top-left-radius: 7px;
    font-size: 18px;
    align-content: center;
  }
  .ticket-sign{
    justify-self: right;
    background: none;
    width: 130px;
    color: white;
    position: relative;
    align-content: center;
    text-align: center;
  }
  .otherFile{
    cursor: pointer;
    display: flex;
    font-size: 15px;
    color: #878A93;
    align-items: center;
    border: solid 1px;
    padding: 4px 20px;
    border-radius: 10px;
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
  background: none; /* Ensure no background */
  border: none;
  font-size: 11px;
  font-weight: 500;
  line-height: 11px;
  min-width: 170px;
  padding-inline-start: 46px;
  position: relative;
  text-align: start;
  height: 54px;
}

.css-12sxlyp::before {
  border-bottom: 2px solid var(--border-color);
    -webkit-border-start: 2px solid var(--border-color);
    border-inline-start: 2px solid var(--border-color);
    border-start-start-radius: 15px;
    border-end-start-radius: 15px;
    border-top: 2px solid var(--border-color);
    content: "";
    display: block;
    height: 100%;
    inset-inline-start: 0px;
    position: absolute;
    width: 35px;
    top: 7px;
    background: none;
}
.css-12sxlyp::after {
    content: "";
    position: absolute;
    top: 7px;
    bottom: 4px;
    right: 10px;
    border-right: 2px dashed var(--border-color);
    width: 30%;
    border-bottom: 2px dashed var(--border-color);
    border-top: 2px dashed var(--border-color);
    border-bottom-right-radius: 15px;
    border-top-right-radius: 15px;
    height: 100%;
}
.css-fv3lde {
  align-items: center;
  display: flex;
  padding: 7px 40px 4px 4px;  
  margin-left: -18px;
  font-size: 26px;
}

.css-1j983t3 {
  position: absolute;
  white-space: nowrap;
  font-size: 11px;
  bottom: 0px;
  left: 46px;
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

    .otherFile{
      margin-top: 20%;
      zoom: 0.7;
  }

  }
  .css-po3aid{
    font-size: 20px;
  }
</style>


