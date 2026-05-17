import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // base: "/wallexa/",
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
  },
});
