'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertTriangle,
  CalendarClock,
  Calendar,
  CheckCircle,
  Trash2,
  Printer,
  Users,
  User,
  DoorOpen,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { Staff } from '@/types';

type ShiftKey = 'Pagi' | 'Siang' | 'Malam';
const SHIFTS: ShiftKey[] = ['Pagi', 'Siang', 'Malam'];
const SHIFT_DETAILS: Record<ShiftKey, { icon: React.ElementType }> = {
  Pagi: { icon: Sun },
  Siang: { icon: Sunset },
  Malam: { icon: Moon },
};

interface NurseShiftTeams {
  Pagi: Staff[];
  Siang: Staff[];
  Malam: Staff[];
}

type ResponsibleStaffByShift = Record<ShiftKey, Staff | null>;
type RoomAssignmentsMap = Record<string, Staff[]>;

interface HistoryEntry {
  id: string;
  archivedAt: string;
  anesthesiaTeam: Staff[];
  nurseTeams: NurseShiftTeams;
  responsibleStaffByShift: ResponsibleStaffByShift;
  roomAssignments?: RoomAssignmentsMap;
}

/* 🔹 CSS Print A4 */
const PrintStyles = () => (
  <style jsx global>{`
    @page { size: A4; margin: 15mm; }
    @media print {
      body * { visibility: hidden; }
      .printable-entry, .printable-entry * { visibility: visible; }
      .printable-entry {
        width: 100%;
        border: 1px solid #ccc;
        padding: 15px;
        background: white !important;
      }
      .no-print { display: none !important; }
    }
  `}</style>
);

export default function HistoryShift() {
  const [historyList, setHistoryList] = useState<HistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');

  /** FETCH HISTORY */
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const res = await fetch('/api/shift-history', { cache: 'no-store' });
      if (!res.ok) throw new Error('Gagal memuat histori');
      const data: HistoryEntry[] = await res.json();
      setHistoryList(data);
      setFilteredHistory(data);
    } catch {
      setError('Terjadi kesalahan saat memuat histori.');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setFilteredHistory(
      !selectedDate
        ? historyList
        : historyList.filter((entry) => entry.archivedAt.startsWith(selectedDate))
    );
  }, [selectedDate, historyList]);

  /** DELETE HISTORY */
  const handleDeleteHistory = async (id: string, archivedAt: string) => {
    const formattedDate = new Date(archivedAt).toLocaleDateString('id-ID');
    if (!confirm(`Yakin ingin menghapus histori shift tanggal ${formattedDate}?`)) return;

    const promise = fetch(`/api/shift-history/${id}`, { method: 'DELETE' }).then((res) => {
      if (!res.ok) throw new Error('Gagal menghapus histori.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Menghapus...',
      success: () => {
        setHistoryList((prev) => prev.filter((e) => e.id !== id));
        return 'Histori berhasil dihapus.';
      },
      error: 'Gagal menghapus histori.',
    });
  };

  /** PRINT */
  const handlePrintHistory = (entryId: string) => {
    const entry = document.getElementById(entryId);
    if (!entry) return;
    entry.classList.add('printable-entry');
    window.print();
    setTimeout(() => entry.classList.remove('printable-entry'), 300);
  };

  /** RENDER HELPERS */
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });

  const renderStaffList = (list: Staff[], msg: string) =>
    list.length === 0 ? (
      <p className="text-sm text-gray-500 italic">{msg}</p>
    ) : (
      <ul className="space-y-1">
        {list.map((s) => (
          <li key={s.id} className="flex items-center text-[11px]">
            <User size={14} className="mr-1 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
            <span className="text-green-400 ml-1 text-[9px]">({s.role})</span>
          </li>
        ))}
      </ul>
    );

  const renderRoomAssignments = (assignments?: RoomAssignmentsMap) => {
    if (!assignments) return null;
    return Object.entries(assignments).map(([room, staffList]) => (
      <div key={room}>
        <h5 className="font-semibold flex items-center text-[11px] text-gray-700 dark:text-gray-300">
          <DoorOpen size={14} className="mr-1" /> OK {room}
        </h5>
        {renderStaffList(staffList, 'Tidak ada staf ditugaskan.')}
      </div>
    ));
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-md p-4 border border-gray-200 dark:border-gray-700 mt-4">
      <PrintStyles />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center">
          <CalendarClock size={28} className="text-purple-600 dark:text-purple-400 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Histori Shift</h1>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Calendar size={18} className="text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-gray-400 hover:text-gray-200 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={28} className="animate-spin text-purple-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Memuat histori...</span>
          </div>
        ) : error ? (
          <div className="flex items-center p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            <AlertTriangle size={20} className="mr-3" />
            {error}
          </div>
        ) : (
          <div
            className={clsx(
              'space-y-4 printable-overflow transition-all',
              filteredHistory.length > 3 && 'max-h-[80vh] overflow-y-auto pr-2'
            )}
          >
            {filteredHistory.length === 0 ? (
              <p className="text-gray-500 italic">Tidak ada histori pada tanggal ini.</p>
            ) : (
              filteredHistory.map((entry) => (
                <motion.div
                  key={entry.id}
                  id={`history-entry-${entry.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="font-semibold text-purple-700 dark:text-purple-300 flex items-center text-md">
                      <CalendarClock size={16} className="mr-2" />
                      {formatDateTime(entry.archivedAt)}
                    </h2>
                    <div className="flex gap-2 no-print">
                      <button
                        onClick={() => handlePrintHistory(`history-entry-${entry.id}`)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
                      >
                        <Printer size={14} className="mr-1" /> Print
                      </button>
                      <button
                        onClick={() => handleDeleteHistory(entry.id, entry.archivedAt)}
                        className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center"
                      >
                        <Trash2 size={14} className="mr-1" /> Hapus
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-md mb-3">
                    <h3 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2 text-[11px] flex items-center">
                      <CheckCircle size={16} className="mr-2" /> Penanggung Jawab Kamar
                    </h3>
                    {SHIFTS.map((shift) => {
                      const pj = entry.responsibleStaffByShift?.[shift];
                      const Icon = SHIFT_DETAILS[shift].icon;
                      return (
                        <div key={shift} className="flex items-center text-[11px] gap-2">
                          <Icon size={16} className="text-yellow-600 dark:text-yellow-400" />
                          <span className="font-semibold w-12">{shift}:</span>
                          {pj ? (
                            <div className="flex items-center">
                              <User size={15} className="mr-1 text-yellow-600 dark:text-yellow-400" />
                              <span className="font-bold text-yellow-900 dark:text-yellow-100">
                                {pj.name}
                              </span>
                              <span className="text-yellow-700 dark:text-yellow-300 ml-1">
                                ({pj.role})
                              </span>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Belum ditetapkan.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md mb-3">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 text-[11px] flex items-center">
                      <Users size={16} className="mr-2" /> Tim Anestesi (
                      {entry.anesthesiaTeam.length})
                    </h3>
                    {renderStaffList(entry.anesthesiaTeam, 'Tidak ada dokter anestesi.')}
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-md mb-3">
                    <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 text-[11px] flex items-center">
                      <DoorOpen size={16} className="mr-2" /> Staf Bertugas di Kamar Operasi
                    </h3>
                    {renderRoomAssignments(entry.roomAssignments)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {SHIFTS.map((shift) => {
                      const Icon = SHIFT_DETAILS[shift].icon;
                      return (
                        <div
                          key={shift}
                          className="bg-green-50 dark:bg-green-900/30 p-2 rounded border-l-4 border-green-400 dark:border-green-600"
                        >
                          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center text-[12px]">
                            <Icon size={16} className="mr-2" /> Shift {shift}
                          </h4>
                          {renderStaffList(entry.nurseTeams?.[shift] || [], 'Shift kosong.')}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
