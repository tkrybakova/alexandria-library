import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Mic, Square, Send, Upload } from 'lucide-react';
import AIFeedback from './AIFeedback';

export default function AudioSubmission({ assignment, onSubmit }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCheck = async () => {
    if (!audioBlob) return;
    
    setIsChecking(true);
    try {
      // Upload audio file
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      const { file_url } = await base44.integrations.Core.UploadFile({ file: audioBlob });

      // Check with AI
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Проанализируй этот аудио-ответ студента и оцени его.
        
Вопрос/задание: ${assignment.title}

Оцени по следующим критериям (от 0 до 100):
1. Произношение и дикция
2. Понимание темы
3. Полнота ответа
4. Грамматика речи

Дай конструктивную обратную связь с конкретными рекомендациями по улучшению.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            transcription: { type: "string", description: "Расшифровка аудио" },
            scores: {
              type: "object",
              properties: {
                pronunciation: { type: "number", description: "Произношение 0-100" },
                understanding: { type: "number", description: "Понимание 0-100" },
                completeness: { type: "number", description: "Полнота 0-100" },
                grammar: { type: "number", description: "Грамматика 0-100" }
              }
            },
            overall_score: { type: "number", description: "Общая оценка 0-100" },
            feedback: {
              type: "object",
              properties: {
                strengths: {
                  type: "array",
                  items: { type: "string" }
                },
                pronunciation_issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      word: { type: "string" },
                      issue: { type: "string" },
                      recommendation: { type: "string" }
                    }
                  }
                },
                improvements: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      setFeedback({ ...response, audio_url: file_url });
    } catch (error) {
      console.error('Error checking audio:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (feedback) {
      await onSubmit({
        type: 'audio',
        audio_url: feedback.audio_url,
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
            <Mic className="w-5 h-5" />
            Аудио-ответ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300 mb-2 block">Задание</Label>
            <p className="text-white bg-slate-700/50 p-4 rounded-lg">
              {assignment.title}
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 py-8 bg-slate-700/30 rounded-lg">
            {!audioUrl ? (
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="lg"
                className={`w-32 h-32 rounded-full ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                }`}
              >
                {isRecording ? (
                  <Square className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </Button>
            ) : (
              <div className="w-full max-w-md space-y-4">
                <audio src={audioUrl} controls className="w-full" />
                <Button
                  onClick={() => {
                    setAudioUrl(null);
                    setAudioBlob(null);
                    setFeedback(null);
                  }}
                  variant="outline"
                  className="w-full border-slate-600"
                >
                  Записать заново
                </Button>
              </div>
            )}
            <p className="text-slate-400 text-sm">
              {isRecording ? 'Запись... Нажмите, чтобы остановить' : audioUrl ? 'Прослушайте запись' : 'Нажмите, чтобы начать запись'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCheck}
              disabled={!audioBlob || isChecking}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Анализ AI...
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

      {feedback && <AIFeedback feedback={feedback} type="audio" />}
    </div>
  );
}