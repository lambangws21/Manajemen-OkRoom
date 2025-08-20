'use client';
import { StaffMember } from '@/types';
import StaffSelectionModal from '@/components/Team/StafSelectionModal';
// DITAMBAHKAN: Impor 'mockStaffMembers' dari file data Anda
import { mockStaffMembers } from '@/lib/mock-data';

interface AssignTeamModalProps {
  initialTeam: StaffMember[];
  onClose: () => void;
  onAssign: (team: StaffMember[]) => void;
  patientName: string;
}

export default function AssignTeamModal({ initialTeam, onClose, onAssign, patientName }: AssignTeamModalProps) {
  return (
    <StaffSelectionModal
      title={`Atur Tim Perawat untuk ${patientName}`}
      // Sekarang 'mockStaffMembers' sudah dikenal dan error hilang
      staffList={mockStaffMembers.filter(s => s.role.includes('Perawat'))}
      initialSelection={initialTeam}
      onClose={onClose}
      onSave={onAssign}
    />
  );
}