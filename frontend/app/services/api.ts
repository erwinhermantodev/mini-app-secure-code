// Helper function to convert between formats
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return window.btoa(binary);
};

function createPassword(username: string, password: string): string {
  return `${username}-${password}`;
}

// Function to encrypt the password using Web Crypto API
async function encryptPassword(password: string, key: string): Promise<string> {
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(16));

  // Import the key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    base64ToArrayBuffer(key),
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt"]
  );

  // Encrypt the password
  const encodedPassword = new TextEncoder().encode(password);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    encodedPassword
  );

  // Convert to base64 and combine with IV
  const encryptedBase64 = arrayBufferToBase64(encryptedBuffer);
  const ivBase64 = arrayBufferToBase64(iv);

  return `${ivBase64}:${encryptedBase64}`;
}

const key = "tgK+Gkb9qVIRUSAaHahODfYwbSfW/t7FfugOoeB15jk=";

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

  return response.json();
};

export const loginUser = async (email: string, password: string) => {
  try {
    // Create combined password
    const combinedPassword = createPassword(email, password);

    // Await the encryption result
    const encryptedPassword = await encryptPassword(combinedPassword, key);

    console.log("encryptedPassword:", encryptedPassword);

    // Make the API call
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: encryptedPassword }),
    });

    console.log("response:", response);

    // Parse and return the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
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
