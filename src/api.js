import axios from 'axios';

const api = axios.create({
    // Vite uses import.meta.env instead of process.env
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001'
});

export default api;