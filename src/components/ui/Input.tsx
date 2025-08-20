'use client';

import { ChangeEvent } from 'react';

// 1. Ubah 'interface' untuk bisa menerima semua properti standar dari elemen <input> HTML.
// Ini cara terbaik agar komponen Anda fleksibel dan bisa menerima props seperti 'name', 'id', 'required', dll.
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Anda masih bisa mendefinisikan props khusus di sini jika perlu.
  // 'onChange' kita definisikan ulang agar lebih spesifik jika diperlukan,
  // namun dengan extends, ini sebenarnya sudah tercakup.
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

// 2. Tambahkan 'name' dan '...props' ke dalam parameter fungsi.
// '...props' akan menangkap semua properti lain yang Anda berikan (seperti 'name', 'id', dll.)
export default function Input({ type = 'text', placeholder, value, onChange, name, ...props }: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name} // <-- Gunakan prop 'name' di sini
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props} // <-- Sebar semua sisa props lainnya di sini
    />
  );
}