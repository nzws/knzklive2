import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogBody,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { FC, useRef } from 'react';

export const StartedNote: FC = () => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { isOpen, onClose } = useDisclosure({
    defaultIsOpen: true
  });

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay backdropBlur={4} />

      <AlertDialogContent>
        <AlertDialogHeader>
          「ブラウザから配信」は超試験的機能です
        </AlertDialogHeader>

        <AlertDialogBody>
          特にモバイル端末のブラウザでは、タブやアプリをバックグラウンドにした際に切断されることがあるため、
          基本的にこのページを開いたままにしておいてください。
        </AlertDialogBody>

        <AlertDialogFooter>
          <Button colorScheme="blue" onClick={onClose} maxW="100%">
            閉じる
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
