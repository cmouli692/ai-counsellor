import api from "../api/axios";
export const getStage = () => api.get("/stage");
