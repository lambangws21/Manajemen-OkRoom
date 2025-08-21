'use client';

import { useState, useMemo } from 'react';
import { ScheduledSurgery, StaffMember } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input'; // <-- Impor Input
import { X, ArrowRightLeft, CheckCircle2, Search } from 'lucide-react';
import { mockStaffMembers } from '@/lib/mock-data';

interface PatientHandoverModalProps {
  surgery: ScheduledSurgery;
  onClose: () => void;
  onSubmit: (handoverNotes: string, receivingTeam: StaffMember[]) => void;
}

export default function PatientHandoverModal({ surgery, onClose, onSubmit }: PatientHandoverModalProps) {
  const [notes, setNotes] = useState<string>('');
  const [selectedReceiverIds, setSelectedReceiverIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState(''); // <-- State untuk search

  const potentialReceivers = mockStaffMembers.filter(s => s.role.includes('Perawat'));
  
  // Filter daftar perawat berdasarkan searchTerm
  const filteredReceivers = useMemo(() => {
    if (!searchTerm) {
      return potentialReceivers;
    }
    return potentialReceivers.filter(staff =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, potentialReceivers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert('Catatan serah terima tidak boleh kosong.');
      return;
    }
    const receivingTeam = potentialReceivers.filter(staff => selectedReceiverIds.has(staff.id));
    onSubmit(notes, receivingTeam);
  };

  const handleSelectReceiver = (staffId: string) => {
    const newSelection = new Set(selectedReceiverIds);
    if (newSelection.has(staffId)) {
      newSelection.delete(staffId);
    } else {
      newSelection.add(staffId);
    }
    setSelectedReceiverIds(newSelection);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl flex flex-col animate-fade-in-down" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center border-b dark:border-gray-700 pb-4 mb-4">
          <div className="flex items-center">
            <ArrowRightLeft size={24} className="mr-3 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Serah Terima Pasien</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md" >
                <p><strong>Pasien:</strong> {surgery.patientName}</p>
                <p><strong>No. RM:</strong> {surgery.mrn}</p>
                <p><strong>Status Saat Ini:</strong> {surgery.status}</p>
            </div>
            
            <div>
              <label htmlFor="handoverNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Catatan Serah Terima (Wajib)
              </label>
              <textarea 
                id="handoverNotes"
                name="handoverNotes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" 
                rows={5}
                placeholder="Contoh: Pasien diserahkan dalam kondisi stabil, TTV normal..."
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diserahkan Kepada Tim Perawat
              </label>
              {/* Search Input */}
              <div className="relative mb-2">
                <Input 
                  placeholder="Cari nama perawat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Daftar Perawat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {filteredReceivers.length > 0 ? filteredReceivers.map(staff => (
                  <div 
                    key={staff.id} 
                    onClick={() => handleSelectReceiver(staff.id)}
                    className={`p-2 rounded-md cursor-pointer flex items-center justify-between transition-all ${
                      selectedReceiverIds.has(staff.id) 
                        ? 'bg-blue-100 ring-2 ring-blue-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-700">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.role}</p>
                    </div>
                    {selectedReceiverIds.has(staff.id) && <CheckCircle2 size={18} className="text-blue-600" />}
                  </div>
                )) : (
                  <p className="text-sm text-gray-400 col-span-2 text-center py-4">Nama tidak ditemukan.</p>
                )}
              </div>
            </div>
          </div>
          
          <footer className="flex justify-end gap-4 pt-6 mt-4 border-t dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
            <Button type="submit">
              Konfirmasi Serah Terima
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
