import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, Reply, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommentItem({ comment, allComments, user, courseId, lessonId }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(false);
  const queryClient = useQueryClient();

  const replies = allComments.filter(c => c.parent_id === comment.id);

  const createReplyMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      setReplyText('');
      setShowReply(false);
    },
  });

  const updateLikesMutation = useMutation({
    mutationFn: (newLikes) => base44.entities.Comment.update(comment.id, { likes: newLikes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
    },
  });

  const handleReply = () => {
    if (!replyText.trim()) return;
    
    createReplyMutation.mutate({
      user_id: user.id,
      author_name: user.full_name,
      content: replyText,
      parent_id: comment.id,
      ...(lessonId ? { lesson_id: lessonId } : {}),
      ...(courseId ? { course_id: courseId } : {}),
      is_instructor: user.role === 'admin'
    });
  };

  const handleLike = () => {
    if (!liked) {
      updateLikesMutation.mutate((comment.likes || 0) + 1);
      setLiked(true);
    } else {
      updateLikesMutation.mutate(Math.max(0, (comment.likes || 0) - 1));
      setLiked(false);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'только что';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
    return `${Math.floor(seconds / 86400)} дн назад`;
  };

  return (
    <div className="space-y-3">
      <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
              {comment.author_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{comment.author_name}</p>
              <p className="text-slate-400 text-xs">{timeAgo(comment.created_date)}</p>
            </div>
          </div>
          {comment.is_instructor && (
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Преподаватель
            </Badge>
          )}
        </div>

        <p className="text-slate-300 mb-3 whitespace-pre-wrap">{comment.content}</p>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`text-slate-400 hover:text-red-400 ${liked ? 'text-red-400' : ''}`}
          >
            <Heart className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
            {comment.likes || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReply(!showReply)}
            className="text-slate-400 hover:text-white"
          >
            <Reply className="w-4 h-4 mr-1" />
            Ответить
          </Button>
        </div>

        <AnimatePresence>
          {showReply && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Напишите ответ..."
                className="bg-slate-600 border-slate-500 text-white"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReply(false)}
                  className="text-slate-400"
                >
                  Отмена
                </Button>
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyText.trim() || createReplyMutation.isPending}
                  className="bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Ответить
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-8 space-y-3">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              allComments={allComments}
              user={user}
              courseId={courseId}
              lessonId={lessonId}
            />
          ))}
        </div>
      )}
    </div>
  );
}