import { defineConfig } from "tsup";

export default defineConfig({
  // Entry points
  entry: ["src/index.ts"],

  // Output settings
  outDir: "dist",
  format: ["cjs"],
  target: "node18",

  // Development optimizations
  splitting: false,
  treeshake: false, // Faster builds in dev
  minify: false, // No minification in dev

  // Source maps for debugging
  sourcemap: true,

  // Clean output directory (only on first build, not on watch)
  clean: true,

  // Watch mode settings
  watch: process.argv.includes("--watch") ? ["src"] : false,
  onSuccess: process.argv.includes("--watch")
    ? "node dist/index.js"
    : undefined,

  // Bundle settings for development
  bundle: true,
  external: [
    "fs",
    "path",
    "crypto",
    "os",
    "util",
    "events",
    "stream",
    "buffer",
    "querystring",
    "url",
    "string_decoder",
    "assert",
    "pg-native",
  ],

  // Keep more external in dev for faster builds
  noExternal: [],

  // Generate type declarations in dev
  dts: true,

  // Environment
  env: {
    NODE_ENV: "development",
  },

  // No optimizations in dev
  esbuildOptions(options) {
    options.keepNames = true;
    // Keep console.log in development
  },

  // Define constants
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
  },
});
