'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Gestor</h1>
        <p className="text-gray-600 mb-8">Sistema de suporte com chat IA e pagamento PIX</p>

        <div className="space-y-4">
          <Link
            href="/chat"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            💬 Iniciar Chat
          </Link>

          <Link
            href="/admin"
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            ⚙️ Painel Admin
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Versão 1.0 • © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
