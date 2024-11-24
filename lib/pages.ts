import { readItems, rest } from "@directus/sdk";

import { directus } from "@/lib/directus";
import { ItemsQuery } from "@/types/fields";

/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function getPages(options?: ItemsQuery): Promise<any[]> {
  return directus.with(rest(
    { onRequest: (options) => ({ ...options, cache: 'no-store' })}
  )).request(readItems("pages", options));
}
