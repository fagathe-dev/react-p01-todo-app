import { fetchLogin, fetchProfile } from '@/services/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/ui/components/Base/Button';
import { Card } from '@/ui/components/Content/Card';
import { Alert } from '@/ui/components/Feedback/Alert';
import { TextField } from '@/ui/components/Forms/Fields/TextField';
import { Text } from '@/ui/components/Typo/Text';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { z } from 'zod';

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "L'identifiant est obligatoire")
    .refine(
      (val) => {
        const isEmail = z.email().safeParse(val).success;
        const isUsername = val.length >= 3;
        return isEmail || isUsername;
      },
      {
        message:
          "Veuillez renseigner une adresse e-mail valide ou un nom d'utilisateur (au moins 3 caractères)",
      }
    ),
  password: z.string().min(1, 'Le mot de passe est obligatoire'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const { setAuth, token, user } = useAuthStore();
  const navigate = useNavigate();

  // Redirection automatique si une session valide est déjà active
  useEffect(() => {
    if (token && user) {
      navigate('/', { replace: true });
    }
  }, [token, user, navigate]);

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
      // 1. Récupération du JWT Lexik
      const { token } = await fetchLogin(data);

      // 2. Récupération du profil utilisateur associé
      const userProfile = await fetchProfile(token);

      // 3. Hydratation complète du store et redirection
      setAuth(token, userProfile);
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
            label="E-mail ou nom d'utilisateur"
            type="text"
            placeholder="Ex : john@example.com ou johndoe"
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
