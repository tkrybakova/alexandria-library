import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Mic, CheckCircle } from 'lucide-react';
import EssaySubmission from '../components/assignments/EssaySubmission';
import AudioSubmission from '../components/assignments/AudioSubmission';
import { motion } from 'framer-motion';

export default function Assignment() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Get assignment ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const assignmentId = urlParams.get('id');
        
        if (assignmentId) {
          const assignments = await base44.entities.Assignment.filter({ id: assignmentId });
          if (assignments[0]) {
            setAssignment(assignments[0]);
          }
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (submission) => {
    try {
      await base44.entities.UserAssignment.create({
        user_id: user.id,
        assignment_id: assignment.id,
        submission,
        score: submission.score,
        ai_feedback: JSON.stringify(submission.ai_feedback),
        status: 'graded',
        submitted_at: new Date().toISOString()
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  if (!user || !assignment) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 text-center">
              <CardContent className="py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Задание отправлено!
                </h2>
                <p className="text-slate-300 mb-6">
                  Ваш ответ успешно сохранён и оценён AI
                </p>
                <Button
                  onClick={() => navigate(-1)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600"
                >
                  Вернуться к курсу
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-white mb-2">
                  {assignment.title}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className="bg-slate-700 text-slate-300">
                    {assignment.type === 'essay' ? 'Эссе' : 
                     assignment.type === 'audio' ? 'Аудио' : 'Тест'}
                  </Badge>
                  <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Макс. балл: {assignment.max_score}
                  </Badge>
                </div>
              </div>
              {assignment.type === 'essay' && <FileText className="w-8 h-8 text-slate-400" />}
              {assignment.type === 'audio' && <Mic className="w-8 h-8 text-slate-400" />}
            </div>
          </CardHeader>
        </Card>

        {assignment.type === 'essay' && (
          <EssaySubmission assignment={assignment} onSubmit={handleSubmit} />
        )}

        {assignment.type === 'audio' && (
          <AudioSubmission assignment={assignment} onSubmit={handleSubmit} />
        )}

        {assignment.type === 'test' && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">Тесты будут реализованы позже</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}