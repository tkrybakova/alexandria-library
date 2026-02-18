import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIFeedback({ feedback, type }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (score >= 60) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-slate-800/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Оценка
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <span className="text-slate-300">Общая оценка</span>
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                {Math.round(feedback.overall_score)}
              </span>
              <span className="text-slate-400">/100</span>
            </div>
          </div>

          {/* Individual Scores */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Object.entries(feedback.scores).map(([key, value]) => (
              <div key={key} className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-slate-400 text-sm mb-1 capitalize">
                  {key === 'grammar' ? 'Грамматика' :
                   key === 'style' ? 'Стиль' :
                   key === 'content' ? 'Содержание' :
                   key === 'relevance' ? 'Релевантность' :
                   key === 'pronunciation' ? 'Произношение' :
                   key === 'understanding' ? 'Понимание' :
                   key === 'completeness' ? 'Полнота' : key}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-slate-700 rounded-full h-2 mr-2">
                    <div
                      className={`h-2 rounded-full ${
                        value >= 80 ? 'bg-green-500' :
                        value >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(value)}`}>
                    {Math.round(value)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <p className="text-slate-300">{feedback.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Transcription for Audio */}
      {type === 'audio' && feedback.transcription && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Расшифровка</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 italic">"{feedback.transcription}"</p>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {feedback.feedback?.strengths?.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Сильные стороны
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Grammar Errors (Essay) */}
      {type === 'essay' && feedback.feedback?.grammar_errors?.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Ошибки грамматики
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedback.feedback.grammar_errors.map((error, index) => (
                <div key={index} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant="outline" className="border-red-500 text-red-400">
                      Ошибка
                    </Badge>
                    <span className="text-slate-300 flex-1">{error.error}</span>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      Правильно
                    </Badge>
                    <span className="text-slate-300 flex-1">{error.correction}</span>
                  </div>
                  <p className="text-slate-400 text-sm pl-20">{error.explanation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pronunciation Issues (Audio) */}
      {type === 'audio' && feedback.feedback?.pronunciation_issues?.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Проблемы с произношением
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.feedback.pronunciation_issues.map((issue, index) => (
                <div key={index} className="bg-slate-700/30 p-3 rounded-lg">
                  <p className="text-white font-medium mb-1">"{issue.word}"</p>
                  <p className="text-slate-400 text-sm mb-1">{issue.issue}</p>
                  <p className="text-green-400 text-sm">💡 {issue.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weaknesses (Essay) */}
      {type === 'essay' && feedback.feedback?.weaknesses?.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Области для улучшения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.feedback.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <span className="text-amber-400 mt-1">→</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {feedback.feedback?.improvements?.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Рекомендации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.feedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-300">
                  <span className="text-amber-400 mt-1">💡</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}