export interface Room {
  id: number | string;
  number: number;
  type: string;
  status: 'Tersedia' | 'Sedang Operasi' | 'Kotor' | 'Dibersihkan' | 'Perbaikan';
}

export interface PatientStage {
  name: string;
  timestamp: string | null;
  desc: string;
}

export interface PatientStatusData {
  stages: PatientStage[];
  currentStage: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Dokter Anestesi' | 'Perawat Bedah' | 'Perawat Anestesi';
}

export interface OperatingRoomShift {
  operatingRoom: string;
  shift: 'Pagi' | 'Siang' | 'Malam';
  anesthesiologist: StaffMember;
  nurses: StaffMember[];
}

export interface BaseSurgery {
  id: string;
  procedure: string;
  doctorName: string;
}

export interface SurgeryLog {
  spongeCount: { before: number; after: number };
  bloodLoss: number; // in ml
  implants: string; // e.g., "Plate, Screw A, Screw B"
  followUpCare: string;
  documents: string; // e.g., "Rontgen, Hasil Lab"
}
export interface ScheduledSurgery extends BaseSurgery {
  patientName: string;
  mrn: string;
  scheduledAt: string;
  status: 
    | 'Terjadwal' 
    | 'Terkonfirmasi' 
    | 'Dibatalkan'
    | 'Pasien Diterima'
    | 'Siap Panggil'
    | 'Dipanggil'
    | 'Operasi Berlangsung'
    | 'Operasi Selesai'
    | 'Persiapan Operasi'
    | 'Ruang Pemulihan';
  // DITAMBAHKAN: Properti baru untuk penugasan
  assignedOR?: string; // e.g., "OK 1"
  assignedTeam?: {
    anesthesiologist: StaffMember;
    nurses: StaffMember[];
  };
  surgeryLog?: SurgeryLog;
}
// ... (interface lainnya)

export interface OngoingSurgery extends BaseSurgery {
  caseId: string;
  operatingRoom: string;
  startTime: string;
  status: 'Persiapan Operasi' | 'Operasi Berlangsung' | 'Ruang Pemulihan';
  // DIUBAH: Tambahkan dokter anestesi ke dalam tim
  team: {
    anesthesiologist: StaffMember;
    nurses: StaffMember[];
  };
}


// export interface OngoingSurgery extends BaseSurgery {
//   caseId: string;
//   operatingRoom: string;
//   startTime: string;
//   status: 'Persiapan Operasi' | 'Operasi Berlangsung' | 'Ruang Pemulihan';
//   team: {
//     nurses: StaffMember[];
//   };
// }
