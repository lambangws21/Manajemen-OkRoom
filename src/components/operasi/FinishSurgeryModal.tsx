'use client';
import { useState } from 'react';
// Asumsi: Kita akan memodifikasi/memperluas tipe SurgeryLog secara lokal
import { SurgeryLog } from '@/types'; 
import {Button} from '@/components/ui/ui/button';
import {Input} from '@/components/ui/ui/input';
import { X } from 'lucide-react';

// 💡 PENAMBAHAN TIPE LOKAL: Untuk memperbaiki error 2322 & 2352
interface SpongeCount {
  before: number;
  after: number;
}

// 💡 PERLUASAN TIPE LOG:
// Jika SurgeryLog asli mendefinisikan spongeCount sebagai 'number', kita perlu membuat 
// tipe lokal yang benar-benar mewakili struktur yang Anda gunakan.
// Karena kita hanya menggunakan log parsial di sini, kita pastikan semua yang kita gunakan benar.
interface LocalSurgeryLogState extends Omit<SurgeryLog, 'spongeCount'> {
  spongeCount: SpongeCount;
  // Anda mungkin juga perlu menambahkan properti waktu opsional di sini jika ingin 
  // mempertahankan type safety penuh di file ini.
  timeSurgeryEnded?: string;
}

interface FinishSurgeryModalProps {
  onClose: () => void;
  // Menerima tipe log parsial agar sesuai dengan onUpdate yang sudah diperbaiki
  onSubmit: (log: Partial<LocalSurgeryLogState>) => void; 
}

export default function FinishSurgeryModal({ onClose, onSubmit }: FinishSurgeryModalProps) {
  // 💡 PERBAIKAN 1: Gunakan LocalSurgeryLogState untuk state.
  const [log, setLog] = useState<LocalSurgeryLogState>({
    spongeCount: { before: 0, after: 0 },
    // Asumsi properti lain (bloodLoss, dll.) adalah bagian dari SurgeryLog yang di-Omit
    bloodLoss: 0, // Asumsi ini ada di SurgeryLog
    implants: 'Tidak ada',
    followUpCare: '',
    documents: '',
  } as LocalSurgeryLogState); // Paksa asersi tipe untuk memastikan semua properti terpenuhi

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Tipe dasar aman
    setLog(prev => ({ ...prev, [name]: value }));
  };

  const handleSpongeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 💡 PERBAIKAN 2: Gunakan spread operator pada prev.spongeCount yang sekarang TIPE OBJEK.
    // Ini memperbaiki error 2698, 18048, dan 2339.
    setLog(prev => ({ 
        ...prev, 
        spongeCount: { 
            ...prev.spongeCount, 
            [name as keyof SpongeCount]: Number(value) 
        } 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 💡 PERBAIKAN 3: onSubmit menerima Partial<LocalSurgeryLogState>
    // Ini mengizinkan log yang belum tentu memiliki semua properti waktu, namun properti utama ada.
    onSubmit(log); 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Laporan Pasca-Operasi</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Jml Kasa (Sebelum)</label>
              {/* Akses properti objek, sekarang aman */}
              <Input type="number" name="before" value={log.spongeCount.before} onChange={handleSpongeCountChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Jml Kasa (Sesudah)</label>
              {/* Akses properti objek, sekarang aman */}
              <Input type="number" name="after" value={log.spongeCount.after} onChange={handleSpongeCountChange} required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Perdarahan (ml)</label>
            <Input type="number" name="bloodLoss" value={log.bloodLoss} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium">Implan yang Digunakan</label>
            <Input name="implants" value={log.implants} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Tindak Lanjut Perawatan</label>
            <textarea name="followUpCare" value={log.followUpCare} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" rows={3}></textarea>
          </div>
          <div>
            <label className="text-sm font-medium">Berkas Dibawa</label>
            <Input name="documents" value={log.documents} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
            <Button type="submit">Selesai Operasi</Button>
          </div>
        </form>
      </div>
    </div>
  );
}