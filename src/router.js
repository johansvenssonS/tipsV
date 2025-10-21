export default class Router extends HTMLElement {
  constructor() {
    super();

    this.currentRoute = "";

    this.allRoutes = {
      "": {
        view: "<landing-view></landing-view",
        subject: "Landing-screen",
      },
      team: {
        view: "<team-view></team-view>",
        name: "team-screen",
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

    this.resolveRoute();
  }

  resolveRoute() {
    this.currentRoute = location.hash.replace("#", "");

    this.render();
  }

  render() {
    this.innerHTML =
      this.routes[this.currentRoute]?.view || "<not-found></not-found>";
  }
}
