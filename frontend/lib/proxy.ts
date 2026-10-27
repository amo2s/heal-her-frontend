import axios from "axios";
import { io, Socket } from "socket.io-client";

// --- CONFIGURATION ---
const NEXTJS_PROXY_BASE = ""; 
const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://sliverboy-healher-backend.hf.space";

// --- 1. THE GHOST API (Dumb Messenger) ---
export const api = axios.create({
  baseURL: NEXTJS_PROXY_BASE,
  timeout: 15000, 
  headers: { "Content-Type": "application/json" },
  // CRITICAL: This allows the browser to send the HttpOnly cookies to the proxy
  withCredentials: true, 
});

// --- 2. RESPONSE INTERCEPTOR (No Panic Mode) ---
//api.interceptors.response.use(
  //(response) => response,
  //(error) => {
    // We only log the error. We STOP the auto-logout for now.
    // This allows us to see the 401 in the console without getting kicked to /login.
    //console.error("[API ERROR]:", error.response?.status, error.response?.data);
    //return Promise.reject(error);
  //}
//);

// --- 3. THE GHOST SOCKET ---
let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: "/socket.io/",
      withCredentials: true, // Uses cookies automatically
      reconnection: true,
    });

    socket.on("connect_error", (err) => console.warn("[SOCKET ERROR]:", err.message));
    socket.on("connect", () => console.log("[SOCKET] Connected."));
  }
  return socket;
};