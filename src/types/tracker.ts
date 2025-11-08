// types/tracker.ts

/**
 * Interface untuk data operasi yang diterima dari /api/operasi/[id]
 * Ini mencerminkan ExtendedOngoingSurgery dari API Anda.
 */
export interface ExtendedOngoingSurgery {
    id: string; 
    caseId: string;
    procedure: string;
    doctorName: string;
    operatingRoom: string;
    status: string; // Misal: "Persiapan Operasi", "Operasi Berlangsung"
    patientName: string;
    mrn: string;
    startTime?: string; // ISO String (Waktu masuk OK)
    actualStartTime?: string; // ISO String (Waktu operasi dimulai)
    endTime?: string; // ISO String (Waktu operasi selesai/pindah recovery)
}

/**
 * Tipe data untuk setiap langkah di timeline
 */
export interface PatientStage {
  name: string;
  timestamp: string | null;
  desc: string; 
  statusKey: string; // Kunci status yang memicu stage ini
}

/**
 * Tipe data yang dibutuhkan oleh komponen StatusTimeline
 */
export interface PatientStatusData {
    id: string;
    patientName: string;
    mrn: string;
    stages: PatientStage[];
    currentStage: string; // Nama stage yang sedang aktif (misal: "Operasi Berlangsung")
}

export type TimelineStatus = 'Diterima' | 'Operasi Berlangsung' | 'Ruang Pemulihan';