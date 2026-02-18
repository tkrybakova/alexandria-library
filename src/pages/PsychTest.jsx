import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, Compass, Palette, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  {
    question: "Когда вы сталкиваетесь с новой темой, что вас привлекает больше всего?",
    options: [
      { text: "Открытие новых возможностей и связей", archetype: "explorer" },
      { text: "Глубокое понимание теории и принципов", archetype: "scholar" },
      { text: "Создание чего-то нового на основе знаний", archetype: "creator" },
      { text: "Систематизация и сохранение информации", archetype: "guardian" }
    ]
  },
  {
    question: "Как вы предпочитаете изучать материал?",
    options: [
      { text: "Экспериментировать и пробовать разные подходы", archetype: "explorer" },
      { text: "Читать академические источники и анализировать", archetype: "scholar" },
      { text: "Применять знания в практических проектах", archetype: "creator" },
      { text: "Создавать структурированные заметки и конспекты", archetype: "guardian" }
    ]
  },
  {
    question: "Что мотивирует вас в обучении?",
    options: [
      { text: "Любопытство и жажда открытий", archetype: "explorer" },
      { text: "Стремление к истине и пониманию", archetype: "scholar" },
      { text: "Желание создавать и воплощать идеи", archetype: "creator" },
      { text: "Ответственность за сохранение знаний", archetype: "guardian" }
    ]
  },
  {
    question: "Как вы решаете сложные задачи?",
    options: [
      { text: "Ищу нестандартные решения и новые пути", archetype: "explorer" },
      { text: "Анализирую проблему с разных сторон", archetype: "scholar" },
      { text: "Создаю прототипы и тестирую идеи", archetype: "creator" },
      { text: "Использую проверенные методы и алгоритмы", archetype: "guardian" }
    ]
  },
  {
    question: "Что для вас важнее в образовании?",
    options: [
      { text: "Свобода исследования и самостоятельность", archetype: "explorer" },
      { text: "Академическая строгость и точность", archetype: "scholar" },
      { text: "Творческое самовыражение", archetype: "creator" },
      { text: "Структура и последовательность", archetype: "guardian" }
    ]
  }
];

const facultyInfo = {
  explorer: {
    name: "Исследователи",
    icon: Compass,
    color: "from-blue-500 to-cyan-500",
    description: "Вы - первопроходец в мире знаний. Вас привлекают новые территории, неизведанные пути и смелые эксперименты. Ваша сила - в способности видеть связи там, где другие видят хаос."
  },
  scholar: {
    name: "Учёные",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    description: "Вы - искатель истины. Глубокий анализ, критическое мышление и стремление к пониманию сути вещей - ваши главные инструменты. Вы не довольствуетесь поверхностными ответами."
  },
  creator: {
    name: "Создатели",
    icon: Palette,
    color: "from-orange-500 to-red-500",
    description: "Вы - архитектор новых идей. Ваша сила в способности трансформировать знания в нечто уникальное. Вы видите возможности для инноваций везде, где другие видят ограничения."
  },
  guardian: {
    name: "Хранители",
    icon: Shield,
    color: "from-green-500 to-emerald-500",
    description: "Вы - страж мудрости. Систематизация, сохранение и передача знаний - ваша миссия. Вы понимаете ценность структуры и последовательности в обучении."
  }
};

export default function PsychTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.psycho_test_completed) {
          navigate(createPageUrl('Dashboard'));
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, [navigate]);

  const handleAnswer = (archetype) => {
    const newAnswers = { ...answers, [currentQuestion]: archetype };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = async (finalAnswers) => {
    const archetypeCounts = {};
    Object.values(finalAnswers).forEach(archetype => {
      archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
    });

    const dominantArchetype = Object.entries(archetypeCounts)
      .sort((a, b) => b[1] - a[1])[0][0];

    setResult(dominantArchetype);
    setIsSubmitting(true);

    try {
      const faculties = await base44.entities.Faculty.filter({ archetype: dominantArchetype });
      let faculty = faculties[0];

      if (!faculty) {
        faculty = await base44.entities.Faculty.create({
          name: facultyInfo[dominantArchetype].name,
          archetype: dominantArchetype,
          description: facultyInfo[dominantArchetype].description,
          color: dominantArchetype === 'explorer' ? '#3b82f6' : 
                 dominantArchetype === 'scholar' ? '#a855f7' :
                 dominantArchetype === 'creator' ? '#f97316' : '#10b981',
          icon: dominantArchetype
        });
      }

      await base44.auth.updateMe({
        faculty_id: faculty.id,
        psycho_test_completed: true,
        psycho_test_results: archetypeCounts
      });

      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 3000);
    } catch (error) {
      console.error('Error saving test results:', error);
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">Психологический тест</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Найдите свой факультет</h1>
              <p className="text-slate-400">Вопрос {currentQuestion + 1} из {questions.length}</p>
              <Progress value={progress} className="mt-4 h-2" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      {questions[currentQuestion].question}
                    </h2>
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <Button
                          key={index}
                          onClick={() => handleAnswer(option.archetype)}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-4 px-6 border-slate-600 hover:border-amber-500 hover:bg-slate-700 text-slate-200"
                        >
                          <span className="flex-1">{option.text}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
              <CardContent className="p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${facultyInfo[result].color} flex items-center justify-center`}
                >
                  {React.createElement(facultyInfo[result].icon, { className: "w-12 h-12 text-white" })}
                </motion.div>
                
                <h2 className="text-3xl font-bold text-white mb-2">
                  Ваш факультет: {facultyInfo[result].name}
                </h2>
                <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                  {facultyInfo[result].description}
                </p>
                
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>Перенаправление в вашу библиотеку...</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}