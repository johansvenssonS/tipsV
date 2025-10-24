////COMPONENTS
import Kupong from "./components/kupong.js";
customElements.define("my-kupong", Kupong);

//LANDING VIEW
import Homescreen from "./components/home.js";
customElements.define("landing-view", Homescreen);

///TEAM VIEW
import Team from "./components/team.js";
customElements.define("team-view", Team);

///LOGIN VIEW
import Login from "./components/login.js";
customElements.define("login-view", Login);

//ROUTER LOGIC

import Router from "./router.js";
customElements.define("router-outlet", Router);

import Navigation from "./navigation.js";
customElements.define("navigation-outlet", Navigation);

const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});
