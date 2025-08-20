import Spinner from "@/components/ui/Spinner";

export default function Loading() {
  // Komponen ini akan secara otomatis ditampilkan oleh Next.js
  // saat halaman baru sedang dimuat di server.
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100/50 dark:bg-gray-800/50">
      <Spinner size="lg" />
      <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
        Memuat...
      </p>
    </div>
  );
}