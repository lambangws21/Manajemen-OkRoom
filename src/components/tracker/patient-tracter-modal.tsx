'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/ui/sheet';
import { Button } from '@/components/ui/ui/button';
import {
  Monitor,
  X,
  RefreshCcw,
  Activity,
  Clock4,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ScheduledSurgery } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Lazy load komponen tracker agar modal ringan
const TrackerApp = dynamic(() => import('@/components/tracker/new-tracker/App'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-300 animate-pulse">
      Memuat tracker pasien...
    </div>
  ),
});

interface PatientTrackerModalProps {
  surgery: ScheduledSurgery;
}

export default function PatientTrackerModal({ surgery }: PatientTrackerModalProps) {
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const lastStatusRef = useRef<string | null>(null);

  // ✅ Live update dari server tiap 30 detik
  const handleLiveUpdate = useCallback(async () => {
    try {
      const res = await fetch(`/api/kasus/${surgery.mrn}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const newStatus = data?.status;

      if (lastStatusRef.current && newStatus !== lastStatusRef.current) {
        toast.success(`📢 ${surgery.patientName}`, {
          description: `Status pasien berubah menjadi "${newStatus}"`,
        });
      }

      lastStatusRef.current = newStatus;
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Gagal memuat status:', err);
    }
  }, [surgery.mrn, surgery.patientName]);

  useEffect(() => {
    if (!open) return;
    setIsLive(true);
    handleLiveUpdate();

    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
      handleLiveUpdate();
    }, 30000);

    return () => {
      clearInterval(interval);
      setIsLive(false);
    };
  }, [open, handleLiveUpdate]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Tombol Pembuka */}
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 font-medium text-blue-600 border-blue-300 hover:bg-blue-50 hover:shadow-md 
                     dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-800/30 transition-all"
        >
          <Monitor size={16} />
          Lihat Tracker
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-all"
      >
        <SheetHeader className="flex items-center justify-between mb-4 border-b pb-3 dark:border-gray-700">
          {/* Judul */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={isLive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className={`h-2.5 w-2.5 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Activity size={18} className="text-blue-600 dark:text-blue-400" />
              Tracker Pasien
            </SheetTitle>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setRefreshKey((k) => k + 1);
                handleLiveUpdate();
              }}
              className="rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 text-blue-500 dark:text-blue-300 transition"
              title="Refresh Data"
            >
              <RefreshCcw size={18} />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-full hover:bg-red-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 transition"
              title="Tutup"
            >
              <X size={18} />
            </Button>
          </div>
        </SheetHeader>

        {/* Info Update */}
        {lastUpdated && (
          <motion.p
            key="updated"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 italic"
          >
            <Clock4 size={12} className="mr-1" /> Terakhir diperbarui:{" "}
            <span className="ml-1 font-medium text-gray-600 dark:text-gray-300">
              {lastUpdated.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Jakarta',
              })} WIB
            </span>
          </motion.p>
        )}

        {/* Konten */}
        <AnimatePresence mode="wait">
          <motion.div
            key={refreshKey}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-3 pb-8"
          >
            <TrackerApp key={`${surgery.mrn}-${refreshKey}`} />
          </motion.div>
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
