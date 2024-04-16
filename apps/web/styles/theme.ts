import { extendTheme } from '@chakra-ui/react';

export const generateTheme = () =>
  extendTheme({
    fonts: {
      body: "'Noto Sans JP', sans-serif",
      heading: "'Noto Sans JP', sans-serif"
    },
    initialColorMode: 'dark',
    useSystemColorMode: false
  });
