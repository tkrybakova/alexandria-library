import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send, FileText } from 'lucide-react';
import AIFeedback from './AIFeedback';

export default function EssaySubmission({ assignment, onSubmit }) {
  const [essay, setEssay] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleCheck = async () => {
    if (!essay.trim()) return;
    
    setIsChecking(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Проверь это эссе и дай детальную оценку.
        
Тема: ${assignment.essay_prompt}

Текст эссе:
${essay}

Оцени эссе по следующим критериям (от 0 до 100):
1. Грамматика и орфография
2. Стиль и структура
3. Содержание и аргументация
4. Соответствие теме

Дай конструктивную обратную связь с конкретными примерами ошибок и рекомендациями по улучшению.`,
        response_json_schema: {
          type: "object",
          properties: {
            scores: {
              type: "object",
              properties: {
                grammar: { type: "number", description: "Оценка грамматики 0-100" },
                style: { type: "number", description: "Оценка стиля 0-100" },
                content: { type: "number", description: "Оценка содержания 0-100" },
                relevance: { type: "number", description: "Соответствие теме 0-100" }
              }
            },
            overall_score: { type: "number", description: "Общая оценка 0-100" },
            feedback: {
              type: "object",
              properties: {
                strengths: {
                  type: "array",
                  items: { type: "string" },
                  description: "Сильные стороны эссе"
                },
                weaknesses: {
                  type: "array",
                  items: { type: "string" },
                  description: "Слабые стороны"
                },
                grammar_errors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      error: { type: "string" },
                      correction: { type: "string" },
                      explanation: { type: "string" }
                    }
                  }
                },
                improvements: {
                  type: "array",
                  items: { type: "string" },
                  description: "Рекомендации по улучшению"
                }
              }
            },
            summary: { type: "string", description: "Краткое резюме" }
          }
        }
      });

      setFeedback(response);
    } catch (error) {
      console.error('Error checking essay:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (feedback) {
      await onSubmit({
        type: 'essay',
        content: essay,
        ai_feedback: feedback,
        score: feedback.overall_score
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5" />
            Написание эссе
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300 mb-2 block">Тема эссе</Label>
            <p className="text-white bg-slate-700/50 p-4 rounded-lg">
              {assignment.essay_prompt}
            </p>
          </div>

          <div>
            <Label className="text-slate-300 mb-2 block">Ваше эссе</Label>
            <Textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Напишите ваше эссе здесь..."
              className="min-h-[300px] bg-slate-700 border-slate-600 text-white"
              disabled={isChecking}
            />
            <p className="text-slate-400 text-sm mt-2">
              Слов: {essay.trim().split(/\s+/).filter(Boolean).length}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCheck}
              disabled={!essay.trim() || isChecking}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Проверка AI...
                </>
              ) : (
                'Проверить с помощью AI'
              )}
            </Button>
            {feedback && (
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Отправить ответ
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {feedback && <AIFeedback feedback={feedback} type="essay" />}
    </div>
  );
}