import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; 
import { Staff } from '@/types/index';

// --- Tipe Data ---

type ShiftType = 'Pagi' | 'Siang' | 'Malam';

type NurseShiftTeams = {
  [key in ShiftType]: Staff[];
}

// 🔹 BARU: Tipe untuk Penanggung Jawab berdasarkan Shift
type ResponsibleStaffByShift = {
    [key in ShiftType]: Staff | null;
}

// 🔹 PERUBAHAN: Payload sekarang menggunakan struktur ResponsibleStaffByShift
interface AssignmentPayload {
    anesthesiaTeam?: Staff[];
    nurseTeams?: NurseShiftTeams;
    responsibleStaffByShift?: ResponsibleStaffByShift;
}

const DEFAULT_NURSE_TEAMS: NurseShiftTeams = { 
    Pagi: [], 
    Siang: [], 
    Malam: [] 
};

// 🔹 BARU: Struktur Default untuk Penanggung Jawab
const DEFAULT_RESPONSIBLE_STAFF: ResponsibleStaffByShift = {
    Pagi: null,
    Siang: null,
    Malam: null,
};

// Interface yang merepresentasikan dokumen 'current' secara keseluruhan di Firestore
interface CurrentShiftAssignmentDocument {
    anesthesiaTeam: Staff[];
    nurseTeams: NurseShiftTeams;
    // 🔹 PERUBAHAN: Mengganti responsibleStaff tunggal
    responsibleStaffByShift: ResponsibleStaffByShift;
    lastUpdated: string;
}

// Konstanta Firebase
const SHIFT_TEAMS_COLLECTION = 'shift-teams';
const CURRENT_ASSIGNMENT_ID = 'current'; 

// --- Handler GET: Mengambil Penugasan Tim Jaga Aktif ---
// Endpoint: GET /api/shift-assignments
export async function GET() {
  try {
    const docSnap = await adminDb.collection(SHIFT_TEAMS_COLLECTION).doc(CURRENT_ASSIGNMENT_ID).get();

    if (!docSnap.exists) {
      return NextResponse.json({ 
        anesthesiaTeam: [], 
        nurseTeams: DEFAULT_NURSE_TEAMS,
        responsibleStaffByShift: DEFAULT_RESPONSIBLE_STAFF, // 🔹 Berikan default struktur baru
      }, { status: 200 });
    }

    // Menggabungkan data dengan default untuk memastikan struktur lengkap
    const data = docSnap.data() as Partial<CurrentShiftAssignmentDocument>;

    return NextResponse.json({
        anesthesiaTeam: data.anesthesiaTeam || [],
        nurseTeams: data.nurseTeams || DEFAULT_NURSE_TEAMS,
        // 🔹 Pastikan field baru dikembalikan
        responsibleStaffByShift: data.responsibleStaffByShift || DEFAULT_RESPONSIBLE_STAFF, 
    }, { status: 200 });

  } catch (error) {
    console.error("GET Shift Assignments Error:", error);
    return NextResponse.json({ error: 'Gagal mengambil penugasan shift.' }, { status: 500 });
  }
}


// --- Handler PUT: Menyimpan/Memperbarui Penugasan Tim Jaga ---
// Endpoint: PUT /api/shift-assignments
export async function PUT(request: NextRequest) {
  try {
    const body: AssignmentPayload = await request.json();
    
    // Validasi minimal
    if (!body.anesthesiaTeam && !body.nurseTeams && !body.responsibleStaffByShift) {
        return NextResponse.json({ error: 'Payload tidak boleh kosong.' }, { status: 400 });
    }

    const docRef = adminDb.collection(SHIFT_TEAMS_COLLECTION).doc(CURRENT_ASSIGNMENT_ID);
    
    const updateData: Partial<CurrentShiftAssignmentDocument> = { 
        lastUpdated: new Date().toISOString(),
    };

    if (body.anesthesiaTeam !== undefined) {
        updateData.anesthesiaTeam = body.anesthesiaTeam;
    }
    if (body.nurseTeams !== undefined) {
        updateData.nurseTeams = body.nurseTeams;
    }
    
    // 🔹 PERUBAHAN UTAMA: Proses struktur responsibleStaffByShift baru
    if (body.responsibleStaffByShift !== undefined) {
        updateData.responsibleStaffByShift = body.responsibleStaffByShift;
    }


    // Menggunakan set dengan { merge: true }
    // Asumsi kita harus mengambil dokumen lama untuk menggabungkan jika perlu
    await docRef.set(updateData as CurrentShiftAssignmentDocument, { merge: true });

    return NextResponse.json({ message: 'Penugasan shift berhasil disimpan.' }, { status: 200 });
  } catch (error) {
    console.error("PUT Shift Assignments Error:", error);
    return NextResponse.json({ error: 'Gagal menyimpan penugasan shift.' }, { status: 500 });
  }
}
