import { createDirectus, rest, staticToken } from "@directus/sdk";
import getConfig from 'next/config';

export interface ItemsQuery {
  limit?: number;
  fields?: Array<string>;
  filter?: Record<string, {
    _eq: string | number;
  }>;
}

const {
  publicRuntimeConfig: { url, token },
} = getConfig();

export const directus = createDirectus(
  String(url),
).with(staticToken(token)
).with(rest()
);
