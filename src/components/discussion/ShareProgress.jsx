import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Trophy, CheckCircle2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShareProgress({ achievement, onClose }) {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const shareMutation = useMutation({
    mutationFn: () => base44.entities.Achievement.update(achievement.id, { is_shared: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['achievements']);
    },
  });

  const handleShare = () => {
    shareMutation.mutate();
  };

  const handleCopyLink = () => {
    const shareText = `🎓 Я завершил курс "${achievement.title}" в Александрийской библиотеке! ${achievement.score ? `Оценка: ${achievement.score}/100` : ''}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <Card
        className="bg-slate-800 border-slate-700 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Share2 className="w-5 h-5" />
            Поделиться достижением
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-br from-amber-900/20 to-slate-700/50 p-6 rounded-lg border border-amber-500/30 text-center">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{achievement.title}</h3>
            <p className="text-slate-300 mb-3">{achievement.description}</p>
            {achievement.score && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-lg px-4 py-1">
                {achievement.score}/100
              </Badge>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Скопировано!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать
                </>
              )}
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
              disabled={shareMutation.isPending || achievement.is_shared}
            >
              {achievement.is_shared ? 'Опубликовано' : 'Опубликовать'}
            </Button>
          </div>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-slate-400"
          >
            Закрыть
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}