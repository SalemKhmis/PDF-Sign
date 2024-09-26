<script>
  import { createEventDispatcher } from "svelte";
  import DrawingCanvas from "./DrawingCanvas.svelte";
  import { ggID } from "./utils/helper.js";
  import { fly } from "svelte/transition";
  import { save } from "./utils/PDF.js";
  import html2canvas from "html2canvas";

  let email = "salemkhmis003@gmail.com";
  let paraphe = "SK"
  let username = "Salem Khmis";
  let path = localStorage.getItem("path");
  let addingDrawing = false;
  const genID = ggID();
  const dispatch = createEventDispatcher();
  let allObjects = [];
  let selectedValue = '';
  let code ='';
  generateCode(email,username).then(res =>  code = res);
  console.log('code ', code);
  
  

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
  async function handleSubmit() {
    if (email && username) {
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("path", path);
      localStorage.setItem("font", selectedValue);
      localStorage.setItem("codeSign", code);
      alert("Registration successful!");
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
        <div class="input-group">
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
        </div>
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
          </tbody>
        </table>
        
        <p>Selected Value: {selectedValue}</p>

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
  <div class="sign-block" >
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

  input {
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
  .css-fv3lde {
    -webkit-box-align: center;
    align-items: center;
    display: flex;
    padding: 10px;
    font-size: 24px;
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

</style>
