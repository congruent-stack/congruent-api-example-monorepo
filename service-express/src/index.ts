import './pokemons_routes.js';
import { app } from './setup.js';

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});