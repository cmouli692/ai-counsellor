import api from "../api/axios";
export const chat = (message) =>
  api.post("/ai/counsellor", { message });
