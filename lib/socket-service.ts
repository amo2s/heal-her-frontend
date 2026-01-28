// lib/socket-service.ts

type EventHandler = (data: any) => void;

export class VerificationSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: { [event: string]: EventHandler[] } = {};
  private shouldReconnect = true;
  private reconnectInterval = 2000;

  constructor(token: string) {
    // 1. Intelligent URL Resolution
    // Automatically switches between ws:// (localhost) and wss:// (production)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const wsBase = apiUrl.replace(/^http/, "ws"); // Replaces http->ws, https->wss
    
    this.url = `${wsBase}/verification/ws/verification?token=${token}`;
    this.connect();
  }

  private connect() {
    console.log(`🔌 Socket Service: Connecting to ${this.url}`);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("✅ Socket Service: Connected");
      this.emitInternal("connect", {});
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Socket Service received:", data);
        
        // Broadcast to specific listeners
        // We map the raw message to the 'verification_result' event you want
        this.emitInternal("verification_result", data);
        
      } catch (e) {
        console.error("Socket Parse Error:", e);
      }
    };

    this.ws.onclose = () => {
      console.log("⚠️ Socket Service: Disconnected");
      if (this.shouldReconnect) {
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    };

    this.ws.onerror = (err) => {
      console.error("❌ Socket Service Error:", err);
    };
  }

  // --- PUBLIC API (Socket.IO Standard Style) ---

  public on(event: string, callback: EventHandler) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  public off(event: string) {
    delete this.listeners[event];
  }

  public disconnect() {
    this.shouldReconnect = false;
    this.ws?.close();
  }

  // --- INTERNAL ROUTER ---
  private emitInternal(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}