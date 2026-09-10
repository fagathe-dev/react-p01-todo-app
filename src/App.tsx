import { useTheme } from '@/hooks/useTheme';
import { router } from '@/router';
import { GlobalStyle } from '@/ui/theme/GlobalStyle';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

export const App = () => {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
