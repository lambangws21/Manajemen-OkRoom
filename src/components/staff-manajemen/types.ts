export interface Staff {
    id: string;
    name: string;
    role: string;
    department?: string;
  }
  
  export interface StaffFormData {
    name: string;
    role: string;
    department: string;
  }
  
  export interface LeaveData {
    id: string;
    staffName: string;
    type: 'Cuti' | 'Sakit' | 'Izin';
    startDate: string;
    endDate: string;
    status: 'Pending' | 'Disetujui' | 'Ditolak';
  }
  