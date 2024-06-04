import {
  Grid,
  GridItem,
  HStack,
  Heading,
  Text,
  VStack
} from '@chakra-ui/react';
import { LiveStats } from 'api-types/common/types';
import { FC } from 'react';
import {
  FiArrowDown,
  FiArrowUp,
  FiMic,
  FiMinus,
  FiRadio,
  FiVideo
} from 'react-icons/fi';

interface Props {
  isPushing: boolean;
  stats?: LiveStats;
}

export const Stats: FC<Props> = ({ isPushing, stats }) => (
  <Grid
    templateColumns="repeat(3, 1fr)"
    gap={4}
    p={4}
    bg={isPushing ? 'rgba(178, 245, 234, 0.2)' : 'rgba(247, 250, 252, 0.2)'}
    h="170px"
    hideBelow="md"
  >
    <GridItem w="100%" display="flex" gap={6} flexDirection="column">
      <VStack gap={2} alignItems="flex-start">
        <Heading size="sm" color="gray.400">
          Live Metrics (Beta)
        </Heading>

        <Heading size="md" display="flex" gap={1} alignItems="center">
          {isPushing ? <FiRadio /> : <FiMinus />}
          <Text ml={1}>{isPushing ? 'プッシュ中' : 'オフライン'}</Text>
        </Heading>
      </VStack>

      {stats?.kbps && isPushing && (
        <VStack gap={1} alignItems="flex-start">
          <Heading size="lg" display="flex" gap={1} alignItems="center">
            <FiArrowDown />

            {stats.kbps?.recv_30s ? (
              `${stats.kbps.recv_30s}kbps`
            ) : (
              <Text color="gray.500">計測中</Text>
            )}
          </Heading>

          <Heading
            size="md"
            display="flex"
            gap={1}
            alignItems="center"
            color="gray.400"
          >
            <FiArrowUp />

            {stats.kbps?.send_30s ? (
              `${stats.kbps.send_30s}kbps`
            ) : (
              <Text color="gray.500">計測中</Text>
            )}
          </Heading>
        </VStack>
      )}
    </GridItem>

    <GridItem w="100%" display="flex" gap={2} flexDirection="column">
      <Heading size="sm" display="flex" gap={1} alignItems="center">
        <FiVideo /> 映像
      </Heading>

      {stats?.video && isPushing ? (
        <HStack gap={2} justifyContent="flex-start">
          <VStack gap={1} alignItems="flex-start" color="gray.400">
            <Text>解像度</Text>
            <Text>コーデック</Text>
            <Text>プロファイル</Text>
          </VStack>

          <VStack gap={1} alignItems="flex-start" fontWeight="bold">
            <Text>
              {stats?.video?.width}x{stats?.video?.height}
            </Text>
            <Text>{stats?.video?.codec}</Text>
            <Text>{stats?.video?.profile}</Text>
          </VStack>
        </HStack>
      ) : (
        <Text color="gray.400">映像入力なし</Text>
      )}
    </GridItem>

    <GridItem w="100%" display="flex" gap={2} flexDirection="column">
      <Heading size="sm" display="flex" gap={1} alignItems="center">
        <FiMic /> 音声
      </Heading>

      {stats?.audio && isPushing ? (
        <HStack gap={2} justifyContent="flex-start">
          <VStack gap={1} alignItems="flex-start" color="gray.400">
            <Text>サンプリングレート</Text>
            <Text>チャンネル</Text>
            <Text>コーデック</Text>
            <Text>プロファイル</Text>
          </VStack>

          <VStack gap={1} alignItems="flex-start" fontWeight="bold">
            <Text>{stats?.audio?.sample_rate}Hz</Text>
            <Text>{stats?.audio?.channel}</Text>
            <Text>{stats?.audio?.codec}</Text>
            <Text>{stats?.audio?.profile}</Text>
          </VStack>
        </HStack>
      ) : (
        <Text color="gray.400">音声入力なし</Text>
      )}
    </GridItem>
  </Grid>
);
