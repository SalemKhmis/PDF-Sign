<script>
    import { createEventDispatcher } from 'svelte';
    import LogoMenu from "./components/LogoMenu.svelte";
  
    let email = '';
    let password = '';
    const dispatch = createEventDispatcher();
  
    async function handleSubmit() {
      if (email && password) {
        // const response = await fetch('http://127.0.0.1:5000/auth/login', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({
        //     "username": email,
        //   "password": password
        //   })
        // });
  
        // if (response.ok) {
          dispatch('login', {
          "username": email,
          "password": password
        });
        // } else {
        //   alert('Login failed. Please check your credentials.');
        // }
      } else {
        alert('Please enter both email and password');
      }
    }
  
    function goToRegister() {
      dispatch('goToRegister');
    }
  </script>
  
  <main class="container">
    <div class="content">
      <div class="menu-item">
        <LogoMenu />
        <span class="title">Tillsco<strong>Sign</strong> </span>
      </div>
      <div class="login-box">
        <h1>LOGIN</h1>
        <form on:submit|preventDefault={handleSubmit}>
          <div class="input-group">
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="Email" bind:value={email} />
          </div>
          <div class="input-group">
            <label for="password">Password</label>
            <input id="password" type="password" placeholder="Password" bind:value={password} />
          </div>
          <div class="create_account" on:click={goToRegister}>Create an account</div>
          <div class="actions">
            <button type="submit" class="login-button">Login</button>
          </div>
        </form>
      </div>
    </div>
  </main>
  
  <style>
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f2f2f2;
      max-width: 100%;
    }
  
    .content {
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
  
    .create_account {
      font-size: 11px;
      text-decoration: underline;
      color: #3ca939;
      text-align: right;
      cursor: pointer;
    }
  
    .login-box {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
      margin-top: 20px;
    }
  
    h1 {
      margin-bottom: 1.5rem;
      color: #333;
    }
  
    .input-group {
      margin-bottom: 1rem;
      text-align: left;
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
      justify-content: center;
    }
  
    @media (max-width: 768px) {
      .login-box {
        padding: 1.5rem;
      }
  
      .menu-item {
        margin-bottom: 10px;
      }
  
      .title {
        font-size: 20px;
      }
  
      .login-button {
        padding: 0.6rem;
      }
  
      .create_account {
        font-size: 10px;
      }
    }
  </style>
  