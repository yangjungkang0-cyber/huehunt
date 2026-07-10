import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/huehunt/",
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
  },
});
