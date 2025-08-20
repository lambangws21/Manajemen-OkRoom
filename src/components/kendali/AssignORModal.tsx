'use client';
import Button from '@/components/ui/Button';
import { mockRooms } from '@/lib/mock-data';
import { useState } from 'react';

// PASTIKAN PROPS INI BENAR
interface AssignORModalProps {
  onClose: () => void;
  onAssign: (orNumber: string) => void; // <-- Harus menerima 'string'
}

export default function AssignORModal({ onClose, onAssign }: AssignORModalProps) {
  const [selectedOR, setSelectedOR] = useState<string>('');
  const availableRooms = mockRooms.filter(r => r.status === 'Tersedia' || r.status === 'Dibersihkan');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Pilih Ruang Operasi</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {availableRooms.map(room => (
            <div 
              key={room.id}
              onClick={() => setSelectedOR(`OK ${room.number}`)}
              className={`p-3 rounded-md cursor-pointer ${selectedOR === `OK ${room.number}` ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
              OK {room.number} - {room.type} ({room.status})
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={() => onAssign(selectedOR)} disabled={!selectedOR}>Tugaskan</Button>
        </div>
      </div>
    </div>
  );
}