import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/auth.store';
import { Avatar, Icon } from '@/ui/components/Base';
import { Image } from '@/ui/components/Embed';
import { Container } from '@/ui/components/Grid';
import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarDropdown,
  NavbarDropdownDivider,
  NavbarDropdownItem,
  NavbarDropdownMenu,
  NavbarDropdownToggle,
  NavbarItem,
  NavbarNav,
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
  min-height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.body};
  overflow-x: hidden;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 100vh;
`;

const MainContent = styled(Container).attrs({ as: 'main' })`
  flex: 1 0 auto;
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
  { label: 'Journal intime', path: '/journal', icon: 'book-lock-outline' },
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
        {/* SIDEBAR : Menu principal des modules métier                       */}
        {/* ================================================================= */}
        <Sidebar width="260px" breakpoint="md">
          {/* Logo & Identité */}
          <SidebarHeader>
            <BrandLink to="/todos">
              <Image
                src="/images/logo.webp"
                srcSet="/images/logo.webp"
                width={32}
                alt="Logo de l'application To-Do App"
              />
              <Text weight="semibold" size="base" color="heading">
                To-Do App
              </Text>
            </BrandLink>
          </SidebarHeader>

          {/* Navigation par sections */}
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

          {/* Pied de la Sidebar : aperçu utilisateur & raccourci déconnexion */}
          <SidebarFooter>
            <UserProfilePreview>
              <Avatar
                name={user?.username ?? 'Utilisateur'}
                src={user?.avatar ?? undefined}
                size="sm"
              />
              <UserMeta>
                <Text weight="semibold" size="xs" color="heading" truncate>
                  {user?.username ?? 'Utilisateur'}
                </Text>
                <Text size="xs" color="muted" truncate>
                  {user?.email ?? ''}
                </Text>
              </UserMeta>
            </UserProfilePreview>
          </SidebarFooter>
        </Sidebar>

        {/* ================================================================= */}
        {/* ZONE DE CONTENU : Navbar supérieure + Outlet central              */}
        {/* ================================================================= */}
        <ContentArea>
          <Navbar sticky breakpoint="md">
            {/* Toggler pour afficher la sidebar sur mobile */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <SidebarToggle />
              <NavbarBrand>
                <Text weight="medium" size="sm" color="heading">
                  Mon Espace
                </Text>
              </NavbarBrand>
            </div>

            {/* Menu Navbar Collapse avec profil, thème et déconnexion */}
            <NavbarCollapse>
              <NavbarNav as="ul" style={{ marginLeft: 'auto' }}>
                <NavbarItem as="li">
                  <NavbarDropdown>
                    <AvatarToggle aria-label="Menu du compte utilisateur">
                      <Avatar
                        name={user?.username ?? 'Utilisateur'}
                        src={user?.avatar ?? undefined}
                        size="base"
                      />
                    </AvatarToggle>

                    <NavbarDropdownMenu align="right">
                      {/* Lien vers le profil (/profile) */}
                      <NavbarDropdownItem as={Link} to="/profile">
                        <MenuActionContent>
                          <span>Mon profil</span>
                          <Icon name="account" size={18} />
                        </MenuActionContent>
                      </NavbarDropdownItem>

                      <NavbarDropdownDivider />

                      {/* Bascule du thème Sombre / Clair */}
                      <NavbarDropdownItem onClick={toggleTheme}>
                        <MenuActionContent>
                          <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
                          <Icon
                            name={isDark ? 'weather-sunny' : 'weather-night'}
                            size={18}
                          />
                        </MenuActionContent>
                      </NavbarDropdownItem>

                      <NavbarDropdownDivider />

                      {/* Déconnexion */}
                      <NavbarDropdownItem as={Link} to="/logout">
                        <MenuActionContent>
                          <span>Se déconnecter</span>
                          <Icon name="logout" size={18} />
                        </MenuActionContent>
                      </NavbarDropdownItem>
                    </NavbarDropdownMenu>
                  </NavbarDropdown>
                </NavbarItem>
              </NavbarNav>
            </NavbarCollapse>
          </Navbar>

          {/* Affichage des pages enfants */}
          <MainContent>
            <Outlet />
          </MainContent>
        </ContentArea>
      </DashboardRoot>
    </SidebarProvider>
  );
};