"use client";

import { useState, useEffect } from "react";
import { StaffMember } from "@/types";
import { mockStaffMembers, mockShiftAssignments } from "@/lib/mock-data";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StaffSelectionModal from "@/components/Team/StafSelectionModal";
import ShiftColumn from "@/components/Team/ShiftColumn";
import { UserPlus } from "lucide-react";
import { getCurrentShift } from "@/lib/utils";

type NurseShiftTeams = {
  Pagi: StaffMember[];
  Siang: StaffMember[];
  Malam: StaffMember[];
};

export default function ManajemenTimPage() {
  const staffList = mockStaffMembers;

  const [anesthesiaTeam, setAnesthesiaTeam] = useState<StaffMember[]>([
    mockStaffMembers[0],
    mockStaffMembers[1],
    mockStaffMembers[2],
  ]);
  const [nurseTeams, setNurseTeams] = useState<NurseShiftTeams>({
    Pagi: mockShiftAssignments
      .filter((a) => a.shift === "Pagi")
      .flatMap((a) => a.nurses),
    Siang: mockShiftAssignments
      .filter((a) => a.shift === "Siang")
      .flatMap((a) => a.nurses),
    Malam: mockShiftAssignments
      .filter((a) => a.shift === "Malam")
      .flatMap((a) => a.nurses),
  });

  const [activeShift, setActiveShift] = useState<
    "Pagi" | "Siang" | "Malam" | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"anesthesia" | "nurses" | null>(
    null
  );
  const [shiftToManage, setShiftToManage] = useState<
    "Pagi" | "Siang" | "Malam"
  >("Pagi");

  useEffect(() => {
    setActiveShift(getCurrentShift());
    const interval = setInterval(
      () => setActiveShift(getCurrentShift()),
      60000
    );
    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = (
    type: "anesthesia" | "nurses",
    shift?: "Pagi" | "Siang" | "Malam"
  ) => {
    setModalType(type);
    if (type === "nurses" && shift) {
      setShiftToManage(shift);
    }
    setIsModalOpen(true);
  };

  const handleSaveTeam = (selectedStaff: StaffMember[]) => {
    if (modalType === "anesthesia") {
      if (selectedStaff.length < 2 || selectedStaff.length > 5) {
        alert("Tim Dokter Anestesi harus terdiri dari 1 atau 2 orang.");
        return;
      }
      setAnesthesiaTeam(selectedStaff);
    }
    if (modalType === "nurses") {
      setNurseTeams((prevTeams) => ({
        ...prevTeams,
        [shiftToManage]: selectedStaff,
      }));
    }
    setIsModalOpen(false);
  };

  const anesthesiologistList = staffList.filter(
    (s) => s.role === "Dokter Anestesi"
  );
  const nurseList = staffList.filter((s) => s.role.includes("Perawat"));

  return (
    // Hapus 'h-full' dan biarkan konten tumbuh secara alami
    <div className="p-4 md:p-6">
      {/* Board Dokter Anestesi Jaga 24 Jam */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-500">
            Dokter Anestesi Jaga
          </h2>
          <Button
            onClick={() => handleOpenModal("anesthesia")}
            className="w-full sm:w-auto"
          >
            <UserPlus size={18} className="mr-2" /> Dokter Anestesi
          </Button>
        </div>
        {anesthesiaTeam.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {anesthesiaTeam.map((doc) => (
              <div
                key={doc.id}
                className="p-1 bg-blue-50 dark:bg-blue-900/70 rounded-xl text-center"
              >
                <p className=" text-blue-900 dark:text-blue-200 ">
                  {doc.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            Tim jaga belum diatur.
          </p>
        )}
      </Card>

      {/* Board Tim Perawat per Shift */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Tim Perawat Jaga per Shift
        </h2>
        {/* DIUBAH: Gunakan 'flex-col' di mobile/tablet dan 'flex-row' di desktop */}
        <div className="flex flex-col lg:flex-row gap-6">
          {(["Pagi", "Siang", "Malam"] as const).map((shift) => (
            <div key={shift} className="flex-1">
              <ShiftColumn
                shiftName={shift}
                nursesOnDuty={nurseTeams[shift]}
                onManageTeam={() => handleOpenModal("nurses", shift)}
                isActive={activeShift === shift}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modal (tidak berubah) */}
      {isModalOpen && modalType === "anesthesia" && (
        <StaffSelectionModal
          title="Tambah Dokter Anestesi"
          staffList={anesthesiologistList}
          selectionConstraint={{ min: 1, max: 5 }}
          initialSelection={anesthesiaTeam}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTeam}
        />
      )}
      {isModalOpen && modalType === "nurses" && (
        <StaffSelectionModal
          title={`Atur Tim Jaga Perawat - Shift ${shiftToManage}`}
          staffList={nurseList}
          initialSelection={nurseTeams[shiftToManage]}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTeam}
        />
      )}
    </div>
  );
}
