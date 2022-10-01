import { FC, Fragment } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  MenuDivider,
  MenuGroup
} from '@chakra-ui/react';
import { useAuth } from '~/utils/hooks/use-auth';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { FormattedMessage, useIntl } from 'react-intl';
import { useMyTenants } from '~/utils/hooks/api/use-my-tenant';
import Link from 'next/link';
import { TenantPublic, LivePrivate } from 'api-types/common/types';

type Props = {
  onCreateLive: (tenant: TenantPublic, previousLive?: LivePrivate) => void;
};

export const User: FC<Props> = ({ onCreateLive }) => {
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

        {myTenants?.map(({ tenant, recentLive }) => (
          <Fragment key={tenant.id}>
            <MenuDivider />

            <MenuGroup title={`@${tenant.slug}`}>
              {recentLive && !recentLive.endedAt ? (
                <Link
                  href={`/@${tenant.slug}/${recentLive.idInTenant}`}
                  passHref
                >
                  <MenuItem as="a">
                    <FormattedMessage id="navbar.menu.stream-link" />
                  </MenuItem>
                </Link>
              ) : (
                <MenuItem onClick={() => onCreateLive(tenant, recentLive)}>
                  <FormattedMessage id="navbar.menu.start-stream" />
                </MenuItem>
              )}

              {/*
              <Link href={`/@${tenant.slug}/history`} passHref>
                <MenuItem as="a">
                  <FormattedMessage id="navbar.menu.channel-history" />
                </MenuItem>
              </Link>
              */}

              <Link href={`/@${tenant.slug}/settings`} passHref>
                <MenuItem as="a">
                  <FormattedMessage id="navbar.menu.channel-settings" />
                </MenuItem>
              </Link>
            </MenuGroup>
          </Fragment>
        ))}
      </MenuList>
    </Menu>
  );
};
