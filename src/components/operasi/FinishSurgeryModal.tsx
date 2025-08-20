'use client';
import { useState } from 'react';
import { SurgeryLog } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { X } from 'lucide-react';

interface FinishSurgeryModalProps {
  onClose: () => void;
  onSubmit: (log: SurgeryLog) => void;
}

export default function FinishSurgeryModal({ onClose, onSubmit }: FinishSurgeryModalProps) {
  const [log, setLog] = useState<SurgeryLog>({
    spongeCount: { before: 0, after: 0 },
    bloodLoss: 0,
    implants: 'Tidak ada',
    followUpCare: '',
    documents: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLog(prev => ({ ...prev, [name]: value }));
  };

  const handleSpongeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLog(prev => ({ ...prev, spongeCount: { ...prev.spongeCount, [name]: Number(value) } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              <Input type="number" name="before" value={log.spongeCount.before} onChange={handleSpongeCountChange} required />
            </div>
            <div>
              <label className="text-sm font-medium">Jml Kasa (Sesudah)</label>
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