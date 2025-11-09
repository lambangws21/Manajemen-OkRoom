// // src/app/api/staffs/[id]/route.ts

// import { NextResponse } from 'next/server';
// import { adminDb } from '@/lib/firebaseAdmin'; // Import Admin SDK instance
// import admin from 'firebase-admin'; // Perlu diimpor untuk FieldValue
// import { StaffPayload, StaffRole } from '@/types/index'; 

// const VALID_ROLES: StaffRole[] = ["Dokter Anestesi", "Perawat Bedah", "Perawat Anestesi"];
// const STAFF_COLLECTION = 'staff';

// // --- Handler untuk GET staff by ID ---
// // Endpoint: GET /api/staffs/[id]
// export async function GET(req: Request, context: { params: { id: string } }) {
//     const staffId = context.params.id;
//     try {
//         const docSnap = await adminDb.collection(STAFF_COLLECTION).doc(staffId).get();

//         if (!docSnap.exists) {
//             return NextResponse.json({ error: "Staff not found" }, { status: 404 });
//         }

//         return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
//     } catch (error) {
//         console.error("Error fetching staff:", error);
//         return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
//     }
// }


// // --- Handler untuk PUT (Mengedit data Staff) ---
// // Endpoint: PUT /api/staffs/[id]
// export async function PUT(request: Request, context: { params: { id: string } }) {
//   const staffId = context.params.id;

//   try {
//     const body: StaffPayload = await request.json();
//     const { name, role, department } = body;

//     // 1. Validasi
//     if (!name || !role) {
//       return NextResponse.json(
//         { error: 'Nama dan Role staff wajib diisi.' },
//         { status: 400 }
//       );
//     }
//     if (!VALID_ROLES.includes(role)) {
//       return NextResponse.json(
//         { error: `Role tidak valid. Pilih dari: ${VALID_ROLES.join(', ')}` },
//         { status: 400 }
//       );
//     }

//     const docRef = adminDb.collection(STAFF_COLLECTION).doc(staffId);

//     const docSnap = await docRef.get();
//     if (!docSnap.exists) {
//       return NextResponse.json({ error: 'Staff tidak ditemukan.' }, { status: 404 });
//     }

//     // 2. Data yang diupdate
//     const updateData = {
//       name,
//       role,
//       // Hapus properti undefined jika department tidak dikirim
//       department: department || admin.firestore.FieldValue.delete(), 
//       updatedAt: new Date().toISOString(),
//     };

//     await docRef.update(updateData);

//     return NextResponse.json({ id: staffId, message: 'Data staff berhasil diperbarui' }, { status: 200 });
//   } catch (error) {
//     console.error(`Error saat mengupdate data staff:`, error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// // --- Handler untuk DELETE (Menghapus data Staff) ---
// // Endpoint: DELETE /api/staffs/[id]
// export async function DELETE(request: Request, context: { params: { id: string } }) {
//   const staffId = context.params.id;

//   try {
//     const docRef = adminDb.collection(STAFF_COLLECTION).doc(staffId);
//     await docRef.delete();
    
//     return NextResponse.json({ id: staffId, message: 'Data staff berhasil dihapus' }, { status: 200 });
//   } catch (error) {
//     console.error(`Error saat menghapus data staff:`, error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { StaffPayload, StaffRole } from "@/types";

const STAFF_COLLECTION = "staff";
const VALID_ROLES: StaffRole[] = ["Dokter Anestesi", "Perawat Bedah", "Perawat Anestesi"];

/**
 * ✅ GET /api/staffs/[id]
 * Ambil detail 1 staff berdasarkan ID
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "ID staff tidak valid." }, { status: 400 });
    }

    const docRef = adminDb.collection(STAFF_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Staff tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() }, { status: 200 });
  } catch (error) {
    console.error("❌ Error GET staff:", error);
    const msg = error instanceof Error ? error.message : "Gagal mengambil data staff.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * ✅ PUT /api/staffs/[id]
 * Update data staff (nama, role, department)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body: StaffPayload = await request.json();
    const { name, role, department } = body;

    if (!id) {
      return NextResponse.json({ error: "ID staff tidak valid." }, { status: 400 });
    }
    if (!name || !role) {
      return NextResponse.json(
        { error: "Nama dan Role staff wajib diisi." },
        { status: 400 }
      );
    }
    if (!VALID_ROLES.includes(role as StaffRole)) {
      return NextResponse.json(
        { error: `Role tidak valid. Pilih dari: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      );
    }
    

    const docRef = adminDb.collection(STAFF_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Staff tidak ditemukan." }, { status: 404 });
    }

    const updateData = {
      name,
      role,
      department: department || admin.firestore.FieldValue.delete(),
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updateData);

    return NextResponse.json(
      { id, message: `Data staff berhasil diperbarui.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error PUT staff:", error);
    const msg = error instanceof Error ? error.message : "Gagal memperbarui data staff.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * ✅ DELETE /api/staffs/[id]
 * Hapus 1 staff berdasarkan ID
 */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "ID staff tidak valid." }, { status: 400 });
    }

    const docRef = adminDb.collection(STAFF_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Staff tidak ditemukan." }, { status: 404 });
    }

    await docRef.delete();
    console.log(`🗑️ Staff ${id} berhasil dihapus.`);

    return NextResponse.json(
      { id, message: `Data staff dengan ID ${id} berhasil dihapus.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error DELETE staff:", error);
    const msg = error instanceof Error ? error.message : "Gagal menghapus data staff.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
