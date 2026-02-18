import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';
import CommentItem from './CommentItem';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommentSection({ courseId, lessonId, user }) {
  const [newComment, setNewComment] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', courseId, lessonId],
    queryFn: () => {
      const filter = {};
      if (lessonId) filter.lesson_id = lessonId;
      else if (courseId) filter.course_id = courseId;
      return base44.entities.Comment.filter(filter);
    },
    enabled: !!(courseId || lessonId),
  });

  const createCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      setNewComment('');
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    createCommentMutation.mutate({
      user_id: user.id,
      author_name: user.full_name,
      content: newComment,
      ...(lessonId ? { lesson_id: lessonId } : {}),
      ...(courseId ? { course_id: courseId } : {}),
      is_instructor: user.role === 'admin'
    });
  };

  const topLevelComments = comments.filter(c => !c.parent_id);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5" />
          Обсуждение ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment Form */}
        <div className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Задайте вопрос или поделитесь мыслями..."
            className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-orange-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Отправить
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4 mt-6">
          <AnimatePresence>
            {topLevelComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <CommentItem
                  comment={comment}
                  allComments={comments}
                  user={user}
                  courseId={courseId}
                  lessonId={lessonId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {topLevelComments.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Будьте первым, кто начнёт обсуждение!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}