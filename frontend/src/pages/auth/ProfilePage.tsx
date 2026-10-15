import { deleteAccount } from '@/services/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/ui/components/Base/Button';
import { Icon } from '@/ui/components/Base/Icon';
import { TabContent, TabList, Tabs, TabTrigger } from '@/ui/components/Navigation/Tabs';
import { Text } from '@/ui/components/Typo/Text';
import { Title } from '@/ui/components/Typo/Title';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  ChangeAvatarForm,
  ChangeEmailForm,
  ChangeInformationsForm,
  ChangeJournalPasscodeForm,
  ChangePasswordForm,
} from './components';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 820px;
  width: 100%;
`;

const ProfileBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  flex-wrap: wrap;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DangerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border: 1px solid #fecaca;
  background-color: #fef2f2;
  border-radius: ${({ theme }) => theme.radii.base};
  max-width: 640px;
  flex-wrap: wrap;
`;

export const ProfilePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ');

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Attention : la suppression de votre compte est définitive. Toutes vos notes, tâches, entrées de journal et fichiers seront supprimés. Continuer ?'
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteAccount();
      logout();
      navigate('/login');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageContainer>
      <Title as="h2">Mon Profil</Title>

      <ProfileBanner>
        <ChangeAvatarForm />
        <div>
          <Title as="h3" style={{ margin: 0 }}>
            {fullName || user.username}
          </Title>
          <Text size="sm" color="muted">
            @{user.username} • {user.email}
          </Text>
        </div>
      </ProfileBanner>

      <Tabs defaultValue="informations">
        <TabList>
          <TabTrigger value="informations">
            <Icon name="account-outline" size={16} />
            <span>Informations</span>
          </TabTrigger>

          <TabTrigger value="security">
            <Icon name="shield-lock-outline" size={16} />
            <span>Sécurité & Connexion</span>
          </TabTrigger>

          <TabTrigger value="danger">
            <Icon name="alert-octagon-outline" size={16} />
            <span>Danger Zone</span>
          </TabTrigger>
        </TabList>

        <TabContent value="informations">
          <ChangeInformationsForm />
        </TabContent>

        <TabContent value="security">
          <Stack>
            <ChangeEmailForm />
            <ChangePasswordForm />
            <ChangeJournalPasscodeForm />
          </Stack>
        </TabContent>

        <TabContent value="danger">
          <DangerCard>
            <div style={{ maxWidth: 420 }}>
              <Title as="h4" style={{ margin: 0, color: '#991b1b' }}>
                Supprimer définitivement le compte
              </Title>
              <Text size="xs" style={{ color: '#b91c1c', marginTop: 4 }}>
                Cette action est irréversible et supprimera toutes vos données ainsi que vos fichiers stockés sur le
                serveur.
              </Text>
            </div>

            <Button
              type="button"
              loading={deleting}
              onClick={handleDeleteAccount}
              style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none' }}
            >
              Supprimer mon compte
            </Button>
          </DangerCard>
        </TabContent>
      </Tabs>
    </PageContainer>
  );
};
