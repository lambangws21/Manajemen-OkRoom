// 'use client';

// import { useState, useEffect, useMemo } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';
// import { mockStaffMembers, mockShiftAssignments } from '@/lib/mock-data';
// import type { ScheduledSurgeryPopulated, StaffMember } from '@/types/schedule';
// import Card from '@/components/ui/card';
// import Button from '@/components/ui/button';
// import Badge from '@/components/ui/Badge';
// import AssignORModal from '@/components/kendali/AssignORModal';
// import AssignTeamModal from '@/components/kendali/AssignTeamModal';
// import { getCurrentShift } from '@/lib/utils';
// import { getSchedules, updateSchedule } from '@/lib/scheduleApi';
// import { toast } from 'sonner';

// export default function ControlBoard() {
//   const [schedule, setSchedule] = useState<ScheduledSurgery[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSurgery, setSelectedSurgery] = useState<ScheduledSurgery | null>(null);
//   const [modal, setModal] = useState<'assignOR' | 'assignTeam' | null>(null);

//   useEffect(() => {
//     void loadData();
//   }, []);

//   async function loadData() {
//     setLoading(true);
//     try {
//       const todayStr = new Date().toISOString().split('T')[0];
//       const data = await getSchedules();
//       // Filter data hari ini di sisi klien
//       setSchedule(data.filter(s => s.scheduledAt.startsWith(todayStr) && s.status !== "Dibatalkan"));
//     } catch  {
//       toast.error("Gagal memuat jadwal dari database.");
//     } finally {
//       setLoading(false);
//     }
//   }
  
//   async function handleUpdate(updatedSurgery: Partial<ScheduledSurgery> & { id: string }) {
//     try {
//       // Optimistic update: perbarui UI dulu
//       setSchedule(prev => prev.map(s => s.id === updatedSurgery.id ? { ...s, ...updatedSurgery } : s));
      
//       // Ambil data lengkap untuk dikirim ke API
//       const fullData = schedule.find(s => s.id === updatedSurgery.id);
//       if (fullData) {
//         await updateSchedule({ ...fullData, ...updatedSurgery });
//       }
//     } catch {
//       toast.error("Gagal memperbarui jadwal.");
//       void loadData(); // Kembalikan ke data asli jika gagal
//     }
//   }

//   const handleCallPatient = (id: string) => {
//     void handleUpdate({ id, status: "Dipanggil" });
//     toast.info("Pasien telah dipanggil.");
//   };

//   const handleAssignOR = (orNumber: string) => {
//     if (!selectedSurgery) return;
//     void handleUpdate({ id: selectedSurgery.id, assignedOR: orNumber, status: 'Terkonfirmasi' });
//     setModal(null);
//   };

//   const handleAssignTeam = (team: StaffMember[]) => {
//     if (!selectedSurgery) return;
//     const activeShift = getCurrentShift();
//     const anesthesiologist = mockShiftAssignments.find(a => a.shift === activeShift)?.anesthesiologist || mockStaffMembers[0];
//     void handleUpdate({ id: selectedSurgery.id, assignedTeam: { anesthesiologist, nurses: team } });
//     setModal(null);
//   };
  
//   const sorted = useMemo(() => 
//     [...schedule].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
//   [schedule]);

//   if (loading) {
//     return <div className="text-center py-10">Memuat data...</div>;
//   }

//   return (
//     <div>
//       {/* Mobile list */}
//       <div className="grid gap-3 sm:hidden">
//         <AnimatePresence>
//           {sorted.map((s) => (
//             <motion.div
//               key={s.id}
//               layout
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow"
//             >
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="font-semibold">{s.patientName}</p>
//                   <p className="text-xs text-gray-500">{s.mrn}</p>
//                 </div>
//                 <Badge>{s.status}</Badge>
//               </div>
//               <div className="mt-2 text-sm space-y-1">
//                 <p><strong>OK:</strong> {s.assignedOR || '...'}</p>
//                 <p><strong>Tim:</strong> {s.assignedTeam?.nurses.length || 0} Perawat</p>
//               </div>
//               <div className="mt-3 flex justify-end gap-2">
//                 <Button size="sm" variant="secondary" onClick={() => { setSelectedSurgery(s); setModal('assignOR'); }}>Atur OK</Button>
//                 <Button size="sm" variant="secondary" onClick={() => { setSelectedSurgery(s); setModal('assignTeam'); }}>Atur Tim</Button>
//                 <Button size="sm" onClick={() => handleCallPatient(s.id)} disabled={!s.assignedOR || !s.assignedTeam || s.status !== 'Terkonfirmasi'}>Panggil</Button>
//               </div>
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>

//       {/* Desktop table */}
//       <div className="hidden sm:block">
//         <Card className="overflow-x-auto">
//           <table className="w-full text-left text-sm">
//             {/* ... JSX thead tidak berubah ... */}
//             <tbody className="divide-y dark:divide-gray-700">
//               {sorted.map((surgery) => (
//                 <tr key={surgery.id}>
//                   {/* ... JSX td tidak berubah, gunakan handler yang baru ... */}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </Card>
//       </div>

//       {modal === "assignOR" && selectedSurgery && (
//         <AssignORModal onClose={() => setModal(null)} onAssign={handleAssignOR} />
//       )}
//       {modal === "assignTeam" && selectedSurgery && (
//         <AssignTeamModal patientName={selectedSurgery.patientName} initialTeam={selectedSurgery.assignedTeam?.nurses || []} onClose={() => setModal(null)} onAssign={handleAssignTeam} />
//       )}
//     </div>
//   );
// }
