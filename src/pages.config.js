/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Assignment from './pages/Assignment';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import FacultyChat from './pages/FacultyChat';
import Home from './pages/Home';
import InstructorDashboard from './pages/InstructorDashboard';
import Lesson from './pages/Lesson';
import Library from './pages/Library';
import OrganizationAdmin from './pages/OrganizationAdmin';
import Profile from './pages/Profile';
import PsychTest from './pages/PsychTest';
import Flashcards from './pages/Flashcards';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Assignment": Assignment,
    "CourseDetail": CourseDetail,
    "Courses": Courses,
    "Dashboard": Dashboard,
    "FacultyChat": FacultyChat,
    "Home": Home,
    "InstructorDashboard": InstructorDashboard,
    "Lesson": Lesson,
    "Library": Library,
    "OrganizationAdmin": OrganizationAdmin,
    "Profile": Profile,
    "PsychTest": PsychTest,
    "Flashcards": Flashcards,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};