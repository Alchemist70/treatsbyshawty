import axios from "axios";

export const API_URL = "https://treatsbyshawty-backend-5dmq.onrender.com";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default axiosInstance;
