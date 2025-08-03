import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import apiRouter from './api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', apiRouter);

app.get('/', (_req, res) => {
  res.send('Server is up and running 🚀');
});

app.listen(PORT, () => {
  console.log(`⚡️ Server listening at http://localhost:${PORT}`);
});
