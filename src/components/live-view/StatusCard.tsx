'use client';

import { OngoingSurgery } from '@/types/index';
import Card from '@/components/ui/Card';
import { Clock, Syringe, Bed, Users, Stethoscope } from 'lucide-react';

const statusConfig = {
  'Persiapan': {
    label: 'PERSIAPAN',
    color: 'bg-yellow-500',
    icon: <Syringe size={36} className="text-white" />
  },
  'Operasi Berlangsung': {
    label: 'OPERASI BERLANGSUNG',
    color: 'bg-red-600 animate-pulse',
    icon: <Clock size={36} className="text-white" />
  },
  'Ruang Pemulihan': {
    label: 'RUANG PEMULIHAN',
    color: 'bg-blue-500',
    icon: <Bed size={36} className="text-white" />
  },
};

interface StatusCardProps {
  data: OngoingSurgery;
}

export default function StatusCard({ data }: StatusCardProps) {
  const config = statusConfig[data.status];

  // Cari dokter anestesi dari tim jaga harian (dummy logic)
  // Di aplikasi nyata, data ini akan datang langsung dari 'OngoingSurgery'
  const anesthesiologist = { name: 'Dr. Made Wirawan, Sp.An' }; // Contoh

  return (
    // Mengubah Card menjadi layout grid dengan 3 kolom
    <Card className="grid grid-cols-3 p-0 overflow-hidden min-h-[300px]">
      
      {/* Kolom 1: Informasi Tim Jaga (Sidebar Samping) */}
      <div className="col-span-1 bg-gray-100 p-4 flex flex-col">
        {/* Dokter Anestesi */}
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-700 flex items-center border-b pb-2">
            <Stethoscope size={16} className="mr-2" />
            DOKTER ANESTESI
          </h4>
          <div className="text-sm text-gray-600 mt-2">
            {/* Asumsi data dokter anestesi ada di data.team */}
            {anesthesiologist.name}
          </div>
        </div>
        
        {/* Tim Perawat */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 flex items-center border-b pb-2">
            <Users size={16} className="mr-2" />
            TIM PERAWAT
          </h4>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            {data.team.nurses.map(nurse => (
              <li key={nurse.id}>{nurse.name}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Kolom 2 & 3: Informasi Utama Pasien */}
      <div className="col-span-2 flex flex-col">
        <div className={`p-4 flex items-center ${config.color}`}>
          {config.icon}
          <p className="ml-4 font-bold text-2xl text-white">{config.label}</p>
        </div>
        
        <div className="p-6 text-center flex-grow flex flex-col justify-center">
          <p className="text-lg font-medium text-gray-500">ID Pasien</p>
          <p className="text-5xl font-bold tracking-wider text-gray-800 my-2">{data.caseId}</p>
          <p className="text-2xl text-gray-600">{data.operatingRoom}</p>
        </div>

        {/* Anda bisa menghapus footer status jika sudah ada di header */}
      </div>
    </Card>
  );
}