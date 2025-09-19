import { defineConfig } from "tsup";

export default defineConfig({
  // Entry points
  entry: ["src/index.ts", "scripts/migrate.ts"],

  // Output settings
  outDir: "dist",
  format: ["cjs"], // CommonJS for Node.js
  target: "node18", // Target Node.js 18+

  // Code splitting and optimization
  splitting: false, // Disable for single entry point
  treeshake: true, // Enable tree shaking
  minify: true, // Always minify for production builds

  // Source maps
  sourcemap: false, // No source maps in production

  // Clean output directory
  clean: true,

  // Bundle dependencies
  bundle: true,
  external: [
    // Keep Node.js built-ins external
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

    // Keep these as external (they should be installed)
    "pg-native", // Optional pg dependency
  ],

  // Don't bundle node_modules by default (but allow specific ones)
  noExternal: [
    // Bundle these for better performance
    "zod",
    "jose",
  ],

  // TypeScript settings
  dts: false, // Don't generate .d.ts files for production builds

  // Environment variables
  env: {
    NODE_ENV: "production",
  },

  // Plugins and transformations
  esbuildOptions(options) {
    // Always optimize for production builds
    options.drop = ["console", "debugger"]; // Remove console.log and debugger
    options.legalComments = "none"; // Remove comments
    options.keepNames = true; // Keep function names for better error traces
  },

  // Banner for the output file
  banner: {
    js: "#!/usr/bin/env node",
  },

  // Define global constants
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
