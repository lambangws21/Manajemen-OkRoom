import {
  Room,
  PatientStatusData,
  ScheduledSurgery,
  OngoingSurgery,
  StaffMember,
  OperatingRoomShift,
  // Dihapus: 'PatientStage' tidak digunakan secara langsung di file ini
} from "@/types";

// =====================================================================
// #1 DATA STATIS DASAR
// =====================================================================

export const mockRooms: Room[] = [
  { id: "ok-1", number: 1, type: "Bedah Umum", status: "Sedang Operasi" },
  { id: "ok-2", number: 2, type: "Ortopedi", status: "Kotor" },
  { id: "ok-3", number: 3, type: "Jantung", status: "Tersedia" },
  { id: "ok-4", number: 4, type: "Mata", status: "Dibersihkan" },
  { id: "ok-5", number: 5, type: "Bedah Saraf", status: "Perbaikan" },
  { id: "ok-6", number: 6, type: "Umum", status: "Tersedia" },
];

export const mockStaffMembers: StaffMember[] = [
  { id: "an-01", name: "Dr. Made Wirawan, Sp.An", role: "Dokter Anestesi" },
  { id: "an-02", name: "Dr. Ketut Sucipta, Sp.An", role: "Dokter Anestesi" },
  { id: "an-03", name: "Dr. Gede Bayu, Sp.An", role: "Dokter Anestesi" },
  { id: "an-04", name: "Dr. Komang Aryani, Sp.An", role: "Dokter Anestesi" },
  { id: "an-05", name: "Dr. Putu Sanjaya, Sp.An", role: "Dokter Anestesi" },
  { id: "pb-01", name: "Ns. Wayan Sari", role: "Perawat Bedah" },
  { id: "pb-02", name: "Ns. Gede Pratama", role: "Perawat Bedah" },
  { id: "pb-03", name: "Ns. Putu Eka", role: "Perawat Bedah" },
  { id: "pb-04", name: "Ns. Kadek Dharma", role: "Perawat Bedah" },
  { id: "pb-05", name: "Ns. Komang Ayu", role: "Perawat Bedah" },
  { id: "pb-06", name: "Ns. Luh Mertasih", role: "Perawat Bedah" },
  { id: "pb-07", name: "Ns. Made Suarta", role: "Perawat Bedah" },
  { id: "pb-08", name: "Ns. Nyoman Tri", role: "Perawat Bedah" },
  { id: "pb-09", name: "Ns. Ketut Widi", role: "Perawat Bedah" },
  { id: "pb-10", name: "Ns. Wayan Budi", role: "Perawat Bedah" },
  { id: "pb-11", name: "Ns. Gede Arta", role: "Perawat Bedah" },
  { id: "pb-12", name: "Ns. Putu Dewi", role: "Perawat Bedah" },
  { id: "pb-13", name: "Ns. Kadek Santi", role: "Perawat Bedah" },
  { id: "pb-14", name: "Ns. Komang Adi", role: "Perawat Bedah" },
  { id: "pb-15", name: "Ns. Luh Wati", role: "Perawat Bedah" },
  { id: "pa-01", name: "Ns. Komang Putra", role: "Perawat Anestesi" },
  { id: "pa-02", name: "Ns. Luh Novi", role: "Perawat Anestesi" },
  { id: "pa-03", name: "Ns. Made Yasa", role: "Perawat Anestesi" },
  { id: "pa-04", name: "Ns. Nyoman Sinta", role: "Perawat Anestesi" },
  { id: "pa-05", name: "Ns. Ketut Ari", role: "Perawat Anestesi" },
  { id: "pa-06", name: "Ns. Wayan Agus", role: "Perawat Anestesi" },
  { id: "pa-07", name: "Ns. Gede Sugi", role: "Perawat Anestesi" },
  { id: "pa-08", name: "Ns. Putu Rini", role: "Perawat Anestesi" },
  { id: "pa-09", name: "Ns. Kadek Suci", role: "Perawat Anestesi" },
  { id: "pa-10", name: "Ns. Komang Jaya", role: "Perawat Anestesi" },
];

const dokterAnestesi = mockStaffMembers.filter(s => s.role === 'Dokter Anestesi');
const perawatBedah = mockStaffMembers.filter(s => s.role === 'Perawat Bedah');
const perawatAnestesi = mockStaffMembers.filter(s => s.role === 'Perawat Anestesi');

export const mockOnCallAnesthesiaTeam: StaffMember[] = [ dokterAnestesi[0], dokterAnestesi[1], dokterAnestesi[2] ];

export const mockShiftAssignments: OperatingRoomShift[] = [
  { operatingRoom: "OK 1 (Bedah Umum)", shift: "Pagi", anesthesiologist: dokterAnestesi[0], nurses: [perawatBedah[0], perawatAnestesi[0]] },
  { operatingRoom: "OK 2 (Ortopedi)", shift: "Pagi", anesthesiologist: dokterAnestesi[1], nurses: [perawatBedah[1], perawatAnestesi[1]] },
  { operatingRoom: "OK 1 (Bedah Umum)", shift: "Siang", anesthesiologist: dokterAnestesi[2], nurses: [perawatBedah[2], perawatAnestesi[2]] },
  { operatingRoom: "OK 3 (Jantung)", shift: "Siang", anesthesiologist: dokterAnestesi[3], nurses: [perawatBedah[3], perawatAnestesi[3]] },
  { operatingRoom: "OK 1 (Bedah Umum)", shift: "Malam", anesthesiologist: dokterAnestesi[4], nurses: [perawatBedah[4], perawatAnestesi[4]] },
];

// =====================================================================
// #2 DATA DINAMIS (JADWAL, LIVE VIEW, STATS)
// =====================================================================
const createDate = (hour: number, minute: number, dayOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

// DIUBAH: 'let' menjadi 'const' karena tidak di-assign ulang
export const mockScheduledSurgeries: ScheduledSurgery[] = [
  { id: "op-001", patientName: "Budi Santoso", mrn: "MRN-12345", procedure: "Operasi Katarak", doctorName: "Dr. I Gusti Ngurah", scheduledAt: createDate(9, 0), status: "Ruang Pemulihan", assignedOR: "OK 4 (Mata)" },
  { id: "op-002", patientName: "Citra Lestari", mrn: "MRN-67890", procedure: "Operasi Caesar", doctorName: "Dr. Ayu Wulandari", scheduledAt: createDate(11, 0), status: "Operasi Selesai", assignedOR: "OK 1 (Bedah Umum)" },
  { id: "op-005", patientName: "Eka Prasetya", mrn: "MRN-54321", procedure: "Total Knee Replacement", doctorName: "Dr. Ngurah Sanjaya", scheduledAt: createDate(14, 30), status: "Operasi Berlangsung", assignedOR: 'OK 2 (Ortopedi)' },
  { id: "op-008", patientName: "Hadi Wijaya", mrn: "MRN-44556", procedure: "Angioplasti Koroner", doctorName: "Dr. I Wayan Kardiasa", scheduledAt: createDate(16, 0), status: "Persiapan Operasi", assignedOR: "OK 3 (Jantung)" },
  { id: "op-009", patientName: "Indah Cahyani", mrn: "MRN-55667", procedure: "Cholecystectomy", doctorName: "Dr. Ayu Wulandari", scheduledAt: createDate(21, 0), status: "Terkonfirmasi" },
  { id: "op-007", patientName: "Made Dahlam", mrn: "MRN-11443", procedure: "Vericocle", doctorName: "Dr. I Nym Adyt", scheduledAt: createDate(8, 30, 1), status: "Dipanggil" },
  { id: "op-013", patientName: "Cici Mandala", mrn: "MRN-17873", procedure: "Operasi SC ", doctorName: "Dr. Ayu Diah", scheduledAt: createDate(8, 30, 1), status: "Dipanggil" },

];

// DIUBAH: 'let' menjadi 'const'
export const mockSurgeryBoard: OngoingSurgery[] = mockScheduledSurgeries
  .filter(s => ['Persiapan Operasi', 'Operasi Berlangsung', 'Ruang Pemulihan'].includes(s.status))
  .map(s => {
    const shift = mockShiftAssignments.find(as => as.operatingRoom === s.assignedOR);
    return {
      id: s.id,
      procedure: s.procedure,
      doctorName: s.doctorName,
      caseId: `*** *** ${s.mrn.slice(-3)}`,
      operatingRoom: s.assignedOR || 'N/A',
      status: s.status as 'Persiapan Operasi' | 'Operasi Berlangsung' | 'Ruang Pemulihan',
      startTime: new Date(new Date(s.scheduledAt).getTime() + 5 * 60 * 1000).toISOString(),
      team: { 
        anesthesiologist: shift?.anesthesiologist || dokterAnestesi[0],
        nurses: shift?.nurses || [],
      }
    };
  });

const todayStr = new Date().toISOString().split('T')[0];
const todaysSchedule = mockScheduledSurgeries.filter(s => s.scheduledAt.startsWith(todayStr) && s.status !== 'Dibatalkan');
const operationalRooms = mockRooms.filter(r => r.status !== 'Perbaikan').length;
const roomsInUse = mockRooms.filter(r => r.status === 'Sedang Operasi').length;

// DIUBAH: 'let' menjadi 'const'
export const mockDashboardStats = {
  occupancy: operationalRooms > 0 ? `${Math.round((roomsInUse / operationalRooms) * 100)}%` : "0%",
  arrivals: todaysSchedule.length,
  departures: todaysSchedule.filter(s => ['Operasi Selesai', 'Ruang Pemulihan'].includes(s.status)).length,
  dirty: mockRooms.filter(r => r.status === 'Kotor').length,
};

// =====================================================================
// #3 DATA PELACAK PASIEN (DINAMIS)
// =====================================================================
export const getMockPatientStatus = (accessCode: string): PatientStatusData | null => {
    // ... (Logika getMockPatientStatus tidak berubah)
  const surgery = mockScheduledSurgeries.find(s => s.id === accessCode);
  if (!surgery || surgery.status === 'Dibatalkan') return null;
  const now = new Date();
  const scheduledTime = new Date(surgery.scheduledAt);
  const handoverTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
  const prepTime = new Date(scheduledTime.getTime() - 5 * 60 * 1000);
  const surgeryEndTime = new Date(scheduledTime.getTime() + 90 * 60 * 1000);
  const recoveryTime = new Date(surgeryEndTime.getTime() + 60 * 60 * 1000);
  let currentStage: ScheduledSurgery['status'] = "Terjadwal";
  const allPossibleStages: { name: ScheduledSurgery['status'], time: Date, desc: string }[] = [ { name: "Pasien Diterima", time: handoverTime, desc: "Pasien telah diterima tim OK." }, { name: "Persiapan Operasi", time: prepTime, desc: "Tim melakukan persiapan akhir." }, { name: "Operasi Berlangsung", time: scheduledTime, desc: "Operasi sedang berjalan." }, { name: "Operasi Selesai", time: surgeryEndTime, desc: "Prosedur operasi telah selesai." }, { name: "Ruang Pemulihan", time: recoveryTime, desc: "Pasien dalam tahap pemulihan." } ];
  allPossibleStages.forEach(stage => { if (now >= stage.time) { currentStage = stage.name; } });
  const manualStatusIndex = allPossibleStages.findIndex(s => s.name === surgery.status);
  const dynamicStatusIndex = allPossibleStages.findIndex(s => s.name === currentStage);
  if (manualStatusIndex > dynamicStatusIndex) { currentStage = surgery.status; }
  const finalCurrentIndex = allPossibleStages.findIndex(s => s.name === currentStage);
  const finalStages = allPossibleStages.map((stage, index) => ({ name: stage.name, timestamp: index <= finalCurrentIndex ? stage.time.toISOString() : null, desc: stage.desc }));
  return { stages: finalStages, currentStage };
};