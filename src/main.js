////COMPONENTS
import Kupong from "./components/kupong.js";
customElements.define("my-kupong", Kupong);

//LANDING VIEW
import Homescreen from "./components/home.js";
customElements.define("landing-view", Homescreen);

///TEAM VIEW
import Team from "./components/team.js";
customElements.define("team-view", Team);

//ROUTER LOGIC

import Router from "./router.js";
customElements.define("router-outlet", Router);

import Navigation from "./navigation.js";
customElements.define("navigation-outlet", Navigation);
