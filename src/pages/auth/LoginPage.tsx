import { fetchLogin } from '@/services/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/ui/components/Base/Button';
import { Card } from '@/ui/components/Content/Card';
import { Alert } from '@/ui/components/Feedback/Alert';
import { TextField } from '@/ui/components/Forms/Fields/TextField';
import { Text } from '@/ui/components/Typo/Text';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, "L'identifiant est obligatoire"),
  password: z.string().min(1, 'Le mot de passe est obligatoire'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const response = await fetchLogin(data);

      // Stockage explicite du token dans le localStorage et mise à jour du store
      localStorage.setItem('todo_auth_token', response.token);
      setAuth(response.token, response.user);

      navigate('/');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur de connexion');
    }
  };

  return (
    <Card elevation="sm">
      <Card.Header>
        <Card.Title>Connexion</Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {apiError && (
            <div style={{ marginBottom: '1rem' }}>
              <Alert variant="danger">{apiError}</Alert>
            </div>
          )}

          <TextField
            label="Identifiant"
            type="text"
            placeholder="Ex : john_doe"
            error={errors.username?.message}
            {...register('username')}
          />

          <TextField
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" loading={isSubmitting} fullWidth>
            Se connecter
          </Button>
        </form>
      </Card.Body>
      <Card.Footer style={{ justifyContent: 'center' }}>
        <Text size="sm">
          Pas encore de compte ?{' '}
          <RouterLink
            to="/register"
            style={{ color: 'inherit', fontWeight: 600 }}
          >
            Créer un compte
          </RouterLink>
        </Text>
      </Card.Footer>
    </Card>
  );
};
