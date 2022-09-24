import { Portal } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC } from 'react';

type Props = {
  onClick: () => void;
};

export const OLEDScreen: FC<Props> = ({ onClick }) => (
  <Portal>
    <Screen onClick={onClick} />
  </Portal>
);

const Screen = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  z-index: 1000;
`;
