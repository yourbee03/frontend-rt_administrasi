import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getPenghuni = () => axios.get(`${API_URL}/penghuni`);
export const createPenghuni = (data) => axios.post(`${API_URL}/penghuni`, data, {headers: {
    "Content-Type": "application/json"
}});
export const updatePenghuni = (id, data) => axios.put(`${API_URL}/penghuni/${id}`, data);

export const getRumah = () => axios.get(`${API_URL}/rumah`);
export const createRumah = (data) => axios.post(`${API_URL}/rumah`, data);
export const updateRumah = (id, data) => axios.put(`${API_URL}/rumah/${id}`, data);
export const updateRumahStatus = (rumahId, data) => {
    return axios.put(`/api/rumah/${rumahId}/status`, data);
  };

export const getPenghuniByRumah = (rumahId) => axios.get(`${API_URL}/rumah-penghuni/${rumahId}`);
export const createPenghuniRumah = (data) => axios.post(`${API_URL}/rumah-penghuni`, data);
export const updatePenghuniRumah = (rumahId, data) => axios.put(`${API_URL}/rumah-penghuni/${rumahId}`, data);
export const deletePenghuniRumah = (rumahId, penghuniId) => axios.delete(`${API_URL}/rumah-penghuni/${rumahId}/${penghuniId}`);

export const getHistoricalPenghuni = (rumahId) => axios.get(`${API_URL}/rumah-penghuni/${rumahId}/historical`);
export const getCurrentPenghuni = (rumahId) => axios.get(`${API_URL}/rumah-penghuni/${rumahId}/current`);

export const getPembayaran = () => axios.get(`${API_URL}/pembayaran`);
export const createPembayaran = (data) => axios.post(`${API_URL}/pembayaran`, data);
export const updatePembayaran= (id, data) => axios.put(`${API_URL}/pembayaran/${id}`, data);

export const getPengeluaran = () => axios.get(`${API_URL}/pengeluaran`);
export const createPengeluaran = (data) => axios.post(`${API_URL}/pengeluaran`, data);
