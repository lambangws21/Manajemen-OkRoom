// import { NextResponse } from "next/server";
// import { adminDb } from "@/lib/firebaseAdmin";

// // Fungsi bantu untuk ubah timestamp Firestore jadi ISO string
// function processFirestoreData(data: Record<string, unknown>): Record<string, unknown> {
//   const processed: Record<string, unknown> = {};
//   for (const key in data) {
//     const value = data[key];
//     const isTimestamp =
//       value &&
//       typeof value !== "string" &&
//       typeof (value as { toDate?: () => Date }).toDate === "function";

//     if (isTimestamp) {
//       processed[key] = (value as { toDate: () => Date }).toDate().toISOString();
//     } else if (value !== undefined) {
//       processed[key] = value;
//     }
//   }
//   return processed;
// }

// export async function GET(
//   _req: Request,
//   { params }: { params: { mrn: string } }
// ) {
//   try {
//     const mrn = params.mrn.trim().toUpperCase(); // pastikan case-insensitive
//     console.log("🔍 Mencari data operasi untuk MRN:", mrn);

//     // 🔥 Ambil data berdasarkan field `mrn`, bukan doc.id
//     const snapshot = await adminDb
//       .collection("ongoingSurgeries")
//       .where("mrn", "==", mrn)
//       .limit(1)
//       .get();

//     if (snapshot.empty) {
//       return NextResponse.json({ error: "MRN tidak ditemukan" }, { status: 404 });
//     }

//     const doc = snapshot.docs[0];
//     const rawData = doc.data();

//     const serializableData = processFirestoreData(rawData as Record<string, unknown>);

//     // 🔒 Hanya kirim data publik
//     const publicData = {
//       mrn,
//       operatingRoom: serializableData.assignedOR || serializableData.room || "Belum ditentukan",
//       status: serializableData.status || "Tidak diketahui",
//       lastUpdated:
//         serializableData.lastModified ||
//         serializableData.handoverTime ||
//         new Date().toISOString(),
//     };

//     return NextResponse.json(publicData);
//   } catch (error) {
//     console.error("❌ Error API /api/share/[mrn]:", error);
//     return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * 🧩 Helper: Konversi Firestore Timestamp ke ISO string
 */
const toISO = (val: unknown): string | null => {
  if (val && typeof val === "object" && typeof (val as Timestamp).toDate === "function") {
    return (val as Timestamp).toDate().toISOString();
  }
  return null;
};

/**
 * ✅ GET /api/share/[mrn]
 * Ambil data operasi publik berdasarkan MRN (Medical Record Number)
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ mrn: string }> }
) {
  try {
    const { mrn } = await context.params;

    if (!mrn) {
      return NextResponse.json({ error: "MRN tidak valid" }, { status: 400 });
    }

    const formattedMrn = mrn.trim().toUpperCase();
    console.log("🔍 Mencari data operasi untuk MRN:", formattedMrn);

    // 🔥 Cari berdasarkan field MRN
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

    // ✅ Proses timestamp ke ISO
    const processed = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        toISO(value) || value,
      ])
    );

    // 🔒 Hanya kirim data publik (tidak bocor nama pasien, dokter, dll)
    const publicData = {
      mrn: formattedMrn,
      operatingRoom: processed.assignedOR || processed.room || "Belum ditentukan",
      status: processed.status || "Tidak diketahui",
      lastUpdated:
        processed.lastModified ||
        processed.handoverTime ||
        new Date().toISOString(),
    };

    return NextResponse.json(publicData, { status: 200 });
  } catch (error) {
    console.error("❌ Error API /api/share/[mrn]:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
