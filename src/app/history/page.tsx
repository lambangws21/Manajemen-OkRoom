'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Loader2,
  AlertTriangle,
  Users,
  User,
  CalendarClock,
  Sun,
  Moon,
  Sunset,
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

type ShiftKey = 'Pagi' | 'Siang' | 'Malam';
const SHIFTS: ShiftKey[] = ['Pagi', 'Siang', 'Malam'];

const SHIFT_DETAILS: Record<ShiftKey, { icon: React.ElementType }> = {
  Pagi: { icon: Sun },
  Siang: { icon: Sunset },
  Malam: { icon: Moon },
};

interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
}

type NurseShiftTeams = Record<ShiftKey, Staff[]>;

interface ShiftAssignment {
  anesthesiaTeam: Staff[];
  nurseTeams: NurseShiftTeams;
}

interface HistoryEntry extends ShiftAssignment {
  id: string;
  archivedAt: string;
}

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

export default function HistoryDisplay() {
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/shift-history', { method: 'GET', cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error ${res.status}`);
      }
      const data: HistoryEntry[] = await res.json();
      setHistoryList(data);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Terjadi kesalahan saat memuat data.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDateTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Makassar',
      });
    } catch {
      return isoString;
    }
  };

  const renderStaffList = (staffList: Staff[], emptyMessage: string) => {
    if (staffList.length === 0) {
      return <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>;
    }
    return (
      <motion.ul
        className="space-y-1"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {staffList.map((staff) => (
          <motion.li
            key={staff.id}
            className="flex items-center text-sm p-1.5"
            variants={itemVariants}
          >
            <User size={14} className="mr-2 text-slate-400 dark:text-slate-500" />
            <span className="font-medium text-slate-800 dark:text-slate-200">{staff.name}</span>
            <span className="text-slate-600 dark:text-slate-400 ml-1.5">
              ({staff.role})
            </span>
          </motion.li>
        ))}
      </motion.ul>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 md:p-4 w-full min-h-svh transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <CalendarClock size={32} className="text-purple-600 dark:text-purple-400 mr-3" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Histori Penugasan Shift
          </h1>
        </div>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loading"
              className="flex justify-center items-center h-64"
              exit={{ opacity: 0 }}
            >
              <Loader2 size={32} className="animate-spin text-purple-600 dark:text-purple-400" />
              <span className="ml-3 text-lg text-slate-600 dark:text-slate-300">
                Memuat histori...
              </span>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              className="p-4 mb-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg border border-red-300 dark:border-red-800 font-medium flex items-center"
            >
              <AlertTriangle size={20} className="mr-3 text-red-600 dark:text-red-400" />
              <div>
                <span className="font-bold">Gagal memuat histori:</span>
                <p>{error}</p>
              </div>
            </motion.div>
          )}

          {!isLoading && !error && (
            <div
              className={`space-y-6 ${
                historyList.length > 3 ? 'max-h-[85vh] overflow-y-auto pr-2' : ''
              }`}
            >
              {historyList.length === 0 && (
                <p className="text-center text-slate-500 dark:text-slate-400 text-lg italic">
                  Belum ada histori yang diarsipkan.
                </p>
              )}

              {historyList.map((entry) => (
                <motion.div
                  key={entry.id}
                  className="bg-white dark:bg-slate-800 shadow-lg rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  layout
                >
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <h2 className="font-semibold text-purple-800 dark:text-purple-300 flex items-center">
                      <CalendarClock size={16} className="mr-2" />
                      Diarsipkan pada: {formatDateTime(entry.archivedAt)}
                    </h2>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-lg">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center text-lg">
                        <Users size={18} className="mr-2.5" />
                        Tim Dokter Anestesi ({entry.anesthesiaTeam.length})
                      </h3>
                      <div className="text-xs">
                        {renderStaffList(entry.anesthesiaTeam, 'Tidak ada dokter anestesi.')}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 text-lg">
                        Tim Perawat
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {SHIFTS.map((shift) => {
                          const ShiftIcon = SHIFT_DETAILS[shift].icon;
                          return (
                            <div
                              key={shift}
                              className="p-3 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 dark:border-green-500 rounded-r-lg"
                            >
                              <h4 className="font-semibold text-green-900 dark:text-green-300 mb-3 flex items-center">
                                <ShiftIcon size={16} className="mr-2" />
                                Shift {shift}
                              </h4>
                              <div className="text-xs">
                                {renderStaffList(entry.nurseTeams[shift], 'Shift kosong.')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
