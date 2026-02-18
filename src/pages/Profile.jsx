import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, GraduationCap, LogOut, CheckCircle2, XCircle, Edit2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Защита маршрута: автоматическая проверка JWT токена
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // При просроченном токене или отсутствии авторизации - редирект на логин
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    loadUser();
  }, []);

  const { data: faculty } = useQuery({
    queryKey: ['user-faculty', user?.faculty_id],
    queryFn: async () => {
      if (!user?.faculty_id) return null;
      const faculties = await base44.entities.Faculty.filter({ id: user.faculty_id });
      return faculties[0];
    },
    enabled: !!user?.faculty_id,
  });

  const handleLogout = () => {
    // Logout функция: очистка токена и редирект
    base44.auth.logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="w-16 h-16 rounded-full bg-slate-700" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48 bg-slate-700" />
                  <Skeleton className="h-4 w-32 bg-slate-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 bg-slate-700/30 rounded-lg">
                  <Skeleton className="h-6 w-full bg-slate-700" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const participationStatus = user.psycho_test_completed
    ? user.faculty_id
      ? 'active'
      : 'declined'
    : 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl font-bold">
                  {user.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl">{user.full_name}</h1>
                  <p className="text-slate-400 text-sm">Профиль пользователя</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <Mail className="w-6 h-6 text-blue-400" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
              </div>

              {/* Роль */}
              <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <Shield className="w-6 h-6 text-purple-400" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Роль</p>
                  <Badge className={
                    user.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }>
                    {user.role === 'admin' ? 'Администратор / Преподаватель' : 'Студент'}
                  </Badge>
                </div>
              </div>

              {/* Факультет */}
              <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <GraduationCap className="w-6 h-6 text-amber-400" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Факультет</p>
                  {faculty ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${faculty.color} flex items-center justify-center text-white text-xs`}>
                        {faculty.icon}
                      </div>
                      <p className="text-white font-medium">{faculty.name}</p>
                    </div>
                  ) : user.faculty_id ? (
                    <p className="text-slate-300">Загрузка...</p>
                  ) : (
                    <p className="text-slate-500">Не выбран</p>
                  )}
                </div>
              </div>

              {/* Статус участия */}
              <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                {participationStatus === 'active' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-slate-400" />
                )}
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Статус участия</p>
                  <Badge className={
                    participationStatus === 'active'
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : participationStatus === 'declined'
                      ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }>
                    {participationStatus === 'active' && 'Активный участник'}
                    {participationStatus === 'declined' && 'Отказался от факультета'}
                    {participationStatus === 'pending' && 'Ожидает прохождения теста'}
                  </Badge>
                </div>
              </div>

              {/* Психотест */}
              <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <User className="w-6 h-6 text-cyan-400" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Психометрический тест</p>
                  <Badge className={
                    user.psycho_test_completed
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }>
                    {user.psycho_test_completed ? 'Пройден' : 'Не пройден'}
                  </Badge>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти из аккаунта
              </Button>
            </CardContent>
          </Card>

          {/* Системная информация */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Информация о системе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-400">
              <p>• JWT токен управляется автоматически платформой Base44</p>
              <p>• При просроченном токене происходит автоматический редирект на страницу входа</p>
              <p>• Защищённые маршруты проверяют авторизацию через base44.auth.me()</p>
              <p>• Logout очищает сессию и перезагружает приложение</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}