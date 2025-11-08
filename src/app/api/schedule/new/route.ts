// app/schedule/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { StaffMember, ScheduledSurgery, NewScheduledSurgery } from '@/types/schedule'; // simpan types di folder terpisah

// --- GET (Read All) ---
export async function GET() {
  try {
    const schedulesRef = adminDb.collection('scheduledSurgery');
    const snapshot = await schedulesRef.get();

    if (snapshot.empty) {
      return NextResponse.json({ schedules: [] }, { status: 200 });
    }

    const schedules: ScheduledSurgery[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();

      schedules.push({
        id: doc.id,
        patientName: data.patientName,
        mrn: data.mrn,
        procedure: data.procedure,
        doctorName: data.doctorName,
        scheduledAt: data.scheduleAt.toDate().toISOString(), // konversi dari Timestamp
        status: data.status,
        assignedOR: data.assignedOR,
        assignedTeam: data.assignedTeam as {
          anesthesiologist: StaffMember;
          nurses: StaffMember[];
        },
        surgeryLog: data.surgeryLog,
      });
    });

    return NextResponse.json({ schedules }, { status: 200 });
  } catch (error) {
    console.error('Gagal mengambil data jadwal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- POST (Create) ---
export async function POST(request: NextRequest) {
  try {
    const newSchedule: NewScheduledSurgery = await request.json();

    // Validasi sederhana
    if (!newSchedule.patientName || !newSchedule.procedure || !newSchedule.scheduledAt) {
      return NextResponse.json({ error: 'Field yang dibutuhkan tidak lengkap' }, { status: 400 });
    }

    const scheduleData = {
      ...newSchedule,
      scheduleAt: new Date(newSchedule.scheduledAt), // simpan sebagai Timestamp
    };

    const docRef = await adminDb.collection('scheduledSurgery').add(scheduleData);

    return NextResponse.json(
      { id: docRef.id, ...newSchedule },
      { status: 201 }
    );
  } catch (error) {
    console.error('Gagal menambahkan data jadwal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT (Update) ---
export async function PUT(request: NextRequest) {
  try {
    const { id, ...dataToUpdate }: Partial<ScheduledSurgery> = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID jadwal dibutuhkan untuk update' }, { status: 400 });
    }

    const updatePayload: { [key: string]: unknown } = { ...dataToUpdate };

    if (dataToUpdate.scheduledAt) {
      updatePayload.scheduleAt = new Date(dataToUpdate.scheduledAt);
    }

    const scheduleRef = adminDb.collection('scheduledSurgery').doc(id);
    await scheduleRef.update(updatePayload);

    return NextResponse.json(
      { message: `Jadwal dengan ID ${id} berhasil diperbarui` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Gagal memperbarui data jadwal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- DELETE (Delete) ---
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Query parameter "id" dibutuhkan' }, { status: 400 });
    }

    await adminDb.collection('scheduledSurgery').doc(id).delete();

    return NextResponse.json(
      { message: `Jadwal dengan ID ${id} berhasil dihapus` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Gagal menghapus data jadwal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
