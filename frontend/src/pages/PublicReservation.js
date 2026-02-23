import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Calendar, Clock, Users, Phone, Mail, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LanguageSelector } from '../components/LanguageSelector';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const PublicReservation = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    guests: 2,
    date: '',
    time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reservation, setReservation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/reservations`, formData);
      setReservation(response.data);
      setConfirmed(true);
      toast.success(t('toast.reservationSuccess'));
    } catch (error) {
      toast.error(error.response?.data?.detail || t('toast.reservationError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full bg-[#1e293b] border border-[#334155] rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-heading font-bold text-white mb-4">{t('reservation.confirmed').toUpperCase()}</h2>
          <div className="bg-[#0f172a] p-6 rounded-lg mb-6 text-left">
            <p className="text-[#94a3b8] mb-2"><strong className="text-white">{t('reservation.name')}:</strong> {reservation?.name}</p>
            <p className="text-[#94a3b8] mb-2"><strong className="text-white">{t('reservation.date')}:</strong> {reservation?.date}</p>
            <p className="text-[#94a3b8] mb-2"><strong className="text-white">{t('reservation.time')}:</strong> {reservation?.time}</p>
            <p className="text-[#94a3b8] mb-2"><strong className="text-white">{t('reservation.guests')}:</strong> {reservation?.guests}</p>
            {reservation?.table_id && (
              <p className="text-[#94a3b8]"><strong className="text-white">{t('reservation.table')}:</strong> {reservation.table_id}</p>
            )}
          </div>
          <p className="text-[#94a3b8] mb-6">{t('reservation.thankYou')}</p>
          <Button
            data-testid="new-reservation-btn"
            onClick={() => { setConfirmed(false); setFormData({ name: '', phone: '', email: '', guests: 2, date: '', time: '', notes: '' }); }}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white h-12"
          >
            {t('reservation.newReservation')}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>
      
      <div className="relative h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1770736929333-4fb8cd5a1657?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHw0fHxtb29keSUyMG1vZGVybiUyMHJlc3RhdXJhbnQlMjBpbnRlcmlvciUyMGRpbmluZyUyMGRhcmslMjBsaWdodGluZ3xlbnwwfHx8fDE3NzE4MDgyNTB8MA&ixlib=rb-4.1.0&q=85"
          alt="Restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a]"></div>
        <div className="absolute bottom-6 left-4 right-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white uppercase tracking-tight">{t('reservation.title')}</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-4 md:p-8 -mt-8"
      >
        <form onSubmit={handleSubmit} className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-[#f8fafc] mb-2 block">{t('reservation.name')} *</Label>
              <Input
                id="name"
                data-testid="reservation-name-input"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-12 bg-[#0f172a] border-[#334155] text-white"
                placeholder={t('reservation.name')}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-[#f8fafc] mb-2 block">{t('reservation.phone')} *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-[#64748b]" />
                <Input
                  id="phone"
                  data-testid="reservation-phone-input"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="h-12 pl-10 bg-[#0f172a] border-[#334155] text-white"
                  placeholder="+351 912 345 678"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-[#f8fafc] mb-2 block">{t('reservation.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#64748b]" />
                <Input
                  id="email"
                  data-testid="reservation-email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="h-12 pl-10 bg-[#0f172a] border-[#334155] text-white"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guests" className="text-[#f8fafc] mb-2 block">{t('reservation.guests')} *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 h-5 w-5 text-[#64748b]" />
                  <Input
                    id="guests"
                    data-testid="reservation-guests-input"
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={formData.guests}
                    onChange={(e) => handleChange('guests', parseInt(e.target.value))}
                    className="h-12 pl-10 bg-[#0f172a] border-[#334155] text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="date" className="text-[#f8fafc] mb-2 block">{t('reservation.date')} *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-[#64748b]" />
                  <Input
                    id="date"
                    data-testid="reservation-date-input"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="h-12 pl-10 bg-[#0f172a] border-[#334155] text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="time" className="text-[#f8fafc] mb-2 block">{t('reservation.time')} *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 h-5 w-5 text-[#64748b]" />
                <Input
                  id="time"
                  data-testid="reservation-time-input"
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="h-12 pl-10 bg-[#0f172a] border-[#334155] text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-[#f8fafc] mb-2 block">{t('reservation.notes')}</Label>
              <Textarea
                id="notes"
                data-testid="reservation-notes-input"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="min-h-20 bg-[#0f172a] border-[#334155] text-white"
                placeholder={t('reservation.notesPlaceholder')}
              />
            </div>
          </div>

          <Button
            data-testid="submit-reservation-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white h-12 text-lg font-medium shadow-[0_4px_14px_0_rgba(59,130,246,0.39)]"
          >
            {loading ? t('common.loading') : t('reservation.submit')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};