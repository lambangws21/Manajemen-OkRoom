"use client";

import { StaffMember } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Scissors, Syringe, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import  {Button}  from "@/components/ui/ui/button";
import { Card } from "@/components/ui/ui/card";

interface ShiftColumnProps {
  shiftName: "Pagi" | "Siang" | "Malam";
  nursesOnDuty: StaffMember[];
  onManageTeam: () => void;
  isActive: boolean;
}

export default function ShiftColumn({
  shiftName,
  nursesOnDuty,
  onManageTeam,
  isActive,
}: ShiftColumnProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <Card
        className={cn(
          "flex flex-col transition-all rounded-md p-4 shadow-sm dark:shadow-none",
          isActive
            ? "border-0 border-green-100 shadow-lg dark:border-green-400"
            : "border border-gray-200 dark:border-gray-700 hover:shadow-md"
        )}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3 mb-4 gap-2">
          <div className="flex items-center">
            <h2 className="text-md sm:text-lg font-bold text-gray-800 dark:text-gray-800 flex items-center gap-2">
              <Sparkles
                size={18}
                className={cn(
                  "text-yellow-600 transition-transform duration-300",
                  isActive ? "rotate-12" : "opacity-60"
                )}
              />
              Dinas {shiftName}
            </h2>
            {isActive && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hidden sm:inline ml-2 text-md font-semibold text-green-800 bg-green-200 px-2 py-1 rounded animate-pulse"
              >
                AKTIF
              </motion.span>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              onClick={onManageTeam}
              className="p-1 sm:px-3 sm:py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <UserPlus size={16} className="sm:hidden inline" />
              <span className="hidden sm:inline ml-2 text-sm font-medium">
                Atur Tim
              </span>
            </Button>
          </motion.div>
        </div>

        {/* Body */}
        <div
          className={cn(
            "flex-grow space-y-3 min-h-[200px] overflow-y-auto pr-2 transition-all",
            !isActive && "opacity-60"
          )}
        >
          <AnimatePresence>
            {nursesOnDuty.length > 0 ? (
              nursesOnDuty.map((nurse) => (
                <motion.div
                  key={nurse.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{
                    scale: 1.02,
                    translateX: 2,
                  }}
                  className={cn(
                    "p-1.5 flex flex-col transition-all duration-300",
                    nurse.role === "Perawat Bedah"
                      ? "bg-blue-200/90 dark:bg-blue-200/50 border-l-4 border-blue-800 "
                      : "bg-red-200/90 dark:bg-red-200/50 border-l-4 border-red-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="sm:hidden">
                        {nurse.role === "Perawat Bedah" ? (
                          <Scissors
                            size={14}
                            className="text-gray-900 dark:text-gray-200"
                          />
                        ) : (
                          <Syringe
                            size={14}
                            className="text-gray-900 dark:text-gray-200"
                          />
                        )}
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-800">
                        {nurse.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-900 dark:text-gray-700 hidden sm:block pl-1 mt-1">
                    {nurse.role}
                  </p>
                </motion.div>
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-center py-6"
              >
                <p>Tim belum diatur.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}
