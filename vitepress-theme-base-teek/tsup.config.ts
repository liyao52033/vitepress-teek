import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./config/index.ts'],
  format: ["esm"],
  target: 'esnext',
  dts: true,
  outDir: 'dist',
  shims: false,
  clean: true,
  sourcemap: false,
  silent: true,
  splitting: false
})