'use client';

import { useState } from 'react';
import { mockScheduledSurgeries, mockStaffMembers, mockSurgeryBoard } from '@/lib/mock-data'; // Impor yang relevan saja
import { ScheduledSurgery, StaffMember, OngoingSurgery } from '@/types';
import PatientHandoverModal from '@/components/operasi/PatientHandOverModal';
import { Check, ChevronsRight, PlayCircle } from 'lucide-react'; // Ganti Files dengan PlayCircle
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

// Disederhanakan: Komponen kartu sekarang hanya punya satu aksi utama
const HandoverPatientCard = ({ surgery, onHandoverClick }: { surgery: ScheduledSurgery, onHandoverClick: () => void }) => (
  <Card className="mb-4 p-4 transition-all hover:shadow-lg hover:border-blue-500 border border-transparent">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <p className="font-bold text-gray-800 dark:text-gray-800">{surgery.patientName}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">{surgery.procedure}</p>
      </div>
      <Button onClick={onHandoverClick}>
        <ChevronsRight size={16} className="mr-2"/> Terima Pasien
      </Button>
    </div>
  </Card>
);

const CompletedPatientCard = ({ surgery }: { surgery: ScheduledSurgery }) => (
    <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-md mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-4">
            <Check size={24} className="text-green-600 flex-shrink-0" />
            <div>
                <p className="font-bold text-gray-800 dark:text-gray-100">{surgery.patientName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Telah diterima oleh tim OK.</p>
            </div>
        </div>
        <Link href={`/operasi/${surgery.id}`} className="w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="secondary" className="w-full bg-green-200 text-green-800 hover:bg-green-300 dark:bg-green-800/50 dark:text-green-100 dark:hover:bg-green-800/80">
                <PlayCircle size={16} className="mr-2"/> Lanjutkan Proses
            </Button>
        </Link>
    </div>
);


export default function SerahTerimaPage() {
  const [allSurgeries, setAllSurgeries] = useState<ScheduledSurgery[]>(mockScheduledSurgeries);
  const [selectedPatient, setSelectedPatient] = useState<ScheduledSurgery | null>(null);

  const handleConfirmHandover = (notes: string, team: StaffMember[]) => {
    if (!selectedPatient) return;

    // Perbarui status pasien di state utama
    const patientInDatabase = mockScheduledSurgeries.find(p => p.id === selectedPatient.id);
    if (patientInDatabase) {
      patientInDatabase.status = 'Pasien Diterima';
    }

    // 2. Perbarui state lokal untuk me-render ulang UI halaman ini
    setAllSurgeries(prev => 
      prev.map(p => 
        p.id === selectedPatient.id ? { ...p, status: 'Pasien Diterima' } : p
      )
    );

    // Tambahkan/update pasien di Papan Live View
    const newLiveEntry: OngoingSurgery = {
      id: selectedPatient.id,
      procedure: selectedPatient.procedure,
      doctorName: selectedPatient.doctorName,
      caseId: `*** *** ${selectedPatient.mrn.slice(-3)}`,
      operatingRoom: selectedPatient.assignedOR || 'OK Antrian',
      status: 'Persiapan Operasi',
      startTime: new Date().toISOString(),
      team: { 
        anesthesiologist: selectedPatient.assignedTeam?.anesthesiologist || mockStaffMembers[0],
        nurses: selectedPatient.assignedTeam?.nurses || [] 
      },
    };
    
    const boardWithoutPatient = mockSurgeryBoard.filter(p => p.id !== selectedPatient.id);
    mockSurgeryBoard.length = 0;
    mockSurgeryBoard.push(...boardWithoutPatient, newLiveEntry);
    
    console.log(`Serah terima untuk ${selectedPatient.patientName} dicatat dengan tim penerima: ${team.map(t=>t.name).join(', ')}`);
    console.log("Catatan:", notes);
    
    setSelectedPatient(null); // <-- INI KUNCI UNTUK MENUTUP MODAL
    alert('Serah terima berhasil.');
  };

  const patientsReady = allSurgeries.filter(s => s.status === 'Dipanggil');
  const patientsCompleted = allSurgeries.filter(s => s.status === 'Pasien Diterima');

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Papan Serah Terima Pasien</h1>
        <p className="text-gray-500">Daftar pasien yang telah dipanggil dan menunggu diterima oleh tim kamar operasi.</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 px-2">
            Menunggu Diterima ({patientsReady.length})
          </h2>
          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg flex-grow overflow-y-auto min-h-[300px]">
            {patientsReady.length > 0 ? (
              patientsReady.map(surgery => (
                <HandoverPatientCard key={surgery.id} surgery={surgery} onHandoverClick={() => setSelectedPatient(surgery)} />
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Tidak ada pasien dalam antrian.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 px-2">
            Selesai Diterima ({patientsCompleted.length})
          </h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex-grow overflow-y-auto min-h-[300px]">
            {patientsCompleted.map(surgery => (
              <CompletedPatientCard key={surgery.id} surgery={surgery} />
            ))}
          </div>
        </div>
      </main>

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