import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageCircle, AlertCircle, Users, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Access Control: проверка доступа к факультетскому чату
const checkFacultyAccess = (user) => {
  // Edge case 1: Пользователь не аутентифицирован
  if (!user) {
    return { allowed: false, reason: 'not_authenticated' };
  }
  
  // Edge case 2: Пользователь не прошёл психотест
  if (!user.psycho_test_completed) {
    return { allowed: false, reason: 'test_not_completed' };
  }
  
  // Edge case 3: Пользователь отказался от факультета (faculty_id === null или undefined)
  if (!user.faculty_id) {
    return { allowed: false, reason: 'no_faculty' };
  }
  
  // Успешная проверка
  return { allowed: true, facultyId: user.faculty_id };
};

export default function FacultyChat() {
  const [user, setUser] = useState(null);
  const [accessStatus, setAccessStatus] = useState(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Проверка доступа (dependency check)
        const access = checkFacultyAccess(currentUser);
        setAccessStatus(access);
      } catch (error) {
        // Edge case: ошибка загрузки пользователя
        setAccessStatus({ allowed: false, reason: 'auth_error' });
      }
    };
    loadUser();
  }, []);

  const { data: faculty } = useQuery({
    queryKey: ['faculty', accessStatus?.facultyId],
    queryFn: async () => {
      const faculties = await base44.entities.Faculty.filter({ id: accessStatus.facultyId });
      return faculties[0];
    },
    enabled: accessStatus?.allowed && !!accessStatus.facultyId,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['faculty-chat', accessStatus?.facultyId],
    queryFn: () => base44.entities.FacultyChat.filter({ faculty_id: accessStatus.facultyId }, '-created_date'),
    enabled: accessStatus?.allowed && !!accessStatus.facultyId,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.FacultyChat.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['faculty-chat']);
      setMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    },
    onError: () => {
      toast.error('Ошибка отправки сообщения');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      faculty_id: accessStatus.facultyId,
      user_id: user.id,
      author_name: user.full_name,
      message: message.trim()
    });
  };

  // 403 Forbidden: Отображение ошибок доступа
  if (!accessStatus || !accessStatus.allowed) {
    const errorMessages = {
      not_authenticated: {
        title: 'Требуется авторизация',
        description: 'Войдите в систему для доступа к чату факультета',
        icon: AlertCircle,
        action: () => base44.auth.redirectToLogin()
      },
      test_not_completed: {
        title: 'Пройдите психотест',
        description: 'Для доступа к факультетскому чату необходимо пройти психометрический тест',
        icon: AlertCircle,
        action: null
      },
      no_faculty: {
        title: 'Доступ запрещён (403)',
        description: 'Вы отказались от выбора факультета. Чат доступен только участникам факультетов.',
        icon: AlertCircle,
        action: null
      },
      auth_error: {
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить данные пользователя',
        icon: AlertCircle,
        action: null
      }
    };

    const error = errorMessages[accessStatus?.reason] || errorMessages.auth_error;
    const Icon = error.icon;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-red-500/30 max-w-md">
          <CardContent className="p-12 text-center">
            <Icon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">{error.title}</h2>
            <p className="text-slate-300 mb-6">{error.description}</p>
            {error.action && (
              <Button
                onClick={error.action}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                Войти
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Успешный доступ: отображение чата
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${faculty?.color || 'from-slate-500 to-slate-600'} flex items-center justify-center`}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl">{faculty?.name || 'Загрузка...'}</p>
                <p className="text-sm text-slate-400">Чат факультета</p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto mb-4 space-y-3 pr-2">
              {messagesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24 bg-slate-700" />
                        <Skeleton className="h-16 w-64 bg-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <MessageCircle className="w-16 h-16 text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-300 mb-2">Пока нет сообщений</h3>
                  <p className="text-slate-500 text-sm max-w-sm">
                    Будьте первым, кто начнёт обсуждение в чате факультета!
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                const isOwnMessage = msg.user_id === user.id;
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2">
                        {!isOwnMessage && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                            {msg.author_name?.[0]}
                          </div>
                        )}
                        <span className="text-xs text-slate-400">{msg.author_name}</span>
                      </div>
                      <div className={`px-4 py-2 rounded-lg ${
                        isOwnMessage 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' 
                          : 'bg-slate-700 text-slate-200'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.created_date).toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
                  {sendMessageMutation.isPending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-end"
                    >
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span className="text-sm text-slate-400">Отправка...</span>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Напишите сообщение... (Enter для отправки)"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              💡 Нажмите Enter для отправки сообщения
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}