import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { getPages } from "@/lib/pages";
import { Page } from "@/types/fields";

export default async function Home() {
  const data: Page[] = await getPages({
    fields: ["*", "segments.item.*"],
    sort: ["title"],
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <section className="mx-auto flex flex-col items-start gap-2 px-4 py-8 md:py-12 md:pb-8 lg:py-12 lg:pb-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Trail Statistik
        </h1>
      </section>
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
