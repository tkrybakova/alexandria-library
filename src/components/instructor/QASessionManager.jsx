import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Video, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QASessionManager({ courseId, instructorId }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    duration_minutes: 60,
    meeting_link: ''
  });
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['qa-sessions', courseId],
    queryFn: () => base44.entities.QASession.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.QASession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['qa-sessions']);
      setFormData({
        title: '',
        description: '',
        scheduled_date: '',
        duration_minutes: 60,
        meeting_link: ''
      });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.QASession.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['qa-sessions']);
    },
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.scheduled_date) return;
    
    createMutation.mutate({
      course_id: courseId,
      instructor_id: instructorId,
      ...formData
    });
  };

  const statusColors = {
    scheduled: 'bg-blue-500/20 text-blue-300',
    live: 'bg-green-500/20 text-green-300',
    completed: 'bg-slate-500/20 text-slate-300',
    cancelled: 'bg-red-500/20 text-red-300'
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Video className="w-5 h-5" />
            Q&A Сессии
          </CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            Создать
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600"
            >
              <Input
                placeholder="Название сессии"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-600 border-slate-500 text-white"
              />
              <Textarea
                placeholder="Описание (что будет обсуждаться)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-600 border-slate-500 text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="bg-slate-600 border-slate-500 text-white"
                />
                <Input
                  type="number"
                  placeholder="Длительность (мин)"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  className="bg-slate-600 border-slate-500 text-white"
                />
              </div>
              <Input
                placeholder="Ссылка на встречу (Zoom, Google Meet и т.д.)"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                className="bg-slate-600 border-slate-500 text-white"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  Запланировать
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  Отмена
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {sessions.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date)).map((session, idx) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-white font-semibold">{session.title}</h4>
                    <Badge className={statusColors[session.status]}>
                      {session.status}
                    </Badge>
                  </div>
                  {session.description && (
                    <p className="text-slate-300 text-sm mb-2">{session.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-slate-400 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(session.scheduled_date).toLocaleDateString('ru-RU')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(session.scheduled_date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{session.duration_minutes} мин</span>
                  </div>
                  {session.meeting_link && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 text-sm mt-2 inline-block"
                    >
                      Ссылка на встречу →
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(session.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Нет запланированных сессий</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}