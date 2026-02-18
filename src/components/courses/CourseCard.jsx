import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, TrendingUp, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseCard({ course, isRecommended, userProgress, onClick }) {
  const progress = userProgress?.[course.id];
  const isCompleted = progress?.completed;
  const isInProgress = progress?.in_progress;
  const isLocked = course.access_type === 'paid' || course.access_type === 'organization';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all h-full cursor-pointer" onClick={onClick}>
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <CardTitle className="text-xl text-white mb-2 flex items-center gap-2">
                {course.title}
                {isRecommended && (
                  <Sparkles className="w-4 h-4 text-purple-400" />
                )}
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge className={`${
                  isCompleted ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                  isInProgress ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-slate-700 text-slate-300'
                } border`}>
                  {isCompleted ? '✓ Завершён' : isInProgress ? 'В процессе' : course.difficulty}
                </Badge>
                {isLocked && (
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    <Lock className="w-3 h-3 mr-1" />
                    {course.access_type === 'paid' ? 'Платный' : 'Организация'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
            {course.duration_hours && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration_hours}ч</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>Уроки</span>
            </div>
          </div>

          {isInProgress && progress.percentage && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-400">Прогресс</span>
                <span className="text-amber-400 font-medium">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {isRecommended && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-purple-300 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Рекомендовано на основе вашего факультета</span>
              </div>
            </div>
          )}

          <Button 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            {isCompleted ? 'Повторить' : isInProgress ? 'Продолжить' : 'Начать курс'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}