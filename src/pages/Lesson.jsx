import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, ArrowRight, FileText, Trophy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CommentSection from '../components/discussion/CommentSection';
import ShareProgress from '../components/discussion/ShareProgress';

export default function Lesson() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [startTime] = useState(Date.now());
  const progressInterval = useRef(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [achievement, setAchievement] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const urlParams = new URLSearchParams(window.location.search);
        setLessonId(urlParams.get('id'));
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId,
  });

  const { data: course } = useQuery({
    queryKey: ['lesson-course', lesson?.course_id],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: lesson.course_id });
      return courses[0];
    },
    enabled: !!lesson,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['lesson-assignments', lessonId],
    queryFn: () => base44.entities.Assignment.filter({ lesson_id: lessonId }),
    enabled: !!lessonId,
  });

  const { data: progress } = useQuery({
    queryKey: ['lesson-progress', user?.id, lessonId],
    queryFn: async () => {
      const progressList = await base44.entities.LessonProgress.filter({
        user_id: user.id,
        lesson_id: lessonId
      });
      return progressList[0];
    },
    enabled: !!user && !!lessonId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ completed }) => {
      const timeSpent = Math.round((Date.now() - startTime) / 60000);
      
      if (progress) {
        return base44.entities.LessonProgress.update(progress.id, {
          completed,
          time_spent_minutes: (progress.time_spent_minutes || 0) + timeSpent,
          last_accessed: new Date().toISOString(),
          ...(completed && !progress.completed ? { completion_date: new Date().toISOString() } : {})
        });
      } else {
        return base44.entities.LessonProgress.create({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          completed,
          time_spent_minutes: timeSpent,
          last_accessed: new Date().toISOString(),
          ...(completed ? { completion_date: new Date().toISOString() } : {})
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lesson-progress']);
      queryClient.invalidateQueries(['course-lessons']);
    },
  });

  // Update last_accessed periodically
  useEffect(() => {
    if (user && lessonId && lesson) {
      progressInterval.current = setInterval(() => {
        updateProgressMutation.mutate({ completed: progress?.completed || false });
      }, 60000); // Every minute
    }
  }, [user, lessonId, lesson, progress]);

  const handleComplete = async () => {
    updateProgressMutation.mutate({ completed: true });
    
    // Create achievement
    try {
      const newAchievement = await base44.entities.Achievement.create({
        user_id: user.id,
        type: 'lesson_completed',
        title: `Урок завершён: ${lesson.title}`,
        description: `Вы успешно завершили урок "${lesson.title}" из курса "${course?.title}"`,
        course_id: lesson.course_id,
        icon: 'book'
      });
      setAchievement(newAchievement);
      setShowShareDialog(true);
    } catch (error) {
      console.error('Error creating achievement:', error);
    }
  };

  const handleNextLesson = async () => {
    if (!lesson || !course) return;
    
    const allLessons = await base44.entities.Lesson.filter({ course_id: course.id });
    const sortedLessons = allLessons.sort((a, b) => a.order - b.order);
    const currentIndex = sortedLessons.findIndex(l => l.id === lesson.id);
    
    if (currentIndex < sortedLessons.length - 1) {
      const nextLesson = sortedLessons[currentIndex + 1];
      navigate(createPageUrl(`Lesson?id=${nextLesson.id}`));
    } else {
      navigate(createPageUrl(`CourseDetail?id=${course.id}`));
    }
  };

  if (!user || !lesson) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(createPageUrl(`CourseDetail?id=${lesson.course_id}`))}
          variant="ghost"
          className="mb-6 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          К курсу
        </Button>

        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-400 text-sm mb-2">{course?.title}</p>
                <CardTitle className="text-2xl text-white mb-3">{lesson.title}</CardTitle>
                {progress?.completed && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Урок завершён
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {lesson.video_url && (
              <div className="mb-6">
                <video
                  src={lesson.video_url}
                  controls
                  className="w-full rounded-lg"
                />
              </div>
            )}

            <div className="prose prose-invert prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold text-white mb-3 mt-6">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-bold text-white mb-2 mt-4">{children}</h3>,
                  p: ({ children }) => <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside text-slate-300 mb-4 space-y-2">{children}</ol>,
                  code: ({ inline, children }) => inline 
                    ? <code className="bg-slate-700 text-amber-300 px-2 py-1 rounded text-sm">{children}</code>
                    : <code className="block bg-slate-900 text-slate-300 p-4 rounded-lg mb-4 overflow-x-auto">{children}</code>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-amber-500 pl-4 italic text-slate-400 mb-4">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {lesson.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Assignments */}
        {assignments.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Задания к уроку</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignments.map(assignment => (
                <Link
                  key={assignment.id}
                  to={createPageUrl(`Assignment?id=${assignment.id}`)}
                >
                  <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:border-slate-500 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-white font-medium">{assignment.title}</p>
                          <p className="text-slate-400 text-sm">
                            {assignment.type === 'essay' ? 'Эссе' :
                             assignment.type === 'audio' ? 'Аудио-ответ' : 'Тест'}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600">
                        Выполнить
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!progress?.completed && (
            <Button
              onClick={handleComplete}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              disabled={updateProgressMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Отметить как завершённый
            </Button>
          )}
          <Button
            onClick={handleNextLesson}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
          >
            Следующий урок
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Discussion Section */}
        <div className="mt-6">
          <CommentSection lessonId={lessonId} courseId={lesson.course_id} user={user} />
        </div>
      </div>

      {/* Share Achievement Dialog */}
      {showShareDialog && achievement && (
        <ShareProgress
          achievement={achievement}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
}