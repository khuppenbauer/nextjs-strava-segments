import { createDirectus, staticToken } from "@directus/sdk";

const token = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
const url = process.env.NEXT_PUBLIC_DIRECTUS_URL;

if (!token) {
  throw new Error("NEXT_PUBLIC_DIRECTUS_TOKEN is not defined.");
}

if (!url) {
  throw new Error("NEXT_PUBLIC_DIRECTUS_URL is not defined.");
}

export const directus = createDirectus(String(url)).with(staticToken(token));
