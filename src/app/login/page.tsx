'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, LogIn, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/ui/button';

interface FirebaseAuthError {
  code: string;
  message: string;
}

function isFirebaseAuthError(error: unknown): error is FirebaseAuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Login berhasil!');
        router.push('/dashboard');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Akun berhasil dibuat!');
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      if (isFirebaseAuthError(error)) {
        toast.error(error.message || 'Terjadi kesalahan.');
      } else {
        toast.error('Kesalahan tak terduga.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-200 dark:from-gray-950 dark:via-gray-900 dark:to-slate-800 overflow-hidden">
      {/* 💠 Background Aesthetic */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 w-[600px] h-[600px] bg-blue-300 dark:bg-blue-900 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 -left-1/2 w-[600px] h-[600px] bg-indigo-400 dark:bg-indigo-800 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800"
        >
          <motion.h2
            className="text-3xl font-extrabold text-center text-gray-800 dark:text-gray-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </motion.h2>

          <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-6 text-sm">
            {isLogin
              ? 'Masuk untuk melanjutkan ke dashboard Anda'
              : 'Daftar untuk mulai mengelola data operasi'}
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500"
                size={18}
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                className="pl-10 pr-3 py-2 rounded-lg w-full border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition"
                required
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500"
                size={18}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="pl-10 pr-3 py-2 rounded-lg w-full border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold py-2 rounded-lg hover:shadow-lg hover:scale-[1.02] transition-transform"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : isLogin ? (
                <>
                  <LogIn className="mr-2 w-4 h-4" /> Login
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 w-4 h-4" /> Daftar
                </>
              )}
            </Button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isLogin ? 'Daftar di sini' : 'Login di sini'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
