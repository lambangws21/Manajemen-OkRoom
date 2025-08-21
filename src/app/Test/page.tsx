// 'use client';
// import { useState } from 'react';
// import { mockStaffMembers, mockShiftAssignments } from '@/lib/mock-data';
// import { ScheduledSurgery, StaffMember } from '@/types';
// import Card from '@/components/ui/Card';
// import Button from '@/components/ui/Button';
// import Badge from '@/components/ui/Badge';
// import { PhoneCall } from 'lucide-react';
// import AssignORModal from '@/components/kendali/AssignORModal';
// import AssignTeamModal from '@/components/kendali/AssignTeamModal';
// import { getCurrentShift } from '@/lib/utils';

// interface ControlBoardProps {
//   initialSchedule: ScheduledSurgery[];
//   onScheduleUpdate: (updatedSchedule: ScheduledSurgery[]) => void;
// }

// export default function ControlBoard({ initialSchedule, onScheduleUpdate }: ControlBoardProps) {
//   const [schedule, setSchedule] = useState<ScheduledSurgery[]>(initialSchedule);
  
//   const [selectedSurgery, setSelectedSurgery] = useState<ScheduledSurgery | null>(null);
//   const [modal, setModal] = useState<"assignOR" | "assignTeam" | null>(null);

//   const updateSchedule = (newSchedule: ScheduledSurgery[]) => {
//     setSchedule(newSchedule);
//     onScheduleUpdate(newSchedule);
//   };

//   const handleCallPatient = (id: string) => {
//     // SOLUSI: Definisikan tipe status secara eksplisit
//     const newStatus: ScheduledSurgery['status'] = "Dipanggil";
//     const newSchedule = schedule.map(s => s.id === id ? { ...s, status: newStatus } : s);
//     updateSchedule(newSchedule);
//   };

//   const handleAssignOR = (orNumber: string) => {
//     if (!selectedSurgery) return;
//     const newStatus: ScheduledSurgery['status'] = 'Terkonfirmasi';
//     const newSchedule = schedule.map(s => s.id === selectedSurgery.id ? { ...s, assignedOR: orNumber, status: newStatus } : s);
//     updateSchedule(newSchedule);
//     setModal(null);
//   };

//   const handleAssignTeam = (team: StaffMember[]) => {
//     if (!selectedSurgery) return;
//     const activeShift = getCurrentShift();
//     const anesthesiologist = mockShiftAssignments.find(a => a.shift === activeShift)?.anesthesiologist || mockStaffMembers[0];
//     const newSchedule = schedule.map(s => s.id === selectedSurgery.id ? { ...s, assignedTeam: { anesthesiologist, nurses: team } } : s);
//     updateSchedule(newSchedule);
//     setModal(null);
//   };

//   return (
//     <>
//       <Card className="overflow-x-auto">
//         <table className="w-full text-left text-sm">
//           {/* ... JSX Tabel tidak berubah ... */}
//         </table>
//       </Card>

//       {modal === "assignOR" && selectedSurgery && (
//         <AssignORModal onClose={() => setModal(null)} onAssign={handleAssignOR} />
//       )}
//       {modal === "assignTeam" && selectedSurgery && (
//         <AssignTeamModal patientName={selectedSurgery.patientName} initialTeam={selectedSurgery.assignedTeam?.nurses || []} onClose={() => setModal(null)} onAssign={handleAssignTeam} />
//       )}
//     </>
//   );
// }