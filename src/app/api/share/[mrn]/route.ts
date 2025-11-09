import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

const toISO = (val: unknown): string | null => {
  if (val && typeof val === "object" && typeof (val as Timestamp).toDate === "function") {
    return (val as Timestamp).toDate().toISOString();
  }
  return null;
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ mrn: string }> }
) {
  try {
    const { mrn } = await context.params;
    if (!mrn) return NextResponse.json({ error: "MRN tidak valid" }, { status: 400 });

    const formattedMrn = mrn.trim().toUpperCase();
    console.log("🔍 Public share fetch MRN:", formattedMrn);

    const snapshot = await adminDb
      .collection("ongoingSurgeries")
      .where("mrn", "==", formattedMrn)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "MRN tidak ditemukan" }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    const processed = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, toISO(value) || value])
    );

    const publicData = {
      mrn: formattedMrn,
      patientName: processed.patientName || processed.namaPasien || "Tidak diketahui",
      operatingRoom: processed.assignedOR || processed.room || "Belum ditentukan",
      status: processed.status || "Tidak diketahui",
      lastUpdated:
        processed.lastModified ||
        processed.handoverTime ||
        new Date().toISOString(),
    };

    return NextResponse.json(publicData);
  } catch (error) {
    console.error("❌ Error API /api/share/[mrn]:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
