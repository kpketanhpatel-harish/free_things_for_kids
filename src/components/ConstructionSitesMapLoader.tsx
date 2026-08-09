"use client";

import dynamic from "next/dynamic";
import type { ConstructionSite } from "@/types";

const ConstructionSitesMap = dynamic(
  () => import("@/components/ConstructionSitesMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[22rem] items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-sm text-amber-900 md:h-[28rem]">
        Loading map…
      </div>
    ),
  },
);

export default function ConstructionSitesMapLoader({
  sites,
}: {
  sites: ConstructionSite[];
}) {
  return <ConstructionSitesMap sites={sites} />;
}
