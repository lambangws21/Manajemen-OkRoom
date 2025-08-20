import { ReactNode } from 'react';

// DIUBAH: Tambahkan 'indigo' ke dalam tipe yang diizinkan
interface BadgeProps {
  children: ReactNode;
  colorScheme?: 'green' | 'blue' | 'yellow' | 'red' | 'gray' | 'indigo';
}

export default function Badge({ children, colorScheme = 'gray' }: BadgeProps) {
    const colors = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
      // DITAMBAHKAN: Definisikan kelas Tailwind untuk warna 'indigo'
      indigo: 'bg-indigo-100 text-indigo-800',
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[colorScheme]}`}>
        {children}
        </span>
    );
}