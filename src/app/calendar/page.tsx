import type { Metadata } from "next";
import MonthCalendar from "@/components/calendar/MonthCalendar";
import { getActivitiesInRange } from "@/lib/activities";
import {
  monthGridRange,
  parseMonthParam,
} from "@/lib/calendarDisplay";
import { SITE_AREA } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Activity calendar",
  description: `Scan free kids activities in ${SITE_AREA} by month or as a daily list.`,
  alternates: { canonical: "/calendar" },
};

type CalendarPageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const params = await searchParams;
  const { year, month } = parseMonthParam(params.month);
  const { gridStart, gridEnd } = monthGridRange(year, month);
  const activities = await getActivitiesInRange(gridStart, gridEnd);

  return (
    <main className="bg-sky-50">
      <section className="mx-auto max-w-[90rem] px-3 py-6 md:px-4 md:py-8">
        <MonthCalendar year={year} month={month} activities={activities} />
      </section>
    </main>
  );
}
