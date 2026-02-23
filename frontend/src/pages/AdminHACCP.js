import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Thermometer, ClipboardCheck, Package, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminHACCP = () => {
  const [records, setRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('temperature');
  const [showEquipmentDialog, setShowEquipmentDialog] = useState(false);
  const [showSpaceDialog, setShowSpaceDialog] = useState(false);
  const signatureRef = useRef(null);
  
  const [equipmentForm, setEquipmentForm] = useState({ name: '', type: 'refrigerator', location: '' });
  const [spaceForm, setSpaceForm] = useState({ name: '', type: 'kitchen' });
  
  const [formData, setFormData] = useState({
    record_type: 'temperature',
    equipment_product: '',
    value: '',
    user_name: '',
    notes: ''
  });

  useEffect(() => {
    fetchRecords();
    fetchAlerts();
    fetchEquipment();
    fetchSpaces();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API}/haccp`);
      setRecords(response.data);
    } catch (error) {
      toast.error('Erro ao carregar registos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API}/haccp/alerts`);
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`);
      setEquipment(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  const fetchSpaces = async () => {
    try {
      const response = await axios.get(`${API}/spaces`);
      setSpaces(response.data);
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
    }
  };

  const createEquipment = async () => {
    try {
      await axios.post(`${API}/equipment`, equipmentForm);
      toast.success('Equipamento criado');
      setShowEquipmentDialog(false);
      setEquipmentForm({ name: '', type: 'refrigerator', location: '' });
      fetchEquipment();
    } catch (error) {
      toast.error('Erro ao criar equipamento');
    }
  };

  const deleteEquipment = async (id) => {
    if (!window.confirm('Eliminar este equipamento?')) return;
    try {
      await axios.delete(`${API}/equipment/${id}`);
      toast.success('Equipamento eliminado');
      fetchEquipment();
    } catch (error) {
      toast.error('Erro ao eliminar');
    }
  };

  const createSpace = async () => {
    try {
      await axios.post(`${API}/spaces`, spaceForm);
      toast.success('Espaço criado');
      setShowSpaceDialog(false);
      setSpaceForm({ name: '', type: 'kitchen' });
      fetchSpaces();
    } catch (error) {
      toast.error('Erro ao criar espaço');
    }
  };

  const deleteSpace = async (id) => {
    if (!window.confirm('Eliminar este espaço?')) return;
    try {
      await axios.delete(`${API}/spaces/${id}`);
      toast.success('Espaço eliminado');
      fetchSpaces();
    } catch (error) {
      toast.error('Erro ao eliminar');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const signature = signatureRef.current ? signatureRef.current.toDataURL() : null;
    
    try {
      await axios.post(`${API}/haccp`, {
        ...formData,
        record_type: activeTab,
        signature
      });
      toast.success('Registo HACCP criado com sucesso');
      setFormData({ record_type: activeTab, equipment_product: '', value: '', user_name: '', notes: '' });
      if (signatureRef.current) signatureRef.current.clear();
      fetchRecords();
      fetchAlerts();
    } catch (error) {
      toast.error('Erro ao criar registo');
    }
  };

  const getRecordsByType = (type) => {
    return records.filter(r => r.record_type === type);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'temperature': return Thermometer;
      case 'cleaning': return ClipboardCheck;
      case 'goods_reception': return Package;
      case 'expiry': return CalendarIcon;
      default: return ClipboardCheck;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'temperature': return 'Temperatura';
      case 'cleaning': return 'Limpeza';
      case 'goods_reception': return 'Receção de Mercadorias';
      case 'expiry': return 'Validade';
      default: return type;
    }
  };

  return (
    <AdminLayout>
      <div data-testid="admin-haccp" className="space-y-6">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white uppercase tracking-tight">Módulo HACCP</h1>
          <p className="text-[#94a3b8] mt-2">Sistema de Segurança Alimentar</p>
        </div>

        {alerts.length > 0 && (
          <Card className="bg-[#f59e0b]/10 border-[#f59e0b]/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[#f59e0b] font-semibold mb-2">Alertas HACCP</h3>
                <ul className="space-y-1">
                  {alerts.map((alert, index) => (
                    <li key={index} className="text-[#f59e0b] text-sm">• {alert.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#1e293b] border border-[#334155] p-1">
            <TabsTrigger data-testid="tab-temperature" value="temperature" className="data-[state=active]:bg-[#3b82f6]">
              <Thermometer className="w-4 h-4 mr-2" />
              Temperaturas
            </TabsTrigger>
            <TabsTrigger data-testid="tab-cleaning" value="cleaning" className="data-[state=active]:bg-[#3b82f6]">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Limpeza
            </TabsTrigger>
            <TabsTrigger data-testid="tab-goods" value="goods_reception" className="data-[state=active]:bg-[#3b82f6]">
              <Package className="w-4 h-4 mr-2" />
              Receção
            </TabsTrigger>
            <TabsTrigger data-testid="tab-expiry" value="expiry" className="data-[state=active]:bg-[#3b82f6]">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Validade
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1e293b] border-[#334155] p-6">
              <h3 className="text-xl font-heading font-semibold text-white mb-4 uppercase">Novo Registo</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">
                    {activeTab === 'temperature' && 'Equipamento / Alimento'}
                    {activeTab === 'cleaning' && 'Área / Equipamento'}
                    {activeTab === 'goods_reception' && 'Produto / Fornecedor'}
                    {activeTab === 'expiry' && 'Produto'}
                  </Label>
                  <Input
                    data-testid="haccp-equipment-input"
                    required
                    value={formData.equipment_product}
                    onChange={(e) => setFormData({ ...formData, equipment_product: e.target.value })}
                    className="bg-[#0f172a] border-[#334155] text-white"
                    placeholder={
                      activeTab === 'temperature' ? 'Frigorífico A' :
                      activeTab === 'cleaning' ? 'Cozinha - Bancada' :
                      activeTab === 'goods_reception' ? 'Carne - Fornecedor X' :
                      'Leite'
                    }
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">
                    {activeTab === 'temperature' && 'Temperatura (°C)'}
                    {activeTab === 'cleaning' && 'Estado'}
                    {activeTab === 'goods_reception' && 'Quantidade'}
                    {activeTab === 'expiry' && 'Data de Validade'}
                  </Label>
                  {activeTab === 'expiry' ? (
                    <Input
                      data-testid="haccp-value-input"
                      type="date"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="bg-[#0f172a] border-[#334155] text-white"
                    />
                  ) : activeTab === 'cleaning' ? (
                    <Select value={formData.value} onValueChange={(value) => setFormData({ ...formData, value })}>
                      <SelectTrigger data-testid="haccp-value-select" className="bg-[#0f172a] border-[#334155] text-white">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Conforme">Conforme</SelectItem>
                        <SelectItem value="Não Conforme">Não Conforme</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      data-testid="haccp-value-input"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="bg-[#0f172a] border-[#334155] text-white"
                      placeholder={activeTab === 'temperature' ? '4' : '10 kg'}
                    />
                  )}
                </div>

                <div>
                  <Label className="text-white mb-2 block">Colaborador</Label>
                  <Input
                    data-testid="haccp-user-input"
                    required
                    value={formData.user_name}
                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                    className="bg-[#0f172a] border-[#334155] text-white"
                    placeholder="Nome do colaborador"
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Observações</Label>
                  <Textarea
                    data-testid="haccp-notes-input"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-[#0f172a] border-[#334155] text-white"
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div>
                  <Label className="text-white mb-2 block">Assinatura Digital</Label>
                  <div className="bg-[#0f172a] border border-[#334155] rounded-md p-2">
                    <SignatureCanvas
                      ref={signatureRef}
                      canvasProps={{
                        className: 'w-full h-32 bg-white rounded',
                        'data-testid': 'signature-canvas'
                      }}
                    />
                  </div>
                  <Button
                    data-testid="clear-signature-btn"
                    type="button"
                    onClick={() => signatureRef.current?.clear()}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                  >
                    Limpar Assinatura
                  </Button>
                </div>

                <Button
                  data-testid="submit-haccp-btn"
                  type="submit"
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white h-12"
                >
                  Guardar Registo
                </Button>
              </form>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-heading font-semibold text-white uppercase">Histórico - {getTypeLabel(activeTab)}</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {getRecordsByType(activeTab).length === 0 ? (
                  <Card className="bg-[#1e293b] border-[#334155] p-6 text-center">
                    <p className="text-[#64748b]">Nenhum registo ainda</p>
                  </Card>
                ) : (
                  getRecordsByType(activeTab).map((record, index) => (
                    <motion.div
                      key={record.record_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card data-testid="haccp-record-item" className="bg-[#1e293b] border-[#334155] p-4 hover:bg-[#334155] transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-white">{record.equipment_product}</p>
                            <p className="text-sm text-[#94a3b8]">{record.user_name}</p>
                          </div>
                          <p className="text-lg font-data font-bold text-[#3b82f6]">{record.value}</p>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-[#94a3b8] mb-2">{record.notes}</p>
                        )}
                        <p className="text-xs text-[#64748b]">
                          {new Date(record.created_at).toLocaleString('pt-PT')}
                        </p>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
};