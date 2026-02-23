import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, Edit, X } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchQuery, statusFilter]);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${API}/reservations`);
      setReservations(response.data);
    } catch (error) {
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setFilteredReservations(filtered);
  };

  const cancelReservation = async (id) => {
    try {
      await axios.delete(`${API}/reservations/${id}`);
      toast.success('Reserva cancelada');
      fetchReservations();
    } catch (error) {
      toast.error('Erro ao cancelar reserva');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Concluída';
      default: return status;
    }
  };

  return (
    <AdminLayout>
      <div data-testid="admin-reservations" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tight">Reservas</h1>
            <p className="text-[#94a3b8] mt-2">Gerir reservas do restaurante</p>
          </div>
        </div>

        <Card className="bg-[#1e293b] border-[#334155] p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-[#64748b]" />
              <Input
                data-testid="search-reservations-input"
                type="text"
                placeholder="Procurar por nome ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-[#0f172a] border-[#334155] text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="filter-status-select" className="w-full md:w-48 h-12 bg-[#0f172a] border-[#334155] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <p className="text-[#64748b] text-center py-8">A carregar...</p>
          ) : filteredReservations.length === 0 ? (
            <p className="text-[#64748b] text-center py-8">Nenhuma reserva encontrada</p>
          ) : (
            filteredReservations.map((reservation, index) => (
              <motion.div
                key={reservation.reservation_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card data-testid="reservation-item" className="bg-white text-slate-900 border-l-4 border-l-[#3b82f6] p-5 ticket-card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{reservation.name}</h3>
                        <span className={`text-sm font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusLabel(reservation.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
                        <p><strong>Data:</strong> {reservation.date}</p>
                        <p><strong>Hora:</strong> {reservation.time}</p>
                        <p><strong>Pessoas:</strong> {reservation.guests}</p>
                        <p><strong>Telefone:</strong> {reservation.phone}</p>
                        {reservation.table_id && <p><strong>Mesa:</strong> {reservation.table_id}</p>}
                        {reservation.notes && <p className="col-span-2"><strong>Notas:</strong> {reservation.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {reservation.status !== 'cancelled' && (
                        <Button
                          data-testid="cancel-reservation-btn"
                          onClick={() => cancelReservation(reservation.reservation_id)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};