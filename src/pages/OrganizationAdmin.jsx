import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, BookOpen, Plus, Trash2, Edit, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';

export default function OrganizationAdmin() {
  const [user, setUser] = useState(null);
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: '', description: '', website: '', contact_email: '' });
  const [teacherForm, setTeacherForm] = useState({ email: '', specialization: '', bio: '' });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', difficulty: 'beginner' });
  
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

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: () => base44.entities.Organization.filter({ owner_id: user.id }),
    enabled: !!user,
  });

  const selectedOrg = organizations[0];

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers', selectedOrg?.id],
    queryFn: () => base44.entities.Teacher.filter({ organization_id: selectedOrg.id }),
    enabled: !!selectedOrg,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['org-courses', selectedOrg?.id],
    queryFn: () => base44.entities.Course.filter({ organization_id: selectedOrg.id }),
    enabled: !!selectedOrg,
  });

  const createOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.create({ ...data, owner_id: user.id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']);
      setShowOrgForm(false);
      setOrgForm({ name: '', description: '', website: '', contact_email: '' });
    },
  });

  const inviteTeacherMutation = useMutation({
    mutationFn: async (data) => {
      await base44.users.inviteUser(data.email, 'user');
      const users = await base44.entities.User.filter({ email: data.email });
      if (users[0]) {
        return base44.entities.Teacher.create({
          user_id: users[0].id,
          organization_id: selectedOrg.id,
          specialization: data.specialization,
          bio: data.bio,
          permissions: ['create_course', 'edit_course']
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teachers']);
      setShowTeacherForm(false);
      setTeacherForm({ email: '', specialization: '', bio: '' });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create({
      ...data,
      organization_id: selectedOrg.id,
      access_type: 'organization',
      instructor_id: user.id,
      is_published: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['org-courses']);
      setShowCourseForm(false);
      setCourseForm({ title: '', description: '', difficulty: 'beginner' });
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: (id) => base44.entities.Teacher.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['teachers']),
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['org-courses']),
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Администрирование организации</h1>
          <p className="text-slate-400">Управляйте преподавателями и курсами вашей организации</p>
        </div>

        {!selectedOrg ? (
          <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Создайте организацию</h2>
              <p className="text-slate-400 mb-6">Начните управлять своими курсами и преподавателями</p>
              
              {!showOrgForm ? (
                <Button
                  onClick={() => setShowOrgForm(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать организацию
                </Button>
              ) : (
                <div className="max-w-md mx-auto text-left space-y-4">
                  <div>
                    <Label className="text-slate-300">Название организации</Label>
                    <Input
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      placeholder="Университет..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Описание</Label>
                    <Textarea
                      value={orgForm.description}
                      onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                      placeholder="О вашей организации..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Веб-сайт</Label>
                    <Input
                      value={orgForm.website}
                      onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                      placeholder="https://..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Email</Label>
                    <Input
                      value={orgForm.contact_email}
                      onChange={(e) => setOrgForm({ ...orgForm, contact_email: e.target.value })}
                      placeholder="contact@..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => createOrgMutation.mutate(orgForm)}
                      disabled={!orgForm.name || createOrgMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600"
                    >
                      Создать
                    </Button>
                    <Button
                      onClick={() => setShowOrgForm(false)}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="teachers" className="space-y-6">
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger value="teachers" className="data-[state=active]:bg-slate-700">
                <Users className="w-4 h-4 mr-2" />
                Преподаватели
              </TabsTrigger>
              <TabsTrigger value="courses" className="data-[state=active]:bg-slate-700">
                <BookOpen className="w-4 h-4 mr-2" />
                Курсы
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
                <Building2 className="w-4 h-4 mr-2" />
                Настройки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teachers">
              <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Преподаватели ({teachers.length})</CardTitle>
                  <Button
                    onClick={() => setShowTeacherForm(true)}
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Пригласить
                  </Button>
                </CardHeader>
                <CardContent>
                  {showTeacherForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-700/50 p-4 rounded-lg mb-4 space-y-3"
                    >
                      <div>
                        <Label className="text-slate-300">Email преподавателя</Label>
                        <Input
                          value={teacherForm.email}
                          onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                          placeholder="teacher@example.com"
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Специализация</Label>
                        <Input
                          value={teacherForm.specialization}
                          onChange={(e) => setTeacherForm({ ...teacherForm, specialization: e.target.value })}
                          placeholder="Математика, Физика..."
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => inviteTeacherMutation.mutate(teacherForm)}
                          disabled={!teacherForm.email || inviteTeacherMutation.isPending}
                          size="sm"
                        >
                          Пригласить
                        </Button>
                        <Button
                          onClick={() => setShowTeacherForm(false)}
                          variant="outline"
                          size="sm"
                          className="border-slate-500"
                        >
                          Отмена
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    {teachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <div>
                          <p className="text-white font-medium">{teacher.specialization || 'Преподаватель'}</p>
                          <p className="text-slate-400 text-sm">{teacher.user_id}</p>
                        </div>
                        <Button
                          onClick={() => deleteTeacherMutation.mutate(teacher.id)}
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {teachers.length === 0 && !showTeacherForm && (
                      <p className="text-center text-slate-400 py-8">Пригласите первого преподавателя</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses">
              <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Курсы организации ({courses.length})</CardTitle>
                  <Button
                    onClick={() => setShowCourseForm(true)}
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Создать курс
                  </Button>
                </CardHeader>
                <CardContent>
                  {showCourseForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-700/50 p-4 rounded-lg mb-4 space-y-3"
                    >
                      <div>
                        <Label className="text-slate-300">Название курса</Label>
                        <Input
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          placeholder="Введение в..."
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300">Описание</Label>
                        <Textarea
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                          placeholder="О чём этот курс..."
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => createCourseMutation.mutate(courseForm)}
                          disabled={!courseForm.title || createCourseMutation.isPending}
                          size="sm"
                        >
                          Создать
                        </Button>
                        <Button
                          onClick={() => setShowCourseForm(false)}
                          variant="outline"
                          size="sm"
                          className="border-slate-500"
                        >
                          Отмена
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid gap-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <div>
                          <p className="text-white font-medium">{course.title}</p>
                          <p className="text-slate-400 text-sm">{course.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="border-slate-500 text-slate-300">
                              {course.difficulty}
                            </Badge>
                            {!course.is_published && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                                Черновик
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="text-slate-400">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => deleteCourseMutation.mutate(course.id)}
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {courses.length === 0 && !showCourseForm && (
                      <p className="text-center text-slate-400 py-8">Создайте первый курс организации</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-slate-800/50 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Настройки организации</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Название</Label>
                    <p className="text-white text-lg">{selectedOrg.name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Описание</Label>
                    <p className="text-slate-400">{selectedOrg.description || 'Не указано'}</p>
                  </div>
                  {selectedOrg.website && (
                    <div>
                      <Label className="text-slate-300">Веб-сайт</Label>
                      <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                        {selectedOrg.website}
                      </a>
                    </div>
                  )}
                  {selectedOrg.contact_email && (
                    <div>
                      <Label className="text-slate-300">Email</Label>
                      <p className="text-slate-400">{selectedOrg.contact_email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}