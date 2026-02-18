import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Sparkles, Users, Library, ArrowRight, Brain, Compass, Palette, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        try {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };
    checkAuth();
  }, []);

  const faculties = [
    { icon: Compass, name: 'Исследователи', desc: 'Exploratores · Стремятся к новым открытиям' },
    { icon: Brain, name: 'Учёные', desc: 'Eruditi · Глубокий анализ и понимание' },
    { icon: Palette, name: 'Создатели', desc: 'Creatores · Творчество и инновации' },
    { icon: Shield, name: 'Хранители', desc: 'Custodes · Сохранение знаний' }
  ];

  const features = [
    { icon: BookOpen, title: 'Cursus Interactivi', desc: 'Граф знаний и персонализированные траектории' },
    { icon: Sparkles, title: 'AI Adiutor', desc: 'Умный помощник для ответов и проверки заданий' },
    { icon: Library, title: 'Bibliotheca Magna', desc: 'Тысячи материалов: книги, статьи, видео' }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 overflow-hidden bg-blue-50">
        <div className="absolute inset-0 opacity-5 text-blue-900">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="meander" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M0,20 L20,20 L20,0 L40,0 L40,40 L60,40 L60,0 L80,0 L80,20 L60,20 L60,60 L40,60 L40,20 L20,20 L20,60 L0,60 Z" fill="none" stroke="currentColor" strokeWidth="2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#meander)"/>
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-5xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-10"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 border-6 sm:border-8 border-blue-900 mx-auto flex items-center justify-center shadow-2xl bg-blue-50">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-blue-900" />
            </div>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold text-blue-900 mb-6 sm:mb-8 leading-tight tracking-tight">
            BIBLIOTHECA
            <br />
            <span className="text-4xl sm:text-6xl md:text-7xl">ALEXANDRIA</span>
          </h1>

          <div className="h-1 w-32 sm:w-48 bg-blue-900 mx-auto mb-6 sm:mb-8"></div>

          <p className="text-xl sm:text-2xl md:text-3xl text-blue-700 mb-4 sm:mb-6 leading-relaxed font-serif">
            Templum Sapientiae
          </p>
          <p className="text-base sm:text-lg text-blue-600 italic mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Храм знаний нового поколения · Персонализированное обучение с искусственным интеллектом
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                  size="lg"
                  className="bg-blue-900 hover:bg-blue-800 text-white text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 font-serif border-3 sm:border-4 border-blue-900"
                >
                  Intrare
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-3 sm:border-4 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 font-serif"
                >
                  Cognoscere
                </Button>
              </>
            ) : (
              <Link to={createPageUrl(user?.psycho_test_completed ? 'Courses' : 'PsychTest')}>
                <Button
                  size="lg"
                  className="bg-blue-900 hover:bg-blue-800 text-white text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 font-serif border-3 sm:border-4 border-blue-900"
                >
                  {user?.psycho_test_completed ? 'Ad Bibliothecam' : 'Inire Probationem'}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* Faculties Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-blue-50 border-t-4 border-b-4 border-blue-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="h-1 w-20 sm:w-24 bg-blue-900 mx-auto mb-4 sm:mb-6"></div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-blue-900 mb-3 sm:mb-4">IV FACULTATES</h2>
            <p className="text-blue-600 text-base sm:text-lg font-serif italic px-4">
              Пройдите психологический тест и найдите свой архетип обучения
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {faculties.map((faculty, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-blue-50 border-3 sm:border-4 border-blue-900 hover:shadow-2xl transition-all h-full">
                  <CardContent className="p-4 sm:p-8 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-blue-900 mx-auto mb-4 sm:mb-6 flex items-center justify-center bg-blue-50">
                      <faculty.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-900" />
                    </div>
                    <h3 className="text-lg sm:text-2xl font-serif font-bold text-blue-900 mb-2 sm:mb-3">{faculty.name}</h3>
                    <div className="h-0.5 w-12 sm:w-16 bg-blue-400 mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-blue-600 text-xs sm:text-sm leading-relaxed">{faculty.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-3 sm:border-4 border-blue-900 mx-auto mb-4 sm:mb-6 flex items-center justify-center bg-blue-50">
                    <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-900" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-blue-900 mb-3 sm:mb-4">{feature.title}</h3>
                  <div className="h-0.5 w-10 sm:w-12 bg-blue-400 mx-auto mb-3 sm:mb-4"></div>
                  <p className="text-blue-600 text-sm sm:text-base leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-blue-50 border-t-4 border-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-1 w-20 sm:w-24 bg-blue-900 mx-auto mb-6 sm:mb-8"></div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-blue-900 mb-4 sm:mb-6 px-4">
              Ingredere Viam
            </h2>
            <p className="text-blue-600 text-base sm:text-xl mb-8 sm:mb-12 font-serif italic px-4">
              Присоединяйтесь к ученикам, исследующим границы знания
            </p>
            {!isAuthenticated && (
              <Button
                onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                size="lg"
                className="bg-blue-900 hover:bg-blue-800 text-white text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 font-serif border-3 sm:border-4 border-blue-900"
              >
                Subscribere
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}