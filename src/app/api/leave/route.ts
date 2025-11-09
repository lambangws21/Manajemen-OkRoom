// src/app/api/leave/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { logActivity } from "@/lib/logActivity";

const LEAVE_COLLECTION = "leaveRequest";


// --- GET All Leave Requests ---
export async function GET() {
    try {
      const snapshot = await adminDb.collection(LEAVE_COLLECTION).orderBy('createdAt', 'desc').get();
      const leaves = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return NextResponse.json(leaves);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
    }
  }
  
export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.staffName || !data.type || !data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    const docRef = await adminDb.collection(LEAVE_COLLECTION).add({
      ...data,
      status: "Menunggu",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 🧾 Catat aktivitas
    await logActivity(
      "Buat Permohonan Cuti",
      `${data.staffName} mengajukan cuti ${data.type} (${data.startDate} - ${data.endDate})`
    );

    return NextResponse.json({ id: docRef.id, message: "Leave request created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating leave request:", error);
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 });
  }
}
