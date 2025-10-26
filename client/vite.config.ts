import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   proxy: {
  //     "/enter": {
  //       target: "ws://localhost:8000",
  //       changeOrigin: true,
  //       ws: true,
  //       secure: false,
  //     },
  //     "/grid-info": {
  //       target: "ws://localhost:8000",
  //       changeOrigin: true,
  //       ws: true,
  //       secure: false,
  //     },
  //     "/cursor": {
  //       target: "ws://localhost:8000",
  //       changeOrigin: true,
  //       ws: true,
  //       secure: false,
  //     },
  //   },
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
