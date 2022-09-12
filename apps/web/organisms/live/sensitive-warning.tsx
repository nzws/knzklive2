import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogBody,
  Button
} from '@chakra-ui/react';
import { FC, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

export const SensitiveWarning: FC<Props> = ({ isOpen, onClose, title }) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay backdropBlur={4} />

      <AlertDialogContent>
        <AlertDialogHeader>
          <FormattedMessage id="live.sensitive.title" />
        </AlertDialogHeader>
        <AlertDialogBody>
          <FormattedMessage
            id="live.sensitive.description"
            values={{ title }}
          />
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button colorScheme="red" onClick={onClose} maxW="100%">
            <FormattedMessage id="live.sensitive.enter" />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
