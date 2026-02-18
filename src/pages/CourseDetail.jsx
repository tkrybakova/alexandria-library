import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Lock, Clock, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import CommentSection from '../components/discussion/CommentSection';

export default function CourseDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [courseId, setCourseId] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const urlParams = new URLSearchParams(window.location.search);
        setCourseId(urlParams.get('id'));
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }),
    enabled: !!courseId,
  });

  const { data: lessonProgress = [] } = useQuery({
    queryKey: ['lesson-progress', user?.id, courseId],
    queryFn: () => base44.entities.LessonProgress.filter({ 
      user_id: user.id,
      course_id: courseId 
    }),
    enabled: !!user && !!courseId,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['course-assignments', courseId],
    queryFn: async () => {
      const allAssignments = [];
      for (const lesson of lessons) {
        const lessonAssignments = await base44.entities.Assignment.filter({ lesson_id: lesson.id });
        allAssignments.push(...lessonAssignments);
      }
      return allAssignments;
    },
    enabled: lessons.length > 0,
  });

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  const courseProgress = {
    completed: lessonProgress.filter(p => p.completed).length,
    total: lessons.length,
    percentage: lessons.length > 0 
      ? Math.round((lessonProgress.filter(p => p.completed).length / lessons.length) * 100)
      : 0
  };

  const isLessonAccessible = (lesson) => {
    // First lesson is always accessible
    if (lesson.order === 1) return true;
    
    // Check if previous lesson is completed
    const previousLesson = lessons.find(l => l.order === lesson.order - 1);
    if (!previousLesson) return true;
    
    const previousProgress = lessonProgress.find(p => p.lesson_id === previousLesson.id);
    return previousProgress?.completed || false;
  };

  const getLessonProgress = (lessonId) => {
    return lessonProgress.find(p => p.lesson_id === lessonId);
  };

  if (!user || !course) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Button
          onClick={() => navigate(createPageUrl('Courses'))}
          variant="ghost"
          className="mb-6 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          К курсам
        </Button>

        {/* Course Header */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <p className="text-slate-300 mb-4">{course.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-slate-700 text-slate-300">
                    {course.difficulty}
                  </Badge>
                  {course.duration_hours && (
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {course.duration_hours}ч
                    </Badge>
                  )}
                  <Badge className={
                    courseProgress.percentage === 100 
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }>
                    {courseProgress.completed} / {courseProgress.total} уроков
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Прогресс курса</span>
                <span className="text-amber-400 font-medium">{courseProgress.percentage}%</span>
              </div>
              <Progress value={courseProgress.percentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Уроки курса</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedLessons.map((lesson, index) => {
              const progress = getLessonProgress(lesson.id);
              const isCompleted = progress?.completed;
              const isAccessible = isLessonAccessible(lesson);
              const lessonAssignments = assignments.filter(a => a.lesson_id === lesson.id);

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={isAccessible ? createPageUrl(`Lesson?id=${lesson.id}`) : '#'}
                    className={!isAccessible ? 'pointer-events-none' : ''}
                  >
                    <div className={`p-4 rounded-lg border transition-all ${
                      isAccessible
                        ? 'bg-slate-700/30 border-slate-600 hover:border-slate-500 cursor-pointer'
                        : 'bg-slate-700/10 border-slate-700 opacity-50'
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          ) : isAccessible ? (
                            <Circle className="w-6 h-6 text-slate-400" />
                          ) : (
                            <Lock className="w-6 h-6 text-slate-500" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-white font-medium mb-1">
                                {lesson.order}. {lesson.title}
                              </h3>
                              {lesson.duration_minutes && (
                                <p className="text-slate-400 text-sm flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration_minutes} мин
                                </p>
                              )}
                            </div>
                            {isAccessible && (
                              <Button
                                size="sm"
                                className={isCompleted 
                                  ? 'bg-slate-600 hover:bg-slate-500'
                                  : 'bg-gradient-to-r from-amber-500 to-orange-600'
                                }
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(createPageUrl(`Lesson?id=${lesson.id}`));
                                }}
                              >
                                {isCompleted ? 'Повторить' : 'Начать'}
                                <Play className="w-4 h-4 ml-2" />
                              </Button>
                            )}
                          </div>

                          {lessonAssignments.length > 0 && (
                            <div className="flex gap-2 flex-wrap mt-2">
                              {lessonAssignments.map(assignment => (
                                <Badge
                                  key={assignment.id}
                                  variant="outline"
                                  className="border-slate-600 text-slate-400 text-xs"
                                >
                                  {assignment.type === 'essay' ? '📝 Эссе' :
                                   assignment.type === 'audio' ? '🎤 Аудио' : '✅ Тест'}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {lessons.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>В этом курсе пока нет уроков</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discussion Section */}
        <CommentSection courseId={courseId} user={user} />
      </div>
    </div>
  );
}