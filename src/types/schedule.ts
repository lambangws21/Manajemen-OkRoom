export interface StaffMember {
    id: string;
    name: string;
    role: 'Dokter Anestesi' | 'Perawat Bedah' | 'Perawat Anestesi';
  }
export type ScheduledSurgery = {
    id: string;
    patientName: string;
    mrn: string;
    procedure: string;
    doctorName: string;
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
    
    export type SurgeryLog = {
      spongeCount: { before: number; after: number };
      before: number;
      after: number;
      bloodLoss: number;
      implants: string;
      followUpCare: string;
      documents: string;
    };
  
  export type NewScheduledSurgery = Omit<ScheduledSurgery, "id">;

  