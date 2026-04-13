import axios from 'axios';

// Aqui centralizamos a URL. 
// O Vite vai tentar ler do Docker/ambiente, se não achar, usa o localhost:5002
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
