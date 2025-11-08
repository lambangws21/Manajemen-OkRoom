// import { NextRequest, NextResponse } from 'next/server';
// import { adminDb } from '@/lib/firebaseAdmin';
// import { QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
// // DIUBAH: Impor tipe dari sumber utama '/types'
// import { ScheduledSurgery, NewScheduledSurgery, AssignedTeamRef } from '@/types';

// // --- GET (Membaca Semua Jadwal) ---
// export async function GET() {
//   try {
//     // Gunakan nama koleksi yang konsisten
//     const schedulesRef = adminDb.collection('scheduledSurgeries');
//     // Error Anda terjadi pada baris ini, karena gagal menghubungi server Firestore.
//     const snapshot = await schedulesRef.orderBy('scheduledAt', 'asc').get();

//     if (snapshot.empty) {
//       // Kembalikan array kosong jika tidak ada data
//       return NextResponse.json([], { status: 200 });
//     }

//     const schedules: ScheduledSurgery[] = [];
//     snapshot.forEach((doc: QueryDocumentSnapshot) => {
//       const data = doc.data();
//       schedules.push({
//         id: doc.id,
//         patientName: data.patientName,
//         mrn: data.mrn,
//         procedure: data.procedure,
//         doctorName: data.doctorName,
//         room: data.room,
//         assurance: data.assurance,
//         notes: data.notes,
//         scheduledAt: (data.scheduledAt as Timestamp).toDate().toISOString(),
//         status: data.status,
//         assignedOR: data.assignedOR,
//         assignedTeam: data.assignedTeam as AssignedTeamRef,
//         surgeryLog: data.surgeryLog,

//       });
//     });

//     // Kembalikan array secara langsung untuk mempermudah frontend
//     return NextResponse.json(schedules, { status: 200 });
//   } catch (error) {
//     console.error('Gagal mengambil data jadwal:', error);
//     // Tambahkan detail error untuk debugging
//     return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
//   }
// }

// // --- POST (Membuat Jadwal Baru) ---
// export async function POST(request: NextRequest) {
//   try {
//     const newSchedule: NewScheduledSurgery = await request.json();

//     if (!newSchedule.patientName || !newSchedule.procedure || !newSchedule.scheduledAt) {
//       return NextResponse.json({ error: 'Field yang dibutuhkan tidak lengkap' }, { status: 400 });
//     }

//     const scheduleData = {
//       ...newSchedule,
//       // Konversi ISO string kembali ke Timestamp Firebase
//       scheduledAt: Timestamp.fromDate(new Date(newSchedule.scheduledAt)),
//     };

//     const docRef = await adminDb.collection('scheduledSurgeries').add(scheduleData);
//     const createdData = { id: docRef.id, ...newSchedule };

//     return NextResponse.json(createdData, { status: 201 });
//   } catch (error) {
//     console.error('Gagal menambahkan data jadwal:', error);
//     return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
//   }
// }

// // --- PUT (Memperbarui Jadwal) ---
// export async function PUT(request: NextRequest) {
//   try {
//     // Definisi tipe yang lebih eksplisit untuk payload permintaan
//     const requestBody: { id: string } & Partial<Omit<ScheduledSurgery, 'id'>> = await request.json();
    
//     const { id, scheduledAt, ...dataToUpdate } = requestBody;
    
//     if (!id) {
//       return NextResponse.json({ error: 'ID jadwal dibutuhkan' }, { status: 400 });
//     }
    
//     const updatePayload: Record<string, unknown> = { ...dataToUpdate };

//     if (scheduledAt) {
//       // Pastikan konversi jika tanggal diperbarui
//       updatePayload.scheduledAt = Timestamp.fromDate(new Date(scheduledAt));
//     }

//     const scheduleRef = adminDb.collection('scheduledSurgeries').doc(id);
//     await scheduleRef.update(updatePayload);

//     return NextResponse.json({ message: `Jadwal ${id} berhasil diperbarui` });
//   } catch (error) {
//     console.error('Gagal memperbarui data jadwal:', error);
//     return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
//   }
// }

// // --- DELETE (Menghapus Jadwal) ---
// export async function DELETE(request: NextRequest) {
//   try {
//     const id = request.nextUrl.searchParams.get('id');
//     if (!id) {
//       return NextResponse.json({ error: 'Query parameter "id" dibutuhkan' }, { status: 400 });
//     }
//     await adminDb.collection('scheduledSurgeries').doc(id).delete();
//     return NextResponse.json({ message: `Jadwal ${id} berhasil dihapus` });
//   } catch (error) {
//     console.error('Gagal menghapus data jadwal:', error);
//     return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import { ScheduledSurgery, AssignedTeamRef, NewScheduledSurgery } from "@/types";

/*************  ✨ Windsurf Command 🌟  *************/
export async function GET() {
  try {
    const schedulesRef = adminDb.collection("scheduledSurgeries");
    const snapshot = await schedulesRef.get(); // 🔹 hapus orderBy dulu sementara untuk debugging

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const schedules: ScheduledSurgery[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();

      // 🔍 skip dokumen invalid
      if (!data.patientName || !data.scheduledAt) {
        console.warn(`⚠️ Dokumen ${doc.id} tidak lengkap, dilewati.`);
        return;
      }

      // 🔹 konversi Timestamp ke ISO string dengan fallback aman
      const safeDate = (() => {
        try {
          if (data.scheduledAt instanceof Timestamp) {
            return data.scheduledAt.toDate().toISOString();
          }
          if (typeof data.scheduledAt === "string") {
            return new Date(data.scheduledAt).toISOString();
          }
          return new Date().toISOString(); // fallback
        } catch {
          return new Date().toISOString();
        }
      })();

      schedules.push({
        id: doc.id,
        patientName: data.patientName,
        mrn: data.mrn || "",
        procedure: data.procedure || "",
        doctorName: data.doctorName || "",
        room: data.room || "",
        assurance: data.assurance || "",
        notes: data.notes || "",
        scheduledAt: safeDate,
        startTime: data.startTime
          ? (data.startTime instanceof Timestamp
              ? data.startTime.toDate().toISOString()
              : String(data.startTime))
          : null,
        endTime: data.endTime
          ? (data.endTime instanceof Timestamp
              ? data.endTime.toDate().toISOString()
              : String(data.endTime))
          : null,
        createdAt: data.createdAt
          ? (data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : String(data.createdAt))
          : new Date().toISOString(),
        status: data.status || "Terjadwal",
        assignedOR: data.assignedOR || "",
        assignedTeam: (data.assignedTeam || {}) as AssignedTeamRef,
        surgeryLog: data.surgeryLog || [],
      });
    });

    // 🔄 Sort manual di sini setelah semua data aman
    schedules.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
    );

    return NextResponse.json(schedules, { status: 200 });
  } catch (error) {
    console.error("❌ Gagal mengambil data jadwal:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
/*******  9abf3377-e614-42e1-b684-2bdb4cd008d0  *******/


// --- POST (Membuat Jadwal Baru) ---
export async function POST(request: NextRequest) {
  try {
    const newSchedule: NewScheduledSurgery = await request.json();

    if (!newSchedule.patientName || !newSchedule.procedure || !newSchedule.scheduledAt) {
      return NextResponse.json(
        { error: "Field yang dibutuhkan tidak lengkap" },
        { status: 400 }
      );
    }

    const scheduleData = {
      ...newSchedule,
      scheduledAt: Timestamp.fromDate(new Date(newSchedule.scheduledAt)),
      createdAt: Timestamp.now(),
      startTime: null,
      endTime: null,
      status: newSchedule.status || "Menunggu",
    };

    const docRef = await adminDb.collection("scheduledSurgeries").add(scheduleData);
    const createdData = { id: docRef.id, ...newSchedule };

    return NextResponse.json(createdData, { status: 201 });
  } catch (error) {
    console.error("❌ Gagal menambahkan data jadwal:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// --- PUT (Memperbarui Jadwal) ---
export async function PUT(request: NextRequest) {
  try {
    const requestBody: { id: string } & Partial<Omit<ScheduledSurgery, "id">> =
      await request.json();

    const { id, scheduledAt, ...dataToUpdate } = requestBody;

    if (!id) {
      return NextResponse.json({ error: "ID jadwal dibutuhkan" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = { ...dataToUpdate };

    if (scheduledAt) {
      updatePayload.scheduledAt = Timestamp.fromDate(new Date(scheduledAt));
    }

    const scheduleRef = adminDb.collection("scheduledSurgeries").doc(id);
    await scheduleRef.update(updatePayload);

    return NextResponse.json({ message: `✅ Jadwal ${id} berhasil diperbarui` });
  } catch (error) {
    console.error("❌ Gagal memperbarui data jadwal:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// --- DELETE (Menghapus Jadwal) ---
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: 'Query parameter "id" dibutuhkan' },
        { status: 400 }
      );
    }

    await adminDb.collection("scheduledSurgeries").doc(id).delete();
    return NextResponse.json({ message: `🗑️ Jadwal ${id} berhasil dihapus` });
  } catch (error) {
    console.error("❌ Gagal menghapus data jadwal:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
