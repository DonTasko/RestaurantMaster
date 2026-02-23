import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '../components/AdminLayout';
import { Card } from '../components/ui/card';
import { Calendar, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Reservas Hoje',
      value: stats?.today_reservations || 0,
      icon: Calendar,
      color: '#3b82f6',
      testId: 'stat-today-reservations'
    },
    {
      title: 'Taxa de Ocupação',
      value: `${stats?.occupancy_rate || 0}%`,
      icon: TrendingUp,
      color: '#10b981',
      testId: 'stat-occupancy-rate'
    },
    {
      title: 'Alertas HACCP',
      value: stats?.haccp_alerts || 0,
      icon: AlertTriangle,
      color: '#f59e0b',
      testId: 'stat-haccp-alerts'
    },
    {
      title: 'Registos Pendentes',
      value: stats?.pending_records || 0,
      icon: Users,
      color: '#f43f5e',
      testId: 'stat-pending-records'
    }
  ];

  return (
    <AdminLayout>
      <div data-testid="admin-dashboard" className="space-y-6">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tight">Dashboard</h1>
          <p className="text-[#94a3b8] mt-2">Visão geral do restaurante</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card data-testid={stat.testId} className="bg-[#1e293b] border-[#334155] p-6 hover:bg-[#334155] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[#94a3b8] text-sm uppercase tracking-wide font-medium">{stat.title}</p>
                      <p className="text-3xl font-data font-bold text-white mt-2">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#1e293b] border-[#334155] p-6">
            <h3 className="text-xl font-heading font-semibold text-white mb-4 uppercase tracking-wide">Próximas Reservas</h3>
            <div className="space-y-3">
              {stats?.upcoming_reservations?.length > 0 ? (
                stats.upcoming_reservations.map((reservation) => (
                  <div
                    key={reservation.reservation_id}
                    data-testid="upcoming-reservation-item"
                    className="bg-white text-slate-900 border-l-4 border-l-[#3b82f6] rounded-r-md p-4 ticket-card"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{reservation.name}</p>
                        <p className="text-sm text-slate-600">{reservation.guests} pessoas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-semibold">{reservation.date}</p>
                        <p className="text-sm font-mono text-slate-600">{reservation.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#64748b] text-center py-8">Nenhuma reserva próxima</p>
              )}
            </div>
          </Card>

          <Card className="bg-[#1e293b] border-[#334155] p-6">
            <h3 className="text-xl font-heading font-semibold text-white mb-4 uppercase tracking-wide">Ações Rápidas</h3>
            <div className="space-y-3">
              <button
                data-testid="quick-action-new-reservation"
                onClick={() => window.location.href = '/admin/reservations'}
                className="w-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/20 p-4 rounded-md text-left transition-colors"
              >
                <p className="font-semibold">Nova Reserva</p>
                <p className="text-sm opacity-80">Criar manualmente</p>
              </button>
              <button
                data-testid="quick-action-haccp"
                onClick={() => window.location.href = '/admin/haccp'}
                className="w-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/20 p-4 rounded-md text-left transition-colors"
              >
                <p className="font-semibold">Registos HACCP</p>
                <p className="text-sm opacity-80">Adicionar registo</p>
              </button>
              <button
                data-testid="quick-action-tables"
                onClick={() => window.location.href = '/admin/tables'}
                className="w-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/20 p-4 rounded-md text-left transition-colors"
              >
                <p className="font-semibold">Gestão de Mesas</p>
                <p className="text-sm opacity-80">Configurar salas e mesas</p>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};