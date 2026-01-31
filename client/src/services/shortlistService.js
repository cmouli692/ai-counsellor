import api from "../api/axios";
export const addShortlist = (id) => api.post(`/shortlist/${id}`);
export const getShortlist = () => api.get("/shortlist/mine");
