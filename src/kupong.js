
export default class Kupong extends HTMLElement {
  constructor() {
    super();
    this.kupong = [];
  }
  async connectedCallback() {
    const today = new Date();
    const day = today.getDay();
    if (day !== 4) { // 4 är torsdag 
      const response = await fetch('https://tipsv.onrender.com/not_thursday');
      const data = await response.json();
      this.kupong = data.kupong || [];
      console.log("det är inte torsdag, använder testdata");
      this.render();
      return;
    } else {
      try {
      const response = await fetch('https://tipsv.onrender.com/kupong');
      const data = await response.json();
      this.kupong = data.kupong || [];
      console.log(this.kupong);
    } catch (error) {
      console.error('något gick fel:', error);
      this.kupong = [];
    }
    }
    
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


