'use client';

import { StaffMember } from '@/types';
import StaffSelectionModal from '@/components/Team/StafSelectionModal';


export interface AssignTeamModalProps {
  patientName: string;
  initialTeam: StaffMember[];
  staffList: StaffMember[];
  onAssign: (team: StaffMember[]) => void | Promise<void>;
  onClose: () => void;
}

export default function AssignTeamModal({
  patientName,
  initialTeam,
  staffList,
  onAssign,
  onClose,
}: AssignTeamModalProps) {
  return (
    <StaffSelectionModal
      title={`Atur Tim Perawat untuk ${patientName}`}
      // 💥 PERBAIKAN: Hapus fallback ke mockData.
      // Sekarang murni menggunakan staffList yang di-pass dari PapanKendaliPage
      // (yang berasal dari /api/shift-assignments)
      staffList={staffList}
      initialSelection={initialTeam}
      onClose={onClose}
      onSave={onAssign}
    />
  );
}