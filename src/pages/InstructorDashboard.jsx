import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, Award, BookOpen, BarChart3, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import AIGradingAssistant from '../components/instructor/AIGradingAssistant';
import AnnouncementManager from '../components/instructor/AnnouncementManager';
import QASessionManager from '../components/instructor/QASessionManager';

export default function InstructorDashboard() {
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = createPageUrl('Dashboard');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['instructor-courses', user?.id],
    queryFn: () => base44.entities.Course.filter({ instructor_id: user.id }),
    enabled: !!user,
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.Lesson.list(),
    enabled: !!user,
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-progress'],
    queryFn: () => base44.entities.LessonProgress.list(),
    enabled: !!user,
  });

  const { data: allAssignments = [] } = useQuery({
    queryKey: ['all-assignments'],
    queryFn: () => base44.entities.Assignment.list(),
    enabled: !!user,
  });

  const { data: allSubmissions = [] } = useQuery({
    queryKey: ['all-submissions'],
    queryFn: () => base44.entities.UserAssignment.list(),
    enabled: !!user,
  });

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].id);
    }
  }, [courses, selectedCourse]);

  if (!user) return null;

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const courseLessons = allLessons.filter(l => l.course_id === selectedCourse);
  const courseAssignments = allAssignments.filter(a => 
    courseLessons.some(l => l.id === a.lesson_id)
  );
  const courseSubmissions = allSubmissions.filter(s =>
    courseAssignments.some(a => a.id === s.assignment_id)
  );

  // Calculate analytics
  const courseProgress = allProgress.filter(p => p.course_id === selectedCourse);
  const uniqueStudents = new Set(courseProgress.map(p => p.user_id)).size;
  const completedLessons = courseProgress.filter(p => p.completed).length;
  const averageCompletion = courseLessons.length > 0 
    ? Math.round((completedLessons / (courseLessons.length * Math.max(uniqueStudents, 1))) * 100)
    : 0;
  const averageScore = courseSubmissions.length > 0
    ? Math.round(courseSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / courseSubmissions.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Панель преподавателя</h1>
          <p className="text-slate-400">Управление курсами и аналитика</p>
        </div>

        {/* Course Selector */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <label className="text-white font-medium">Выберите курс:</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-64 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link to={createPageUrl(`CourseDetail?id=${selectedCourse}`)}>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  Просмотр курса
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {selectedCourseData && (
          <>
            {/* Analytics Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-gradient-to-br from-blue-900/20 to-slate-800/50 border-blue-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Студентов</p>
                        <p className="text-3xl font-bold text-white">{uniqueStudents}</p>
                      </div>
                      <Users className="w-12 h-12 text-blue-400 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-gradient-to-br from-green-900/20 to-slate-800/50 border-green-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Завершённость</p>
                        <p className="text-3xl font-bold text-white">{averageCompletion}%</p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-green-400 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-gradient-to-br from-amber-900/20 to-slate-800/50 border-amber-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Средний балл</p>
                        <p className="text-3xl font-bold text-white">{averageScore}</p>
                      </div>
                      <Award className="w-12 h-12 text-amber-400 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-gradient-to-br from-purple-900/20 to-slate-800/50 border-purple-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Уроков</p>
                        <p className="text-3xl font-bold text-white">{courseLessons.length}</p>
                      </div>
                      <BookOpen className="w-12 h-12 text-purple-400 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="analytics">Аналитика</TabsTrigger>
                <TabsTrigger value="grading">AI-Проверка</TabsTrigger>
                <TabsTrigger value="announcements">Объявления</TabsTrigger>
                <TabsTrigger value="qa">Q&A Сессии</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-6">
                {/* Student Progress Table */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BarChart3 className="w-5 h-5" />
                      Прогресс студентов
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.from(new Set(courseProgress.map(p => p.user_id))).map((userId, idx) => {
                        const studentProgress = courseProgress.filter(p => p.user_id === userId);
                        const completed = studentProgress.filter(p => p.completed).length;
                        const percentage = Math.round((completed / courseLessons.length) * 100);
                        const studentSubmissions = courseSubmissions.filter(s => s.user_id === userId);
                        const avgScore = studentSubmissions.length > 0
                          ? Math.round(studentSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / studentSubmissions.length)
                          : 0;

                        return (
                          <motion.div
                            key={userId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="text-white font-medium">Студент {userId.slice(0, 8)}</p>
                                  <p className="text-slate-400 text-sm">
                                    {completed} / {courseLessons.length} уроков
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={
                                  avgScore >= 80 ? 'bg-green-500/20 text-green-300' :
                                  avgScore >= 60 ? 'bg-amber-500/20 text-amber-300' :
                                  'bg-red-500/20 text-red-300'
                                }>
                                  Средний: {avgScore}
                                </Badge>
                                <span className="text-amber-400 font-medium">{percentage}%</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                      {uniqueStudents === 0 && (
                        <div className="text-center py-12 text-slate-400">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Пока нет студентов на этом курсе</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Assignments Overview */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <FileText className="w-5 h-5" />
                      Задания
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {courseAssignments.map((assignment, idx) => {
                        const submissions = courseSubmissions.filter(s => s.assignment_id === assignment.id);
                        const graded = submissions.filter(s => s.status === 'graded').length;
                        
                        return (
                          <motion.div
                            key={assignment.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-white font-medium">{assignment.title}</h4>
                                <p className="text-slate-400 text-sm">
                                  {submissions.length} работ • {graded} проверено
                                </p>
                              </div>
                              <Badge className="bg-blue-500/20 text-blue-300">
                                {assignment.type}
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="grading">
                {courseAssignments.length > 0 ? (
                  courseAssignments.map(assignment => {
                    const submissions = courseSubmissions.filter(s => s.assignment_id === assignment.id);
                    return (
                      <div key={assignment.id} className="mb-6">
                        <h3 className="text-white font-semibold mb-3">{assignment.title}</h3>
                        <AIGradingAssistant
                          assignment={assignment}
                          submissions={submissions}
                        />
                      </div>
                    );
                  })
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-12 text-center text-slate-400">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>В этом курсе пока нет заданий</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="announcements">
                <AnnouncementManager
                  courseId={selectedCourse}
                  instructorId={user.id}
                />
              </TabsContent>

              <TabsContent value="qa">
                <QASessionManager
                  courseId={selectedCourse}
                  instructorId={user.id}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {courses.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center text-slate-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>У вас пока нет курсов</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}