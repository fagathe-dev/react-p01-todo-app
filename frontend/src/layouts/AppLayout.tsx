import { useTheme } from '@/hooks/useTheme';
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
  NavbarLink,
  NavbarNav,
  NavbarToggle,
} from '@/ui/components/Navigation';
import { Text } from '@/ui/components/Typo';
import { Link, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const LayoutRoot = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.body};
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

const ThemeToggleContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const NAV_ITEMS = [
  { label: 'Tâches', path: '/todos' },
  { label: 'Notes', path: '/notes' },
  { label: 'Tags', path: '/tags' },
  { label: 'Mémoires', path: '/memories' },
];

export const AppLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const isCurrentPath = (path: string) => location.pathname.startsWith(path);

  return (
    <LayoutRoot>
      <Navbar sticky breakpoint="md">
        <NavbarBrand>
          <BrandLink to="/">
            <Image
              src="/images/logo.webp"
              srcSet="/images/logo.webp"
              width={35}
              alt="Logo de l'application Todo App"
            />
            <Text weight="semibold" size="base" color="muted">
              To-Do App
            </Text>
          </BrandLink>
        </NavbarBrand>

        {/* Bouton burger visible sous le breakpoint "md" */}
        <NavbarToggle />

        {/* Zone repliable sous le breakpoint "md" */}
        <NavbarCollapse>
          {/* Navigation principale */}
          <NavbarNav as="ul">
            {NAV_ITEMS.map(({ label, path }) => {
              const active = isCurrentPath(path);
              return (
                <NavbarItem as="li" key={path}>
                  <NavbarLink
                    as={Link}
                    to={path}
                    $active={active}
                    aria-current={active ? 'page' : undefined}
                  >
                    {label}
                  </NavbarLink>
                </NavbarItem>
              );
            })}
          </NavbarNav>

          {/* Menu utilisateur / Dropdown */}
          <NavbarNav as="ul">
            <NavbarItem as="li">
              <NavbarDropdown>
                <AvatarToggle aria-label="Menu du profil utilisateur">
                  <Avatar name="Utilisateur" size="base" />
                </AvatarToggle>

                <NavbarDropdownMenu align="right">
                  {/* Bascule Thème clair / sombre */}
                  <NavbarDropdownItem onClick={toggleTheme}>
                    <ThemeToggleContent>
                      <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
                      <Icon
                        name={isDark ? 'weather-sunny' : 'weather-night'}
                        size={18}
                      />
                    </ThemeToggleContent>
                  </NavbarDropdownItem>

                  <NavbarDropdownDivider />

                  {/* Lien de déconnexion */}
                  <NavbarDropdownItem as={Link} to="/logout">
                    <ThemeToggleContent>
                      <span>Se déconnecter</span>
                      <Icon name="logout" size={18} />
                    </ThemeToggleContent>
                  </NavbarDropdownItem>
                </NavbarDropdownMenu>
              </NavbarDropdown>
            </NavbarItem>
          </NavbarNav>
        </NavbarCollapse>
      </Navbar>

      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutRoot>
  );
};
