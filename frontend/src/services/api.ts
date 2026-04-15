import axios from 'axios';

// Aqui está o segredo:
// Localmente ele usa a porta 5002. 
// Na Vercel, ele vai ler a URL que configurarmos lá.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002',
});

export default api;