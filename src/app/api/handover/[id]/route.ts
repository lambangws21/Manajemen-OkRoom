// import { NextResponse, NextRequest } from 'next/server';
// import { adminDb } from '@/lib/firebaseAdmin'; 
// import { FieldValue } from 'firebase-admin/firestore';
// import { OngoingSurgery } from '@/types'; // Fokus pada tipe OngoingSurgery

// /**
//  * Endpoint: GET /api/operasi/[id]
//  * Mengambil data satu operasi yang sedang berlangsung (ongoing).
//  */
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
import { FieldValue } from 'firebase-admin/firestore';
import { OngoingSurgery } from '@/types';

/**
 * ✅ Endpoint: GET /api/handover/[id]
 * Mengambil data satu operasi yang sedang berlangsung (ongoing)
 */
export async function GET(request: NextRequest) {
  try {
    // Ambil ID dari URL
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop(); // ambil segmen terakhir dari path

    if (!id) {
      return NextResponse.json({ error: 'ID Operasi tidak valid.' }, { status: 400 });
    }

    const docRef = adminDb.collection('ongoingSurgeries').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Operasi tidak ditemukan di Papan Kendali.' }, { status: 404 });
    }

    const surgeryData = docSnap.data() as OngoingSurgery;

    // Konversi Timestamp jadi ISO string
    const processedData = {
      ...surgeryData,
      id: docSnap.id,
      startTime:
        surgeryData?.startTime &&
        typeof (surgeryData.startTime as unknown as { toDate?: () => Date })?.toDate === 'function'
          ? (surgeryData.startTime as unknown as { toDate: () => Date }).toDate().toISOString()
          : surgeryData?.startTime,
      actualStartTime:
        surgeryData?.actualStartTime &&
        typeof (surgeryData.actualStartTime as unknown as { toDate?: () => Date })?.toDate === 'function'
          ? (surgeryData.actualStartTime as unknown as { toDate: () => Date }).toDate().toISOString()
          : surgeryData?.actualStartTime,
      endTime:
        surgeryData?.endTime &&
        typeof (surgeryData.endTime as unknown as { toDate?: () => Date })?.toDate === 'function'
          ? (surgeryData.endTime as unknown as { toDate: () => Date }).toDate().toISOString()
          : surgeryData?.endTime,
    };

    return NextResponse.json(processedData, { status: 200 });
  } catch (error) {
    console.error('❌ GET OngoingSurgery Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal mengambil data operasi.';
    return NextResponse.json({ error: `Gagal mengambil data: ${message}` }, { status: 500 });
  }
}

/**
 * ✅ Endpoint: PUT /api/handover/[id]
 * Mengubah status operasi (misal: "Mulai Operasi", "Selesai Operasi")
 */
export async function PUT(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split('/').pop(); // ambil segmen terakhir dari path

    if (!id) {
      return NextResponse.json({ error: 'ID Operasi tidak valid.' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status baru tidak boleh kosong.' }, { status: 400 });
    }

    const docRef = adminDb.collection('ongoingSurgeries').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Operasi tidak ditemukan.' }, { status: 404 });
    }

    const updateData: Record<string, string | FieldValue> = {
      status,
      lastModified: FieldValue.serverTimestamp(),
    };

    // Catat waktu berdasarkan status baru
    const data = docSnap.data();
    if (status === 'Operasi Berlangsung' && !data?.actualStartTime) {
      updateData.actualStartTime = FieldValue.serverTimestamp();
    }
    if ((status === 'Operasi Selesai' || status === 'Recovery') && !data?.endTime) {
      updateData.endTime = FieldValue.serverTimestamp();
    }

    // Update ke Firestore
    await docRef.update(updateData);

    // Ambil data terbaru
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();

    // Konversi timestamp
    const processedData = {
      ...updatedData,
      id: updatedDoc.id,
      startTime:
        updatedData?.startTime &&
        typeof (updatedData.startTime as unknown as { toDate?: () => Date })?.toDate === 'function'
          ? (updatedData.startTime as unknown as { toDate: () => Date }).toDate().toISOString()
          : updatedData?.startTime,
      actualStartTime:
        updatedData?.actualStartTime &&
        typeof (updatedData.actualStartTime as unknown as { toDate?: () => Date })?.toDate === 'function'
          ? (updatedData.actualStartTime as unknown as { toDate: () => Date }).toDate().toISOString()
          : updatedData?.actualStartTime,
      endTime:
        updatedData?.endTime &&
        typeof (updatedData.endTime as unknown as { toDate?: () => Date })?.toDate === 'function'
          ? (updatedData.endTime as unknown as { toDate: () => Date }).toDate().toISOString()
          : updatedData?.endTime,
    };

    return NextResponse.json(processedData, { status: 200 });
  } catch (error) {
    console.error('❌ PUT OngoingSurgery Error:', error);
    const message = error instanceof Error ? error.message : 'Gagal update status operasi.';
    return NextResponse.json({ error: `Gagal update status: ${message}` }, { status: 500 });
  }
}
