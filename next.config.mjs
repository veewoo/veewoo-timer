/** @type {import('next').NextConfig} */

import { randomUUID } from "node:crypto";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/~offline", revision: randomUUID() }],
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig = withSerwist({
  reactStrictMode: false,
});

export default nextConfig;
