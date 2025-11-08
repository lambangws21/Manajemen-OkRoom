// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/firebaseAdmin";
// import { ScheduledSurgery, StaffMember } from "@/types/schedule";

// // --- GET (Read Detail) ---
// export async function GET(
//   _req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;
//     const doc = await db.collection("scheduledSurgery").doc(id).get();

//     if (!doc.exists) {
//       return NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });
//     }

//     const data = doc.data()!;
//     const schedule: ScheduledSurgery = {
//       id: doc.id,
//       patientName: data.patientName,
//       mrn: data.mrn,
//       procedure: data.procedure,
//       doctorName: data.doctorName,
//       scheduleAt: data.scheduleAt.toDate().toISOString(),
//       status: data.status,
//       assignedOR: data.assignedOR,
//       assignedTeam: data.assignedTeam as {
//         anesthesiologist: StaffMember;
//         nurses: StaffMember[];
//       },
//       surgeryLog: data.surgeryLog || [],
//     };

//     return NextResponse.json(schedule, { status: 200 });
//   } catch (error) {
//     console.error("Gagal mengambil detail jadwal:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// // --- PUT (Update by ID) ---
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;
//     const dataToUpdate: Partial<ScheduledSurgery> = await req.json();

//     const updatePayload: { [key: string]: unknown } = { ...dataToUpdate };

//     if (dataToUpdate.scheduleAt) {
//       updatePayload.scheduleAt = new Date(dataToUpdate.scheduleAt);
//     }

//     const scheduleRef = db.collection("scheduledSurgery").doc(id);
//     await scheduleRef.update(updatePayload);

//     return NextResponse.json(
//       { message: `Jadwal dengan ID ${id} berhasil diperbarui` },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Gagal update jadwal:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// // --- DELETE (Delete by ID) ---
// export async function DELETE(
//   _req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;

//     await db.collection("scheduledSurgery").doc(id).delete();

//     return NextResponse.json(
//       { message: `Jadwal dengan ID ${id} berhasil dihapus` },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Gagal hapus jadwal:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { ScheduledSurgery } from '@/types';

/**
 * 🔹 Helper: Konversi Firestore Timestamp → ISO string
 */
const toISO = (val: unknown): string | null => {
  if (val && typeof val === 'object' && typeof (val as Timestamp).toDate === 'function') {
    return (val as Timestamp).toDate().toISOString();
  }
  return null;
};

/**
 * ✅ PATCH — Update status atau data jadwal operasi
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const docRef = adminDb.collection('scheduledSurgeries').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Data operasi tidak ditemukan' }, { status: 404 });
    }

    const updateData: Partial<ScheduledSurgery> & { lastModified: Timestamp } = {
      ...body,
      lastModified: Timestamp.now(),
    };

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data() as ScheduledSurgery;

    // ✅ Perbaikan: id ditaruh terakhir agar tidak tertimpa
    const processed = {
      ...updatedData,
      scheduledAt: toISO(updatedData?.scheduledAt) || updatedData?.scheduledAt,
      lastModified: toISO(
        (updatedData as unknown as { lastModified?: Timestamp }).lastModified
      ),
      id: updatedDoc.id, // taruh di paling bawah
    };

    return NextResponse.json(processed, { status: 200 });
  } catch (error) {
    console.error('❌ PATCH Schedule Error:', error);
    const message =
      error instanceof Error ? error.message : 'Gagal memperbarui data.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * ✅ DELETE — Hapus jadwal operasi berdasarkan ID
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const docRef = adminDb.collection('scheduledSurgeries').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: 'Data operasi tidak ditemukan' },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json(
      { message: `Data operasi dengan ID ${id} berhasil dihapus.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ DELETE Schedule Error:', error);
    const message =
      error instanceof Error ? error.message : 'Gagal menghapus data.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


