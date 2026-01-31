import api from "../api/axios";
export const getTasks = () => api.get("/tasks");
export const toggleTask = (id) => api.patch(`/tasks/${id}`);
