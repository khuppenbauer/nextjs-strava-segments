import { graphql } from "@directus/sdk";
import { directus } from "@/lib/directus";
import { SegmentEffortResponse } from "@/types/fields";

const client = directus.with(graphql());

export async function getSegmentEfforts(query: string): Promise<SegmentEffortResponse> {
  return client.query(query);
}
