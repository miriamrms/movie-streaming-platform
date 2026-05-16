import express, { Request, Response } from 'express';
import historyRoutes from './routes/history-routes';

const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ mensagem: "API funcionando!" });
});

app.use('/history', historyRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});