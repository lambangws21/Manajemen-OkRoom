'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScheduledSurgery,
  StaffMember,
  OngoingSurgery,
  AssignedTeamRef,
} from '@/types';
import PatientHandoverModal from '@/components/operasi/PatientHandOverModal';
import {
  Check,
  ChevronsRight,
  PlayCircle,
  Loader2,
  AlertTriangle,
  User,
  Syringe,
  Users,
  FileText,
  Clock,
  Search,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import {Card }from '@/components/ui/ui/card';
import {Button} from '@/components/ui/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/ui/input';

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '-';
  const date = new Date(iso);
  return `${date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
  })} ${date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

// 🟢 Pasien Menunggu Diterima
const HandoverPatientCard = ({
  surgery,
  onHandoverClick,
}: {
  surgery: ScheduledSurgery;
  onHandoverClick: () => void;
}) => {
  const isRR = surgery.status === 'Ruang Pemulihan';
  return (
    <Card className="p-4 mb-3 transition-all hover:shadow-lg hover:border-blue-500 border border-transparent rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
            <User size={16} className="mr-2 text-blue-500" /> {surgery.patientName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Syringe size={14} className="mr-2 text-gray-400" /> {surgery.procedure}
          </p>
        </div>

        <Button
          onClick={onHandoverClick}
          disabled={isRR}
          className={`flex items-center text-sm sm:text-base ${
            isRR
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <ChevronsRight size={16} className="mr-2" />
          {isRR ? 'Sudah di RR' : 'Terima'}
        </Button>
      </div>
    </Card>
  );
};

// 🟢 Pasien Selesai Diterima
const CompletedPatientCard = ({ surgery }: { surgery: ScheduledSurgery }) => {
  const receiverName =
    surgery.receivingTeam && surgery.receivingTeam.length > 0
      ? surgery.receivingTeam[0].name
      : 'Tim OK';
  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col flex-1">
        <p className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
          <Check size={18} className="text-green-600 mr-2" /> {surgery.patientName}
        </p>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
          <p className="flex items-center gap-1.5">
            <Clock size={14} /> Diterima: {formatDateTime(surgery.handoverTime)}
          </p>
          <p className="flex items-center gap-1.5">
            <Users size={14} /> Penerima: {receiverName}
          </p>
          <p className="flex items-start gap-1.5">
            <FileText size={14} className="mt-0.5" /> Catatan:{' '}
            <span className="italic">
              {surgery.notes || 'Tidak ada catatan.'}
            </span>
          </p>
        </div>
      </div>

      <Link href={`/operasi/${surgery.id}`} className="w-full sm:w-auto">
        <Button
          variant="secondary"
          className="w-full sm:w-auto bg-green-200 text-green-800 hover:bg-green-300 dark:bg-green-700/50 dark:text-green-100"
        >
          <PlayCircle size={18} className="mr-2" /> Lanjutkan
        </Button>
      </Link>
    </div>
  );
};

export default function SerahTerimaPage() {
  const [allSurgeries, setAllSurgeries] = useState<ScheduledSurgery[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ScheduledSurgery | null>(null);
  const [allStaffs, setAllStaffs] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('today');

  const staffMap = useMemo(
    () =>
      allStaffs.reduce((map, staff) => {
        map[staff.id] = staff;
        return map;
      }, {} as Record<string, StaffMember>),
    [allStaffs]
  );

  const fetchStaffs = useCallback(async () => {
    try {
      const res = await fetch('/api/staffs');
      const data = await res.json();
      setAllStaffs(data);
    } catch {
      console.error('Gagal memuat staf');
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/handover');
      const data = await res.json();
      setAllSurgeries(data);
    } catch {
      setError('Gagal mengambil data pasien.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
    fetchData();
  }, [fetchStaffs, fetchData]);

  // 🔍 Filter nama + tanggal
  const filteredSurgeries = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    return allSurgeries.filter((s) => {
      const nameMatch = s.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const time = s.handoverTime ? new Date(s.handoverTime) : null;
      if (dateFilter === 'today' && time) return nameMatch && time >= startOfToday;
      if (dateFilter === 'week' && time) return nameMatch && time >= startOfWeek;
      return nameMatch;
    });
  }, [allSurgeries, searchTerm, dateFilter]);

  const patientsReady = filteredSurgeries.filter((s) =>
    ['Dipanggil', 'Siap Panggil'].includes(s.status)
  );

  const patientsCompleted = useMemo(
    () =>
      filteredSurgeries
        .filter((s) => s.status === 'Pasien Diterima')
        .sort(
          (a, b) =>
            new Date(b.handoverTime || 0).getTime() -
            new Date(a.handoverTime || 0).getTime()
        ),
    [filteredSurgeries]
  );

  const handleConfirmHandover = async (notes: string, team: StaffMember[]) => {
    if (!selectedPatient) return;
    const anesthesiologistId =
      selectedPatient.assignedTeam?.anesthesiologistId || 'an-01';
    const anesthesiologistName =
      staffMap[anesthesiologistId]?.name || 'Anestesi Belum Ditugaskan';

    const teamForLiveView: AssignedTeamRef = {
      anesthesiologistId,
      nurseIds: selectedPatient.assignedTeam?.nurseIds || [],
    };

    const newLiveEntry: OngoingSurgery = {
      id: selectedPatient.id,
      procedure: selectedPatient.procedure,
      doctorName: selectedPatient.doctorName,
      patientName: selectedPatient.patientName,
      mrn: selectedPatient.mrn,
      caseId: selectedPatient.mrn,
      anesthesiologistName,
      operatingRoom: selectedPatient.assignedOR || 'OK Antrian',
      status: 'Persiapan Operasi',
      team: teamForLiveView,
      startTime: undefined,
      actualStartTime: undefined,
      handoverTime: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surgery: selectedPatient,
          notes,
          receivingTeam: team,
          liveEntry: newLiveEntry,
        }),
      });
      if (!res.ok) throw new Error('Gagal melakukan serah terima.');
      toast.success(`✅ ${selectedPatient.patientName} diterima`);
      setSelectedPatient(null);
      fetchData();
    } catch {
      toast.error('Gagal melakukan serah terima.');
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <header className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center sm:text-left">
          Papan Serah Terima Pasien
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 text-gray-400" size={16} />
            <Input
              placeholder="Cari nama pasien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="text-gray-500" size={18} />
            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value as 'all' | 'today' | 'week')
              }
              className="border rounded-md px-2 py-1 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="all">Semua</option>
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500 mr-3" size={24} />
          <span>Memuat data pasien...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
          <AlertTriangle className="text-red-500 mr-2" size={24} />
          <span className="text-red-700 dark:text-red-200">{error}</span>
        </div>
      ) : (
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Menunggu */}
          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Menunggu Diterima ({patientsReady.length})
            </h2>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm max-h-[70vh] overflow-y-auto scrollbar-thin">
              {patientsReady.length ? (
                patientsReady.map((s) => (
                  <HandoverPatientCard
                    key={s.id}
                    surgery={s}
                    onHandoverClick={() => setSelectedPatient(s)}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-6 text-sm">
                  Tidak ada pasien menunggu.
                </p>
              )}
            </div>
          </section>

          {/* Kolom Selesai */}
          <section>
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Selesai Diterima ({patientsCompleted.length})
            </h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm max-h-[70vh] overflow-y-auto scrollbar-thin">
              {patientsCompleted.length ? (
                patientsCompleted.map((s) => (
                  <CompletedPatientCard key={s.id} surgery={s} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-6 text-sm">
                  Belum ada pasien diterima.
                </p>
              )}
            </div>
          </section>
        </main>
      )}

      {selectedPatient && (
        <PatientHandoverModal
          surgery={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onSubmit={handleConfirmHandover}
        />
      )}
    </div>
  );
}
