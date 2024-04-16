import { FC, useCallback, useState } from 'react';
import { CommentAutoModType, LivePublic } from 'api-types/common/types';
import {
  Button,
  Heading,
  HStack,
  Input,
  Link,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { useAutoMods } from '~/utils/hooks/api/use-auto-mods';
import { getDocsUrl } from '~/utils/constants';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useAuth } from '~/utils/hooks/use-auth';
import { client } from '~/utils/api/client';

type Props = {
  live: LivePublic;
};

export const AutoMods: FC<Props> = ({ live }) => {
  const { headers } = useAuth();
  const [autoMods, mutateAutoMods] = useAutoMods(live.tenant.id);
  const [type, setType] = useState<CommentAutoModType>('Text');
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<unknown>();
  useAPIError(apiError);

  const handleRemove = useCallback(
    async (id: number) => {
      try {
        if (!headers) {
          return;
        }

        await client.v1.tenants
          ._tenantId(live.tenant.id)
          .auto_mod._id(id)
          .$delete({
            headers
          });
        await mutateAutoMods();
      } catch (error) {
        setApiError(error);
      }
    },
    [headers, live, mutateAutoMods]
  );

  const handleSubmit = useCallback(async () => {
    try {
      if (!headers || !value) {
        return;
      }

      setIsLoading(true);
      await client.v1.tenants._tenantId(live.tenant.id).auto_mod.post({
        body: {
          type,
          value
        },
        headers
      });
      await mutateAutoMods();
      setValue('');
    } catch (error) {
      setApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [headers, live, mutateAutoMods, type, value]);

  return (
    <Stack spacing={6}>
      <Heading size="sm">
        <HStack spacing={3}>
          <Text>オートモデレーション</Text>
          <Link href={autoModDocs} isExternal fontWeight="normal" fontSize="sm">
            オートモデレーションについて <ExternalLinkIcon mx="2px" />
          </Link>
        </HStack>
      </Heading>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>タイプ</Th>
              <Th>値</Th>
              <Th>アクション</Th>
            </Tr>
          </Thead>
          <Tbody>
            {autoMods?.map(item => (
              <Tr key={item.id}>
                <Td>
                  {item.type === 'Account'
                    ? 'アカウント'
                    : item.type === 'Domain'
                      ? 'ドメイン'
                      : 'テキスト'}
                </Td>
                <Td>{item.value}</Td>
                <Td>
                  <Button
                    colorScheme="red"
                    variant="link"
                    onClick={() => void handleRemove(item.id)}
                  >
                    削除
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Heading size="sm">オートモデレーション ルールを追加</Heading>

      <HStack spacing={2}>
        <Select
          value={type}
          onChange={e => setType(e.target.value as CommentAutoModType)}
          width="25%"
        >
          <option value="Text">テキスト（部分一致）</option>
          <option value="Account">アカウント</option>
          <option value="Domain">ドメイン（後方一致）</option>
        </Select>
        <Input
          placeholder={
            type === 'Text'
              ? 'テキスト'
              : type === 'Account'
                ? 'アカウント 例: knzk@knzk.me'
                : 'ドメイン 例: knzk.me'
          }
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <Button
          colorScheme="blue"
          onClick={() => void handleSubmit()}
          disabled={!value}
          isLoading={isLoading}
        >
          追加
        </Button>
      </HStack>
    </Stack>
  );
};

const autoModDocs = getDocsUrl('help/auto-mod');
