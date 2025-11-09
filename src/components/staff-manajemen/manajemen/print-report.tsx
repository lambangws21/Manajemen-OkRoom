"use client";
import { motion } from "framer-motion";
import { Printer } from "lucide-react";
import { LeaveData } from "../types";
import { useRef } from "react";


export default function PrintReport({ leaves }: { leaves: LeaveData[] }) {
  const printRef = useRef<HTMLDivElement>(null);

  const grouped = leaves.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-5"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          🧾 Laporan Mingguan
        </h3>
        <button
          onClick={() => {
            if (printRef.current) {
              // Tambahkan class agar hanya elemen ini yang terlihat saat print
              printRef.current.classList.add("printable-report");
              window.print();
              setTimeout(
                () => printRef.current?.classList.remove("printable-report"),
                500
              );
            }
          }}
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm transition"
        >
          <Printer size={14} /> Print Laporan
        </button>
      </div>

      <motion.div
        ref={printRef}
        className="printable-report bg-white dark:bg-gray-900 p-5 rounded-lg shadow-lg text-sm"
        layout
      >
        <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Laporan Mingguan Staf Operasi
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
          Periode:{" "}
          {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
        </p>

        <table className="w-full border border-gray-300 dark:border-gray-700 mb-4">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                Nama
              </th>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                Jenis
              </th>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                Periode
              </th>
              <th className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-3">
                  Tidak ada data cuti/sakit/izin minggu ini.
                </td>
              </tr>
            ) : (
              leaves.map((l) => (
                <tr key={l.id}>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                    {l.staffName}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                    {l.type}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                    {new Date(l.startDate).toLocaleDateString("id-ID")} -{" "}
                    {new Date(l.endDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 px-3 py-2">
                    {l.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-6 text-sm">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Rekapitulasi Mingguan:
          </h4>
          <ul className="space-y-1 text-gray-700 dark:text-gray-300">
            {Object.entries(grouped).map(([type, count]) => (
              <li key={type}>
                <span className="font-medium">{type}:</span> {count} orang
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-right text-xs text-gray-400 dark:text-gray-500">
          Dicetak otomatis oleh Sistem Manajemen Staf RS •{" "}
          {new Date().toLocaleString("id-ID")}
        </p>
      </motion.div>

      {/* CSS Print Area */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-report,
          .printable-report * {
            visibility: visible;
          }
          .printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
            background: white;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}</style>
    </motion.div>
  );
}
