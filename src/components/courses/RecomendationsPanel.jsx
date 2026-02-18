import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecommendationsPanel({ recommendations, onCourseClick }) {
  if (!recommendations?.length) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-slate-800/50 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Персональные рекомендации
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.course.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onCourseClick(rec.course)}
            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-medium">{rec.course.title}</h4>
              <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                {rec.score}% совпадение
              </Badge>
            </div>
            <p className="text-slate-400 text-sm mb-3 line-clamp-2">
              {rec.course.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {rec.reasons.map((reason, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-purple-300">
                  {reason.type === 'faculty' && <Target className="w-3 h-3" />}
                  {reason.type === 'difficulty' && <TrendingUp className="w-3 h-3" />}
                  <span>{reason.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}