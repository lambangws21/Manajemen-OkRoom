// import { NextResponse } from 'next/server';
// import { adminDb } from '@/lib/firebaseAdmin'; // Pastikan path ini benar
// // Anda mungkin perlu mengimpor ExtendedOngoingSurgery di sini jika ada di '@/types'
// import { OngoingSurgery } from '@/types'; 
// import { Timestamp } from 'firebase-admin/firestore';

// // FIX 1: Interface lokal untuk mengakomodasi semua fields yang dicoba di-return.
// // Anda harus memastikan interface OngoingSurgery/ExtendedOngoingSurgery di '@/types'
// // menyertakan fields ini: actualStartTime, endTime, dan lastModified.
// interface FullSurgeryData extends OngoingSurgery {
//   actualStartTime: unknown; // Asli dari Firestore
//   lastModified: unknown; // Asli dari Firestore
// }

// // Tipe data untuk parameter dinamis di Next.js App Router
// interface Params {
//   params: {
//     caseId: string;
//   };
// }

// // Konversi Firestore Timestamp ke string ISO
// const convertTimestampToISO = (timestamp: unknown): string | null => {
//   if (timestamp && typeof timestamp === 'object' && typeof (timestamp as Timestamp).toDate === 'function') {
//     return (timestamp as Timestamp).toDate().toISOString();
//   }
//   return null;
// };

// /**
//  * Endpoint: GET /api/operasi/[caseId]
//  * Mengambil satu data operasi spesifik berdasarkan field 'caseId'.
//  */
// export async function GET(request: Request, { params }: Params) {
//   // caseIdInput diambil dari nama folder dinamis [caseId]
//   const caseIdInput = params.caseId; 

//   if (!caseIdInput) {
//     return NextResponse.json({ error: 'Case ID tidak disediakan.' }, { status: 400 });
//   }

//   try {
//     const ongoingRef = adminDb.collection('ongoingSurgeries');
    
//     // Melakukan Query berdasarkan field 'caseId'
//     const q = ongoingRef.where('caseId', '==', caseIdInput).limit(1);

//     const snapshot = await q.get();

//     if (snapshot.empty) {
//       // Jika tidak ada dokumen yang ditemukan dengan Case ID tersebut
//       return NextResponse.json({ error: `ID Operasi tidak ditemukan: ${caseIdInput}` }, { status: 404 });
//     }

//     // Ambil dokumen pertama (dan satu-satunya)
//     const doc = snapshot.docs[0];
    
//     // Assert doc.data() sebagai FullSurgeryData yang baru didefinisikan.
//     const data = doc.data() as FullSurgeryData; 

//     // Proses konversi Timestamp
//     const surgeryData: OngoingSurgery = {
//       // Spread data dulu
//       ...data, 
      
//       // Overwrite 'id' dengan doc.id.
//       id: doc.id,

//       // Konversi field waktu yang menggunakan format Firestore Timestamp
//       startTime: convertTimestampToISO(data.startTime) || data.startTime,
//       actualStartTime: convertTimestampToISO(data.actualStartTime),
//       endTime: convertTimestampToISO(data.endTime),
//       lastModified: convertTimestampToISO(data.lastModified),
//     } as OngoingSurgery; // Assert sebagai OngoingSurgery agar sesuai dengan kembalian API

//     // Mengembalikan data tunggal (bukan array)
//     return NextResponse.json(surgeryData, { status: 200 });

//   } catch (error) {
//     console.error(`GET Surgery by Case ID (${caseIdInput}) Error:`, error);
//     if (error instanceof Error) {
//         return NextResponse.json({ error: `Gagal mengambil data: ${error.message}` }, { status: 500 });
//     }
//     return NextResponse.json({ error: 'Gagal mengambil data operasi.' }, { status: 500 });
//   }
// }

import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { OngoingSurgery } from '@/types';
import { Timestamp } from 'firebase-admin/firestore';

// Helper untuk ubah Firestore Timestamp → string ISO
const toISO = (val: unknown): string | null => {
  if (val && typeof val === 'object' && typeof (val as Timestamp).toDate === 'function') {
    return (val as Timestamp).toDate().toISOString();
  }
  return null;
};

/**
 * ✅ GET /api/kasus/[caseId]
 * Ambil detail operasi berdasarkan `caseId`
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await context.params; // ✅ ambil param dari promise context
    if (!caseId) {
      return NextResponse.json({ error: 'Case ID tidak valid.' }, { status: 400 });
    }

    const ref = adminDb.collection('ongoingSurgeries');
    const q = ref.where('caseId', '==', caseId).limit(1);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json({ error: `Data operasi tidak ditemukan (${caseId})` }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    const surgery: OngoingSurgery = {
      id: doc.id,
      doctorName: data.doctorName,
      patientName: data.patientName,
      mrn: data.mrn,
      caseId: data.caseId,
      procedure: data.procedure,
      operatingRoom: data.operatingRoom,
      status: data.status,
      startTime: toISO(data.startTime) || data.startTime,
      actualStartTime: toISO(data.actualStartTime) || data.actualStartTime,
      endTime: toISO(data.endTime) || data.endTime,
      lastModified: toISO(data.lastModified) || data.lastModified,
    };

    return NextResponse.json(surgery, { status: 200 });
  } catch (error) {
    console.error(`❌ Error GET /api/kasus/[caseId]:`, error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

/**
 * ✅ PUT /api/kasus/[caseId]
 * Update status operasi berdasarkan caseId
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID tidak valid.' }, { status: 400 });
    }
    if (!status) {
      return NextResponse.json({ error: 'Status tidak boleh kosong.' }, { status: 400 });
    }

    const ref = adminDb.collection('ongoingSurgeries');
    const q = ref.where('caseId', '==', caseId).limit(1);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json({ error: `Operasi dengan ID ${caseId} tidak ditemukan.` }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const docRef = ref.doc(doc.id);
    const data = doc.data();

    const updatePayload: Record<string, unknown> = {
      status,
      lastModified: Timestamp.now(),
    };

    if (status === 'Operasi Berlangsung' && !data.actualStartTime) {
      updatePayload.actualStartTime = Timestamp.now();
    }

    if ((status === 'Operasi Selesai' || status === 'Recovery') && !data.endTime) {
      updatePayload.endTime = Timestamp.now();
    }

    await docRef.update(updatePayload);

    const updatedDoc = await docRef.get();
    const updated = updatedDoc.data();

    const surgery: OngoingSurgery = {
      id: updatedDoc.id,
      doctorName: updated?.doctorName,
      patientName: updated?.patientName,
      mrn: updated?.mrn,
      caseId: updated?.caseId,
      procedure: updated?.procedure,
      operatingRoom: updated?.operatingRoom,
      status: updated?.status,
      startTime: toISO(updated?.startTime) || updated?.startTime,
      actualStartTime: toISO(updated?.actualStartTime) || updated?.actualStartTime,
      endTime: toISO(updated?.endTime) || updated?.endTime,
      lastModified: toISO(updated?.lastModified) || updated?.lastModified,
    };

    return NextResponse.json(surgery, { status: 200 });
  } catch (error) {
    console.error(`❌ Error PUT /api/kasus/[caseId]:`, error);
    return NextResponse.json({ error: 'Gagal memperbarui data operasi.' }, { status: 500 });
  }
}

/**
 * ✅ DELETE /api/kasus/[caseId]
 * Hapus data operasi berdasarkan `caseId`
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await context.params;

    const ref = adminDb.collection('ongoingSurgeries');
    const q = ref.where('caseId', '==', caseId).limit(1);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return NextResponse.json({ error: `Data operasi ${caseId} tidak ditemukan.` }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    await ref.doc(doc.id).delete();

    return NextResponse.json({ message: `Operasi ${caseId} berhasil dihapus.` }, { status: 200 });
  } catch (error) {
    console.error(`❌ Error DELETE /api/kasus/[caseId]:`, error);
    return NextResponse.json({ error: 'Gagal menghapus data operasi.' }, { status: 500 });
  }
}
