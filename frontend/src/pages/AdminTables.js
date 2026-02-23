import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, DoorOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminTables = () => {
  const [rooms, setRooms] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', capacity: 50 });
  const [tableForm, setTableForm] = useState({ number: '', room_id: '', capacity: 4, can_join: false });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, tablesRes] = await Promise.all([
        axios.get(`${API}/rooms`),
        axios.get(`${API}/tables`)
      ]);
      setRooms(roomsRes.data);
      setTables(tablesRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    try {
      await axios.post(`${API}/rooms`, roomForm);
      toast.success('Sala criada com sucesso');
      setShowRoomDialog(false);
      setRoomForm({ name: '', capacity: 50 });
      fetchData();
    } catch (error) {
      toast.error('Erro ao criar sala');
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta sala?')) return;
    try {
      await axios.delete(`${API}/rooms/${roomId}`);
      toast.success('Sala eliminada');
      fetchData();
    } catch (error) {
      toast.error('Erro ao eliminar sala');
    }
  };

  const createTable = async () => {
    try {
      await axios.post(`${API}/tables`, tableForm);
      toast.success('Mesa criada com sucesso');
      setShowTableDialog(false);
      setTableForm({ number: '', room_id: '', capacity: 4, can_join: false });
      fetchData();
    } catch (error) {
      toast.error('Erro ao criar mesa');
    }
  };

  const deleteTable = async (tableId) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta mesa?')) return;
    try {
      await axios.delete(`${API}/tables/${tableId}`);
      toast.success('Mesa eliminada');
      fetchData();
    } catch (error) {
      toast.error('Erro ao eliminar mesa');
    }
  };

  const getTablesForRoom = (roomId) => {
    return tables.filter(t => t.room_id === roomId);
  };

  return (
    <AdminLayout>
      <div data-testid="admin-tables" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tight">Mesas & Salas</h1>
            <p className="text-[#94a3b8] mt-2">Gerir a disposição do restaurante</p>
          </div>
          <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
            <DialogTrigger asChild>
              <Button data-testid="create-room-btn" className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nova Sala
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1e293b] border-[#334155] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Nova Sala</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome da Sala</Label>
                  <Input
                    data-testid="room-name-input"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    className="bg-[#0f172a] border-[#334155] text-white"
                    placeholder="Salão Principal"
                  />
                </div>
                <div>
                  <Label>Capacidade Máxima</Label>
                  <Input
                    data-testid="room-capacity-input"
                    type="number"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) })}
                    className="bg-[#0f172a] border-[#334155] text-white"
                  />
                </div>
                <Button data-testid="submit-room-btn" onClick={createRoom} className="w-full bg-[#3b82f6] hover:bg-[#2563eb]">
                  Criar Sala
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {rooms.length === 0 ? (
          <Card className="bg-[#1e293b] border-[#334155] p-8 text-center">
            <p className="text-[#64748b]">Nenhuma sala criada. Comece por criar uma sala.</p>
          </Card>
        ) : (
          rooms.map((room, index) => (
            <motion.div
              key={room.room_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card data-testid="room-card" className="bg-[#1e293b] border-[#334155] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#3b82f6]/20 rounded-lg">
                      <DoorOpen className="w-6 h-6 text-[#3b82f6]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-heading font-bold text-white uppercase">{room.name}</h3>
                      <p className="text-[#94a3b8] text-sm">Capacidade: {room.capacity} pessoas</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
                      <DialogTrigger asChild>
                        <Button
                          data-testid="add-table-btn"
                          onClick={() => setTableForm({ ...tableForm, room_id: room.room_id })}
                          size="sm"
                          className="bg-[#10b981] hover:bg-[#059669] text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Mesa
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1e293b] border-[#334155] text-white">
                        <DialogHeader>
                          <DialogTitle className="text-white">Adicionar Mesa</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Número da Mesa</Label>
                            <Input
                              data-testid="table-number-input"
                              value={tableForm.number}
                              onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                              className="bg-[#0f172a] border-[#334155] text-white"
                              placeholder="1, 2, A1, etc."
                            />
                          </div>
                          <div>
                            <Label>Lotação</Label>
                            <Input
                              data-testid="table-capacity-input"
                              type="number"
                              value={tableForm.capacity}
                              onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) })}
                              className="bg-[#0f172a] border-[#334155] text-white"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Pode juntar com outras mesas?</Label>
                            <Switch
                              data-testid="table-can-join-switch"
                              checked={tableForm.can_join}
                              onCheckedChange={(checked) => setTableForm({ ...tableForm, can_join: checked })}
                            />
                          </div>
                          <Button data-testid="submit-table-btn" onClick={createTable} className="w-full bg-[#3b82f6] hover:bg-[#2563eb]">
                            Criar Mesa
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      data-testid="delete-room-btn"
                      onClick={() => deleteRoom(room.room_id)}
                      size="sm"
                      variant="destructive"
                      className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {getTablesForRoom(room.room_id).map((table) => (
                    <div
                      key={table.table_id}
                      data-testid="table-item"
                      className="bg-[#0f172a] border border-[#334155] rounded-lg p-4 hover:bg-[#334155] transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-lg font-data font-bold text-white">#{table.number}</p>
                        <button
                          data-testid="delete-table-btn"
                          onClick={() => deleteTable(table.table_id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-[#94a3b8]">{table.capacity} lugares</p>
                      {table.can_join && (
                        <p className="text-xs text-[#10b981] mt-1">Pode juntar</p>
                      )}
                    </div>
                  ))}
                </div>

                {getTablesForRoom(room.room_id).length === 0 && (
                  <p className="text-[#64748b] text-center py-8">Nenhuma mesa nesta sala</p>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};