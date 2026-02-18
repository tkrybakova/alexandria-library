import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Award, TrendingUp, Clock, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: lessonProgress = [] } = useQuery({
    queryKey: ['lesson-progress', user?.id],
    queryFn: () => base44.entities.LessonProgress.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const { data: userAssignments = [] } = useQuery({
    queryKey: ['user-assignments', user?.id],
    queryFn: () => base44.entities.UserAssignment.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['user-courses'],
    queryFn: () => base44.entities.Course.list(),
    enabled: !!user,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.Lesson.list(),
    enabled: !!user,
  });

  // Calculate statistics
  const stats = {
    completedLessons: lessonProgress.filter(p => p.completed).length,
    totalTimeSpent: lessonProgress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0),
    averageScore: userAssignments.length > 0 
      ? Math.round(userAssignments.reduce((sum, a) => sum + (a.score || 0), 0) / userAssignments.length)
      : 0,
    coursesInProgress: new Set(lessonProgress.map(p => p.course_id)).size
  };

  // Get courses with progress
  const coursesWithProgress = courses.map(course => {
    const courseLessons = lessons.filter(l => l.course_id === course.id);
    const completedCourseLessons = lessonProgress.filter(
      p => p.course_id === course.id && p.completed
    );
    const percentage = courseLessons.length > 0 
      ? Math.round((completedCourseLessons.length / courseLessons.length) * 100)
      : 0;
    
    return {
      ...course,
      totalLessons: courseLessons.length,
      completedLessons: completedCourseLessons.length,
      percentage,
      inProgress: percentage > 0 && percentage < 100
    };
  }).filter(c => c.inProgress || c.percentage === 100)
    .sort((a, b) => b.percentage - a.percentage);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Добро пожаловать, {user.full_name}!
          </h1>
          <p className="text-slate-400">Ваш путь обучения в Александрийской библиотеке</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="bg-gradient-to-br from-blue-900/20 to-slate-800/50 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Уроков пройдено</p>
                    <p className="text-3xl font-bold text-white">{stats.completedLessons}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-green-900/20 to-slate-800/50 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Средний балл</p>
                    <p className="text-3xl font-bold text-white">{stats.averageScore}</p>
                  </div>
                  <Award className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-purple-900/20 to-slate-800/50 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Курсов активно</p>
                    <p className="text-3xl font-bold text-white">{stats.coursesInProgress}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-amber-900/20 to-slate-800/50 border-amber-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Время обучения</p>
                    <p className="text-3xl font-bold text-white">{Math.round(stats.totalTimeSpent / 60)}ч</p>
                  </div>
                  <Clock className="w-12 h-12 text-amber-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Courses in Progress */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5" />
              Мои курсы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursesWithProgress.length > 0 ? (
              coursesWithProgress.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{course.title}</h3>
                          <p className="text-slate-400 text-sm line-clamp-1">{course.description}</p>
                        </div>
                        <Badge className={
                          course.percentage === 100 
                            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }>
                          {course.percentage === 100 ? 'Завершён' : 'В процессе'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">
                          {course.completedLessons} / {course.totalLessons} уроков
                        </span>
                        <span className="text-amber-400 font-medium">{course.percentage}%</span>
                      </div>
                      
                      <Progress value={course.percentage} className="h-2" />
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Вы ещё не начали ни одного курса</p>
                <Link to={createPageUrl('Courses')}>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-600">
                    Выбрать курс
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {userAssignments.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Последние результаты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userAssignments.slice(0, 5).map((assignment, index) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="text-white text-sm">Задание выполнено</p>
                        <p className="text-slate-400 text-xs">
                          {new Date(assignment.submitted_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      assignment.score >= 80 
                        ? 'bg-green-500/20 text-green-300' 
                        : assignment.score >= 60 
                        ? 'bg-amber-500/20 text-amber-300' 
                        : 'bg-red-500/20 text-red-300'
                    }>
                      {assignment.score} баллов
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}