import {
  Room,
  PatientStatusData,
  ScheduledSurgery,
  OngoingSurgery,
  StaffMember,
  OperatingRoomShift,
  PatientStage,
} from "@/types";

// =====================================================================
// #1 DATA UNTUK DASHBOARD UTAMA
// =====================================================================
export const mockRooms: Room[] = [
  { id: "ok-1", number: 1, type: "Bedah Umum", status: "Sedang Operasi" },
  { id: "ok-2", number: 2, type: "Ortopedi", status: "Kotor" },
  { id: "ok-3", number: 3, type: "Jantung", status: "Sedang Operasi" },
  { id: "ok-4", number: 4, type: "Mata", status: "Dibersihkan" },
  { id: "ok-5", number: 5, type: "Bedah Saraf", status: "Perbaikan" },
  { id: "ok-6", number: 6, type: "Umum", status: "Tersedia" },
  { id: "ok-7", number: 7, type: "THT", status: "Tersedia" },
];

export const mockDashboardStats = {
  occupancy: "33%",
  arrivals: 3,
  departures: 2,
  dirty: 2,
};

// ... (import dan data mockRooms, mockDashboardStats, dll.)

// =====================================================================
// #2 DATA STAF & JADWAL JAGA
// =====================================================================

export const mockStaffMembers: StaffMember[] = [
  // 5 Dokter Anestesi
  { id: "an-01", name: "Dr. Made Wirawan, Sp.An", role: "Dokter Anestesi" },
  { id: "an-02", name: "Dr. Ketut Sucipta, Sp.An", role: "Dokter Anestesi" },
  { id: "an-03", name: "Dr. Gede Bayu, Sp.An", role: "Dokter Anestesi" },
  { id: "an-04", name: "Dr. Komang Aryani, Sp.An", role: "Dokter Anestesi" },
  { id: "an-05", name: "Dr. Putu Sanjaya, Sp.An", role: "Dokter Anestesi" },
  // 15 Perawat Bedah
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
  // 10 Perawat Anestesi
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

// --- Kelompokkan Staf Berdasarkan Peran ---
const dokterAnestesi = mockStaffMembers.filter(
  (s) => s.role === "Dokter Anestesi"
);
const perawatBedah = mockStaffMembers.filter((s) => s.role === "Perawat Bedah");
const perawatAnestesi = mockStaffMembers.filter(
  (s) => s.role === "Perawat Anestesi"
);

// Tim Jaga Dokter Anestesi untuk 24 jam
export const mockOnCallAnesthesiaTeam: StaffMember[] = [
  mockStaffMembers[0], // Dr. Made Wirawan
  mockStaffMembers[1], // Dr. Ketut Sucipta
  mockStaffMembers[2], // Dr. Gede Bayu
];

export const mockShiftAssignments: OperatingRoomShift[] = [
  // ====================
  // == TIM JAGA PAGI ===
  // ====================
  {
    operatingRoom: "OK 1 (Bedah Umum)",
    shift: "Pagi",
    anesthesiologist: dokterAnestesi[0], // Dr. Made Wirawan
    nurses: [
      perawatBedah[9], // Ns. Wayan Sari
      perawatBedah[1],
      perawatBedah[6],
      perawatBedah[7], // Ns. Gede Pratama
      perawatAnestesi[0], // Ns. Komang Putra
    ],
  },
  {
    operatingRoom: "OK 2 (Ortopedi)",
    shift: "Pagi",
    anesthesiologist: dokterAnestesi[1], // Dr. Ketut Sucipta
    nurses: [
      perawatBedah[2], // Ns. Putu Eka
      perawatBedah[3], // Ns. Kadek Dharma
      perawatAnestesi[1], // Ns. Luh Novi
    ],
  },

  // =====================
  // == TIM JAGA SIANG ===
  // =====================
  {
    operatingRoom: "OK 1 (Bedah Umum)",
    shift: "Siang",
    anesthesiologist: dokterAnestesi[2], // Dr. Gede Bayu
    nurses: [
      perawatBedah[4], // Ns. Komang Ayu
      perawatBedah[5], // Ns. Luh Mertasih
      perawatAnestesi[2], // Ns. Made Yasa
    ],
  },
  {
    operatingRoom: "OK 3 (Jantung)",
    shift: "Siang",
    anesthesiologist: dokterAnestesi[3], // Dr. Komang Aryani
    nurses: [
      perawatBedah[6], // Ns. Made Suarta
      perawatBedah[7], // Ns. Nyoman Tri
      perawatAnestesi[3], // Ns. Nyoman Sinta
    ],
  },

  // =====================
  // == TIM JAGA MALAM ===
  // =====================
  {
    operatingRoom: "OK 1 (Bedah Umum)",
    shift: "Malam",
    anesthesiologist: dokterAnestesi[4], // Dr. Putu Sanjaya
    nurses: [
      perawatBedah[8], // Ns. Ketut Widi
      perawatBedah[9], // Ns. Wayan Budi
      perawatAnestesi[4], // Ns. Ketut Ari
    ],
  },
];

// ... (sisa mock data seperti mockScheduledSurgeries, dll.)
// =====================================================================
// #3 DATA UNTUK JADWAL & LIVE VIEW (SINKRON)
// =====================================================================
const today = new Date("2025-08-19");

// Fungsi helper untuk membuat tanggal baru tanpa memodifikasi 'today'
const createDate = (hour: number, minute: number, second: number) => {
  const date = new Date(today);
  date.setHours(hour, minute, second);
  return date.toISOString();
};

// ... di dalam mockScheduledSurgeries ...
export const mockScheduledSurgeries: ScheduledSurgery[] = [
  // ...
  // Pasien ini sudah dikonfirmasi, siap untuk diatur OK & Tim nya
  { id: "op-002", patientName: "Citra Lestari", mrn: "MRN-67890", procedure: "Bedah Caesar", doctorName: "Dr. Ayu Wulandari", scheduledAt: createDate(11, 0, 0), status: "Dipanggil" },
  { id: "op-005", patientName: "Eka Prasetya", mrn: "MRN-54321", procedure: "Total Knee Replacement", doctorName: "Dr. Ngurah Sanjaya", scheduledAt: createDate(14, 30, 0), status: "Terkonfirmasi" },
  { id: "op-006", patientName: "Eko Prasetyo", mrn: "MRN-54321", procedure: "Partial Knee Replacement", doctorName: "Dr. Ngurah Sanjaya", scheduledAt: createDate(14, 30, 0), status: "Siap Panggil" },  // Diubah dari Terjadwal
  // ...
];

export const mockSurgeryBoard: OngoingSurgery[] = [
  {
    id: "op-001",
    procedure: "Operasi Katarak",
    doctorName: "Dr. I Gusti Ngurah",
    caseId: "*** *** 345",
    operatingRoom: "OK 4 (Mata)",
    status: "Ruang Pemulihan",
    startTime: createDate(9, 15, 0),
    team: {
      nurses: [
        mockStaffMembers[13],
        mockStaffMembers[11],
        mockStaffMembers[28],
      ],
    },
  },
  {
    id: "op-002",
    procedure: "Bedah Caesar",
    doctorName: "Dr. Ayu Wulandari",
    caseId: "*** *** 890",
    operatingRoom: "OK 1 (Bedah Umum)",
    status: "Ruang Pemulihan",
    startTime: createDate(11, 5, 0),
    team: { nurses: [mockStaffMembers[5], mockStaffMembers[20]] },
  },
  {
    id: "op-005",
    procedure: "Total Knee Replacement",
    doctorName: "Dr. Ngurah Sanjaya",
    caseId: "*** *** 321",
    operatingRoom: "OK 1 (Bedah Umum)",
    status: "Operasi Berlangsung",
    startTime: createDate(14, 35, 0),
    team: { nurses: [mockStaffMembers[7], mockStaffMembers[22]] },
  },
  {
    id: "op-008",
    procedure: "Angioplasti Koroner",
    doctorName: "Dr. I Wayan Kardiasa",
    caseId: "*** *** 556",
    operatingRoom: "OK 3 (Jantung)",
    status: "Persiapan Operasi",
    startTime: createDate(14, 30, 0),
    team: { nurses: [mockStaffMembers[8], mockStaffMembers[23]] },
  },
];

// =====================================================================
// #4 DATA PELACAK PASIEN (VERSI DINAMIS & REALISTIS)
// =====================================================================
export const getMockPatientStatus = (
  accessCode: string
): PatientStatusData | null => {
  const surgery = mockScheduledSurgeries.find((s) => s.id === accessCode);
  if (!surgery || surgery.status === "Dibatalkan") return null;
  const now = new Date("2025-08-19T17:21:00+08:00"); // Waktu simulasi
  const scheduledTime = new Date(surgery.scheduledAt);

  const handoverTime = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
  const prepTime = new Date(scheduledTime.getTime() - 5 * 60 * 1000);
  const surgeryEndTime = new Date(scheduledTime.getTime() + 90 * 60 * 1000);
  const recoveryTime = new Date(surgeryEndTime.getTime() + 60 * 60 * 1000);

  const stages: PatientStage[] = [];
  let currentStage = "Terjadwal";

  const allPossibleStages = [
    {
      name: "Pasien Diterima",
      time: handoverTime,
      desc: "Pasien telah diterima oleh tim kamar operasi.",
    },
    {
      name: "Persiapan Operasi",
      time: prepTime,
      desc: "Tim sedang melakukan persiapan akhir sebelum operasi.",
    },
    {
      name: "Operasi Berlangsung",
      time: scheduledTime,
      desc: "Operasi sedang berjalan. Pasien ditangani oleh tim terbaik kami.",
    },
    {
      name: "Operasi Selesai",
      time: surgeryEndTime,
      desc: "Prosedur operasi telah berhasil diselesaikan.",
    },
    {
      name: "Ruang Pemulihan",
      time: recoveryTime,
      desc: "Pasien sedang dalam tahap pemulihan dan observasi.",
    },
  ];

  allPossibleStages.forEach((stage) => {
    if (now >= stage.time) {
      stages.push({
        name: stage.name,
        timestamp: stage.time.toISOString(),
        desc: stage.desc,
      });
      currentStage = stage.name;
    } else {
      stages.push({
        name: stage.name,
        timestamp: null,
        desc: `Menunggu tahap: ${stage.name}`,
      });
    }
  });

  const manualStatusIndex = allPossibleStages.findIndex(
    (s) => s.name === surgery.status
  );
  const dynamicStatusIndex = allPossibleStages.findIndex(
    (s) => s.name === currentStage
  );

  if (manualStatusIndex > dynamicStatusIndex) {
    currentStage = surgery.status;
  }

  // Perbarui stages berdasarkan currentStage final
  const finalCurrentIndex = allPossibleStages.findIndex(
    (s) => s.name === currentStage
  );
  const finalStages = allPossibleStages.map((stage, index) => {
    if (index <= finalCurrentIndex) {
      return {
        name: stage.name,
        timestamp: stage.time.toISOString(),
        desc: stage.desc,
      };
    }
    return {
      name: stage.name,
      timestamp: null,
      desc: `Menunggu tahap: ${stage.name}`,
    };
  });

  return { stages: finalStages, currentStage };
};
