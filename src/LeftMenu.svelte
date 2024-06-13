<script>
    export let selectedPageIndex;
  </script>
  
  <style>
    .left-menu {
      background-color: #f3f3f3;
      width: 250px;
      height: 100%;
      padding: 20px;
    }
    .left-menu h3 {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    .menu-item {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      cursor: pointer;
    }
    .menu-item img {
      margin-right: 0.5rem;
    }
  </style>
  
  <div class="left-menu">
    <h3>TillScoSign</h3>
    <div class="menu-item">
      <img src="signature_icon.svg" alt="Signature Icon" />
      <span>Signature</span>
    </div>
    <div class="menu-item">
      <img src="initials_icon.svg" alt="Initials Icon" />
      <span>Initials</span>
    </div>
    <div class="menu-item">
      <img src="stamp_icon.svg" alt="Stamp Icon" />
      <span>Stamp</span>
    </div>
    <div class="menu-item">
      <img src="date_signed_icon.svg" alt="Date Signed Icon" />
      <span>Date Signed</span>
    </div>
    <h3>Other Details</h3>
    <div class="menu-item">
      <img src="name_icon.svg" alt="Name Icon" />
      <span>Name</span>
    </div>
    <div class="menu-item">
      <img src="email_icon.svg" alt="Email Icon" />
      <span>Email</span>
    </div>
    <div class="menu-item">
      <img src="company_icon.svg" alt="Company Icon" />
      <span>Company</span>
    </div>
    <div class="menu-item">
      <img src="title_icon.svg" alt="Title Icon" />
      <span>Title</span>
    </div>
    <div class="menu-item">
      <img src="custom_signature_icon.svg" alt="Custom Signature Icon" />
      <span>Custom Signature</span>
    </div>
  </div>
  