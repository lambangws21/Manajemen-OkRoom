'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileDown,
  FileSpreadsheet,
  Search,
  PlayCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { OngoingSurgery } from '@/types';
import { Card } from '@/components/ui/ui/card';
import { Badge } from '@/components/ui/ui/badge';
import { Button } from '@/components/ui/ui/button';
import { Input } from '@/components/ui/ui/input';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// 🔹 Ambil data dari API
async function fetchOngoingSurgeries(): Promise<OngoingSurgery[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const apiUrl = new URL('/api/operasi', baseUrl).toString();

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error('❌ Gagal fetch data operasi:', err);
    return [];
  }
}

// 🔹 Komponen Card Pasien
const OngoingPatientCard = ({ surgery }: { surgery: OngoingSurgery }) => {
  const colorMap: Record<string, string> = {
    'Persiapan Operasi': 'bg-yellow-100 text-yellow-800',
    'Operasi Berlangsung': 'bg-red-100 text-red-800',
    'Ruang Pemulihan': 'bg-indigo-100 text-indigo-800',
  };

  return (
    <Link href={`/operasi/${surgery.id}`}>
      <Card className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-xl transition-all flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {surgery.patientName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dr. {surgery.doctorName || 'Tidak diketahui'}
              </p>
            </div>
            <Badge className={colorMap[surgery.status] || 'bg-gray-200 text-gray-700'}>
              {surgery.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {surgery.procedure}
          </p>
        </div>

        <div className="flex items-center mt-auto text-blue-600 dark:text-blue-400 font-medium">
          Kelola Pasien
          <PlayCircle size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
};

// 🔹 Halaman Utama
export default function OperasiPage() {
  const [ongoingSurgeries, setOngoingSurgeries] = useState<OngoingSurgery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedRooms, setCollapsedRooms] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchOngoingSurgeries();
      setOngoingSurgeries(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // 🔍 Filter dan Group
  const groupedSurgeries = useMemo(() => {
    const filtered = ongoingSurgeries.filter((s) => {
      const term = searchTerm.toLowerCase();
      return (
        s.patientName?.toLowerCase().includes(term) ||
        s.doctorName?.toLowerCase().includes(term) ||
        s.procedure?.toLowerCase().includes(term) ||
        s.operatingRoom?.toLowerCase().includes(term)
      );
    });

    filtered.sort((a, b) => {
      const roomA = parseInt(a.operatingRoom?.replace(/\D/g, '') || '0', 10);
      const roomB = parseInt(b.operatingRoom?.replace(/\D/g, '') || '0', 10);
      return roomA - roomB;
    });

    const grouped = filtered.reduce((acc: Record<string, OngoingSurgery[]>, item) => {
      const room = item.operatingRoom || 'Tanpa Ruangan';
      if (!acc[room]) acc[room] = [];
      acc[room].push(item);
      return acc;
    }, {});

    return grouped;
  }, [ongoingSurgeries, searchTerm]);

  // 📊 Export Excel
  const exportToExcel = () => {
    const data = ongoingSurgeries.map((s) => ({
      Pasien: s.patientName,
      Dokter: s.doctorName,
      Prosedur: s.procedure,
      Ruangan: s.operatingRoom,
      Status: s.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Operasi');
    XLSX.writeFile(wb, 'Daftar_Pasien_Operasi.xlsx');
    toast.success('✅ Berhasil diekspor ke Excel');
  };

  // 🧾 Export PDF (A4)
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Daftar Pasien Operasi', 14, 15);

    const tableData = ongoingSurgeries.map((s) => [
      s.patientName,
      s.doctorName,
      s.procedure,
      s.operatingRoom,
      s.status,
    ]);

    autoTable(doc, {
      startY: 25,
      head: [['Pasien', 'Dokter', 'Prosedur', 'Ruangan', 'Status']],
      body: tableData,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [66, 133, 244] },
      margin: { top: 20 },
    });

    doc.save('Daftar_Pasien_Operasi.pdf');
    toast.success('📄 PDF (A4) berhasil dibuat');
  };

  const toggleRoom = (room: string) => {
    setCollapsedRooms((prev) => ({
      ...prev,
      [room]: !prev[room],
    }));
  };

  const roomNames = Object.keys(groupedSurgeries);

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Pasien di Kamar Operasi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Dikelompokkan berdasarkan kamar operasi — bisa di-expand atau collapse.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportToExcel}
            className="flex items-center gap-2 text-green-600 border-green-400 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-800/30"
          >
            <FileSpreadsheet size={18} /> Excel
          </Button>
          <Button
            variant="outline"
            onClick={exportToPDF}
            className="flex items-center gap-2 text-blue-600 border-blue-400 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-800/30"
          >
            <FileDown size={18} /> PDF (A4)
          </Button>
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
        <Input
          type="text"
          placeholder="Cari pasien, dokter, atau ruangan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      {/* Konten */}
      {loading ? (
        <Card className="text-center py-10 text-gray-500 dark:text-gray-400">
          Memuat data pasien...
        </Card>
      ) : roomNames.length > 0 ? (
        <div className="space-y-6">
          {roomNames.map((room) => {
            const collapsed = collapsedRooms[room];
            return (
              <div key={room} className="transition-all">
                <button
                  onClick={() => toggleRoom(room)}
                  className="flex w-full items-center justify-between px-2 py-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-md mb-2 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition"
                >
                  <div className="flex items-center gap-2">
                    {collapsed ? (
                      <ChevronRight size={18} className="text-blue-600" />
                    ) : (
                      <ChevronDown size={18} className="text-blue-600" />
                    )}
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {room}
                    </h2>
                  </div>
                  <Badge variant="outline">{groupedSurgeries[room].length} pasien</Badge>
                </button>

                {!collapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedSurgeries[room].map((surgery) => (
                      <OngoingPatientCard key={surgery.id} surgery={surgery} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada pasien ditemukan.
          </p>
        </Card>
      )}
    </div>
  );
}
