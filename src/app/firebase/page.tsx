// app/page.tsx
"use client";

import ScheduleTable from "@/components/schedule/ScheduleTable";
import StaffsManager from "@/components/staff-manajemen/staffManajer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        <ScheduleTable />
        <StaffsManager/>
      </div>
    </main>
  );
}
