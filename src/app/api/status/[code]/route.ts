// // src/app/api/status/[kode]/route.ts
// import { NextResponse } from "next/server";
// import { adminDb } from "@/lib/firebaseAdmin";

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
//   { params }: { params: { kode: string } }
// ) {
//   try {
//     const kode = params.kode.trim();
//     const docRef = adminDb.collection("ongoingSurgeries").doc(kode);
//     const docSnap = await docRef.get();

//     if (!docSnap.exists) {
//       return NextResponse.json({ error: "Kode tidak ditemukan" }, { status: 404 });
//     }

//     const serializableData = processFirestoreData(docSnap.data() as Record<string, unknown>);
//     return NextResponse.json({
//       id: docSnap.id,
//       ...serializableData,
//     });
//   } catch (error) {
//     console.error("Error API /status/[kode]:", error);
//     return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

/**
 * 🔧 Fungsi bantu untuk ubah semua Firestore Timestamp jadi ISO string
 */
function processFirestoreData(data: Record<string, unknown>): Record<string, unknown> {
  const processed: Record<string, unknown> = {};

  for (const key in data) {
    const value = data[key];
    const isTimestamp =
      value &&
      typeof value !== "string" &&
      typeof (value as { toDate?: () => Date }).toDate === "function";

    processed[key] = isTimestamp
      ? (value as { toDate: () => Date }).toDate().toISOString()
      : value;
  }

  return processed;
}

/**
 * ✅ GET /api/status/[kode]
 * Ambil data satu operasi berdasarkan KODE unik (biasanya sama dengan doc.id)
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ kode: string }> }
) {
  try {
    const { kode } = await context.params; // ✅ gunakan await seperti referensi listDokter
    const kodeTrimmed = kode.trim().toUpperCase();

    if (!kodeTrimmed) {
      return NextResponse.json({ error: "Kode tidak valid." }, { status: 400 });
    }

    console.log(`🔍 Mencari data status operasi untuk kode: ${kodeTrimmed}`);

    const docRef = adminDb.collection("ongoingSurgeries").doc(kodeTrimmed);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Kode tidak ditemukan." }, { status: 404 });
    }

    const rawData = docSnap.data();
    const serializableData = processFirestoreData(rawData as Record<string, unknown>);

    return NextResponse.json(
      {
        id: docSnap.id,
        ...serializableData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error API /status/[kode]:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
