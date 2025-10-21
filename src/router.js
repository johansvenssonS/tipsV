export default class Router extends HTMLElement {
  constructor() {
    super();

    this.currentRoute = "";

    this.allRoutes = {
      "": {
        view: "<home-screen></home-screen>",
        subject: "Main-menu",
      },
      // "packlist": {
      //     view: "<packlist-view></packlist-view>",
      //     name: "Plocklista",
      // },
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
