
export default class Kupong extends HTMLElement {
  constructor() {
    super();
    this.kupong = [];
  }
  async connectedCallback() {
    const response = await fetch('https://tipsv.onrender.com/kupong');
    const data = await response.json();
    this.kupong = data.kupong || [];
    this.render();
  }

  render() {
    this.innerHTML = `
      <h2>Här är kupongen</h2>
      <ul>
        ${this.kupong.map(match => `<li>${match}</li>`).join('')}
      </ul>
    `;
    return this;
  }
}


