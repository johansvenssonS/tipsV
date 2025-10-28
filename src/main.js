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

import Register from "./components/register.js";
customElements.define("register-view", Register);

//ROUTER LOGIC

import Router from "./router.js";
customElements.define("router-outlet", Router);

import Navigation from "./navigation.js";
customElements.define("navigation-outlet", Navigation);
