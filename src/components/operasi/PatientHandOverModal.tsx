'use client';

import { useState } from 'react';
import { ScheduledSurgery, StaffMember } from '@/types';
import Button from '@/components/ui/Button';
import { X, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { mockStaffMembers } from '@/lib/mock-data';

interface PatientHandoverModalProps {
  surgery: ScheduledSurgery;
  onClose: () => void;
  onSubmit: (handoverNotes: string, receivingTeam: StaffMember[]) => void;
}

export default function PatientHandoverModal({ surgery, onClose, onSubmit }: PatientHandoverModalProps) {
  const [notes, setNotes] = useState<string>('');
  
  // SOLUSI: Kita akan gunakan state ini untuk menyimpan tim penerima yang dipilih
  const [selectedReceiverIds, setSelectedReceiverIds] = useState<Set<string>>(new Set());

  // Ambil daftar perawat dari mock data sebagai tim penerima potensial
  const potentialReceivers = mockStaffMembers.filter(s => s.role.includes('Perawat'));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert('Catatan serah terima tidak boleh kosong.');
      return;
    }
    // Cari objek StaffMember lengkap berdasarkan ID yang dipilih
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diserahkan Kepada Tim Perawat (Pilih 1 atau lebih)
              </label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
                {potentialReceivers.map(staff => (
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
                      <p className="font-semibold text-sm">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.role}</p>
                    </div>
                    {selectedReceiverIds.has(staff.id) && <CheckCircle2 size={18} className="text-blue-600" />}
                  </div>
                ))}
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