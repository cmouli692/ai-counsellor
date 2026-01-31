import api from "../api/axios";
export const lockUniversity = (id) => api.post(`/lock/${id}`);
