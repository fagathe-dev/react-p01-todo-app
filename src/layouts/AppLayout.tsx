import { useTheme } from '@/hooks/useTheme';
import { Link } from '@/ui/components/Base';
import { Icon } from '@/ui/components/Base/Icon';
import { IconButton } from '@/ui/components/Base/IconButton';
import { Container } from '@/ui/components/Grid/Container';
import {
  Navbar,
  NavbarBrand,
  NavbarItem,
  NavbarNav,
} from '@/ui/components/Navigation/Navbar';
import { Text } from '@/ui/components/Typo/Text';
import { Outlet, useNavigate } from 'react-router-dom';
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

export const AppLayout = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <LayoutRoot>
      <Navbar $sticky>
        <NavbarBrand>
          <Icon
            name="check-decagram"
            size={24}
            color={theme.colors.primary.base}
          />
          <Text weight="semibold" size="base">
            <Link href="/">To-Do App</Link>
          </Text>
        </NavbarBrand>

        <NavbarNav>
          <NavbarItem>
            <IconButton
              name={isDark ? 'weather-sunny' : 'weather-night'}
              aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
              onClick={toggleTheme}
              size="base"
            />
          </NavbarItem>
          <NavbarItem>
            <Link href="/logout">
              <IconButton
                name="logout"
                aria-label="Se déconnecter"
                size="base"
              />
            </Link>
          </NavbarItem>
        </NavbarNav>
      </Navbar>

      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutRoot>
  );
};
