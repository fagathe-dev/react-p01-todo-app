import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import {
  JournalCreatePage,
  JournalDetailsPage,
  JournalEditPage,
  JournalsPage,
  LoginPage,
  NotesArchivePage,
  NotesPage,
  NotesTrashPage,
  ProfilePage,
  RegisterPage,
  TagsPage,
  TodoPage,
} from '@/pages';
import { ProtectedRoute } from '@/router/protectedRoute';
import { PublicRoute } from '@/router/publicRoute';
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  // 1. Espace connecté (Sidebar Dashboard via AppLayout)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // Redirection racine vers les todos
          {
            path: '/',
            element: <Navigate to="/todos" replace />,
          },

          // Module Todos
          {
            path: '/todos',
            element: <TodoPage />,
          },

          // Module Tags
          {
            path: '/tags',
            element: <TagsPage />,
          },

          // Module Notes
          {
            path: '/notes',
            element: <NotesPage />,
          },
          {
            path: '/archives',
            element: <NotesArchivePage />,
          },
          {
            path: '/trash',
            element: <NotesTrashPage />,
          },

          // Module Journal intime
          {
            path: '/journal',
            children: [
              { index: true, element: <JournalsPage /> },
              { path: 'new', element: <JournalCreatePage /> },
              { path: ':journalId', element: <JournalDetailsPage /> },
              { path: ':journalId/edit', element: <JournalEditPage /> },
            ],
          },

          // Gestion du compte & profil
          {
            path: '/profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  // 2. Espace public (Connexion & Inscription)
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
          {
            path: '/register',
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },

  // 3. Fallback 404
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
