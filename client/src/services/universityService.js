import api from "../api/axios";
export const getUniversities = () => api.get("/universities");
export const getRecommended = () => api.get("/universities/recommended");
