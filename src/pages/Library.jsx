import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, Scroll, FileText, Video, Headphones, Sparkles, Eye, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Library() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

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

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['library-materials'],
    queryFn: () => base44.entities.LibraryMaterial.list('-created_date'),
    enabled: !!user,
  });

  const categories = [
    { id: 'all', name: 'Все категории', icon: '📚' },
    { id: 'philosophy', name: 'Философия', icon: '🧠' },
    { id: 'mathematics', name: 'Математика', icon: '📐' },
    { id: 'astronomy', name: 'Астрономия', icon: '🌌' },
    { id: 'history', name: 'История', icon: '🏛️' },
    { id: 'literature', name: 'Литература', icon: '📖' },
    { id: 'science', name: 'Науки', icon: '🔬' },
    { id: 'arts', name: 'Искусства', icon: '🎨' },
    { id: 'medicine', name: 'Медицина', icon: '⚕️' }
  ];

  const typeIcons = {
    book: BookOpen,
    scroll: Scroll,
    manuscript: FileText,
    article: FileText,
    video: Video,
    audio: Headphones,
    document: FileText
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesType = selectedType === 'all' || material.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const featuredMaterials = materials.filter(m => m.is_featured).slice(0, 3);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Greek/Roman Pattern Header */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b-8 border-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-white">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="greek-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="currentColor" opacity="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#greek-pattern)"/>
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 border-4 border-blue-100 flex items-center justify-center shadow-xl bg-white">
              <BookOpen className="w-10 h-10 text-blue-900" />
            </div>
            <div>
              <h1 className="text-5xl font-serif text-blue-50 mb-2 drop-shadow-lg">Bibliotheca Alexandria</h1>
              <p className="text-blue-200 text-lg italic">Храм вечной мудрости и знаний древних</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Featured Scrolls */}
        {featuredMaterials.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-blue-700" />
              <h2 className="text-2xl font-serif text-blue-900">Избранные свитки</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredMaterials.map((material, index) => {
                const Icon = typeIcons[material.type] || BookOpen;
                return (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white border-4 border-blue-900 shadow-lg hover:shadow-2xl transition-all overflow-hidden group cursor-pointer">
                      {material.cover_image && (
                        <div className="h-48 overflow-hidden bg-blue-100">
                          <img 
                            src={material.cover_image} 
                            alt={material.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 border-2 border-blue-900 flex items-center justify-center bg-white">
                            <Icon className="w-5 h-5 text-blue-900" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-serif font-bold text-blue-900 mb-1 line-clamp-2">
                              {material.title}
                            </h3>
                            {material.author && (
                              <p className="text-blue-700 text-sm italic">— {material.author}</p>
                            )}
                          </div>
                        </div>
                        {material.description && (
                          <p className="text-blue-600 text-sm line-clamp-3 mb-3">{material.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-blue-700">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {material.views || 0}
                          </span>
                          {material.year && <span>{material.year}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="bg-white border-4 border-blue-900 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск в древних свитках и книгах..."
                  className="pl-10 border-blue-300 bg-white focus:border-blue-500 font-serif"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 border-2 text-sm font-medium transition-all font-serif ${
                    selectedCategory === cat.id
                      ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                      : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-50'
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type Tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-8">
          <TabsList className="bg-white border-2 border-blue-900">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white font-serif">
              Все
            </TabsTrigger>
            <TabsTrigger value="book" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white font-serif">
              <BookOpen className="w-4 h-4 mr-2" />
              Книги
            </TabsTrigger>
            <TabsTrigger value="scroll" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white font-serif">
              <Scroll className="w-4 h-4 mr-2" />
              Свитки
            </TabsTrigger>
            <TabsTrigger value="manuscript" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white font-serif">
              <FileText className="w-4 h-4 mr-2" />
              Манускрипты
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-blue-900 data-[state=active]:text-white font-serif">
              <Video className="w-4 h-4 mr-2" />
              Видео
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Materials Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-4 border-blue-900">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 bg-blue-100 mb-3" />
                  <Skeleton className="h-4 w-1/2 bg-blue-100 mb-4" />
                  <Skeleton className="h-20 w-full bg-blue-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMaterials.length === 0 ? (
          <Card className="bg-white border-4 border-blue-900">
            <CardContent className="p-12 text-center">
              <Scroll className="w-20 h-20 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-blue-900 mb-2">Свитки не найдены</h3>
              <p className="text-blue-600">
                Попробуйте изменить параметры поиска или исследуйте другие разделы библиотеки
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredMaterials.map((material, index) => {
                const Icon = typeIcons[material.type] || BookOpen;
                return (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-white border-4 border-blue-900 hover:shadow-xl transition-all cursor-pointer h-full group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-10 h-10 border-2 border-blue-900 flex items-center justify-center bg-white group-hover:bg-blue-50 transition-colors">
                            <Icon className="w-5 h-5 text-blue-900" />
                          </div>
                          {material.is_featured && (
                            <Badge className="bg-blue-900 text-white border-0">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Избранное
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-serif text-blue-900 line-clamp-2">
                          {material.title}
                        </CardTitle>
                        {material.author && (
                          <p className="text-blue-700 text-sm italic mt-1">— {material.author}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        {material.description && (
                          <p className="text-blue-600 text-sm line-clamp-3 mb-4">{material.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {material.category && (
                            <Badge variant="outline" className="border-blue-900 text-blue-900 bg-blue-50">
                              {categories.find(c => c.id === material.category)?.icon} {' '}
                              {categories.find(c => c.id === material.category)?.name}
                            </Badge>
                          )}
                          {material.language && (
                            <Badge variant="outline" className="border-blue-700 text-blue-700">
                              {material.language}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-blue-700 mb-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {material.views || 0} просмотров
                          </span>
                          {material.pages && (
                            <span>{material.pages} стр.</span>
                          )}
                        </div>

                        {material.file_url && (
                          <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white border-0 shadow-md font-serif">
                            <Download className="w-4 h-4 mr-2" />
                            Изучить
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Greek Footer Pattern */}
      <div className="mt-20 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-t-8 border-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-blue-100 font-serif italic">
            "Знание — свет, освещающий путь сквозь тьму веков"
          </p>
          <div className="mt-4 flex justify-center gap-8 text-blue-200 text-sm">
            <span>📜 {materials.length} свитков</span>
            <span>🏛️ Bibliotheca Alexandria</span>
            <span>⚱️ Древняя мудрость</span>
          </div>
        </div>
      </div>
    </div>
  );
}