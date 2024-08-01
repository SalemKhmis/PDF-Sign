<script>
    export let selectedPageIndex;
  </script>
  
  <style>
    .right-menu {
        padding: 20px;
        border-right: solid 1px #cbd5e0;
        background: white;
        margin-top: 6%;
        border-top-left-radius: 30px;
        width: 25%;
    }
    .left-menu h3 {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    .menu-item {
      display: flex;
      align-items: center;
      margin-bottom: 7px;
      cursor: pointer;
      border-radius: 30px;
      padding: 5px 5px 5px 13px;
      color: #707070;
    }
    .menu-item img {
      margin-right: 0.5rem;
    }
    .menu-item:hover {
        color: #38a53d; /* Change icon color on hover */
    }
    .active_item{
      border: solid 2px #38a53d;
    }
    .separator{
      border: solid 1.5px #E9E9E9;
      margin: 26px 0px;
    }
    .title{
      font-size: 24px;
      color: #7D7E7E;
    }
  </style>
  
  <div class="right-menu">


    <div class="menu-item">
        <i class="mr-4">
            <svg width="19" height="21" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.76709 17.5856C0.76709 18.3709 1.07907 19.1241 1.6344 19.6795C2.18972 20.2348 2.94291 20.5468 3.72826 20.5468H15.5729C16.3583 20.5468 17.1115 20.2348 17.6668 19.6795C18.2221 19.1241 18.5341 18.3709 18.5341 17.5856V7.54528C18.5337 6.76033 18.2216 6.00767 17.6665 5.45272L13.888 1.6723C13.3327 1.1173 12.5796 0.80557 11.7945 0.805664H3.72826C2.94291 0.805664 2.18972 1.11764 1.6344 1.67297C1.07907 2.2283 0.76709 2.98148 0.76709 3.76683V17.5856ZM5.70236 10.6762C5.44058 10.6762 5.18952 10.7802 5.00441 10.9653C4.8193 11.1504 4.71531 11.4015 4.71531 11.6633C4.71531 11.9251 4.8193 12.1761 5.00441 12.3612C5.18952 12.5463 5.44058 12.6503 5.70236 12.6503H13.5988C13.8606 12.6503 14.1117 12.5463 14.2968 12.3612C14.4819 12.1761 14.5859 11.9251 14.5859 11.6633C14.5859 11.4015 14.4819 11.1504 14.2968 10.9653C14.1117 10.7802 13.8606 10.6762 13.5988 10.6762H5.70236ZM5.70236 14.6244C5.44058 14.6244 5.18952 14.7284 5.00441 14.9135C4.8193 15.0986 4.71531 15.3497 4.71531 15.6115C4.71531 15.8733 4.8193 16.1243 5.00441 16.3094C5.18952 16.4946 5.44058 16.5985 5.70236 16.5985H9.65059C9.91237 16.5985 10.1634 16.4946 10.3485 16.3094C10.5336 16.1243 10.6376 15.8733 10.6376 15.6115C10.6376 15.3497 10.5336 15.0986 10.3485 14.9135C10.1634 14.7284 9.91237 14.6244 9.65059 14.6244H5.70236Z" fill="#BCBCBC"/>
                </svg>
        </i>
      <span>4 Pages</span>
    </div>
  </div>
  