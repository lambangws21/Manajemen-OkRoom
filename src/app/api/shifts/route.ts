// src/app/api/shifts/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { logActivity } from "@/lib/logActivity";

const SHIFT_COLLECTION = "shift-teams";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.staffName || !data.date || !data.shift) {
      return NextResponse.json({ error: "Nama, tanggal, dan shift wajib diisi." }, { status: 400 });
    }

    const docRef = await adminDb.collection(SHIFT_COLLECTION).add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 🧾 Catat aktivitas
    await logActivity(
      "Tambah Shift",
      `${data.staffName} dijadwalkan shift ${data.shift} (${data.date})`
    );

    return NextResponse.json({ id: docRef.id, message: "Shift created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID wajib diisi." }, { status: 400 });

    const docRef = adminDb.collection(SHIFT_COLLECTION).doc(id);
    const snap = await docRef.get();
    const data = snap.data();

    await docRef.delete();

    // 🧾 Catat aktivitas
    await logActivity(
      "Hapus Shift",
      `Shift ${data?.staffName} (${data?.shift}, ${data?.date}) dihapus oleh Kepala Ruang`
    );

    return NextResponse.json({ message: "Shift deleted successfully" });
  } catch (error) {
    console.error("Error deleting shift:", error);
    return NextResponse.json({ error: "Failed to delete shift" }, { status: 500 });
  }
}
