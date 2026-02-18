import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementManager({ courseId, instructorId }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal'
  });
  const queryClient = useQueryClient();

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', courseId],
    queryFn: () => base44.entities.Announcement.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Announcement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
      setFormData({ title: '', content: '', priority: 'normal' });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Announcement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['announcements']);
    },
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    
    createMutation.mutate({
      course_id: courseId,
      instructor_id: instructorId,
      ...formData
    });
  };

  const priorityColors = {
    low: 'bg-slate-500/20 text-slate-300',
    normal: 'bg-blue-500/20 text-blue-300',
    high: 'bg-red-500/20 text-red-300'
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Megaphone className="w-5 h-5" />
            Объявления
          </CardTitle>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-600"
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
                placeholder="Заголовок объявления"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-600 border-slate-500 text-white"
              />
              <Textarea
                placeholder="Содержание объявления"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-slate-600 border-slate-500 text-white min-h-[100px]"
              />
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий приоритет</SelectItem>
                  <SelectItem value="normal">Обычный</SelectItem>
                  <SelectItem value="high">Высокий приоритет</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  Опубликовать
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
          {announcements.map((announcement, idx) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold">{announcement.title}</h4>
                    <Badge className={priorityColors[announcement.priority]}>
                      {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    {new Date(announcement.created_date).toLocaleString('ru-RU')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(announcement.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
          {announcements.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Пока нет объявлений</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}