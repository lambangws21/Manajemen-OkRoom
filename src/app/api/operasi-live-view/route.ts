import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; 
import { StaffMember } from '@/types';

/**
 * Endpoint: GET /api/shift-live-data
 * Mengambil data live shift (Tim Anestesi dan PJ) untuk Papan Status.
 */
export async function GET() {
  try {
    const docRef = adminDb.collection('shift-teams').doc('current');
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({
        anesthesiaTeam: [],
        responsibleStaff: 'Data shift tidak ditemukan'
      }, { status: 200 });
    }

    const data = docSnap.data();
    
    // Asumsi shiftDetails menyimpan anesthesiaTeam (StaffMember[])
    const anesthesiaTeam: StaffMember[] = data?.anesthesiaTeam || [];
    
    // Ambil data Penanggung Jawab (PJ) untuk shift yang sedang berjalan
    const currentShift = getCurrentShiftKey();
    const responsibleStaffByShift = data?.responsibleStaffByShift || {};
    
    let responsibleStaffName = 'N/A';
    if (responsibleStaffByShift[currentShift] && responsibleStaffByShift[currentShift].name) {
        responsibleStaffName = responsibleStaffByShift[currentShift].name;
    }


    return NextResponse.json({
      anesthesiaTeam: anesthesiaTeam,
      // Kita hanya mengirim nama PJ aktif
      responsibleStaff: responsibleStaffName,
    }, { status: 200 });

  } catch (error) {
    console.error("GET Shift Live Data Error:", error);
    return NextResponse.json({ error: 'Gagal mengambil data live shift.' }, { status: 500 });
  }
}

// Helper untuk menentukan shift (harus disinkronkan dengan logika client)
function getCurrentShiftKey(): 'Pagi' | 'Siang' | 'Malam' {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 14) return 'Pagi';
    if (hour >= 14 && hour < 21) return 'Siang';
    return 'Malam';
}