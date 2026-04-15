src/echo.js
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: "c3cc214df86b8fe1b7c3",
  cluster: "mt1",
  forceTLS: true,
});

export default echo;