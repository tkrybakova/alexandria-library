import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, LayoutGrid, Network } from 'lucide-react';
import KnowledgeGraph from '../components/courses/KnowledgeGraph';
import CourseCard from '../components/courses/CourseCard';
import RecommendationsPanel from '../components/courses/RecommendationsPanel';
import { motion } from 'framer-motion';

export default function Courses() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);

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

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ is_published: true }),
    enabled: !!user,
  });

  const { data: userAssignments = [] } = useQuery({
    queryKey: ['user-assignments', user?.id],
    queryFn: () => base44.entities.UserAssignment.filter({ user_id: user.id }),
    enabled: !!user,
  });

  // Calculate recommendations
  const getRecommendations = () => {
    if (!user?.faculty_id || !courses.length) return [];

    const recommendations = courses
      .filter(course => !selectedCourse || course.id !== selectedCourse.id)
      .map(course => {
        let score = 0;
        const reasons = [];

        // Faculty match
        if (course.faculty_id === user.faculty_id) {
          score += 50;
          reasons.push({ type: 'faculty', label: 'Ваш факультет' });
        }

        // Difficulty match based on user level
        const userLevel = user.level || 1;
        if (
          (userLevel <= 3 && course.difficulty === 'beginner') ||
          (userLevel > 3 && userLevel <= 7 && course.difficulty === 'intermediate') ||
          (userLevel > 7 && course.difficulty === 'advanced')
        ) {
          score += 30;
          reasons.push({ type: 'difficulty', label: 'Подходящий уровень' });
        }

        // Prerequisites completed
        if (course.prerequisites?.length) {
          const completedPrereqs = course.prerequisites.filter(prereqId => {
            return userAssignments.some(
              assignment => assignment.course_id === prereqId && assignment.status === 'graded'
            );
          });
          if (completedPrereqs.length === course.prerequisites.length) {
            score += 20;
            reasons.push({ type: 'prerequisites', label: 'Готовы к изучению' });
          }
        } else {
          score += 10;
        }

        return { course, score, reasons };
      })
      .filter(rec => rec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return recommendations;
  };

  const recommendations = getRecommendations();

  // Calculate user progress
  const userProgress = {};
  courses.forEach(course => {
    const courseAssignments = userAssignments.filter(a => a.course_id === course.id);
    if (courseAssignments.length > 0) {
      const completed = courseAssignments.every(a => a.status === 'graded');
      userProgress[course.id] = {
        in_progress: !completed,
        completed,
        percentage: (courseAssignments.filter(a => a.status === 'graded').length / courseAssignments.length) * 100
      };
    }
  });

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || course.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Каталог курсов</h1>
          <p className="text-slate-400">Исследуйте граф знаний и выбирайте подходящие курсы</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск курсов..."
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Уровень" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все уровни</SelectItem>
              <SelectItem value="beginner">Начальный</SelectItem>
              <SelectItem value="intermediate">Средний</SelectItem>
              <SelectItem value="advanced">Продвинутый</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={view} onValueChange={setView} className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="grid" className="data-[state=active]:bg-slate-700">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Сетка
            </TabsTrigger>
            <TabsTrigger value="graph" className="data-[state=active]:bg-slate-700">
              <Network className="w-4 h-4 mr-2" />
              Граф знаний
            </TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TabsContent value="grid" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CourseCard
                        course={course}
                        isRecommended={course.faculty_id === user.faculty_id}
                        userProgress={userProgress}
                        onClick={() => setSelectedCourse(course)}
                      />
                    </motion.div>
                  ))}
                </div>
                {filteredCourses.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    Курсы не найдены
                  </div>
                )}
              </TabsContent>

              <TabsContent value="graph" className="mt-0">
                <KnowledgeGraph
                  courses={filteredCourses}
                  onCourseSelect={setSelectedCourse}
                  userProgress={userProgress}
                  userFacultyId={user.faculty_id}
                />
              </TabsContent>
            </div>

            <div>
              <RecommendationsPanel
                recommendations={recommendations}
                onCourseClick={setSelectedCourse}
              />
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}