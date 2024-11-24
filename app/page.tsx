import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPages } from "@/lib/pages";
import { Page } from "@/types/fields";

export default async function Home() {
  const data: Page[] = await getPages({
    fields: ["*", "segments.item.*"],
    sort: ["title"],
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <>
          {data.map((item) => {
            const { id, title, slug } = item;
            return (
              <Card key={id}>
                <CardHeader>
                  <Link href={`/${slug}`}>{title}</Link>
                </CardHeader>
              </Card>
            )
          })}
        </>
      </div>
    </div>
  );
}
