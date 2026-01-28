import axios from "axios";
import { io, Socket } from "socket.io-client";

// --- CONFIGURATION ---
const API_URL = "https://sliverboy-heal-her-backend.hf.space";

// --- HELPER: CENTRALIZED LOGOUT ---
const forceLogout = (reason: string) => {
  console.warn(`🚨 Logout triggered: ${reason}`);
  sessionStorage.removeItem("sb-access-token"); 
  if (typeof window !== "undefined") {
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
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      forceLogout("session_expired");
    }
    return Promise.reject(error);
  }
);

// 4. SECURE SOCKET FACTORY
let socket: Socket | null = null;

export const getSocket = () => {
  const token = sessionStorage.getItem("sb-access-token");
  
  if (!token) {
    return null;
  }
  
  if (!socket) {
    socket = io(API_URL, {
      path: "/socket.io/",     // Explicit path helps match the backend mount
      auth: { token },         // Sends token in auth handshake
      query: { token },        // Fallback: Sends token in URL (caught by our new backend parser)
      reconnection: true,      // Changed to true for better stability
      withCredentials: true,   // Required for the CORS setup we built
      // ❌ REMOVED: transports: ["websocket"] -> This fixes the connection error
    });

    socket.on("connect_error", (err) => {
      console.error("Socket Auth Failed:", err.message);
      // Only logout on specific auth errors, not network hiccups
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