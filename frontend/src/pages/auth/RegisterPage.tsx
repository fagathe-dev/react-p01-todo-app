import { fetchLogin, fetchRegister } from '@/services/auth.api';
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

const registerSchema = z
  .object({
    email: z
      .email("Format d'e-mail invalide")
      .min(1, "L'adresse e-mail est obligatoire"),
    username: z
      .string()
      .trim()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
      .max(90, "Le nom d'utilisateur doit contenir au maximum 90 caractères"),
    password: z
      .string()
      .min(8, 'Le mot de passe doit comporter au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      // 1. Inscription sur l'API Symfony
      await fetchRegister({
        email: data.email,
        username: data.username,
        password: data.password,
      });

      // 2. Connexion immédiate avec l'adresse e-mail
      const loginResponse = await fetchLogin({
        username: data.email,
        password: data.password,
      });

      setAuth(loginResponse.token, loginResponse.user);
      navigate('/');
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Erreur lors de l'inscription"
      );
    }
  };

  return (
    <Card elevation="sm">
      <Card.Header>
        <Card.Title>Créer un compte</Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {apiError && (
            <div style={{ marginBottom: '1rem' }}>
              <Alert variant="danger">{apiError}</Alert>
            </div>
          )}

          <TextField
            label="Adresse e-mail"
            type="email"
            placeholder="Ex : john@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <TextField
            label="Nom d'utilisateur"
            type="text"
            placeholder="Ex : john_doe"
            error={errors.username?.message}
            {...register('username')}
          />

          <TextField
            label="Mot de passe"
            type="password"
            placeholder="Min. 8 car., 1 majuscule, 1 chiffre"
            error={errors.password?.message}
            {...register('password')}
          />

          <TextField
            label="Confirmer le mot de passe"
            type="password"
            placeholder="Retapez votre mot de passe"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" loading={isSubmitting} fullWidth>
            S'inscrire
          </Button>
        </form>
      </Card.Body>
      <Card.Footer style={{ justifyContent: 'center' }}>
        <Text size="sm">
          Déjà inscrit ?{' '}
          <RouterLink to="/login" style={{ color: 'inherit', fontWeight: 600 }}>
            Se connecter
          </RouterLink>
        </Text>
      </Card.Footer>
    </Card>
  );
};
