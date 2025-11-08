// import { NextResponse, NextRequest } from 'next/server';
// import { adminDb } from '@/lib/firebaseAdmin'; 
// import { FieldValue } from 'firebase-admin/firestore';
// import { OngoingSurgery } from '@/types'; // Fokus pada tipe OngoingSurgery

// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const id = params.id;
//     if (!id) {
//       return NextResponse.json({ error: 'ID Operasi tidak valid.' }, { status: 400 });
//     }

//     const docRef = adminDb.collection('ongoingSurgeries').doc(id);
//     const docSnap = await docRef.get();

//     if (!docSnap.exists) {
//       return NextResponse.json({ error: 'Operasi tidak ditemukan di Papan Kendali.' }, { status: 404 });
//     }

//     const surgeryData = docSnap.data() as OngoingSurgery;

//     // Ubah Timestamp jika ada (misal startTime)
//     const processedData = {
//       ...surgeryData,
//       id: docSnap.id,
//       // Jika startTime adalah objek Timestamp, ubah ke ISO string
//       startTime: surgeryData.startTime && typeof (surgeryData.startTime as { toDate?: () => Date }).toDate === 'function'
//         ? (surgeryData.startTime as unknown as { toDate: () => Date }).toDate().toISOString()
//         : surgeryData.startTime,
//     };

//     return NextResponse.json(processedData, { status: 200 });

//   } catch (error) {
//     console.error("GET OngoingSurgery Error:", error);
//     if (error instanceof Error) {
//         return NextResponse.json({ error: `Gagal mengambil data: ${error.message}` }, { status: 500 });
//     }
//     return NextResponse.json({ error: 'Gagal mengambil data operasi.' }, { status: 500 });
//   }
// }


// /**
//  * Endpoint: PUT /api/operasi/[id]
//  * Mengubah status operasi (misal: "Mulai Operasi", "Selesai Operasi").
//  */
// export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
//     try {
//         const id = params.id;
//         const body = await request.json();
//         const { status } = body;

//         if (!id) {
//             return NextResponse.json({ error: 'ID Operasi tidak valid.' }, { status: 400 });
//         }
//         if (!status) {
//             return NextResponse.json({ error: 'Status baru tidak boleh kosong.' }, { status: 400 });
//         }

//         const docRef = adminDb.collection('ongoingSurgeries').doc(id);
//         const docSnap = await docRef.get();

//         if (!docSnap.exists) {
//             return NextResponse.json({ error: 'Operasi tidak ditemukan.' }, { status: 404 });
//         }

//         const updateData: Record<string, string | FieldValue> = {
//             status: status,
//             lastModified: FieldValue.serverTimestamp(),
//         };

//         // Jika status diubah menjadi 'Operasi Berlangsung', catat 'actualStartTime'
//         if (status === 'Operasi Berlangsung' && !docSnap.data()?.actualStartTime) {
//             updateData.actualStartTime = FieldValue.serverTimestamp();
//         }
        
//         // Jika status diubah menjadi 'Operasi Selesai', catat 'endTime'
//         if ((status === 'Operasi Selesai' || status === 'Recovery') && !docSnap.data()?.endTime) {
//             updateData.endTime = FieldValue.serverTimestamp();
//         }

//         // Update dokumen
//         await docRef.update(updateData);

//         // Ambil data terbaru untuk dikembalikan
//         const updatedDoc = await docRef.get();
//         const updatedData = updatedDoc.data();
        
//         // Proses Timestamp untuk respon JSON
//         const processedData = {
//             ...updatedData,
//             id: updatedDoc.id,
//             startTime: updatedData?.startTime && typeof updatedData.startTime.toDate === 'function' 
//                 ? updatedData.startTime.toDate().toISOString() 
//                 : updatedData?.startTime,
//             actualStartTime: updatedData?.actualStartTime && typeof updatedData.actualStartTime.toDate === 'function' 
//                 ? updatedData.actualStartTime.toDate().toISOString() 
//                 : updatedData?.actualStartTime,
//             endTime: updatedData?.endTime && typeof updatedData.endTime.toDate === 'function' 
//                 ? updatedData.endTime.toDate().toISOString() 
//                 : updatedData?.endTime,
//         };


//         return NextResponse.json(processedData, { status: 200 });

//     } catch (error) {
//         console.error("PUT OngoingSurgery Error:", error);
//         if (error instanceof Error) {
//             return NextResponse.json({ error: `Gagal update status: ${error.message}` }, { status: 500 });
//         }
//         return NextResponse.json({ error: 'Gagal update status operasi.' }, { status: 500 });
//     }
// }



import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { OngoingSurgery } from '@/types';

/**
 * Helper konversi Firestore Timestamp → ISO string
 */
const toISO = (val: unknown): string | null => {
  if (val && typeof val === 'object' && typeof (val as Timestamp).toDate === 'function') {
    return (val as Timestamp).toDate().toISOString();
  }
  return null;
};

/**
 * ✅ GET /api/operasi/[id]
 * Ambil satu data operasi berdasarkan ID
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'ID Operasi tidak valid.' }, { status: 400 });
    }

    const docRef = adminDb.collection('ongoingSurgeries').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Operasi tidak ditemukan di Papan Kendali.' }, { status: 404 });
    }

    const data = docSnap.data() as OngoingSurgery;

    const processed = {
      ...data,
      id: docSnap.id,
      startTime: toISO(data.startTime) || data.startTime,
      actualStartTime: toISO(data.actualStartTime) || data.actualStartTime,
      endTime: toISO(data.endTime) || data.endTime,
      lastModified: toISO((data as unknown as { lastModified?: Timestamp }).lastModified),
    };

    return NextResponse.json(processed, { status: 200 });
  } catch (error) {
    console.error('❌ Error GET operasi:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server.';
    return NextResponse.json({ error: `Gagal mengambil data operasi: ${message}` }, { status: 500 });
  }
}

/**
 * ✅ PUT /api/operasi/[id]
 * Update status operasi
 */
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID Operasi tidak valid.' }, { status: 400 });
    }
    if (!status) {
      return NextResponse.json({ error: 'Status baru tidak boleh kosong.' }, { status: 400 });
    }

    const docRef = adminDb.collection('ongoingSurgeries').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Operasi tidak ditemukan.' }, { status: 404 });
    }

    const existing = docSnap.data();

    // ✅ Hindari `any`, pakai union type
    const updateData: Record<string, string | Timestamp> = {
      status,
      lastModified: Timestamp.now(),
    };

    if (status === 'Operasi Berlangsung' && !existing?.actualStartTime) {
      updateData.actualStartTime = Timestamp.now();
    }
    if ((status === 'Operasi Selesai' || status === 'Recovery') && !existing?.endTime) {
      updateData.endTime = Timestamp.now();
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const updated = updatedDoc.data() as OngoingSurgery;

    const processed = {
      ...updated,
      id: updatedDoc.id,
      startTime: toISO(updated.startTime) || updated.startTime,
      actualStartTime: toISO(updated.actualStartTime) || updated.actualStartTime,
      endTime: toISO(updated.endTime) || updated.endTime,
      lastModified: toISO((updated as unknown as { lastModified?: Timestamp }).lastModified),
    };

    return NextResponse.json(processed, { status: 200 });
  } catch (error) {
    console.error('❌ Error PUT operasi:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server.';
    return NextResponse.json({ error: `Gagal memperbarui status operasi: ${message}` }, { status: 500 });
  }
}
