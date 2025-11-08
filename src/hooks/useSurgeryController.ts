"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  ScheduledSurgery,
  OngoingSurgery,
  StaffMember,
} from "@/types";

type Shift = "Pagi" | "Siang" | "Malam";

interface ShiftJaga {
  anesthesiaTeam: StaffMember[];
  nurseTeams: {
    Pagi: StaffMember[];
    Siang: StaffMember[];
    Malam: StaffMember[];
  };
}

// interface AssignedTeamRef {
//   anesthesiologistId: string;
//   nurseIds: string[];
// }

interface LiveEntryPayload
  extends Omit<OngoingSurgery, "startTime" | "actualStartTime"> {
  patientName: string;
  mrn: string;
  caseId: string;
  anesthesiologistName: string;
  actualStartTime?: string | null;
}

// interface ApiErrorResponse {
//   error?: string;
// }

// ✅ Fungsi bantu untuk shift sekarang
export const getCurrentShift = (): Shift => {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 14) return "Pagi";
  if (hour >= 14 && hour < 21) return "Siang";
  return "Malam";
};

// ✅ Fungsi bantu untuk parse JSON
const parseJsonSafely = (text: string, endpointName: string) => {
  if (!text || text.trim() === "") {
    return endpointName.includes("shift-assignments") ? null : [];
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`JSON Error in ${endpointName}:`, text, e);
    throw new Error(`Gagal mengurai JSON dari ${endpointName}.`);
  }
};

// --------------------------------------------------------------
// 🔥 Custom Hook: useSurgeryController
// --------------------------------------------------------------
export function useSurgeryController() {
  const [schedule, setSchedule] = useState<ScheduledSurgery[]>([]);
  const [liveOperations, setLiveOperations] = useState<OngoingSurgery[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [assignments, setAssignments] = useState<ShiftJaga | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loadingLive, setLoadingLive] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];

  // Staff lookup map
  const staffMap = useMemo(() => {
    return staff.reduce((map, s) => {
      map[s.id] = s;
      return map;
    }, {} as Record<string, StaffMember>);
  }, [staff]);

  // ✅ Fungsi utama: Load semua data
  const loadAll = useCallback(async () => {
    setLoadingLive(true);
    try {
      const scheduleApi = "/api/schedule";
      const liveApi = `/api/operasi?tanggal=${todayStr}`;
      const staffApi = "/api/staffs";
      const shiftApi = "/api/shift-assignments";

      const [scheduleRes, liveRes, staffRes, shiftRes] = await Promise.all([
        fetch(scheduleApi),
        fetch(liveApi),
        fetch(staffApi),
        fetch(shiftApi),
      ]);

      if (!scheduleRes.ok || !liveRes.ok || !staffRes.ok || !shiftRes.ok) {
        throw new Error("Gagal memuat data dari satu atau lebih API.");
      }

      const scheduleText = await scheduleRes.text();
      const liveText = await liveRes.text();
      const staffText = await staffRes.text();
      const shiftText = await shiftRes.text();

      const scheduleData = parseJsonSafely(scheduleText, scheduleApi) as ScheduledSurgery[];
      const liveData = parseJsonSafely(liveText, liveApi) as OngoingSurgery[];
      const staffData = parseJsonSafely(staffText, staffApi) as StaffMember[];
      const shiftData = parseJsonSafely(shiftText, shiftApi) as ShiftJaga | null;

      const todaySchedule = scheduleData
        .filter((s) => s.scheduledAt.startsWith(todayStr) && s.status !== "Dibatalkan")
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

      setSchedule(todaySchedule);
      setLiveOperations(liveData);
      setStaff(staffData);
      setAssignments(shiftData);
    } catch (err) {
      console.error("❌ Gagal memuat data:", err);
      toast.error(err instanceof Error ? err.message : "Kesalahan memuat data papan kendali");
    } finally {
      setLoadingLive(false);
    }
  }, [todayStr]);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  // ✅ Update status otomatis (dengan auto handover)
  const updateSurgeryStatus = useCallback(
    async (id: string, payload: Partial<ScheduledSurgery>): Promise<void> => {
      try {
        setUpdatingId(id);
        const newStatus = payload.status;
        if (!newStatus) throw new Error("Status baru tidak ditemukan.");

        const surgery = schedule.find((s) => s.id === id);
        if (!surgery) throw new Error("Data pasien tidak ditemukan.");

        // --- Auto handover ---
        if (newStatus === "Pasien Diterima") {
          const anesthesiologistId = surgery.assignedTeam?.anesthesiologistId || "";
          const anesthesiologistName =
            staffMap[anesthesiologistId]?.name || "Anestesi Belum Ditugaskan";

          const newLiveEntry: LiveEntryPayload = {
            id: surgery.id,
            procedure: surgery.procedure,
            doctorName: surgery.doctorName,
            patientName: surgery.patientName,
            mrn: surgery.mrn,
            caseId: surgery.mrn,
            anesthesiologistName,
            operatingRoom: surgery.assignedOR || "OK Antrian",
            status: "Pasien Diterima",
            team: {
              anesthesiologistId,
              nurseIds: surgery.assignedTeam?.nurseIds || [],
            },
            actualStartTime: new Date().toISOString(),
          };

          const res = await fetch("/api/handover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              surgery,
              notes: "Pasien diterima otomatis dari papan kendali.",
              receivingTeam: [],
              liveEntry: newLiveEntry,
            }),
          });

          if (!res.ok) throw new Error("Gagal melakukan handover otomatis.");
          toast.success(`✅ Pasien ${surgery.patientName} diterima di OK.`);
          await loadAll();
          return;
        }

        // --- Fase operasi aktif ---
        const isOngoingPhase = [
          "Persiapan Operasi",
          "Operasi Berlangsung",
          "Operasi Selesai",
          "Ruang Pemulihan",
          "Recovery",
        ].includes(newStatus);

        const endpoint = isOngoingPhase
          ? `/api/operasi/${id}`
          : `/api/schedule/${id}`;

        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Gagal update status operasi.");
        toast.success(`Status pasien diperbarui ke "${newStatus}"`);
        await loadAll();
      } catch (error) {
        console.error("⚠️ updateSurgeryStatus Error:", error);
        toast.error(error instanceof Error ? error.message : "Gagal memperbarui status operasi");
      } finally {
        setUpdatingId(null);
      }
    },
    [schedule, staffMap, loadAll]
  );

  return {
    schedule,
    liveOperations,
    staff,
    assignments,
    updatingId,
    loadingLive,
    staffMap,
    loadAll,
    updateSurgeryStatus,
  };
}
