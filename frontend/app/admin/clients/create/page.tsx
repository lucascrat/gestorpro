'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function CreateClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    panelUsername: '',
    panelPassword: '',
    renewalCost: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin');
        return;
      }

      await axios.post(`${API_URL}/api/clients`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar cliente');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">⚙️ Novo Cliente</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Voltar
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nome do Cliente *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: João da Silva"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Usuário Painel *</label>
              <input
                type="text"
                name="panelUsername"
                value={formData.panelUsername}
                onChange={handleChange}
                placeholder="Ex: joao.silva"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Senha Painel *</label>
              <input
                type="password"
                name="panelPassword"
                value={formData.panelPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <p className="text-xs text-gray-500 mt-1">Será encriptada e salva com segurança</p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Valor Renovação (R$) *</label>
              <input
                type="number"
                name="renewalCost"
                value={formData.renewalCost}
                onChange={handleChange}
                placeholder="29.90"
                step="0.01"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg disabled:bg-gray-400 transition"
              >
                {loading ? 'Criando...' : 'Criar Cliente'}
              </button>

              <Link
                href="/admin"
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
