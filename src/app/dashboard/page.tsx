"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  Pencil,
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
import { Input } from "@/components/ui/ui/input"; // 💥 Impor Input
import { Label } from "@/components/ui/ui/label"; // 💥 Impor Label
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

// Definisikan tipe Shift secara konstan
const SHIFTS = ["Pagi", "Siang", "Malam"] as const;

// Detail untuk ikon di UI (Anda sudah punya Sun, SunsetIcon, MoonStarIcon)
const SHIFT_DETAILS = {
  Pagi: { icon: Sun },
  Siang: { icon: SunsetIcon },
  Malam: { icon: MoonStarIcon },
};

type ResponsibleStaffByShift = {
  [key in Shift]: StaffMember | null;
};

interface ShiftJaga {
  anesthesiaTeam: StaffMember[];
  nurseTeams: {
    Pagi: StaffMember[];
    Siang: StaffMember[];
    Malam: StaffMember[];
  };
  responsibleStaffByShift: ResponsibleStaffByShift; // 👈 GANTI DENGAN INI
}

// Tambahkan properti opsional agar kompatibel dengan OngoingSurgery
interface LiveEntryPayload extends Omit<OngoingSurgery, "startTime" | "team"> {
  patientName: string;
  mrn: string;
  anesthesiologistName: string;
  actualStartTime: string;
}

// ------------------------------------------------------------------
// Komponen Modal Edit Jadwal (Didefinisikan secara lokal)
// ------------------------------------------------------------------

interface ScheduleEditModalProps {
  surgery: ScheduledSurgery;
  onClose: () => void;
  onSave: (updatedData: Partial<ScheduledSurgery>) => Promise<void>;
  staffList: StaffMember[]; // Daftar staf untuk dropdown
}

const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({
  surgery,
  onClose,
  onSave,
  staffList,
}) => {
  const [formData, setFormData] = useState<Partial<ScheduledSurgery>>({
    scheduledAt: surgery.scheduledAt,
    assignedOR: surgery.assignedOR,
    doctorName: surgery.doctorName,
    procedure: surgery.procedure,
    // Kita asumsikan ada assignedTeam di sini untuk mendapatkan ID anestesi
    assignedTeam: surgery.assignedTeam,
  });

  const [isSaving, setIsSaving] = useState(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      firstInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInputRef.current?.focus();
    }, 250); // Delay 250ms biar animasi modal sempat tampil
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const changes: Partial<ScheduledSurgery> = {};

      if (formData.scheduledAt) {
        changes.scheduledAt = new Date(formData.scheduledAt).toISOString();
      }
      if (formData.assignedOR) changes.assignedOR = formData.assignedOR;
      if (formData.doctorName) changes.doctorName = formData.doctorName;
      if (formData.procedure) changes.procedure = formData.procedure;
      if (formData.assignedTeam) changes.assignedTeam = formData.assignedTeam;

      await onSave(changes);
      onClose();
    } catch (error) {
      toast.error("Gagal menyimpan perubahan.");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }));
  // };

  // const anesthesiologists = staffList.filter(
  //   (s) => s.role === "Dokter Anestesi"
  // );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
    <Card className="w-full max-w-lg p-6 dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4">
        Edit Jadwal: {surgery.patientName}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="procedure">Prosedur</Label>
          <Input
            id="procedure"
            ref={firstInputRef} // 💥 Fokus otomatis ke sini
            value={formData.procedure || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, procedure: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="scheduledAt">Waktu Terjadwal</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            defaultValue={
              formData.scheduledAt
                ? new Date(formData.scheduledAt).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, scheduledAt: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="assignedOR">Kamar Operasi</Label>
          <Input
            id="assignedOR"
            value={formData.assignedOR || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, assignedOR: e.target.value }))
            }
            placeholder="e.g., OK 1"
            required
          />
        </div>

        <div>
          <Label htmlFor="anesthesiologist">Dokter Anestesi</Label>
          <select
            id="anesthesiologist"
            defaultValue={surgery.assignedTeam?.anesthesiologistId || ""}
            onChange={(e) => {
              const selectedId = e.target.value;
              const selectedStaff = staffList.find(
                (s) => s.id === selectedId
              );
              if (selectedStaff) {
                setFormData((p) => ({
                  ...p,
                  assignedTeam: {
                    nurseIds: p.assignedTeam?.nurseIds || [],
                    anesthesiologistId: selectedId,
                  },
                }));
              }
            }}
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Dokter</option>
            {staffList
              .filter((s) => s.role === "Dokter Anestesi")
              .map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </div>
      </form>
    </Card>
  </div>
  );
};

// ------------------------------------------------------------------
// Fungsi Helper dan Komponen Utama
// ------------------------------------------------------------------

const formatTimeWIB = (time?: string | null) => {
  if (!time) return "-";
  // Gunakan try-catch untuk memastikan timeZone valid
  try {
    return new Date(time).toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return new Date(time).toLocaleTimeString("id-ID");
  }
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
  const [editingSurgery, setEditingSurgery] = useState<ScheduledSurgery | null>(
    null
  );
  const [loadingLive, setLoadingLive] = useState(true);

  // 💥 1. TAMBAHKAN STATE UNTUK PENCARIAN
  const [searchTerm, setSearchTerm] = useState("");

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

  // 💥 FUNGSI EDIT JADWAL (PATCH /api/schedule/[id])
  const handleEdit = useCallback(
    async (updatedData: Partial<ScheduledSurgery>) => {
      if (!editingSurgery) return;

      try {
        const res = await fetch(`/api/schedule/${editingSurgery.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });

        if (!res.ok) throw new Error("Gagal memperbarui jadwal");

        toast.success(
          `✅ Jadwal ${editingSurgery.patientName} berhasil diubah.`
        );
        await loadAll();
      } catch (err) {
        console.error("❌ Edit gagal:", err);
        toast.error("Gagal menyimpan perubahan jadwal");
      } finally {
        setEditingSurgery(null);
      }
    },
    [editingSurgery, loadAll]
  );

  // 💥 FUNGSI UPDATE STATUS (Termasuk Handover)
  const updateSurgeryStatus = useCallback(
    async (surgery: ScheduledSurgery, nextStatus: string) => {
      setUpdatingId(surgery.id);
      try {
        if (nextStatus === "Pasien Diterima") {
          const anesthesiologistName =
            staff.find((s) => s.id === surgery.assignedTeam?.anesthesiologistId)
              ?.name || "Belum ditentukan";

          // Payload untuk POST ke API Handover
          const payload: {
            surgery: ScheduledSurgery;
            notes: string;
            receivingTeam: StaffMember[];
            liveEntry: LiveEntryPayload;
          } = {
            surgery,
            notes: "Pasien diterima otomatis dari papan kendali.",
            receivingTeam: [],
            liveEntry: {
              id: surgery.id,
              procedure: surgery.procedure,
              doctorName: surgery.doctorName,
              patientName: surgery.patientName,
              mrn: surgery.mrn,
              caseId: surgery.mrn, // Menggunakan MRN sebagai Case ID
              anesthesiologistName,
              operatingRoom: surgery.assignedOR || "Belum ditentukan",
              status: "Persiapan Operasi",
              actualStartTime: new Date().toISOString(), // Waktu masuk OK
            } as LiveEntryPayload,
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

        // Default PATCH untuk update status schedule
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
    // 💥 REVISI: Mengurangi refresh data agar tidak terlalu sering (90 detik)
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

  // 💥 2. BUAT LOGIKA FILTER DENGAN useMemo
  const filteredSchedule = useMemo(() => {
    // Jika tidak ada pencarian, kembalikan semua jadwal
    if (!searchTerm) return schedule;

    const lowerCaseTerm = searchTerm.toLowerCase();

    return schedule.filter(
      (s) =>
        s.patientName.toLowerCase().includes(lowerCaseTerm) ||
        (s.procedure && s.procedure.toLowerCase().includes(lowerCaseTerm)) ||
        s.doctorName.toLowerCase().includes(lowerCaseTerm) ||
        (s.assignedOR && s.assignedOR.toLowerCase().includes(lowerCaseTerm))
    );
  }, [schedule, searchTerm]); // <-- Dependensi: schedule dan searchTerm

  const canUpdateStatus = (status: string) =>
    ["Terkonfirmasi", "Siap Panggil"].includes(status);

  const currentShift = getCurrentShift();

  return (
    <div className="p-4 md:p-6 dark:bg-gray-900 min-h-screen">
      <Toaster position="top-right" richColors />

      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Papan Kendali Operasi - Hari Ini
        </h1>
        <div className="flex items-center gap-4">
          <Badge className="p-1 pr-4 pl-4 border-0 outline-1 rounded bg-amber-500/50 text-sm">
            <GlassesIcon
              size={28}
              className="mr-2 dark:text-amber-200 text-slate-700"
            />{" "}
            {schedule.length} Pasien
          </Badge>
          {schedule.length > 0 && <PatientTrackerModal surgery={schedule[0]} />}
          {/* 💥 LINK: Gunakan link yang benar */}
          <Link
            href={"/operasi"}
            className="flex items-center p-1 pr-4 pl-4 text-nowrap border-0 outline-1 dark:outline-green-500/50 rounded bg-green-500/50 text-sm"
          >
            {" "}
            <HandshakeIcon
              size={18}
              className="mr-2 dark:text-amber-100 text-slate-700"
            />
            Pasien OK
          </Link>
        </div>
      </header>

      {/* Grid Informasi (Lebih Responsif) */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operasi Berlangsung (Menggunakan Card yang responsif) */}
        <Card>
          <CardHeader className="flex items-center">
            <Activity size={18} className="mr-2 text-red-500" />
            <CardTitle className="text-red-500">Operasi Berlangsung</CardTitle>
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
                    ? "grid-cols-1 sm:grid-cols-2 max-h-60 overflow-y-auto" // Responsif pada sm
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
            <CardTitle className="text-green-700 ">
              Antrian Berikutnya
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    ? "grid-cols-1 sm:grid-cols-2 max-h-60 overflow-y-auto"
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

        {/* Tim Jaga (Kolom 3) */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center">
              <Users size={18} className="mr-2 text-blue-500" />
              <CardTitle className="text-gray-700 dark:text-gray-200 text-wrap">
                Tim Jaga Hari Ini
              </CardTitle>
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
                      className="border-l-2 border-blue-400 bg-blue-600/30 dark:bg-blue-500/30 text-slate-700 dark:text-slate-100  p-1 pl-3 rounded text-wrap"
                    >
                      {staff.name}
                    </li>
                  ))
                ) : (
                  <li className="italic text-gray-400">Belum diatur</li>
                )}
              </ul>
            </div>

            {/* Penanggung Jawab OK (Per-Shift) */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">
                Penanggung Jawab OK Harian
              </h4>

              <div className="space-y-3">
                {/* Pastikan SHIFTS sudah didefinisikan di atas (Langkah 1) */}
                {SHIFTS.map((shiftKey) => {
                  // Cek apakah assignments ada DAN responsibleStaffByShift ada
                  const pjStaff =
                    assignments?.responsibleStaffByShift?.[shiftKey];

                  // Pastikan SHIFT_DETAILS sudah didefinisikan (Langkah 1)
                  const ShiftIcon = SHIFT_DETAILS[shiftKey].icon;
                  const isCurrentShift = shiftKey === currentShift;

                  return (
                    <div
                      key={shiftKey}
                      className={`p-2 rounded-lg border transition-all 
                      ${
                        isCurrentShift
                          ? "bg-yellow-100 dark:bg-yellow-800/70 border-yellow-500 shadow-md"
                          : "bg-white dark:bg-slate-700 border-yellow-200 dark:border-yellow-600"
                      }`}
                    >
                      <h4
                        className={`font-bold text-xs mb-1 flex items-center 
                      ${
                        isCurrentShift
                          ? "text-yellow-800 dark:text-yellow-200"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                      >
                        <ShiftIcon size={14} className="mr-2" />
                        Shift {shiftKey}
                        {isCurrentShift && (
                          <Badge className="ml-2 px-2 py-0.5 rounded-full bg-yellow-600 h-6 w-6  animate-bounce"/>
                          
                        )}
                      </h4>

                      {pjStaff ? (
                        <div className="flex items-center text-xs text-yellow-700 dark:text-yellow-300 pl-4">
                          {/* Ganti ikon User jika belum diimpor, atau impor 'User' dari lucide-react */}
                          <Users
                            size={12}
                            className="mr-2 flex-shrink-0 text-yellow-600 dark:text-yellow-300"
                          />
                          <span className="font-medium text-xs text-slate-800 dark:text-slate-200">
                            {pjStaff.name}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic pl-4">
                          Belum ditetapkan.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Perawat (Responsif: stack di mobile, flex di md) */}
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
                    <div key={shift} className="flex-1 min-w-[30%]">
                      {" "}
                      {/* 💥 Responsive flex-1 */}
                      <div className="flex items-center justify-between mb-1">
                        <h5
                          className={`font-semibold text-xs text-wrap ${
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
                          className={`text-xs text-wrap text-gray-600 dark:text-gray-200 space-y-1 ${
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
                        <p className="italic text-gray-400 text-xs text-wrap">
                          Kosong
                        </p>
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

          {/* 💥 3. TAMBAHKAN INPUT SEARCH DI SINI */}
          <div className="px-6 pt-2">
            <Input
              placeholder="Cari pasien, prosedur, dokter, atau OK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dark:bg-gray-800"
            />
          </div>

          <CardContent className="flex-grow overflow-auto scrollbar-thin pt-4">
            {" "}
            {/* Tambah pt-4 */}
            {/* 💥 TABLE RESPONSIVENESS: Tambahkan div untuk overflow di mobile */}
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">
                      Pasien & Prosedur
                    </TableHead>
                    <TableHead className="min-w-[80px]">Waktu</TableHead>
                    <TableHead className="min-w-[100px]">Ruang</TableHead>
                    <TableHead className="min-w-[150px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* 💥 4. GUNAKAN filteredSchedule DI SINI */}
                  {filteredSchedule.length ? (
                    filteredSchedule.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <b className="font-medium text-sm text-slate-700 dark:text-slate-100">
                            {s.patientName}
                          </b>
                          <div className="text-xs text-gray-500">
                            {s.procedure || "N/A"}{" "}
                            {/* Pastikan procedure tidak null */}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-stone-700 dark:text-slate-100">
                          {formatTimeWIB(s.scheduledAt)}
                        </TableCell>
                        <TableCell className="font-semibold text-stone-700 dark:text-slate-100">
                          {s.assignedOR || "Belum diatur"}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          {canUpdateStatus(s.status) ? (
                            <StatusActionButton
                              surgery={s}
                              onUpdateStatus={updateSurgeryStatus}
                              isUpdating={updatingId === s.id}
                            />
                          ) : (
                            <Badge className="bg-gray-200/10 text-gray-600 dark:text-gray-400 rounded p-1 border-l-4 border-yellow-600 animate-pulse">
                              {s.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* 💥 TOMBOL EDIT */}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingSurgery(s)}
                            >
                              <Pencil size={14} className="text-blue-500" />
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => confirmDelete(s)}
                            >
                              <Trash2
                                size={14}
                                className="text-red-400  dark:text-slate-100"
                              />
                            </Button>
                            <ShareStatusButton mrn={s.mrn} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5} // Diubah dari 4 menjadi 5
                        className="text-center italic text-gray-400"
                      >
                        {/* 💥 5. BUAT PESAN DINAMIS */}
                        {searchTerm
                          ? "Tidak ada jadwal yang cocok."
                          : "Tidak ada jadwal hari ini."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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

      {/* 💥 MODAL EDIT JADWAL */}
      {editingSurgery && (
        <ScheduleEditModal
          surgery={editingSurgery}
          onClose={() => setEditingSurgery(null)}
          onSave={handleEdit}
          staffList={staff}
        />
      )}
    </div>
  );
}
