const BASE_URL = "http://localhost:3000/auth";

export const registerUser = async (
  email: string,
  name: string,
  password: string
) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });
  console.log("response");
  console.log(response);
  return response.json();
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  console.log("response");
  console.log(response);
  return response.json();
};

export const getUserProfile = async (token: string) => {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(response);
  return response.json();
};

export const updateUserProfile = async (
  token: string,
  name: string,
  email: string
) => {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email }),
  });
  return response.json();
};

export const updatePassword = async (
  token: string,
  currentPassword: string,
  password: string
) => {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, password }),
  });
  return response.json();
};
