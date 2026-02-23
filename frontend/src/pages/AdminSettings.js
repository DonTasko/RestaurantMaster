import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = [
    { value: 0, label: 'Segunda' },
    { value: 1, label: 'Terça' },
    { value: 2, label: 'Quarta' },
    { value: 3, label: 'Quinta' },
    { value: 4, label: 'Sexta' },
    { value: 5, label: 'Sábado' },
    { value: 6, label: 'Domingo' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/settings`, settings);
      toast.success('Configurações guardadas com sucesso');
    } catch (error) {
      toast.error('Erro ao guardar configurações');
    }
  };

  const toggleDay = (day) => {
    const newDays = settings.open_days.includes(day)
      ? settings.open_days.filter(d => d !== day)
      : [...settings.open_days, day];
    setSettings({ ...settings, open_days: newDays });
  };

  if (loading || !settings) {
    return (
      <AdminLayout>
        <div className="text-white">A carregar...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div data-testid="admin-settings" className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tight">Configurações</h1>
          <p className="text-[#94a3b8] mt-2">Configurar horários e capacidade do restaurante</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-[#1e293b] border-[#334155] p-6">
            <h3 className="text-xl font-heading font-semibold text-white mb-4 uppercase">Dias Abertos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    data-testid={`day-checkbox-${day.value}`}
                    id={`day-${day.value}`}
                    checked={settings.open_days.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <label
                    htmlFor={`day-${day.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#1e293b] border-[#334155] p-6">
            <h3 className="text-xl font-heading font-semibold text-white mb-4 uppercase">Horários</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3">Almoço</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#94a3b8]">Início</Label>
                    <Input
                      data-testid="lunch-start-input"
                      type="time"
                      value={settings.lunch_start}
                      onChange={(e) => setSettings({ ...settings, lunch_start: e.target.value })}
                      className="bg-[#0f172a] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#94a3b8]">Fim</Label>
                    <Input
                      data-testid="lunch-end-input"
                      type="time"
                      value={settings.lunch_end}
                      onChange={(e) => setSettings({ ...settings, lunch_end: e.target.value })}
                      className="bg-[#0f172a] border-[#334155] text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Jantar</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#94a3b8]">Início</Label>
                    <Input
                      data-testid="dinner-start-input"
                      type="time"
                      value={settings.dinner_start}
                      onChange={(e) => setSettings({ ...settings, dinner_start: e.target.value })}
                      className="bg-[#0f172a] border-[#334155] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#94a3b8]">Fim</Label>
                    <Input
                      data-testid="dinner-end-input"
                      type="time"
                      value={settings.dinner_end}
                      onChange={(e) => setSettings({ ...settings, dinner_end: e.target.value })}
                      className="bg-[#0f172a] border-[#334155] text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1e293b] border-[#334155] p-6">
            <h3 className="text-xl font-heading font-semibold text-white mb-4 uppercase">Capacidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-[#94a3b8] mb-2 block">Capacidade Almoço</Label>
                <Input
                  data-testid="max-capacity-lunch-input"
                  type="number"
                  value={settings.max_capacity_lunch}
                  onChange={(e) => setSettings({ ...settings, max_capacity_lunch: parseInt(e.target.value) })}
                  className="bg-[#0f172a] border-[#334155] text-white"
                />
              </div>
              <div>
                <Label className="text-[#94a3b8] mb-2 block">Capacidade Jantar</Label>
                <Input
                  data-testid="max-capacity-dinner-input"
                  type="number"
                  value={settings.max_capacity_dinner}
                  onChange={(e) => setSettings({ ...settings, max_capacity_dinner: parseInt(e.target.value) })}
                  className="bg-[#0f172a] border-[#334155] text-white"
                />
              </div>
              <div>
                <Label className="text-[#94a3b8] mb-2 block">Tempo Médio Mesa (min)</Label>
                <Input
                  data-testid="avg-table-time-input"
                  type="number"
                  value={settings.avg_table_time}
                  onChange={(e) => setSettings({ ...settings, avg_table_time: parseInt(e.target.value) })}
                  className="bg-[#0f172a] border-[#334155] text-white"
                />
              </div>
            </div>
          </Card>

          <Button
            data-testid="save-settings-btn"
            type="submit"
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white h-12 px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Configurações
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
};