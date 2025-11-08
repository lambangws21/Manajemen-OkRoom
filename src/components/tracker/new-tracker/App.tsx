"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RotateCw, AlertTriangle, Stethoscope } from "lucide-react";
import { PatientStatusData, ExtendedOngoingSurgery } from "@/types/tracker";
import { mapSurgeryToTimeline } from "@/lib/status";
import { Button } from "@/components/ui/ui/button";
import { Card } from "@/components/ui/ui/card";
import { StatusTimeline } from "@/components/tracker/new-tracker/status-timeline";

export default function App() {
  const [inputCode, setInputCode] = useState("");
  const [searchedCode, setSearchedCode] = useState("");
  const [statusData, setStatusData] = useState<PatientStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (code: string) => {
    if (!code) return;

    setIsLoading(true);
    setError(null);
    setStatusData(null);

    try {
      const res = await fetch(`/api/kasus/${code}`, { cache: "no-store" });
      const rawData = await res.json();

      if (!res.ok) throw new Error(rawData.error || "Kode operasi tidak ditemukan.");

      const fetchedData = mapSurgeryToTimeline(rawData as ExtendedOngoingSurgery);
      setStatusData(fetchedData);
    } catch (e) {
      if (code === "SIMULASI123") {
        const simulatedSurgery: ExtendedOngoingSurgery = {
          id: code,
          caseId: code,
          procedure: "Herniorrhaphy",
          doctorName: "Dr. Jane Foster",
          operatingRoom: "OK 2",
          status: "Operasi Berlangsung",
          patientName: "Ester Sagala",
          mrn: "MRN001",
          startTime: new Date(Date.now() - 5400000).toISOString(),
          actualStartTime: new Date(Date.now() - 5300000).toISOString(),
        };
        setStatusData(mapSurgeryToTimeline(simulatedSurgery));
      } else {
        setError(e instanceof Error ? e.message : "Terjadi kesalahan server.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchedCode) fetchData(searchedCode);
  }, [searchedCode, fetchData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) setSearchedCode(inputCode.trim());
  };

  const handleReset = () => {
    setSearchedCode("");
    setInputCode("");
    setStatusData(null);
    setError(null);
  };

  // 💎 Transisi halus antar state
  const transitionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative w-full min-h-screen dark:via-gray-800  flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={transitionVariants}
            className="w-full max-w-md"
          >
            <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 shadow-2xl backdrop-blur-md">
              <RotateCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Mengambil status operasi...
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Mohon tunggu sebentar, data sedang dimuat.
              </p>
            </Card>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={transitionVariants}
            className="w-full max-w-md"
          >
            <Card className="p-8 text-center bg-red-50/70 dark:bg-red-900/20 border border-red-400/40 shadow-lg backdrop-blur">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400">
                Terjadi Kesalahan
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{error}</p>
              <Button onClick={handleReset} variant="secondary" className="mt-6">
                Coba Lagi
              </Button>
            </Card>
          </motion.div>
        ) : statusData ? (
          <motion.div
            key="timeline"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={transitionVariants}
            className="w-full max-w-5xl mx-auto"
          >
            <StatusTimeline
              accessCode={searchedCode}
              statusData={statusData}
              onReset={handleReset}
            />
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={transitionVariants}
            className="w-full max-w-lg mx-auto"
          >
            <Card className="p-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-2xl border border-blue-200 dark:border-blue-900">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-sky-400 p-3 rounded-xl shadow-md">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2 text-center">
                Lacak Status Operasi
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
                Masukkan kode operasi atau MRN untuk melihat progres operasi.
              </p>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  placeholder="Contoh: SIMULASI123"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-grow px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  required
                />
                <Button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="h-11 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold shadow hover:scale-[1.02] transition-transform"
                >
                  <Search size={18} className="mr-2" />
                  Cari
                </Button>
              </form>

              <p className="text-xs text-center mt-5 text-gray-400 dark:text-gray-500">
                💡 Coba kode demo: <strong>SIMULASI123</strong>
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
