import { FC, Fragment } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  MenuDivider,
  MenuGroup,
  LinkOverlay,
  LinkBox
} from '@chakra-ui/react';
import { useAuth } from '~/utils/hooks/use-auth';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMyTenants } from '~/utils/hooks/api/use-my-tenant';
import Link from 'next/link';
import { TenantPublic } from 'server/src/models/tenant';
import { LivePublic } from 'server/src/models/live';

type Props = {
  tenant?: TenantPublic;
  onCreateLive: () => void;
  recentLive?: LivePublic;
};

export const User: FC<Props> = ({ tenant, onCreateLive, recentLive }) => {
  const { signOut } = useAuth();
  const intl = useIntl();
  const [me] = useUsersMe();
  const [myTenants] = useMyTenants();
  const displayName = me?.displayName || me?.account || '?';

  return (
    <Menu>
      <MenuButton
        as={Avatar}
        name={displayName}
        src={me?.avatarUrl}
        cursor="pointer"
        size="sm"
      />

      <MenuList>
        <MenuGroup
          title={intl.formatMessage(
            { id: 'navbar.menu.hello' },
            { displayName }
          )}
        >
          <Link href="/account/settings" passHref>
            <MenuItem as="a">
              <FormattedMessage id="navbar.menu.account-settings" />
            </MenuItem>
          </Link>

          <MenuItem onClick={signOut}>
            <FormattedMessage id="navbar.logout" />
          </MenuItem>
        </MenuGroup>

        {myTenants?.map(t => (
          <Fragment key={t.id}>
            <MenuDivider />

            {tenant?.domain === t.domain ? (
              <MenuGroup
                title={intl.formatMessage(
                  { id: 'navbar.menu.current-tenant' },
                  { domain: t.domain }
                )}
              >
                {recentLive &&
                recentLive.tenantId === t.id &&
                recentLive.status !== 'Ended' ? (
                  <Link href={`/watch/${recentLive.idInTenant}`} passHref>
                    <MenuItem as="a">
                      <FormattedMessage id="navbar.menu.stream-link" />
                    </MenuItem>
                  </Link>
                ) : (
                  <MenuItem onClick={onCreateLive}>
                    <FormattedMessage id="navbar.menu.start-stream" />
                  </MenuItem>
                )}

                <Link href="/tenant/settings" passHref>
                  <MenuItem as="a">
                    <FormattedMessage id="navbar.menu.tenant-settings" />
                  </MenuItem>
                </Link>
              </MenuGroup>
            ) : (
              <MenuGroup title={t.domain}>
                <LinkBox as={MenuItem}>
                  <LinkOverlay href={`https://${t.domain}`} isExternal>
                    <FormattedMessage id="navbar.menu.change-tenant" />
                  </LinkOverlay>
                </LinkBox>
              </MenuGroup>
            )}
          </Fragment>
        ))}
      </MenuList>
    </Menu>
  );
};
