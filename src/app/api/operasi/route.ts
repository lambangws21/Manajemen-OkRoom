// import { NextResponse } from 'next/server';
// import { adminDb } from '@/lib/firebaseAdmin'; 
// import { OngoingSurgery } from '@/types';

// /**
//  * Endpoint: GET /api/operasi
//  * Mengambil data pasien yang sedang aktif di alur operasi
//  * (Persiapan, Berlangsung, atau Recovery)
//  */
// export async function GET() {
//   try {
//     const ongoingRef = adminDb.collection('ongoingSurgeries');
    
//     // Ambil data yang statusnya BUKAN 'Operasi Selesai'
//     // Ini adalah pasien yang masih relevan untuk ditampilkan di papan operasi
//     const q = ongoingRef.where('status', 'in', [
//         'Persiapan Operasi', 
//         'Operasi Berlangsung', 
//         'Ruang Pemulihan', // atau 'Recovery' (sesuaikan dengan status Anda)
//     ]);

//     const snapshot = await q.get();

//     if (snapshot.empty) {
//       return NextResponse.json([], { status: 200 });
//     }

//     const surgeries: OngoingSurgery[] = [];
//     snapshot.forEach(doc => {
//       const data = doc.data();
//       // Proses konversi Timestamp (jika perlu)
//       const startTime = data.startTime && typeof data.startTime.toDate === 'function' 
//         ? data.startTime.toDate().toISOString() 
//         : data.startTime;

//       surgeries.push({
//         id: doc.id,
//         ...data,
//         startTime: startTime,
//       } as OngoingSurgery);
//     });

//     return NextResponse.json(surgeries, { status: 200 });

//   } catch (error) {
//     console.error("GET Ongoing Surgeries Error:", error);
//     if (error instanceof Error) {
//         return NextResponse.json({ error: `Gagal mengambil data: ${error.message}` }, { status: 500 });
//     }
//     return NextResponse.json({ error: 'Gagal mengambil data operasi.' }, { status: 500 });
//   }
// }

import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; 
import { OngoingSurgery } from '@/types';
import { Timestamp } from 'firebase-admin/firestore'; // Import Timestamp

/**
 * Helper function untuk mengecek apakah Timestamp Firestore (UTC) 
 * berada di hari yang sama dengan string YYYY-MM-DD (dari WITA / GMT+8).
 */
const isSameDayWITA = (firestoreTimestamp: Timestamp | undefined | null, yyyyMmDdString: string): boolean => {
  // Jika timestamp tidak ada, jangan tampilkan
  if (!firestoreTimestamp || !firestoreTimestamp.toDate) {
    return false;
  }
  
  try {
    // 1. Konversi Timestamp Firestore (UTC) ke Date Object JS (masih UTC)
    const utcDate = firestoreTimestamp.toDate(); 
    
    // 2. Konversi Date Object UTC ke zona waktu WITA (GMT+8)
    //    offset WITA = +8 jam * 60 menit/jam = 480 menit
    const witaOffsetMinutes = 8 * 60; 
    const witaDate = new Date(utcDate.getTime() + (witaOffsetMinutes * 60000));
    
    // 3. Dapatkan YYYY-MM-DD dari tanggal WITA
    //    (Kita gunakan getUTC... karena kita sudah offset manual)
    const yyyy = witaDate.getUTCFullYear();
    const mm = String(witaDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(witaDate.getUTCDate()).padStart(2, '0');
    const docDateStringWITA = `${yyyy}-${mm}-${dd}`;
    
    // 4. Bandingkan dengan tanggal filter (yang juga dari WITA)
    return docDateStringWITA === yyyyMmDdString;

  } catch (e) {
    console.error("isSameDayWITA parsing error:", e);
    return false;
  }
};


/**
 * Endpoint: GET /api/operasi
 * Mengambil data pasien yang sedang aktif (Persiapan, Berlangsung, Pemulihan)
 * 💥 FIX: Menerima query param '?tanggal=YYYY-MM-DD' dan filter di server-side JS
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tanggalFilter = searchParams.get('tanggal'); // Misal: "2025-11-07"

    const ongoingRef = adminDb.collection('ongoingSurgeries');
    
    // 💥 PERBAIKAN: HANYA filter berdasarkan STATUS di Firestore
    // Kita tidak bisa menggabungkan filter 'in' dengan filter rentang 'startTime'
    // 💥 TAMBAHAN: Sertakan status antrian (Siap Panggil, Dipanggil, Pasien Diterima)
    const q = ongoingRef.where('status', 'in', [
        'Siap Panggil', 
        'Dipanggil', 
        'Pasien Diterima',
        'Persiapan Operasi', 
        'Operasi Berlangsung', 
        'Ruang Pemulihan',
    ]);
    
    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const surgeries: OngoingSurgery[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const startTimeTimestamp = data.startTime as Timestamp; // Dapatkan Timestamp Firestore
      const actualStartTimeTimestamp = data.actualStartTime as Timestamp;
      const endTimeTimestamp = data.endTime as Timestamp;

      // 💥 PERBAIKAN: Lakukan filter tanggal di memori (server-side JavaScript)
      if (tanggalFilter) {
        // Asumsi kita filter berdasarkan 'startTime'
        if (!isSameDayWITA(startTimeTimestamp, tanggalFilter)) {
          return; // Lewati dokumen ini, tidak sesuai tanggal
        }
      }
      
      // 💥 PERBAIKAN: Pastikan 'startTime' adalah ISO string atau null
      const startTimeISO = startTimeTimestamp && typeof startTimeTimestamp.toDate === 'function' 
        ? startTimeTimestamp.toDate().toISOString() 
        : null; // <-- Fallback ke null, BUKAN data.startTime

      // 💥 PERBAIKAN: Pastikan 'actualStartTime' adalah ISO string atau null
      const actualStartTimeISO = actualStartTimeTimestamp && typeof actualStartTimeTimestamp.toDate === 'function'
        ? actualStartTimeTimestamp.toDate().toISOString()
        : null; // <-- Fallback ke null, BUKAN data.actualStartTime
        
      const endTimeISO = endTimeTimestamp && typeof endTimeTimestamp.toDate === 'function'
        ? endTimeTimestamp.toDate().toISOString()
        : null; // <-- Fallback ke null

      surgeries.push({
        id: doc.id,
        ...data,
        startTime: startTimeISO, // Sekarang dijamin ISO string or null
        actualStartTime: actualStartTimeISO, // Sekarang dijamin ISO string or null
        endTime: endTimeISO,
      } as OngoingSurgery);
    });

    return NextResponse.json(surgeries, { status: 200 });

  } catch (error) {
    console.error("GET Ongoing Surgeries Error:", error);
    if (error instanceof Error) {
        return NextResponse.json({ error: `Gagal mengambil data: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Gagal mengambil data operasi.' }, { status: 500 });
  }
}