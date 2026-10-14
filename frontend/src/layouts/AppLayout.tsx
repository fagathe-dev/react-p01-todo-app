import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar, Icon } from '@/ui/components/Base';
import { Image } from '@/ui/components/Embed';
import { Container } from '@/ui/components/Grid';
import {
  Navbar,
  NavbarBrand,
  NavbarDropdown,
  NavbarDropdownDivider,
  NavbarDropdownItem,
  NavbarDropdownMenu,
  NavbarDropdownToggle,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarProvider,
  SidebarSection,
  SidebarToggle,
} from '@/ui/components/Navigation';
import { Text } from '@/ui/components/Typo';
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// ---------------------------------------------------------------------------
// Styles du Layout Dashboard
// ---------------------------------------------------------------------------

const DashboardRoot = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.body};
  overflow: hidden;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
`;

const ScrollArea = styled.main`
  flex: 1;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;

  /* Défilement fluide et discret */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.radii.full};
  }
`;

const MainContent = styled(Container)`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[6]};
`;

const BrandLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  text-decoration: none;
  color: inherit;
`;

const AvatarToggle = styled(NavbarDropdownToggle)`
  padding: 0;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.radii.full};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;

  &:hover {
    background: transparent;
    opacity: 0.85;
  }
`;

const MenuActionContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const UserProfilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2.5]};
  overflow: hidden;
`;

const UserMeta = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

// ---------------------------------------------------------------------------
// Configuration des menus de la Sidebar
// ---------------------------------------------------------------------------

interface NavModule {
  label: string;
  path: string;
  icon: string;
}

const PRIMARY_MODULES: NavModule[] = [
  { label: 'Tâches', path: '/todos', icon: 'format-list-checks' },
  { label: 'Notes', path: '/notes', icon: 'note-text-outline' },
  { label: 'Journal', path: '/journal', icon: 'book-lock-outline' },
  { label: 'Tags', path: '/tags', icon: 'tag-outline' },
];

const ARCHIVE_MODULES: NavModule[] = [
  { label: 'Archives', path: '/archives', icon: 'archive-outline' },
  { label: 'Corbeille', path: '/trash', icon: 'trash-can-outline' },
];

// ---------------------------------------------------------------------------
// Composant AppLayout
// ---------------------------------------------------------------------------

export const AppLayout: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const location = useLocation();

  const isCurrentPath = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <SidebarProvider breakpoint="md">
      <DashboardRoot>
        {/* ================================================================= */}
        {/* SIDEBAR : Reste fixe à gauche, avec son propre scroll interne     */}
        {/* ================================================================= */}
        <Sidebar width="260px" breakpoint="md">
          <SidebarHeader>
            <BrandLink to="/todos">
              <Image
                src="/images/logo.webp"
                srcSet="/images/logo.webp"
                width={32}
                alt="Logo de l'application To-Do App"
              />
            </BrandLink>
          </SidebarHeader>

          <SidebarNav>
            <SidebarSection>Espaces de travail</SidebarSection>
            {PRIMARY_MODULES.map(({ label, path, icon }) => {
              const active = isCurrentPath(path);
              return (
                <SidebarItem key={path}>
                  <SidebarLink
                    as={Link}
                    to={path}
                    active={active}
                    icon={<Icon name={icon} size={18} />}
                    aria-current={active ? 'page' : undefined}
                  >
                    {label}
                  </SidebarLink>
                </SidebarItem>
              );
            })}

            <SidebarSection>Système</SidebarSection>
            {ARCHIVE_MODULES.map(({ label, path, icon }) => {
              const active = isCurrentPath(path);
              return (
                <SidebarItem key={path}>
                  <SidebarLink
                    as={Link}
                    to={path}
                    active={active}
                    icon={<Icon name={icon} size={18} />}
                    aria-current={active ? 'page' : undefined}
                  >
                    {label}
                  </SidebarLink>
                </SidebarItem>
              );
            })}
          </SidebarNav>

          <SidebarFooter>
            <UserProfilePreview>
              <Avatar name={user?.username ?? 'Utilisateur'} src={user?.avatar ?? undefined} size="sm" />
              <UserMeta>
                <Text weight="semibold" size="xs" color="tertiary">
                  {user?.username ?? 'Utilisateur'}
                </Text>
                <Text size="xs" color="muted">
                  {user?.email ?? ''}
                </Text>
              </UserMeta>
            </UserProfilePreview>
          </SidebarFooter>
        </Sidebar>

        {/* ================================================================= */}
        {/* ZONE DE CONTENU : Navbar fixe en haut, ScrollArea seule à défiler */}
        {/* ================================================================= */}
        <ContentArea>
          <Navbar sticky breakpoint="md">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <SidebarToggle />
              <NavbarBrand>
                <Text weight="medium" size="sm" color="tertiary" style={{ paddingInline: 10 }}>
                  Mon Espace
                </Text>
              </NavbarBrand>
            </div>

            {/* L'avatar est placé directement ici : visible sur toutes les résolutions */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <NavbarDropdown>
                <AvatarToggle aria-label="Menu du compte utilisateur">
                  <Avatar name={user?.username ?? 'Utilisateur'} src={user?.avatar ?? undefined} size="base" />
                </AvatarToggle>

                <NavbarDropdownMenu align="right">
                  <NavbarDropdownItem as={Link} to="/profile">
                    <MenuActionContent>
                      <span>Mon profil</span>
                      <Icon name="account" size={18} />
                    </MenuActionContent>
                  </NavbarDropdownItem>

                  <NavbarDropdownDivider />

                  <NavbarDropdownItem onClick={toggleTheme}>
                    <MenuActionContent>
                      <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
                      <Icon name={isDark ? 'weather-sunny' : 'weather-night'} size={18} />
                    </MenuActionContent>
                  </NavbarDropdownItem>

                  <NavbarDropdownDivider />

                  <NavbarDropdownItem as={Link} to="/logout">
                    <MenuActionContent>
                      <span>Se déconnecter</span>
                      <Icon name="logout" size={18} />
                    </MenuActionContent>
                  </NavbarDropdownItem>
                </NavbarDropdownMenu>
              </NavbarDropdown>
            </div>
          </Navbar>

          <ScrollArea>
            <MainContent fluid style={{ maxWidth: 1500, marginInline: 'auto' }}>
              <Outlet />
            </MainContent>
          </ScrollArea>
        </ContentArea>
      </DashboardRoot>
    </SidebarProvider>
  );
};
