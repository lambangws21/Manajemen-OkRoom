"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Staff } from "@/types";
import { UserPlus, Loader2, Archive } from "lucide-react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";

import Button from "@/components/ui/button";
import StaffSelectionModal from "@/components/Team/StafSelectionModal";
import ShiftColumn from "@/components/Team/ShiftColumn";
import { getCurrentShift } from "@/lib/utils";

type NurseShiftTeams = { Pagi: Staff[]; Siang: Staff[]; Malam: Staff[] };
const SHIFTS = ["Pagi", "Siang", "Malam"] as const;
type ShiftType = (typeof SHIFTS)[number];

// =========================
// 🧩 Custom Hook: Data Shift
// =========================
function useShiftManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [anesthesiaTeam, setAnesthesiaTeam] = useState<Staff[]>([]);
  const [nurseTeams, setNurseTeams] = useState<NurseShiftTeams>({
    Pagi: [],
    Siang: [],
    Malam: [],
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [staffRes, teamRes] = await Promise.all([
        fetch("/api/staffs"),
        fetch("/api/shift-assignments"),
      ]);
      const [allStaffs, currentAssignments] = await Promise.all([
        staffRes.json(),
        teamRes.json(),
      ]);
      setStaffList(allStaffs);
      setAnesthesiaTeam(currentAssignments.anesthesiaTeam || []);
      setNurseTeams(
        currentAssignments.nurseTeams || {
          Pagi: [],
          Siang: [],
          Malam: [],
        }
      );
    } catch {
      toast.error("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateAssignments = useCallback(
    async (payload: {
      anesthesiaTeam: Staff[];
      nurseTeams: NurseShiftTeams;
    }) => {
      try {
        setIsSaving(true);
        const res = await fetch("/api/shift-assignments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        setAnesthesiaTeam(payload.anesthesiaTeam);
        setNurseTeams(payload.nurseTeams);
        toast.success("Perubahan disimpan ✅");
      } catch {
        toast.error("Gagal menyimpan perubahan.");
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    loading,
    isSaving,
    anesthesiaTeam,
    nurseTeams,
    anesthesiologistList: useMemo(
      () => staffList.filter((s) => s.role === "Dokter Anestesi"),
      [staffList]
    ),
    nurseList: useMemo(
      () => staffList.filter((s) => s.role.includes("Perawat")),
      [staffList]
    ),
    updateAssignments,
    fetchData,
  };
}

// ====================================
// 🧩 Custom Hook: Arsipkan ke Histori
// ====================================
function useArchiveShift() {
  const [isArchiving, setIsArchiving] = useState(false);

  const archive = useCallback(
    async (payload: {
      anesthesiaTeam: Staff[];
      nurseTeams: NurseShiftTeams;
    }) => {
      if (!payload) {
        toast.error("Tidak ada data untuk diarsipkan.");
        return;
      }

      setIsArchiving(true);
      const promise = fetch("/api/shift-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mengarsipkan data.");
        return data;
      });

      toast.promise(promise, {
        loading: "Mengarsipkan jadwal...",
        success: "Histori shift berhasil disimpan ✅",
        error: "Gagal mengarsipkan jadwal.",
      });

      try {
        await promise;
      } finally {
        setIsArchiving(false);
      }
    },
    []
  );

  return { archive, isArchiving };
}

// ============================
// 📄 Page: Manajemen Tim Utama
// ============================
export default function ManajemenTimPage() {
  const {
    loading,
    isSaving,
    anesthesiaTeam,
    nurseTeams,
    anesthesiologistList,
    nurseList,
    updateAssignments,
  } = useShiftManagement();

  const { archive, isArchiving } = useArchiveShift();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"anesthesia" | "nurses" | null>(
    null
  );
  const [shiftToManage, setShiftToManage] = useState<ShiftType>("Pagi");
  const [activeShift, setActiveShift] = useState<ShiftType | null>(null);

  useEffect(() => {
    setActiveShift(getCurrentShift() as ShiftType);
    const interval = setInterval(
      () => setActiveShift(getCurrentShift() as ShiftType),
      60000
    );
    return () => clearInterval(interval);
  }, []);

  const handleSaveTeam = (selectedStaff: Staff[]) => {
    if (modalType === "anesthesia") {
      updateAssignments({ anesthesiaTeam: selectedStaff, nurseTeams });
    } else if (modalType === "nurses") {
      const updated = { ...nurseTeams, [shiftToManage]: selectedStaff };
      updateAssignments({ anesthesiaTeam, nurseTeams: updated });
    }
    setIsModalOpen(false);
  };

  const handleArchive = () => {
    archive({ anesthesiaTeam, nurseTeams });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen justify-center items-center text-slate-600 dark:text-slate-300">
        <Loader2 className="animate-spin mb-3 text-blue-500" size={48} />
        <p className="text-lg">Memuat data staf...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Toaster position="top-right" richColors />

      {/* HEADER */}
      <motion.div
        className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Manajemen Tim Operasi
        </h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Shift aktif:{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {activeShift ?? "-"}
            </span>
          </div>
          {/* Tombol Arsip */}
        </div>
      </motion.div>

      {/* ANESTHESIA TEAM */}
      <motion.div
        className="backdrop-blur-md bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm mb-8"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Dokter Anestesi Jaga
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setModalType("anesthesia");
                setIsModalOpen(true);
              }}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus size={18} /> Atur Dokter
            </Button>
            <Button
              onClick={handleArchive}
              disabled={isSaving || isArchiving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2"
            >
              {isArchiving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Archive size={16} />
              )}
              Arsipkan
            </Button>
          </div>
        </div>
        {anesthesiaTeam.length ? (
          <div className="flex flex-wrap gap-2">
            {anesthesiaTeam.map((doc) => (
              <span
                key={doc.id}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md text-sm font-medium shadow-sm"
              >
                {doc.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">
            Belum ada dokter anestesi jaga.
          </p>
        )}
      </motion.div>

      {/* NURSE TEAMS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
          Tim Perawat Jaga per Shift
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {SHIFTS.map((shift) => (
            <motion.div
              key={shift}
              className={`rounded-lg backdrop-blur-md border ${
                activeShift === shift
                  ? "border-blue-500/50 shadow-blue-100 dark:shadow-blue-900/30"
                  : "border-slate-200 dark:border-slate-700"
              } bg-white/60 dark:bg-slate-900/40 shadow-sm p-5 transition-all`}
              whileHover={{ scale: 1.01 }}
            >
              <ShiftColumn
                shiftName={shift}
                nursesOnDuty={nurseTeams[shift]}
                onManageTeam={() => {
                  setModalType("nurses");
                  setShiftToManage(shift);
                  setIsModalOpen(true);
                }}
                isActive={activeShift === shift}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* MODALS */}
      {isModalOpen && modalType === "anesthesia" && (
        <StaffSelectionModal
          title="Atur Dokter Anestesi"
          staffList={anesthesiologistList}
          selectionConstraint={{ min: 1, max: 5 }}
          initialSelection={anesthesiaTeam}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTeam}
        />
      )}
      {isModalOpen && modalType === "nurses" && (
        <StaffSelectionModal
          title={`Atur Tim Perawat - Shift ${shiftToManage}`}
          staffList={nurseList}
          initialSelection={nurseTeams[shiftToManage]}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTeam}
        />
      )}
    </motion.div>
  );
}
