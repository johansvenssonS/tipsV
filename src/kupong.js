export default class Kupong extends HTMLElement {
  constructor() {
    super();
    this.kupong = [];
  }
  async connectedCallback() {
    this.innerHTML = `<div class="text-center">
    <div role="status">
        <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span>Hämtar Kupong...</span>
    </div>
</div>`;
    try {
      const response = await fetch("https://tipsv.onrender.com/kupong");
      const data = await response.json();
      this.kupong = data.kupong || [];
      console.log(this.kupong);
    } catch (error) {
      console.error("något gick fel:", error);
      this.kupong = [];
    }
    this.render();
  }

  render() {
    let fixadData = this.kupong.map(this.fixData);
    this.innerHTML = `
      <h2 class="text-xl font-bold mb-2 text-center">Veckans Kupong</h2>
      <div class="flex-start justify-center items-center">
        <table class="w-auto max-w-md bg-white rounded shadow border border-gray-200 text-sm mx-auto">
          <thead>
            <tr>
              <th class="px-2 py-1 text-left">Match</th>
              <th class="px-2 py-1">1</th>
              <th class="px-2 py-1">X</th>
              <th class="px-2 py-1">2</th>
            </tr>
          </thead>
          <tbody>
            ${fixadData
              .map(
                (team, i) =>
                  `<tr>
                <td class="border px-2 py-1 whitespace-nowrap">${team}</td>
                <td class="border px-2 py-1"><button class="outline-btn" data-row="${i}" data-col="1"></button></td>
                <td class="border px-2 py-1"><button class="outline-btn" data-row="${i}" data-col="X"></button></td>
                <td class="border px-2 py-1"><button class="outline-btn" data-row="${i}" data-col="2"></button></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <button class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded">
  Lämna in kupong
  <button>
      </div>
      

    `;

    this.querySelectorAll(".outline-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        btn.classList.toggle("checked");
        btn.innerHTML = btn.classList.contains("checked")
          ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>'
          : "";
      });
    });
    return this;
  }
  fixData(kupong) {
    const str = String(kupong).replace(/^\d+\s*/, "");
    const teamNames = str.split("1X2")[0].trim();
    return teamNames;
  }
}

// matcher console.log
// Öppnar sidan...
// Sidan är öppnad
// [
//   '1Irland - Ungern1X2Tipsinfo1X2Svenska folket44%28%28%Odds2,653,252,95',
//   '2Bolton - Wimbledon1X2Tipsinfo1X2Svenska folket66%20%14%Odds1,584,105,80',
//   '3Doncaster - Bradford1X2Tipsinfo1X2Svenska folket43%25%32%Odds2,283,453,10',
//   '4Huddersfield - Peterborough 1X2Tipsinfo1X2Svenska folket72%15%13%Odds1,524,605,75',
//   '5Lincoln - Wigan1X2Tipsinfo1X2Svenska folket44%28%28%Odds2,353,253,15',
//   '6Plymouth - Stockport1X2Tipsinfo1X2Svenska folket37%22%41%Odds3,303,602,12',
//   '7Port Vale - Leyton Orient1X2Tipsinfo1X2Svenska folket53%23%24%Odds2,283,403,15',
//   '8Rotherham - Exeter1X2Tipsinfo1X2Svenska folket44%25%31%Odds2,333,453,00',
//   '9Wycombe - Mansfield1X2Tipsinfo1X2Svenska folket51%21%28%Odds2,083,553,50',
//   '10Milton Keynes Dons - Grimsby1X2Tipsinfo1X2Svenska folket53%26%21%Odds2,023,503,35',
//   '11Notts County - Fleetwood1X2Tipsinfo1X2Svenska folket59%21%20%Odds1,903,603,65',
//   '12Salford - Tranmere1X2Tipsinfo1X2Svenska folket46%29%25%Odds2,233,403,00',
//   '13Walsall - Chesterfield1X2Tipsinfo1X2Svenska folket43%26%31%Odds2,703,352,45'
// ]

// Add styles for outline-btn and checked state
const style = document.createElement("style");
style.textContent = `
  .outline-btn {
    width: 28px;
    height: 28px;
    border: 2px solid #cbd5e1;
    background: #fff;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s;
    outline: none;
    margin: 0 auto;
  }
  .outline-btn.checked {
    border-color: #38bdf8;
  }
`;
document.head.appendChild(style);
