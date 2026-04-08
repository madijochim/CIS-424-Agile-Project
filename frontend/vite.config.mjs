import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Dev: empty base + proxy below → browser calls same origin /api/* (avoids CORS). Override with VITE_API_URL.
  const apiBase =
    env.VITE_API_URL !== undefined && env.VITE_API_URL !== ""
      ? env.VITE_API_URL
      : mode === "development"
        ? ""
        : "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
        },
      },
    },
    define: {
      __API_BASE__: JSON.stringify(apiBase),
    },
  };
});
