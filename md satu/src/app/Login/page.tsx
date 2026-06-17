import Link from "next/link";
import { Zap, Mail, Lock, ArrowRight } from "lucide-react";
import { Logo } from "@/src/components/shared/Logo";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex font-sans selection:bg-emerald-100 selection:text-emerald-900 bg-white">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-emerald-50 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-40 -right-40 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

        <div className="relative z-10">
          <Link href="/" className="inline-block group">
            <div className="group-hover:scale-105 transition-transform origin-left">
              <Logo />
            </div>
          </Link>
          <div className="mt-20 max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
              Pantau Konsumsi Listrik Lebih Cerdas
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Selamat datang kembali! Kelola penggunaan listrik Anda, dapatkan prediksi akurat, dan temukan cara menghemat tagihan bulanan.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} WattSmart. Seluruh hak cipta dilindungi.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Masuk ke Akun</h2>
            <p className="mt-2 text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link href="/register" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                Daftar sekarang
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" action="#" method="POST">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Kata Sandi
                  </label>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                      Lupa sandi?
                    </a>
                  </div>
                </div>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Ingat saya
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-md hover:shadow-lg"
              >
                Masuk
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}