import express from 'express';
import cors from 'cors';
import getKupong from './puppeteer.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/kupong', async (req, res) => {
  try {
    const kupong = await getKupong();
    res.json({ kupong });
  } catch (error) {
    res.status(500).json({ error: 'Något gick fel vid hämtning av kupong', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('StrykVänner backend server är igång!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
