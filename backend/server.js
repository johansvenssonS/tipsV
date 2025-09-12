import express from 'express';
import cors from 'cors';
import getKupong from './puppeteer.js';
import fs from 'fs/promises';


const DATA_FILE = './lastKupong.json';
const app = express();
const allowedOrigins = [
  'https://johansvenssons.github.io',
  'http://127.0.0.1:3000'
];
app.use(cors({
  origin: allowedOrigins
}));
const PORT = process.env.PORT || 3000;

async function saveKupong(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data), 'utf8');
}

async function loadKupong(){
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

app.get('/kupong', async (req, res) => {
  const today = new Date();
  const day = today.getDay();

  try {
    let kupong;
    if (day !== 4 || day === 5 || day === 6) { // om det är torsdag, fredag eller lördag
      kupong = await getKupong();
      if (kupong) {
        await saveKupong(kupong);
        res.json({ kupong });
      } else {
        res.status(500).json({ error: 'Kunde inte hämta kupongen' });
      }
    } else {
      const lastData = await loadKupong();
      if (lastData) {
        res.json({ kupong: lastData }); // skicka den senaste kupongen om den finns
      } else {
        const kupong = await getKupong();
        await saveKupong(kupong);
        res.json({ kupong });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Något gick fel vid hämtning av kupong', details: error.message });
  }
});
// app.get('/not_thursday', async (req, res) => {
//   try {
//     const kupong = not_thursday();
//     res.json({ kupong });
//   } catch (error) {
//     res.status(500).json({ error: 'Något gick fel vid hämtning av kupong', details: error.message });
//   }
// });

app.get('/', (req, res) => {
  res.send('StrykVänner backend server är igång!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
