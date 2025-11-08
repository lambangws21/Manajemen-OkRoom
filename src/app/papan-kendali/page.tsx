"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ScheduledSurgery, StaffMember, OngoingSurgery } from "@/types";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/ui/card";
import { Badge } from "@/components/ui/ui/badge";
import {
  Users,
  Activity,
  SkipForward,
  Sun,
  SunsetIcon,
  MoonStarIcon,
  Loader2,
  Clock,
  Trash2,
  GlassesIcon,
  HandshakeIcon,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/ui/table";
import RoomGrid from "@/components/dashboard/RoomGrid";
import StatusActionButton from "@/components/kendali/StatusActionButton";
import { Button } from "@/components/ui/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/ui/alert-dialog";
import PatientTrackerModal from "@/components/tracker/patient-tracter-modal";
import Link from "next/link";
import ShareStatusButton from "@/components/share/share-button";

type Shift = "Pagi" | "Siang" | "Malam";

interface ShiftJaga {
  anesthesiaTeam: StaffMember[];
  nurseTeams: {
    Pagi: StaffMember[];
    Siang: StaffMember[];
    Malam: StaffMember[];
  };
}

// ✅ Gunakan formatter zona waktu Indonesia (WIB)
const formatTimeWIB = (time?: string | null) => {
  if (!time) return "-";
  return new Date(time).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const getCurrentShift = (): Shift => {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 14) return "Pagi";
  if (hour >= 14 && hour < 21) return "Siang";
  return "Malam";
};

export default function PapanKendaliPage() {
  const [schedule, setSchedule] = useState<ScheduledSurgery[]>([]);
  const [liveOperations, setLiveOperations] = useState<OngoingSurgery[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [assignments, setAssignments] = useState<ShiftJaga | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(
    null
  );
  const [loadingLive, setLoadingLive] = useState(true);

  const todayStr = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Jakarta",
  });

  const loadAll = useCallback(async () => {
    setLoadingLive(true);
    try {
      const [scheduleRes, liveRes, staffRes, shiftRes] = await Promise.all([
        fetch("/api/schedule"),
        fetch(`/api/operasi?tanggal=${todayStr}`),
        fetch("/api/staffs"),
        fetch("/api/shift-assignments"),
      ]);

      const [scheduleJson, liveJson, staffJson, shiftJson] = await Promise.all([
        scheduleRes.json(),
        liveRes.json(),
        staffRes.json(),
        shiftRes.json(),
      ]);

      const scheduleData: ScheduledSurgery[] = Array.isArray(scheduleJson)
        ? scheduleJson
        : scheduleJson?.data || [];

      const liveData: OngoingSurgery[] = Array.isArray(liveJson)
        ? liveJson
        : liveJson?.data || [];

      const staffData: StaffMember[] = Array.isArray(staffJson)
        ? staffJson
        : staffJson?.data || [];

      const shiftData: ShiftJaga | null =
        typeof shiftJson === "object" && shiftJson !== null
          ? (shiftJson as ShiftJaga)
          : null;

      const todaySchedule = scheduleData
        .filter(
          (s) =>
            typeof s.scheduledAt === "string" &&
            s.scheduledAt.startsWith(todayStr) &&
            s.status !== "Dibatalkan"
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        );

      setSchedule(todaySchedule);
      setLiveOperations(liveData);
      setStaff(staffData);
      setAssignments(shiftData);
    } catch (err) {
      console.error("❌ Gagal memuat data:", err);
      toast.error("Gagal memuat data papan kendali");
    } finally {
      setLoadingLive(false);
    }
  }, [todayStr]);

  const updateSurgeryStatus = useCallback(
    async (surgery: ScheduledSurgery, nextStatus: string) => {
      setUpdatingId(surgery.id);
      try {
        if (nextStatus === "Pasien Diterima") {
          const anesthesiologistName =
            staff.find((s) => s.id === surgery.assignedTeam?.anesthesiologistId)
              ?.name || "Belum ditentukan";

          const payload = {
            surgery,
            notes: "Pasien diterima otomatis dari papan kendali.",
            receivingTeam: [],
            liveEntry: {
              id: surgery.id,
              procedure: surgery.procedure,
              doctorName: surgery.doctorName,
              patientName: surgery.patientName,
              mrn: surgery.mrn,
              caseId: surgery.mrn,
              anesthesiologistName,
              operatingRoom: surgery.assignedOR || "Belum ditentukan",
              status: "Persiapan Operasi",
              actualStartTime: new Date().toISOString(),
            },
          };

          const res = await fetch("/api/handover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error("Gagal melakukan handover");
          toast.success(`✅ ${surgery.patientName} diterima di OK`);
          await loadAll();
          return;
        }

        const res = await fetch(`/api/schedule/${surgery.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });

        if (!res.ok) throw new Error("Gagal memperbarui status");
        toast.success(`${surgery.patientName}`, {
          description: `Status diubah menjadi: ${nextStatus}`,
        });
        await loadAll();
      } catch (err) {
        console.error("❌ Update gagal:", err);
        toast.error("Gagal memperbarui status");
      } finally {
        setUpdatingId(null);
      }
    },
    [staff, loadAll]
  );

  const confirmDelete = (surgery: ScheduledSurgery) => {
    setDeleting({ id: surgery.id, name: surgery.patientName });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/schedule/${deleting.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus data");
      toast.success(`🗑️ Jadwal ${deleting.name} berhasil dihapus`);
      await loadAll();
    } catch {
      toast.error("Gagal menghapus data");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 90000);
    return () => clearInterval(interval);
  }, [loadAll]);

  const { currentSurgeries, nextInQueueByOR } = useMemo(() => {
    const current = liveOperations.filter(
      (s) => s.status === "Operasi Berlangsung"
    );
    const queued = liveOperations.filter((s) =>
      [
        "Siap Panggil",
        "Dipanggil",
        "Pasien Diterima",
        "Persiapan Operasi",
      ].includes(s.status)
    );
    return { currentSurgeries: current, nextInQueueByOR: queued };
  }, [liveOperations]);

  const canUpdateStatus = (status: string) =>
    ["Terkonfirmasi", "Siap Panggil"].includes(status);

  return (
    <div className="p-4 md:p-6 dark:bg-gray-900 min-h-screen">
      <Toaster position="top-right" richColors />

      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Papan Kendali Operasi - Hari Ini
        </h1>
        <div className="flex items-center gap-4">
          <Badge className="p-1 pr-4 pl-4 border-0 outline-1 rounded bg-amber-500/50 text-sm">
            <GlassesIcon size={28} className="mr-2 dark:text-amber-200 text-slate-700" />{" "}
            {schedule.length} Pasien
          </Badge>
          {schedule.length > 0 && <PatientTrackerModal surgery={schedule[0]} />}
          <Link href={"/operasi"} className="flex items-center p-1 pr-4 pl-4 border-0 outline-1 dark:outline-green-500/50 rounded bg-green-500/50 text-sm">  <HandshakeIcon size={18} className="mr-2 dark:text-amber-100 text-slate-700" />pasienku</Link>
         
        </div>
      </header>

      {/* Grid Informasi */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operasi Berlangsung */}
        <Card>
          <CardHeader className="flex items-center">
            <Activity size={18} className="mr-2 text-red-500" />
            <CardTitle>Operasi Berlangsung</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLive ? (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin mr-2" />
                Memuat data live...
              </div>
            ) : currentSurgeries.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Tidak ada operasi yang sedang berlangsung.
              </p>
            ) : (
              <div
                className={`grid gap-3 ${
                  currentSurgeries.length > 5
                    ? "grid-cols-1 md:grid-cols-2 max-h-60 overflow-y-auto"
                    : "grid-cols-1"
                }`}
              >
                {currentSurgeries.map((surgery) => (
                  <div
                    key={surgery.id}
                    className="p-2 border-l-4 border-red-500 bg-red-100/40 rounded-md shadow-lg dark:shadow-pink-400/20  dark:bg-red-900/30"
                  >
                    <p className="font-bold text-gray-800 dark:text-gray-100">
                      {surgery.patientName} ({surgery.mrn})
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {surgery.operatingRoom} (Dr. {surgery.doctorName})
                    </p>
                    <p className="text-xs flex items-center gap-1 text-gray-500">
                      <Clock size={12} /> Mulai:{" "}
                      {formatTimeWIB(surgery.actualStartTime)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Antrian Berikutnya */}
        <Card>
          <CardHeader className="flex items-center">
            <SkipForward size={18} className="mr-2 text-green-500" />
            <CardTitle>Antrian Berikutnya</CardTitle>
          </CardHeader>
          <CardContent >
            {loadingLive ? (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin mr-2" />
                Mengkalkulasi antrian...
              </div>
            ) : nextInQueueByOR.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Tidak ada pasien dalam antrian.
              </p>
            ) : (
              <div
                className={`grid gap-2 ${
                  nextInQueueByOR.length > 5
                    ? "grid-cols-1 md:grid-cols-2 max-h-60 overflow-y-auto"
                    : "grid-cols-1"
                }`}
              >
                {nextInQueueByOR.map((surgery) => (
                  <div
                    key={surgery.id}
                    className="p-2 border-l-4 border-green-500 bg-green-100/40 rounded-md dark:bg-green-900/30 shadow-md dark:shadow-green-300/40"
                  >
                    <p className="font-bold text-gray-800 dark:text-gray-100">
                      {surgery.patientName} {surgery.caseId}
                    </p>
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                      <span>
                        {surgery.operatingRoom} (Dr. {surgery.doctorName})
                      </span>
                      <Badge variant="secondary">{surgery.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tim Jaga */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center">
              <Users size={18} className="mr-2 text-blue-500" />
              <CardTitle>Tim Jaga Hari Ini</CardTitle>
            </div>

            {/* 🕒 Penanda Shift Aktif */}
            <Badge variant="default" className="bg-blue-600 text-white">
              Shift Aktif: {getCurrentShift()}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Dokter Anestesi */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-1">
                Dokter Anestesi
              </h4>
              <ul
                className={`text-xs text-gray-600 dark:text-gray-400 space-y-1 ${
                  (assignments?.anesthesiaTeam?.length ?? 0) > 5
                    ? "max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 shadow-inner"
                    : ""
                }`}
              >
                {assignments?.anesthesiaTeam?.length ? (
                  assignments.anesthesiaTeam.map((staff) => (
                    <li
                      key={staff.id}
                      className="border-l-2 border-blue-400 bg-blue-600/30 dark:bg-blue-500/30 text-slate-700 dark:text-slate-100  p-1 pl-3 rounded"
                    >
                      {staff.name}
                    </li>
                  ))
                ) : (
                  <li className="italic text-gray-400">Belum diatur</li>
                )}
              </ul>
            </div>

            {/* Perawat */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-1">
                Perawat Berdasarkan Shift
              </h4>

              <div className="flex flex-col md:flex-row gap-3">
                {(["Pagi", "Siang", "Malam"] as const).map((shift) => {
                  const isActive = getCurrentShift() === shift;
                  const nurses = assignments?.nurseTeams?.[shift] ?? [];
                  const bgColor =
                    shift === "Pagi"
                      ? "bg-green-500/30 border-green-400"
                      : shift === "Siang"
                      ? "bg-yellow-500/30 border-yellow-400"
                      : "bg-purple-500/30 border-purple-400";

                  const icon =
                    shift === "Pagi" ? (
                      <Sun size={14} />
                    ) : shift === "Siang" ? (
                      <SunsetIcon size={14} />
                    ) : (
                      <MoonStarIcon size={14} />
                    );

                  return (
                    <div key={shift} className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5
                          className={`font-semibold text-xs ${
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {isActive ? " " : ""}Shift {shift}
                        </h5>
                        {isActive && (
                          <Badge
                            variant="default"
                            className="text-[10px] rounded-md border-blue-400 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                          >
                            Aktif
                          </Badge>
                        )}
                      </div>

                      {nurses.length ? (
                        <ul
                          className={`text-xs text-gray-600 dark:text-gray-200 space-y-1 ${
                            nurses.length > 5
                              ? "max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600"
                              : ""
                          }`}
                        >
                          {nurses.map((staff) => (
                            <li
                              key={staff.id}
                              className={`flex items-center gap-2 border-l-2 ${bgColor} p-1 rounded ${
                                isActive
                                  ? "ring-1 ring-blue-400 dark:ring-blue-500"
                                  : ""
                              }`}
                            >
                              {icon} {staff.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-gray-400 text-xs">Kosong</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLE & ROOM GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="h-[80vh] flex flex-col">
          <CardHeader>
            <CardTitle>Jadwal & Kendali Pasien</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto scrollbar-thin">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pasien</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Ruang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.length ? (
                  schedule.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <b>{s.patientName}</b>
                        <div className="text-xs text-gray-500">
                          {s.procedure}
                        </div>
                      </TableCell>
                      <TableCell>{formatTimeWIB(s.scheduledAt)}</TableCell>
                      <TableCell>{s.assignedOR || "Belum diatur"}</TableCell>
                      <TableCell className="flex gap-2">
                        {canUpdateStatus(s.status) ? (
                          <StatusActionButton
                            surgery={s}
                            onUpdateStatus={updateSurgeryStatus}
                            isUpdating={updatingId === s.id}
                          />
                        ) : (
                          <Badge className="bg-gray-200/10 rounded p-1 border-l-4 border-yellow-600 animate-pulse">
                            {s.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell >
                        <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDelete(s)}
                        >
                          <Trash2 size={14} className="text-red-400 dark:text-slate-100"/>
                        </Button>
                        <ShareStatusButton mrn={s.mrn} />
                        </div>
                       
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center italic text-gray-400"
                    >
                      Tidak ada jadwal hari ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Visualisasi Ruangan */}
        <Card className="h-[80vh] flex flex-col">
          <CardHeader>
            <CardTitle>Visualisasi Kamar Operasi</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            <RoomGrid filters={{ search: "", status: "All" }} />
          </CardContent>
        </Card>
      </div>

      {/* Modal Konfirmasi Hapus */}
      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
            <AlertDialogDescription>
              Jadwal <b>{deleting?.name}</b> akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
