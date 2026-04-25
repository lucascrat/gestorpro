'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Client {
  id: number;
  name: string;
  panel_username: string;
  renewal_cost: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [loginMode, setLoginMode] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setLoginMode(false);
      fetchClients(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchClients(authToken: string) {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setClients(response.data.clients);
      setError('');
    } catch (err: any) {
      setError('Erro ao carregar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Mock login - em produção, seria um endpoint real
    const mockToken = btoa(`${loginEmail}:${loginPassword}`);
    localStorage.setItem('adminToken', mockToken);
    setToken(mockToken);
    setLoginMode(false);
    fetchClients(mockToken);
  }

  function handleLogout() {
    localStorage.removeItem('adminToken');
    setToken('');
    setLoginMode(true);
    setClients([]);
  }

  if (loginMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Login</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Senha</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Entrar
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Demo: use qualquer email/senha
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-2xl font-bold">⚙️ Painel Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
        >
          Sair
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Clientes Cadastrados</h2>
          <Link
            href="/admin/clients/create"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            + Novo Cliente
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando clientes...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {clients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhum cliente cadastrado ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-200 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Nome</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Usuário Painel</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Valor Renovação</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-800 font-semibold">{client.name}</td>
                        <td className="px-6 py-4 text-gray-600">{client.panel_username}</td>
                        <td className="px-6 py-4 text-gray-600">
                          R$ {parseFloat(String(client.renewal_cost)).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            client.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {client.status === 'active' ? '✓ Ativo' : '✗ Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm(`Deletar cliente ${client.name}?`)) {
                                // TODO: Implementar delete
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
