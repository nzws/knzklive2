import { FC, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  AlertDialogCloseButton
} from '@chakra-ui/react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  submitText: string;
};

export const Dialog: FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitText
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>{title}</AlertDialogHeader>
        <AlertDialogCloseButton />

        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            キャンセル
          </Button>
          <Button colorScheme="blue" ml={3} onClick={onSubmit}>
            {submitText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
