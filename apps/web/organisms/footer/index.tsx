import {
  Box,
  Container,
  Stack,
  Link as ChakraLink,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  LinkOverlay,
  LinkBox,
  HStack
} from '@chakra-ui/react';
import Link from 'next/link';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { FiGithub, FiGlobe } from 'react-icons/fi';
import { localeNames, SupportedLocale, supportedLocales } from '~/locales';
import { useRouter } from 'next/router';

export const Footer: FC = () => {
  const { query } = useRouter();
  const locale = query.locale as SupportedLocale;

  return (
    <Box marginTop="auto">
      <Container as={Stack} maxW="full" py={8}>
        <Divider mb={2} />

        <HStack flexWrap="wrap" spacing={6}>
          <Box color="gray.400">
            <ChakraLink href="https://github.com/nzws/knzklive2" isExternal>
              <Icon as={FiGithub} mr={2} />
              nzws/knzklive2
            </ChakraLink>
          </Box>

          <Box color="gray.400">
            <ChakraLink
              href="https://nzws.notion.site/knzk-live-cbc2512a7ced4c80b93536d5ab671d13"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FormattedMessage id="footer.terms-and-privacy" />
            </ChakraLink>
          </Box>

          <Box color="gray.400">
            <ChakraLink href="/about" as={Link}>
              <FormattedMessage id="page.about.title" />
            </ChakraLink>
          </Box>

          <Box color="gray.400">
            <ChakraLink
              href="https://github.com/nzws/knzklive2/releases"
              isExternal
            >
              <FormattedMessage id="footer.release-note" />
            </ChakraLink>
          </Box>

          <Box color="gray.400">
            <ChakraLink href="https://github.com/sponsors/nzws" isExternal>
              <FormattedMessage id="footer.donate" />
            </ChakraLink>
          </Box>

          <Box color="gray.400">
            <Menu>
              <MenuButton as={ChakraLink}>
                <Icon as={FiGlobe} mr={2} pt={1} />
                {localeNames[locale]}
              </MenuButton>

              <MenuList>
                {supportedLocales.map(locale => (
                  <LinkBox as={MenuItem} key={locale}>
                    <LinkOverlay href={`?lang=${locale}`}>
                      {localeNames[locale]}
                    </LinkOverlay>
                  </LinkBox>
                ))}
              </MenuList>
            </Menu>
          </Box>
        </HStack>
      </Container>
    </Box>
  );
};
