import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIGradingAssistant({ assignment, submissions }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeSubmissions = async () => {
    setAnalyzing(true);
    try {
      const submissionsText = submissions.map((s, idx) => 
        `Работа ${idx + 1}:\n${JSON.stringify(s.submission)}\nОценка: ${s.score || 'не оценено'}`
      ).join('\n\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Проанализируй следующие работы студентов по заданию "${assignment.title}".
        
Тип задания: ${assignment.type}
${assignment.essay_prompt ? `Тема эссе: ${assignment.essay_prompt}` : ''}

Работы студентов:
${submissionsText}

Предоставь:
1. Общую статистику (средний балл, распределение оценок)
2. Наиболее частые ошибки и проблемы
3. Сильные стороны работ
4. Рекомендации для обратной связи студентам
5. Предложения по улучшению задания`,
        response_json_schema: {
          type: "object",
          properties: {
            statistics: {
              type: "object",
              properties: {
                average_score: { type: "number" },
                score_distribution: { type: "string" },
                completion_rate: { type: "string" }
              }
            },
            common_errors: {
              type: "array",
              items: { type: "string" }
            },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            feedback_recommendations: {
              type: "array",
              items: { type: "string" }
            },
            assignment_improvements: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing submissions:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-amber-400" />
          AI-ассистент для проверки
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="text-center py-8">
            <p className="text-slate-300 mb-4">
              Используйте AI для анализа всех работ студентов и получения рекомендаций
            </p>
            <Button
              onClick={analyzeSubmissions}
              disabled={analyzing || submissions.length === 0}
              className="bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Анализирую...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Анализировать работы ({submissions.length})
                </>
              )}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Statistics */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Статистика
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Средний балл</p>
                  <p className="text-2xl font-bold text-white">
                    {analysis.statistics?.average_score || 0}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Распределение</p>
                  <p className="text-white text-sm">{analysis.statistics?.score_distribution}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Завершено</p>
                  <p className="text-white text-sm">{analysis.statistics?.completion_rate}</p>
                </div>
              </div>
            </div>

            {/* Common Errors */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-white font-semibold mb-3">Частые ошибки</h3>
              <ul className="space-y-2">
                {analysis.common_errors?.map((error, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30 mt-0.5">
                      {idx + 1}
                    </Badge>
                    <span className="text-sm">{error}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strengths */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-white font-semibold mb-3">Сильные стороны</h3>
              <ul className="space-y-2">
                {analysis.strengths?.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mt-0.5">
                      ✓
                    </Badge>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-white font-semibold mb-3">Рекомендации для обратной связи</h3>
              <ul className="space-y-2">
                {analysis.feedback_recommendations?.map((rec, idx) => (
                  <li key={idx} className="text-slate-300 text-sm">• {rec}</li>
                ))}
              </ul>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-white font-semibold mb-3">Улучшение задания</h3>
              <ul className="space-y-2">
                {analysis.assignment_improvements?.map((imp, idx) => (
                  <li key={idx} className="text-slate-300 text-sm">• {imp}</li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => setAnalysis(null)}
              variant="outline"
              className="w-full border-slate-600 text-slate-300"
            >
              Новый анализ
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}