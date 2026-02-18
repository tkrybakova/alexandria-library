import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, Library, GraduationCap, CreditCard, LogOut, Menu, X, User, Building2, Users } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navItems = [
    { name: 'Главная', page: 'Home', icon: Home },
    ...(isAuthenticated && user?.psycho_test_completed ? [
      { name: 'Курсы', page: 'Courses', icon: GraduationCap },
      { name: 'Библиотека', page: 'Library', icon: Library },
      { name: 'Флеш-карты', page: 'Flashcards', icon: CreditCard },
      ...(user?.faculty_id ? [{ name: 'Чат факультета', page: 'FacultyChat', icon: Users }] : [])
    ] : []),
    ...(isAuthenticated && user?.role === 'admin' ? [
      { name: 'Преподаватель', page: 'InstructorDashboard', icon: GraduationCap },
      { name: 'Организация', page: 'OrganizationAdmin', icon: Building2 }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-blue-50/95 backdrop-blur border-b-4 border-blue-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-blue-900 rounded-sm flex items-center justify-center bg-blue-50">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-900" />
              </div>
              <span className="text-base sm:text-xl font-serif font-bold text-blue-900 hidden sm:inline tracking-wide">BIBLIOTHECA ALEXANDRIA</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all font-medium ${
                    currentPageName === item.page
                      ? 'border-blue-900 text-blue-900'
                      : 'border-transparent text-blue-600 hover:text-blue-900 hover:border-blue-400'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-serif">{item.name}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to={createPageUrl('Profile')}>
                    <Button variant="ghost" size="icon" className="text-blue-700 hover:text-blue-900 border border-blue-300 hover:border-blue-900">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button
                    onClick={() => base44.auth.logout()}
                    variant="ghost"
                    size="icon"
                    className="text-blue-700 hover:text-blue-900 border border-blue-300 hover:border-blue-900 hidden md:flex"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-serif border-2 border-blue-900"
                >
                  Войти
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-blue-900 border border-blue-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-blue-200 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 border-l-4 transition-colors font-serif ${
                    currentPageName === item.page
                      ? 'border-blue-900 bg-blue-100 text-blue-900'
                      : 'border-transparent text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    base44.auth.logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 border-l-4 border-transparent text-blue-600 hover:bg-blue-50 w-full font-serif"
                >
                  <LogOut className="w-5 h-5" />
                  Выйти
                </button>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-blue-50 border-t-4 border-blue-900 py-8 sm:py-12 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="border-b-2 border-blue-300 pb-6 mb-6">
            <div className="h-1 bg-blue-900 w-32 mx-auto mb-4"></div>
          </div>
          <p className="text-center text-blue-600 font-serif italic">
            © MMXXVI · Bibliotheca Alexandria · Templum Sapientiae
          </p>
        </div>
      </footer>
    </div>
  );
}