import { Button, Portal, Stack } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC, useCallback, useState } from 'react';

export const OLEDScreen: FC = () => {
  const [isOn, setIsOn] = useState(false);

  const handleOpen = useCallback(() => {
    try {
      void document.body.requestFullscreen();
    } catch (e) {
      console.error(e);
    }
    setIsOn(true);
  }, []);

  const handleClose = useCallback(() => {
    try {
      void document.exitFullscreen();
    } catch (e) {
      console.error(e);
    }

    setIsOn(false);
  }, []);

  return (
    <Stack spacing={4}>
      <Button onClick={handleOpen} width="100%">
        有機EL向け: 画面を黒くする (タップして解除)
      </Button>

      {isOn && (
        <Portal>
          <Screen onClick={handleClose} />
        </Portal>
      )}
    </Stack>
  );
};

const Screen = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  z-index: 1000;
`;
