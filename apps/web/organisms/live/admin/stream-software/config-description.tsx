import { ListItem, Text, UnorderedList } from '@chakra-ui/react';
import { Fragment } from 'react';

export const ConfigDescription = () => (
  <Fragment>
    <Text>
      現在、配信システム側でハードリミットは設定されていませんが、快適な配信をするために以下の設定を推奨します。
    </Text>

    <UnorderedList>
      <ListItem>
        キーフレーム間隔: <b>1s</b> (重要:
        間隔が大きい/オートだと視聴がカクつきます)
      </ListItem>
      <ListItem>
        映像エンコーダ: <b>H264</b> の任意のハードウェア/ソフトウェアエンコーダ
        (重要: H265(HEVC) は対応していません)
      </ListItem>
      <ListItem>出力解像度: 1920x1080</ListItem>
      <ListItem>
        ビットレート: 2000 kbps 前後 (重くなる場合は落としてください)
      </ListItem>
    </UnorderedList>
  </Fragment>
);
