import { NextResponse, NextRequest } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { logActivity } from "@/lib/logActivity";

const LEAVE_COLLECTION = "leaveRequest";

// ✅ Gunakan Promise<{ id: string }> untuk context.params (versi Next 14+)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 💥 await wajib di sini
    const { status, approvedBy = "Kepala Ruang" } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status wajib diisi." },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection(LEAVE_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "Data cuti tidak ditemukan." },
        { status: 404 }
      );
    }

    const data = docSnap.data();

    await docRef.update({
      status,
      approvedBy,
      updatedAt: new Date().toISOString(),
    });

    // 🧾 Catat aktivitas
    const action = status === "Disetujui" ? "Approve Cuti" : "Tolak Cuti";
    const description = `${approvedBy} ${
      status === "Disetujui" ? "menyetujui" : "menolak"
    } cuti untuk ${data?.staffName} (${data?.type})`;
    await logActivity(action, description, approvedBy);

    return NextResponse.json({
      id,
      message: "Leave status updated successfully",
    });
  } catch (error) {
    console.error("Error updating leave status:", error);
    return NextResponse.json(
      { error: "Failed to update leave status" },
      { status: 500 }
    );
  }
}
