import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Flashcards() {
  const [user, setUser] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '' });

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: flashcards = [] } = useQuery({
    queryKey: ['flashcards', user?.id],
    queryFn: () => base44.entities.Flashcard.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Flashcard.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      setShowForm(false);
      setNewCard({ front: '', back: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Flashcard.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });

  const currentCard = flashcards[currentIndex];
  const dueCards = flashcards.filter(c => !c.next_review || new Date(c.next_review) <= new Date());

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handleRating = (quality) => {
    if (!currentCard) return;

    let { interval_days, ease_factor, repetitions } = currentCard;
    
    if (quality >= 3) {
      if (repetitions === 0) {
        interval_days = 1;
      } else if (repetitions === 1) {
        interval_days = 6;
      } else {
        interval_days = Math.round(interval_days * ease_factor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval_days = 1;
    }

    ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval_days);

    updateMutation.mutate({
      id: currentCard.id,
      data: {
        interval_days,
        ease_factor,
        repetitions,
        next_review: nextReview.toISOString()
      }
    });

    handleNext();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      user_id: user.id,
      front: newCard.front,
      back: newCard.back,
      next_review: new Date().toISOString(),
      interval_days: 1,
      ease_factor: 2.5,
      repetitions: 0
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-900 flex items-center justify-center bg-blue-50">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-900" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-blue-900">TABULAE</h1>
          </div>
          <div className="h-1 w-24 bg-blue-900 mx-auto mb-4"></div>
          <p className="text-blue-600 font-serif italic text-sm sm:text-base">Система интервальных повторений</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <Card className="bg-blue-50 border-2 border-blue-900">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{flashcards.length}</p>
              <p className="text-xs sm:text-sm text-blue-600 font-serif">Всего карт</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-2 border-blue-900">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{dueCards.length}</p>
              <p className="text-xs sm:text-sm text-blue-600 font-serif">К изучению</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-2 border-blue-900 col-span-2 sm:col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{flashcards.filter(c => c.repetitions > 0).length}</p>
              <p className="text-xs sm:text-sm text-blue-600 font-serif">Изучено</p>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard */}
        {flashcards.length > 0 && currentCard ? (
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative w-full h-64 sm:h-80 cursor-pointer"
                onClick={() => setFlipped(!flipped)}
              >
                <Card className="absolute inset-0 bg-blue-50 border-4 border-blue-900 shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
                  <CardContent className="flex items-center justify-center h-full p-6 sm:p-8">
                    <div className="text-center">
                      <Badge className="mb-4 bg-blue-900 text-white text-xs sm:text-sm">Вопрос</Badge>
                      <p className="text-xl sm:text-3xl font-serif text-blue-900">{currentCard.front}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="absolute inset-0 bg-blue-50 border-4 border-blue-900 shadow-xl" 
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <CardContent className="flex items-center justify-center h-full p-6 sm:p-8">
                    <div className="text-center">
                      <Badge className="mb-4 bg-blue-900 text-white text-xs sm:text-sm">Ответ</Badge>
                      <p className="text-lg sm:text-2xl font-serif text-blue-900">{currentCard.back}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            <p className="text-center text-blue-600 mt-4 text-xs sm:text-sm font-serif">
              Карта {currentIndex + 1} из {flashcards.length} · Нажмите для переворота
            </p>

            {/* Rating Buttons */}
            {flipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6"
              >
                <Button onClick={() => handleRating(1)} variant="outline" className="border-2 border-red-600 text-red-600 hover:bg-red-50 text-xs sm:text-sm py-3 sm:py-4">
                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Забыл
                </Button>
                <Button onClick={() => handleRating(2)} variant="outline" className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 text-xs sm:text-sm py-3 sm:py-4">
                  Сложно
                </Button>
                <Button onClick={() => handleRating(3)} variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm py-3 sm:py-4">
                  Хорошо
                </Button>
                <Button onClick={() => handleRating(4)} variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50 text-xs sm:text-sm py-3 sm:py-4">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Легко
                </Button>
              </motion.div>
            )}
          </div>
        ) : (
          <Card className="bg-blue-50 border-4 border-blue-900 mb-8">
            <CardContent className="p-8 sm:p-12 text-center">
              <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-serif text-blue-900 mb-2">Карты не найдены</h3>
              <p className="text-blue-600 text-sm sm:text-base">Создайте первую карту для начала обучения</p>
            </CardContent>
          </Card>
        )}

        {/* Add Card Form */}
        <Card className="bg-blue-50 border-4 border-blue-900">
          <CardContent className="p-4 sm:p-6">
            {!showForm ? (
              <Button
                onClick={() => setShowForm(true)}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-serif text-sm sm:text-base py-3 sm:py-4"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Создать новую карту
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-blue-900 font-serif mb-2 text-sm sm:text-base">Вопрос</label>
                  <Textarea
                    value={newCard.front}
                    onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                    placeholder="Что такое..."
                    className="border-2 border-blue-900 focus:border-blue-700 font-serif text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-900 font-serif mb-2 text-sm sm:text-base">Ответ</label>
                  <Textarea
                    value={newCard.back}
                    onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                    placeholder="Это..."
                    className="border-2 border-blue-900 focus:border-blue-700 font-serif text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Button type="submit" className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-serif text-sm sm:text-base py-2 sm:py-3">
                    Создать
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1 border-2 border-blue-900 text-blue-900 hover:bg-blue-50 font-serif text-sm sm:text-base py-2 sm:py-3"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}