import { FC, useCallback, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button
} from '@chakra-ui/react';
import { CommentAutoModType } from 'api-types/common/types';

type Props = {
  onClose: () => void;
  onSubmit: () => Promise<void>;
  openType?: Exclude<CommentAutoModType, 'Text'>;
  acct?: string;
};

export const ConfirmAutoModModal: FC<Props> = ({
  onClose,
  onSubmit,
  openType,
  acct
}) => {
  const cancelRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const typeText = openType === 'Account' ? 'アカウント' : 'ドメイン';
  const content =
    openType === 'Account' ? acct : `*.${(acct || '').split('@')[1]}`;

  const handleSubmit = useCallback(() => {
    void (async () => {
      try {
        setIsLoading(true);
        await onSubmit();
      } catch {
        // noop
      } finally {
        setIsLoading(false);
      }
    })();
  }, [onSubmit]);

  return (
    <AlertDialog
      isOpen={openType !== undefined || isLoading}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {typeText}を非表示
          </AlertDialogHeader>

          <AlertDialogBody>
            {content}{' '}
            をオートモデレーションにより非表示にします。非表示にしたコメントはコメントビューワーや一般ユーザーから表示されなくなります。
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} disabled={isLoading}>
              キャンセル
            </Button>

            <Button
              colorScheme="red"
              onClick={handleSubmit}
              ml={3}
              isLoading={isLoading}
            >
              非表示
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
