// import { NextResponse, NextRequest } from 'next/server';
// import { adminDb } from '@/lib/firebaseAdmin'; 
// import { FieldValue } from 'firebase-admin/firestore';
// import { ScheduledSurgery, OngoingSurgery, StaffMember } from '@/types';

// // Tipe data yang diharapkan dari Body Request
// interface HandoverPayload {
//   surgery: ScheduledSurgery;
//   notes: string;
//   receivingTeam: StaffMember[];
//   liveEntry: Omit<OngoingSurgery, 'startTime'>; // Client mengirim template, server mengatur waktu
// }

// /**
//  * 💥 BARU: Endpoint GET
//  * Endpoint: GET /api/operasi/handover
//  * Mengambil daftar pasien yang relevan untuk serah terima:
//  * 1. Status 'Dipanggil' (menunggu)
//  * 2. Status 'Pasien Diterima' (selesai)
//  */
// export async function GET() { // 💥 PERBAIKAN: Hapus parameter 'request' yang tidak digunakan
//   try {
//     const scheduleRef = adminDb.collection('scheduledSurgeries');
//     const q = scheduleRef.where('status', 'in', ['Dipanggil', 'Pasien Diterima']);
    
//     const querySnapshot = await q.get();
    
//     if (querySnapshot.empty) {
//       return NextResponse.json([], { status: 200 });
//     }
    
//     const surgeries: ScheduledSurgery[] = [];
//     querySnapshot.forEach(doc => {
//       surgeries.push({ id: doc.id, ...doc.data() } as ScheduledSurgery);
//     });
    
//     return NextResponse.json(surgeries, { status: 200 });

//   } catch (error) {
//     console.error("GET Handover Surgeries Error:", error);
//     if (error instanceof Error) {
//         return NextResponse.json({ error: `Gagal mengambil data: ${error.message}` }, { status: 500 });
//     }
//     return NextResponse.json({ error: 'Gagal mengambil data serah terima.' }, { status: 500 });
//   }
// }


// /**
//  * Endpoint: POST /api/operasi/handover
//  * Melakukan transaksi serah terima pasien:
//  * 1. Mengubah status 'schedule' menjadi 'Pasien Diterima'.
//  * 2. Membuat dokumen baru di 'ongoingSurgeries' untuk live view.
//  */
// export async function POST(request: NextRequest) {
//   try {
//     const body: HandoverPayload = await request.json();
    
//     const { surgery, notes, receivingTeam, liveEntry } = body;

//     // Validasi input dasar
//     if (!surgery || !surgery.id || !liveEntry) {
//         return NextResponse.json({ error: 'Data operasi tidak lengkap.' }, { status: 400 });
//     }

//     // Tentukan referensi dokumen
//     const scheduleRef = adminDb.collection('scheduledSurgeries').doc(surgery.id);
//     const ongoingRef = adminDb.collection('ongoingSurgeries').doc(surgery.id);

//     // Jalankan sebagai transaksi atomik
//     await adminDb.runTransaction(async (transaction) => {
//       // 1. Update dokumen di koleksi 'schedule'
//       transaction.update(scheduleRef, {
//         status: 'Pasien Diterima',
//         handoverNotes: notes,
//         receivingTeam: receivingTeam, // Simpan data tim penerima
//         lastModified: FieldValue.serverTimestamp(),
//       });

//       // 2. Buat dokumen baru di koleksi 'ongoingSurgeries'
//       // 💥 PERBAIKAN: Hapus type annotation ': OngoingSurgery'
//       const newOngoingSurgeryDoc = {
//         ...liveEntry,
//         status: 'Persiapan Operasi', // Pastikan status awal di OK
//         startTime: FieldValue.serverTimestamp(), // 💥 Hapus 'as any'
//       };
      
//       transaction.set(ongoingRef, newOngoingSurgeryDoc);
//     });

//     return NextResponse.json({ 
//         message: 'Serah terima berhasil, pasien telah diterima di OK.',
//         ongoingSurgeryId: ongoingRef.id 
//     }, { status: 200 });

//   } catch (error) {
//     console.error("Handover Transaction Error:", error);
//     // Tangani error jika transaksi gagal
//     if (error instanceof Error) {
//         return NextResponse.json({ error: `Transaksi gagal: ${error.message}` }, { status: 500 });
//     }
//     return NextResponse.json({ error: 'Gagal memproses serah terima di server.' }, { status: 500 });
//   }
// }

import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; 
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ScheduledSurgery, OngoingSurgery, StaffMember } from '@/types';

// --- Types ---
interface HandoverPayload {
  surgery: ScheduledSurgery;
  notes: string;
  receivingTeam: StaffMember[];
  liveEntry: Omit<OngoingSurgery, 'startTime'>;
}

/**
 * ✅ GET /api/handover
 * Ambil pasien status 'Dipanggil' atau 'Pasien Diterima' untuk proses serah terima.
 */
export async function GET() {
  try {
    const scheduleRef = adminDb.collection('scheduledSurgeries');
    const q = scheduleRef.where('status', 'in', ['Dipanggil', 'Pasien Diterima']);
    const snapshot = await q.get();

    if (snapshot.empty) return NextResponse.json([], { status: 200 });

    // 🔹 Konversi data agar handoverTime & scheduledAt menjadi string ISO
    const surgeries = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        scheduledAt: data.scheduledAt instanceof Timestamp
          ? data.scheduledAt.toDate().toISOString()
          : data.scheduledAt ?? null,
        handoverTime: data.handoverTime instanceof Timestamp
          ? data.handoverTime.toDate().toISOString()
          : data.handoverTime ?? null,
        lastModified: data.lastModified instanceof Timestamp
          ? data.lastModified.toDate().toISOString()
          : data.lastModified ?? null,
      } as unknown as ScheduledSurgery;
    });

    return NextResponse.json(surgeries, { status: 200 });
  } catch (error) {
    console.error('GET Handover Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal mengambil data serah terima.' },
      { status: 500 }
    );
  }
}

/**
 * ✅ POST /api/handover
 * Jalankan serah terima: update status schedule → buat ongoing surgery.
 */
export async function POST(request: NextRequest) {
  try {
    const body: HandoverPayload = await request.json();
    const { surgery, notes, receivingTeam, liveEntry } = body;

    if (!surgery?.id || !liveEntry) {
      return NextResponse.json({ error: 'Data operasi tidak lengkap.' }, { status: 400 });
    }

    const scheduleRef = adminDb.collection('scheduledSurgeries').doc(surgery.id);
    const ongoingRef = adminDb.collection('ongoingSurgeries').doc(surgery.id);

    await adminDb.runTransaction(async (tx) => {
      tx.update(scheduleRef, {
        status: 'Pasien Diterima',
        handoverNotes: notes,
        handoverTime: FieldValue.serverTimestamp(),
        receivingTeam,
        lastModified: FieldValue.serverTimestamp(),
      });

      const newOngoing = {
        ...liveEntry,
        status: 'Persiapan Operasi',
        startTime: FieldValue.serverTimestamp(),
      };

      tx.set(ongoingRef, newOngoing);
    });

    return NextResponse.json(
      { message: '✅ Serah terima berhasil.', ongoingSurgeryId: ongoingRef.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST Handover Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal melakukan serah terima.' },
      { status: 500 }
    );
  }
}