'use client';

import { useState } from 'react';
import SurgeryScheduleTable from '@/components/jadwal-operasi/SurgeryScheduleTable';
import AddSurgeryForm from '@/components/jadwal-operasi/AddSurgeryForm';
import { mockScheduledSurgeries, mockShiftAssignments } from '@/lib/mock-data'; // Impor shiftAssignments
import { ScheduledSurgery } from '@/types';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import SurgeryDetailModal from '@/components/jadwal-operasi/SurgeryDetailModal';

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
    <div className="p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Jadwal Operasi Mendatang</h1>
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />Tambah Jadwal Baru
        </Button>
      </header>

      {/* Gunakan prop yang benar: 'surgeries' dan 'shiftAssignments' */}
      <SurgeryScheduleTable 
        surgeries={surgeries} 
        shiftAssignments={mockShiftAssignments}
        onViewDetail={handleViewDetail} 
      />
      
      {isAddModalOpen && <AddSurgeryForm onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddSurgery} />}
      {selectedSurgery && <SurgeryDetailModal surgery={selectedSurgery} onClose={() => setSelectedSurgery(null)} />}
    </div>
  );
}