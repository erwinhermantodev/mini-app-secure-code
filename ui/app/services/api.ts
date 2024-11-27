// src/services/api.ts
import axios from "axios";
import { useAuth } from "../context/authContext";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // Replace with your API base URL
});

apiClient.interceptors.request.use((config) => {
  const { token } = useAuth();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data.accessToken;
  } catch (error) {
    throw new Error("Login failed");
  }
};

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  } catch (error) {
    throw new Error("Unable to fetch profile");
  }
};

export const updateUserProfile = async (profile: {
  name: string;
  email: string;
}) => {
  try {
    const response = await apiClient.put("/auth/profile", profile);
    return response.data;
  } catch (error) {
    throw new Error("Profile update failed");
  }
};
