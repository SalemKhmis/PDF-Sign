<script>
  import { createEventDispatcher } from "svelte";
  import DrawingCanvas from "./DrawingCanvas.svelte";
  import { ggID } from "./utils/helper.js";
  import { fly } from "svelte/transition";
  import { save } from "./utils/PDF.js";
  import html2canvas from "html2canvas";

  let email =  localStorage.getItem("email")? localStorage.getItem("email") : "salemkhmis003@gmail.com";
  let paraphe =  localStorage.getItem("initial")? localStorage.getItem("initial") : "SK"
  let username = localStorage.getItem("username")? localStorage.getItem("username") :"Salem Khmis";
  let path = localStorage.getItem("path");
  let addingDrawing = false;
  const genID = ggID();
  const dispatch = createEventDispatcher();
  let allObjects = [];
  let selectedValue = '';
  let code ='';
  generateCode(email,username).then(res =>  code = res);
  console.log('code ', code);
  
  // Initialize color from localStorage or default to black
    let selectedColor = localStorage.getItem('selectedColor') || '#000000';

    // Save color when changed
    function handleColorChange(event) {
        selectedColor = event.target.value;
        localStorage.setItem('selectedColor', selectedColor);
    }

        let selectedColorBorder = localStorage.getItem('selectedColorBorder') || '#000000';

    // Save color when changed
    function handleColorChangeBorder(event) {
        selectedColorBorder = event.target.value;
        localStorage.setItem('selectedColorBorder', selectedColorBorder);
    }

  async function addHtmlBlockAsImage() {
  try {
    const htmlElement = document.querySelector(".sign-block");
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
  
  async function generateCode(email, full_name) {
      const data = `${email}${full_name}`;
      console.log(data);
      
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(data);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
      
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const code = hashHex.toUpperCase().slice(0, 15);
      console.log("code",code);

      return code;
  }
  import { onMount } from 'svelte';
  onMount(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  });
  async function handleSubmit() {
    if (email && username) {
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("path", path);
      localStorage.setItem("font", selectedValue);
      localStorage.setItem("codeSign", code);
      localStorage.setItem("initial", paraphe);

      alert("Registration successful!");
      dispatch("goToHome");

      // dispatch("goToHome", {
      //   "username": username,
      //   "email": email,
      //   "codeSign": code,
      //   "initial": paraphe,
      //   "font": selectedValue,
      // });
      //         const response = await fetch('http://127.0.0.1:5000/auth/register', {
      //           method: 'POST',
      //           headers: {
      //             'Content-Type': 'application/json'
      //           },
      //           body: JSON.stringify({
      //   "username": username,
      //   "email": email,
      //   "password": password
      // })
      //         });

      //         if (response.ok) {
      //           alert('Registration successful!');
      //           dispatch('register', {
      //   "username": username,
      //   "email": email,
      //   "password": password
      // });
      //         } else {
      //           alert('Registration failed. Please try again.');
      //         }
    } else {
      alert("Please enter both email and password");
    }
  }

  function goToHome() {
    dispatch("goToHome");

  }
  function onAddDrawing() {
    addingDrawing = true;
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
      pIndex === selectedPageIndex ? [...objects, object] : objects,
    );
  }
</script>

<main class="container">
  <div style="text-align: center; width: 70%;" class="mt-4">
    <div class="login-box">
      <h1>Profile</h1>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="input-group">
          <label for="name">Full name</label>
          <input
            id="name"
            type="text"
            placeholder="Name"
            bind:value={username}
            on:change={generateCode(email,username).then(res =>  code = res)}
          />
        </div>
        <div class="input-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            bind:value={email}
            on:change={generateCode(email,username).then(res =>  code = res)}
          />
        </div>
        <!-- <div class="input-group">
            <label for="postal">Postal code</label>
            <input id="postal" type="number" placeholder="Postal code" />
          </div> -->
        <!-- <div class="input-group">
          <label >Signature</label>
          <div class="block_sign">
            <svg width="100%" height="100%" viewBox="0 0 783 102"
              ><path
                stroke-width="5"
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke="black"
                fill="none"
                d={path}
              ></path></svg
            >
          </div>
        </div> -->
        <div class="actions" style="text-align: right;">
          <button
            type="button"
            on:click={onAddDrawing}
            class="login-button"
            style="width: initial;    padding: 3px 10px;"
            >Add new signature</button
          >
        </div>
        <div class="input-group">
          <label >Paraphe</label>
          <input
            type="text"
            bind:value={paraphe}
            placeholder="Type something..."
          />
        </div>

        <!-- now the tale -->
        <div style="max-height: 400px; overflow-y: auto; border: 1px solid #eee;">
          <table style="width: 100%;">
            <tbody>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input
                      type="radio"
                      value="Mistral"
                      bind:group={selectedValue}
                    />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div >
                    <div  class="css-12sxlyp">
                      <span>Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span  class="css-po3aid" style="font-family: Mistral;">{username}</span>
                      </div>
                      <span class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="initials-text" class="css-18wjb7a">
                      <span data-qa="initials-text-label" aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="initials-text-font" class="css-po3aid" style="font-family: Mistral;">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input
                      type="radio"
                      value="Rage"
                      bind:group={selectedValue}
                    />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="signature-text" class="css-12sxlyp">
                      <span data-qa="signature-text-label">Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="signature-text-font" class="css-po3aid" style="font-family: Rage;">{username}</span>
                      </div>
                      <span data-qa="signature-text-user-id" aria-hidden="true" class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="initials-text" class="css-18wjb7a">
                      <span data-qa="initials-text-label" aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="initials-text-font" class="css-po3aid" style="font-family: Rage;">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input
                      type="radio"
                      value="cursive"
                      bind:group={selectedValue}
                    />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="signature-text" class="css-12sxlyp">
                      <span data-qa="signature-text-label">Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="signature-text-font" class="css-po3aid" style="font-family: cursive; font-style: italic;">{username}</span>
                      </div>
                      <span data-qa="signature-text-user-id" aria-hidden="true" class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="initials-text" class="css-18wjb7a">
                      <span data-qa="initials-text-label" aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="initials-text-font" class="css-po3aid" style="font-family: cursive; font-style: italic;">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input
                      type="radio"
                      value="monospace"
                      bind:group={selectedValue}
                    />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="signature-text" class="css-12sxlyp">
                      <span data-qa="signature-text-label">Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="signature-text-font" class="css-po3aid" style="font-family: monospace; font-style: italic;">{username}</span>
                      </div>
                      <span data-qa="signature-text-user-id" aria-hidden="true" class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="initials-text" class="css-18wjb7a">
                      <span data-qa="initials-text-label" aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="initials-text-font" class="css-po3aid" style="font-family: monospace; font-style: italic;">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input
                      type="radio"
                      value="'Lucida Handwriting', cursive"
                      bind:group={selectedValue}
                    />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="signature-text" class="css-12sxlyp">
                      <span data-qa="signature-text-label">Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="signature-text-font" class="css-po3aid" style="font-family: 'Lucida Handwriting', cursive;">{username}</span>
                      </div>
                      <span data-qa="signature-text-user-id" aria-hidden="true" class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="initials-text" class="css-18wjb7a">
                      <span data-qa="initials-text-label" aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="initials-text-font" class="css-po3aid" style="font-family: 'Lucida Handwriting', cursive;">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input
                      type="radio"
                      value="'Brush Script MT', cursive"
                      bind:group={selectedValue}
                    />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="signature-text" class="css-12sxlyp">
                      <span data-qa="signature-text-label">Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="signature-text-font" class="css-po3aid" style="font-family: 'Brush Script MT', cursive;">{username}</span>
                      </div>
                      <span data-qa="signature-text-user-id" aria-hidden="true" class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="initials-text" class="css-18wjb7a">
                      <span data-qa="initials-text-label" aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="initials-text-font" class="css-po3aid" style="font-family: 'Brush Script MT', cursive;">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>

              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input
                      type="radio"
                      value="'Brush Script MT', cursive"
                      bind:group={selectedValue}
                    />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="signature-text" class="css-12sxlyp">
                      <span data-qa="signature-text-label">Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="signature-text-font" class="css-po3aid" style="font-family: cursive; font-style: italic;transform: rotate(-5deg);">{username}</span>
                      </div>
                      <span data-qa="signature-text-user-id" aria-hidden="true" class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="initials-text" class="css-18wjb7a">
                      <span data-qa="initials-text-label" aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="initials-text-font" class="css-po3aid" style="ffont-family: cursive; font-style: italic;   display: inline-block;">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input
                      type="radio"
                      value="'Brush Script MT', cursive"
                      bind:group={selectedValue}
                    />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="signature-text" class="css-12sxlyp">
                      <span data-qa="signature-text-label">Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="signature-text-font" class="css-po3aid" style="font-family: 'Dancing Script', cursive;">{username}</span>
                      </div>
                      <span data-qa="signature-text-user-id" aria-hidden="true" class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="initials-text" class="css-18wjb7a">
                      <span data-qa="initials-text-label" aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="initials-text-font" class="css-po3aid" style="font-family: 'Dancing Script', cursive;">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input
                      type="radio"
                      value="'Segoe Script', cursive"
                      bind:group={selectedValue}
                    />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="signature-text" class="css-12sxlyp">
                      <span data-qa="signature-text-label">Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="signature-text-font" class="css-po3aid" 
                              style="font-family: 'Segoe Script', cursive; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
                          {username}
                        </span>
                      </div>
                      <span data-qa="signature-text-user-id" aria-hidden="true" class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div aria-hidden="true">
                    <div data-qa="initials-text" class="css-18wjb7a">
                      <span data-qa="initials-text-label" aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span data-qa="initials-text-font" class="css-po3aid" 
                              style="font-family: 'Segoe Script', cursive;">
                          {paraphe}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input type="radio" value="elegant-script" bind:group={selectedValue} />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-12sxlyp">
                      <span>Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Edwardian Script', cursive;
                          font-size: 1em;
                          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                          color: #222;
                        ">{username}</span>
                      </div>
                      <span class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-18wjb7a">
                      <span aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Edwardian Script', cursive;
                          font-size: 0.8em;
                        ">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input type="radio" value="casual-tilted" bind:group={selectedValue} />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-12sxlyp">
                      <span>Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Comic Sans MS', cursive;
                          display: inline-block;
                          transform: rotate(-7deg);
                          font-size: 1em;
                          color: #333;
                        ">{username}</span>
                      </div>
                      <span class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-18wjb7a">
                      <span aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Comic Sans MS', cursive;
                          display: inline-block;
                          transform: rotate(5deg);
                        ">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input type="radio" value="professional-mono" bind:group={selectedValue} />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-12sxlyp">
                      <span>Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Courier New', monospace;
                          font-weight: bold;
                          text-decoration: underline;
                          text-decoration-thickness: 2px;
                          text-underline-offset: 4px;
                          letter-spacing: 1px;
                        ">{username}</span>
                      </div>
                      <span class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-18wjb7a">
                      <span aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Courier New', monospace;
                          font-weight: bold;
                        ">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input type="radio" value="artistic-brush" bind:group={selectedValue} />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-12sxlyp">
                      <span>Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Brush Script MT', cursive;
                          font-size: 1em;
                          background: linear-gradient(to right, #555, #000);
                          -webkit-background-clip: text;
                          -webkit-text-fill-color: transparent;
                          display: inline-block;
                          padding-bottom: 2px;
                          border-bottom: 1px solid #999;
                        ">{username}</span>
                      </div>
                      <span class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-18wjb7a">
                      <span aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Brush Script MT', cursive;
                          font-size: 0.8em;
                        ">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input type="radio" value="modern-calligraphy" bind:group={selectedValue} />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-12sxlyp">
                      <span>Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Dancing Script', cursive;
                          color: #222;
                          text-shadow: 1px 1px 0px rgba(0,0,0,0.1),
                                      2px 2px 0px rgba(0,0,0,0.1);
                          line-height: 1;
                        ">{username}</span>
                      </div>
                      <span class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-18wjb7a">
                      <span aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Dancing Script', cursive;
                          font-size: 1em;
                        ">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr data-qa="signature-row" class="css-1achfvd">
                <td class="css-85irbq">
                  <div class="css-13qgaex">
                    <input type="radio" value="stamped-effect" bind:group={selectedValue} />
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-12sxlyp">
                      <span>Signé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Times New Roman', serif;
                          font-weight: bold;
                          border: 2px solid #000;
                          border-radius: 4px;
                          padding: 2px 6px;
                          display: inline-block;
                          transform: rotate(-2deg);
                        ">{username}</span>
                      </div>
                      <span class="css-1j983t3">{code}</span>
                    </div>
                  </div>
                </td>
                <td class="css-85irbq">
                  <div>
                    <div class="css-18wjb7a">
                      <span aria-hidden="true">DS</span>
                      <span class="css-1pdgtej">Paraphé par&nbsp;:</span>
                      <div class="css-fv3lde">
                        <span class="css-po3aid" style="
                          font-family: 'Times New Roman', serif;
                          font-weight: bold;
                        ">{paraphe}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
<br>
        <div style="text-align: left;">
          <label >Select a color of signature</label>
            <input type="color" bind:value={selectedColor} on:input={handleColorChange} />
        </div>
        <div 
            class="preview" 
            style="background-color: {selectedColor};">
            Color selected: {selectedColor}
        </div>
        <br>

        <div style="text-align: left;">
          <label >Select a color of border</label>
            <input type="color" bind:value={selectedColorBorder} on:input={handleColorChangeBorder} />
        </div>
        <div 
            class="preview" 
            style="background-color: {selectedColorBorder};">
            Color selected: {selectedColorBorder}
        </div>

        <div class="create_account" on:click={goToHome}>Back</div>
        <div class="actions">
          <button type="submit" class="login-button bold">Save</button>
        </div>
      </form>
    </div>
  </div>
  {#if addingDrawing}
    <div
      transition:fly={{ y: -200, duration: 500 }}
      class="fixed z-10 top-0 left-0 right-0 border-b border-gray-300 bg-white
      shadow-lg"
      style="height: 50%;"
    >
      <DrawingCanvas
        on:finish={(e) => {
          const { originWidth, originHeight, pathh } = e.detail;
          path = e.detail.path;
          let scale = 1;
          if (originWidth > 500) {
            scale = 500 / originWidth;
          }
          addDrawing(originWidth, originHeight, pathh, scale);
          addingDrawing = false;
        }}
        on:cancel={() => (addingDrawing = false)}
      />
    </div>
  {/if}
  <div class="sign-block" style="height: 64px;width: 220px;position: absolute;top: -70px;" >
    <div class="css-12sxlyp">
      <span>Signé par&nbsp;:</span>
      <div class="css-fv3lde">
        <span class="css-po3aid" style="font-family: Mistral;">{username}</span>
      </div>
      <span class="css-1j983t3">{code}</span>
    </div>
  </div>
</main>

<style>

    .preview {
        padding: 10px;
        border: 1px solid #ccc;
        width: 150px;
        text-align: center;
        color: #fff;
        border-radius: 8px;
    }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f2f2f2;
    max-width: 100%;
  }

  .create_account {
    font-size: 11px;
    text-decoration: underline;
    color: #3ca939;
    text-align: left;
    cursor: pointer;
  }

  .login-box {
    background-color: white;
    padding: 2rem 5rem 3rem 5rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  h1 {
    margin-bottom: 1.5rem;
    color: #333;
  }

  .input-group {
    margin-bottom: 1rem;
    text-align: left;
  }
  .bold {
    font-weight: bold;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .input-group input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #3ca939;
    border-radius: 12px;
  }

  .actions {
    margin-top: 1.5rem;
  }

  .login-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #3ca939;
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
  }

  .login-button:hover {
    background-color: #34a428;
  }

  .title {
    font-size: 24px;
    color: #7d7e7e;
  }

  .menu-item {
    display: flex;
    align-items: center;
    margin-bottom: 7px;
    cursor: pointer;
    border-radius: 30px;
    padding: 5px 5px 5px 13px;
    color: #707070;
    place-content: center;
  }

  .menu-item img {
    margin-right: 0.5rem;
  }
  .block_sign {
    border: 1px solid #3ca939;
    padding: 15px;
    border-radius: 12px;
  }

  .font1 {
    font-family: "Mistral";
  }
  .font2 {
    font-family: "Rage";
  }
  .font3 {
    font-family: cursive;font-style: italic;
  }
  .font4 {
    font-family: monospace;font-style: italic;
  }
  .css-12sxlyp {
    background: none;
    border: none;
    font-size: 11px;
    font-weight: 500;
    line-height: 11px;
    min-width: 140px;
    padding-inline-start: 25px;
    position: relative;
    text-align: start;
  }

  .css-12sxlyp::before {
    border-bottom: 2px solid rgb(0, 92, 185);
    border-inline-start: 2px solid rgb(0, 92, 185);
    border-start-start-radius: 5px;
    border-end-start-radius: 5px;
    border-top: 2px solid rgb(0, 92, 185);
    content: "";
    display: block;
    height: calc(100% - 8px);
    inset-inline-start: 0px;
    position: absolute;
    top: 4px;
    width: 20px;
  }
  .css-12sxlyp::after {
    content: "";
    position: absolute;
    top: 4px;
    bottom: 4px;
    right: 0px;
    border-right: 2px dashed rgb(0, 92, 185);
    width: 30%;
    border-bottom: 2px dashed rgb(0, 92, 185);
    border-top: 2px dashed rgb(0, 92, 185);
    border-bottom-right-radius: 5px;
    border-top-right-radius: 5px;
}
  .css-fv3lde {
    -webkit-box-align: center;
    align-items: center;
    display: flex;
    padding: 10px;
    font-size: 18px;
  }
  .css-1j983t3 {
    display: block;
    max-width: 114px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .css-1achfvd:nth-of-type(2n+1) {
    background-color: rgb(249, 249, 249);
}

.css-ngukmh td:nth-of-type(1) {
    width: 6%;
    text-align: start;
}

.css-85irbq:first-of-type {
    border-inline-start: 3px solid transparent;
    padding-inline-start: 21px;
}
.css-ngukmh td {
    text-align: start;
}
.css-85irbq {
    border-bottom: 1px solid rgb(233, 233, 233);
    padding: 12px;
}
.css-13qgaex {
    min-height: 18px;
    min-width: 18px;
    position: relative;
}

.css-3nnjra {
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
}
.css-10l9226 {
    align-items: flex-start;
    display: inline-flex;
    color: rgb(30, 30, 30);
    min-height: 18px;
    min-width: 18px;
}
.css-ngukmh td:nth-of-type(2) {
    width: 47%;
    text-align: start;
}

.css-ngukmh td {
    text-align: start;
}
.css-85irbq {
    border-bottom: 1px solid rgb(233, 233, 233);
    padding: 12px;
}
.css-85irbq:last-child {
    border-inline-end: none;
    padding-inline-end: 24px;
}
.css-18wjb7a {
    background: none;
    border: none;
    font-size: 11px;
    font-weight: 500;
    line-height: 11px;
    min-width: 140px;
    padding-inline-start: 25px;
    position: relative;
    text-align: start;
    padding-bottom: 11px;
}
.css-18wjb7a::before {
    border-bottom: 2px solid rgb(0, 92, 185);
    border-inline-start: 2px solid rgb(0, 92, 185);
    border-start-start-radius: 5px;
    border-end-start-radius: 5px;
    border-top: 2px solid rgb(0, 92, 185);
    content: "";
    display: block;
    height: calc(100% - 8px);
    inset-inline-start: 0px;
    position: absolute;
    top: 4px;
    width: 20px;
}

.css-18wjb7a::after {
    content: "";
    position: absolute;
    top: 4px;
    bottom: 4px;
    height: calc(100% - 8px);
    right: 0px;
    border-right: 2px dashed rgb(0, 92, 185);
    width: 30%;
    border-bottom: 2px dashed rgb(0, 92, 185);
    border-top: 2px dashed rgb(0, 92, 185);
    border-bottom-right-radius: 5px;
    border-top-right-radius: 5px;
}

</style>
