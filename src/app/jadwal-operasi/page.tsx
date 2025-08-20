'use client';

import { useState } from 'react';

import SurgeryScheduleTable from '@/components/jadwal-operasi/SurgeryScheduleTable';
import AddSurgeryForm from '@/components/jadwal-operasi/AddSurgeryForm';
import { mockScheduledSurgeries } from '@/lib/mock-data';
import { ScheduledSurgery } from '@/types';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import SurgeryDetailModal from '@/components/jadwal-operasi/SurgeryDetailModal';
// PatientActionModal tidak lagi dibutuhkan di sini karena aksinya sudah pindah

export default function JadwalOperasiPage() {
  const [surgeries, setSurgeries] = useState<ScheduledSurgery[]>(mockScheduledSurgeries);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<ScheduledSurgery | null>(null);
  
  const handleAddSurgery = (newSurgeryData: Omit<ScheduledSurgery, 'id' | 'status'>) => {
    const newSurgery: ScheduledSurgery = { ...newSurgeryData, id: `op-${Date.now()}`, status: 'Terjadwal' };
    setSurgeries(prev => [newSurgery, ...prev]);
    setIsAddModalOpen(false);
  };
  
  const handleViewDetail = (surgery: ScheduledSurgery) => { setSelectedSurgery(surgery); };

  return (
    <div className="flex flex-col h-full">
      <main className="flex-grow p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Jadwal Operasi Mendatang</h1>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <Plus size={20} className="mr-2" />Tambah Jadwal Baru
          </Button>
        </header>

        {/* 3. DIUBAH: Hapus prop onOpenActions yang tidak lagi digunakan */}
        <SurgeryScheduleTable 
          surgeries={surgeries} 
          onViewDetail={handleViewDetail} 
        />
        
        {isAddModalOpen && <AddSurgeryForm onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddSurgery} />}
        {selectedSurgery && <SurgeryDetailModal surgery={selectedSurgery} onClose={() => setSelectedSurgery(null)} />}
      </main>
    </div>
  );
}