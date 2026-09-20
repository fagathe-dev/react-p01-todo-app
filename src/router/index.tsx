import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { TagsPage } from '@/pages/tags/TagsPage';
import { TasksPage } from '@/pages/tasks/TasksPage';
import { ProtectedRoute } from '@/router/protectedRoute';
import { PublicRoute } from '@/router/publicRoute';
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  // 1. Espace connecté : redirection vers /login si déconnecté
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: <TasksPage />,
          },
          {
            path: '/tags',
            element: <TagsPage />,
          },
        ],
      },
    ],
  },

  // 2. Espace visiteur : redirection vers / si déjà connecté
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

  // 3. Redirection par défaut (routes inexistantes)
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
