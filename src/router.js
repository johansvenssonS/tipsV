import auth from "./auth.js";

export default class Router extends HTMLElement {
  constructor() {
    super();

    this.currentRoute = "";

    this.allRoutes = {
      "": {
        view: "<landing-view></landing-view",
        subject: "landing-screen",
      },
      login: {
        view: "<login-view></login-view",
        subject: "user-Login",
      },
      team: {
        view: "<team-view></team-view>",
        name: "team-screen",
        requiresAuth: true, // Mark protected routes
      },
    };
  }

  get routes() {
    return this.allRoutes;
  }
  connectedCallback() {
    window.addEventListener("hashchange", () => {
      this.resolveRoute();
    });

    // Listen for auth changes
    window.addEventListener("auth-changed", () => {
      this.resolveRoute();
    });

    this.resolveRoute();
  }

  resolveRoute() {
    this.currentRoute = location.hash.replace("#", "");

    // Kolla om routen behöver loggas in (user-specific)
    const route = this.routes[this.currentRoute];
    if (route && route.requiresAuth && auth.checkExistingLogin) {
      location.hash = "login";
      return;
    }

    this.render();
  }

  render() {
    this.innerHTML =
      this.routes[this.currentRoute]?.view || "<not-found></not-found>";
  }
}
