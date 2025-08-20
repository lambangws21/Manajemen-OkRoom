'use client';
import { useState, FormEvent } from 'react';
import { ScheduledSurgery } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Omit<'id'> berarti kita tidak memerlukan 'id' saat membuat data baru
type NewSurgeryData = Omit<ScheduledSurgery, 'id' | 'status'>;

interface AddSurgeryFormProps {
  onClose: () => void;
  onSubmit: (data: NewSurgeryData) => void;
}

export default function AddSurgeryForm({ onClose, onSubmit }: AddSurgeryFormProps) {
  const [formData, setFormData] = useState<NewSurgeryData>({
    patientName: '',
    mrn: '',
    procedure: '', // <-- DIUBAH: dari plannedProcedure
    doctorName: '',
    scheduledAt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-down" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Tambah Jadwal Operasi Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="patientName" placeholder="Nama Pasien" value={formData.patientName} onChange={handleChange} required />
          <Input name="mrn" placeholder="Nomor Rekam Medis (MRN)" value={formData.mrn} onChange={handleChange} required />
          {/* DIUBAH: 'name' dan 'value' disesuaikan */}
          <Input name="procedure" placeholder="Prosedur yang Direncanakan" value={formData.procedure} onChange={handleChange} required />
          <Input name="doctorName" placeholder="Nama Dokter" value={formData.doctorName} onChange={handleChange} required />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Waktu Operasi</label>
            <Input name="scheduledAt" type="datetime-local" value={formData.scheduledAt} onChange={handleChange} required />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
            <Button type="submit" variant="primary">Simpan Jadwal</Button>
          </div>
        </form>
      </div>
    </div>
  );
}