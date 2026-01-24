import axios from "axios";
import { io, Socket } from "socket.io-client";

// --- CONFIGURATION ---
const API_URL = "http://127.0.0.1:8000";

// --- HELPER: CENTRALIZED LOGOUT ---
// Unified logic for both Axios and Socket failures
const forceLogout = (reason: string) => {
  console.warn(`🚨 Logout triggered: ${reason}`);
  
  // CHANGE 1: Use sessionStorage (clears when tab closes)
  sessionStorage.removeItem("sb-access-token"); 
  
  if (typeof window !== "undefined") {
    // use 'replace' instead of 'href' so the user cannot hit "Back" to return
    window.location.replace(`/login?error=${reason}`);
  }
};

// 1. CREATE SECURE AXIOS INSTANCE
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. REQUEST INTERCEPTOR (Attaches Token)
api.interceptors.request.use(
  (config) => {
    // CHANGE 2: Read from sessionStorage
    const token = sessionStorage.getItem("sb-access-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. RESPONSE INTERCEPTOR (The "Hacker" Trap)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If Backend says "401 Unauthorized" or "403 Forbidden"
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      forceLogout("session_expired");
    }
    return Promise.reject(error);
  }
);

// 4. SECURE SOCKET FACTORY
let socket: Socket | null = null;

export const getSocket = () => {
  // CHANGE 3: Read from sessionStorage
  const token = sessionStorage.getItem("sb-access-token");
  
  // STRICT: If no token exists, do not even attempt a connection
  if (!token) {
    return null;
  }
  
  if (!socket) {
    socket = io(API_URL, {
      auth: { token }, // Handshake Auth
      transports: ["websocket"],
      reconnection: false, // Don't retry if rejected
    });

    // Listen for Backend Kicks
    socket.on("connect_error", (err) => {
      console.error("Socket Auth Failed:", err.message);
      // Only kick if it's an auth error, not a network error
      if (err.message.includes("Unauthorized") || err.message.includes("invalid") || err.message.includes("jwt")) {
         forceLogout("auth_failed");
      }
    });

    socket.on("force_logout", () => {
       forceLogout("multiple_tabs");
    });
  }
  return socket;
};