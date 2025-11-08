export type StaffRole = 'Dokter Anestesi' | 'Perawat';
export type ShiftKey = 'Pagi' | 'Siang' | 'Malam';

export interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftAssignment {
  anesthesiaTeam: Staff[];
  nurseTeams: { [K in ShiftKey]: Staff[] };
}

export type NurseShiftTeams = { [K in ShiftKey]: Staff[] };
