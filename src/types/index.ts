// This file is now the single source of truth for all types.

// 🔹 TAMBAHKAN TIPE INI
export type RoomStatus = 'Tersedia' | 'Dipakai' | 'Persiapan' | 'Pembersihan';

// 🔹 TAMBAHKAN INTERFACE INI
export interface OperatingRoom {
  id: string;
  number: string; // e.g., "OK 1"
  status: RoomStatus;
  patientName: string | null;
  procedure: string | null;
}

export interface OperatingRoomShiftPopulated
  extends Omit<OperatingRoomShift, 'anesthesiologistId' | 'nurseIds'> {
  anesthesiologist: StaffMember;
  nurses: StaffMember[];
}

export interface Room {
  id: string;
  number: string;
  type: string;
  status: 'Available' | 'Occupied' | 'Dirty' | 'Out of Order';
  assignedTeam?: string;
  updatedAt?: string;
}


export interface StaffMember {
  id: string;
  name: string;
  shift?: string;
  role: 'Dokter Anestesi' | 'Perawat Bedah' | 'Perawat Anestesi';
}


export type ShiftKey = 'Pagi' | 'Siang' | 'Malam';

export type NurseShiftTeams = {
  [K in ShiftKey]: StaffMember[];
};

export interface ShiftAssignment {
  anesthesiaTeam: StaffMember[];
  nurseTeams: NurseShiftTeams;
  responsibleStaff?: StaffMember;
}

// Menyimpan referensi ID, bukan objek utuh. Ini lebih efisien untuk database.
export interface AssignedTeamRef {
  anesthesiologistId: string;
  nurseIds: string[];
}

export interface ShiftAssignment {
  id: string;
  shift: string;
  anesthesiologistId: string;
  nurseIds: string[];
}


export interface OperatingRoomShift {
  operatingRoom: string;
  shift: 'Pagi' | 'Siang' | 'Malam';
  anesthesiologistId: string;
  nurseIds: string[];
}

// export interface SurgeryLog {
//   spongeCount: { before: number; after: number };
//   bloodLoss: number;
//   implants: string;
//   followUpCare: string;
//   documents: string;
// }

// 📁 src/types/index.ts atau src/types/tracker.ts
export interface SurgeryLog {
  // Waktu-waktu penting
  timePatientAccepted?: string;
  timePreparationStarted?: string;
  timeSurgeryEnded?: string;
  timeRecoveryStarted?: string;
  timePatientOut?: string;

  // Field tambahan log medis (biarkan opsional)
  spongeCount?: number;
  bloodLoss?: number;
  implants?: string;
  followUpCare?: string;
  documents?: string;
}


export interface BaseSurgery {
  id: string;
  procedure: string;
  doctorName: string;
}

export interface ScheduledSurgery extends BaseSurgery {
  id: string;
  patientName: string;
  mrn: string;
  scheduledAt: string;
  notes: string;
  room: string;
  assurance: string;
  status:
    | 'Terjadwal'
    | 'Terkonfirmasi'
    | 'Dibatalkan'
    | 'Siap Panggil'
    | 'Dipanggil'
    | 'Pasien Diterima'
    | 'Persiapan Operasi'
    | 'Operasi Berlangsung'
    | 'Operasi Selesai'
    | 'Ruang Pemulihan';
  assignedOR?: string;
  assignedTeam?: AssignedTeamRef;
  surgeryLog?: SurgeryLog;
  handoverTime?: string;
  createdAt?: string | null;
  receivingTeam?: { name: string }[]; // atau StaffMember[]
  startTime?: string | null; // 🔹 ubah bagian ini!
  endTime?: string | null;   // 🔹 sekalian tambahkan untuk konsistensi
}


// Versi yang sudah "populated" (dengan data lengkap dari koleksi staff)
export interface ScheduledSurgeryPopulated extends Omit<ScheduledSurgery, 'assignedTeam'> {
  assignedTeam?: {
    anesthesiologist: StaffMember;
    nurses: StaffMember[];
  };
}

export type NewScheduledSurgery = Omit<
  ScheduledSurgery,
  'id' | 'createdAt' | 'startTime' | 'endTime' | 'surgeryLog'
>;


export interface OngoingSurgery extends BaseSurgery {
  id: string;
  procedure: string;
  doctorName: string;
  patientName: string;
  mrn: string;
  caseId: string;
  operatingRoom: string;
  status: string;
  team?: AssignedTeamRef;

  // 💡 Jadikan opsional agar fleksibel
  startTime?: string;
  actualStartTime?: string;
  endTime?: string;

  // 💡 Tambahan field baru
  lastModified?: string; // ✅ tambahkan ini
  anesthesiologistName?: string;
  handoverTime?: string; // waktu pasien diterima
  // assignedTeam?: {
  //   anesthesiologistId: string;
  //   nurseIds: string[];
  // };
  assignedTeam?: AssignedTeamRef;
}
// export interface OngoingSurgery extends BaseSurgery {
//   id: string;
//   caseId: string;
//   patientName: string;
//   mrn: string;
//   procedure: string;
//   doctorName: string;
//   operatingRoom: string;
//   status: 'Persiapan Operasi' | 'Operasi Berlangsung' | 'Ruang Pemulihan';
//   startTime?: string;
//   actualStartTime?: string;
//   endTime?: string;
//   team: AssignedTeamRef;
//   surgeryLog?: SurgeryLog;
// }


// Tipe untuk Pelacak Pasien Individual
export interface PatientStage {
  name: string;
  timestamp: string | null;
  desc: string;
}

export interface PatientStatusData {
  stages: PatientStage[];
  currentStage: string;
}



// src/types/index.ts

// --- 1. Definisi Role/Status (untuk konsistensi) ---
export type StaffRole = 
  | 'Dokter Anestesi' 
  | 'Perawat Bedah' 
  | 'Perawat Anestesi';

// --- 2. Interface Staff Member ---

export interface Staff {
  /** Firestore Document ID (Wajib untuk CRUD) */
  id: string; 
  name: string;
  /** Role staf, sesuai enum yang ditentukan */
  role: StaffRole; 
  /** Department, Opsional di database */
  department?: string; 
  /** Waktu pembuatan record (opsional, dikelola oleh Firestore) */
  createdAt?: string; 
  /** Waktu update terakhir (opsional, dikelola oleh Firestore) */
  updatedAt?: string; 
}

// --- Tambahan untuk Komponen Visual Grid / Card ---
export interface ProcessedRoom extends OperatingRoom {
  name: string;
  description?: string;
  team?: StaffMember[];
}


// --- 3. Interface untuk data yang dikirim dari Form (tanpa ID/metadata) ---
// Berguna untuk memastikan data yang dikirim ke POST/PUT tidak memiliki ID
export type StaffPayload = Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>;

// export interface Room {
//   id: number | string;
//   number: number;
//   type: string;
//   status: 'Tersedia' | 'Sedang Operasi' | 'Kotor' | 'Dibersihkan' | 'Perbaikan';
// }

// export interface StaffMember {
//   id: string;
//   name: string;
//   role: 'Dokter Anestesi' | 'Perawat Bedah' | 'Perawat Anestesi';
// }

// export interface OperatingRoomShift {
//   operatingRoom: string;
//   shift: 'Pagi' | 'Siang' | 'Malam';
//   anesthesiologistId: string;
//   nurseIds: string[];
// }

// export interface SurgeryLog {
//   spongeCount: { before: number; after: number };
//   bloodLoss: number;
//   implants: string;
//   followUpCare: string;
//   documents: string;
// }



// export interface AssignedTeamRef {
//   anesthesiologistId: string;
//   nurseIds: string[];
// }

// export interface BaseSurgery {
//   id: string;
//   procedure: string;
//   doctorName: string;
// }

// export interface ScheduledSurgery extends BaseSurgery {
//   patientName: string;
//   mrn: string;
//   scheduledAt: string; // Stored as ISO string in the app
//   status: 
//     | 'Terjadwal' 
//     | 'Terkonfirmasi' 
//     | 'Dibatalkan'
//     | 'Siap Panggil'
//     | 'Dipanggil'
//     | 'Pasien Diterima'
//     | 'Persiapan Operasi'
//     | 'Operasi Berlangsung'
//     | 'Operasi Selesai'
//     | 'Ruang Pemulihan';
//   assignedOR?: string;
//   // This will store references (IDs) to staff members
//   assignedTeam?: AssignedTeamRef;
//   surgeryLog?: SurgeryLog;
// }

// // Type for creating new data, omitting the 'id'
// export type NewScheduledSurgery = Omit<ScheduledSurgery, 'id'>;


// export interface OngoingSurgery extends BaseSurgery {
//   caseId: string;
//   operatingRoom: string;
//   startTime: string;
//   status: 'Persiapan Operasi' | 'Operasi Berlangsung' | 'Ruang Pemulihan';
//   team: {
//     nurses: StaffMember[];
//   };
// }
