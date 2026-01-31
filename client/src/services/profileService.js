import api from "../api/axios";

export const saveProfile = (data) => api.post("/profile", data);
export const getProfile = () => api.get("/profile/me");

