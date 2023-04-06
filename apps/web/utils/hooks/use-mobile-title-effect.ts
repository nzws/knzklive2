import { useDisclosure } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

export const useMobileTitleEffect = (disabled: unknown) => {
  const [isManuallyTapped, setIsManuallyTapped] = useState(false);
  const { isOpen, onToggle, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (disabled || isManuallyTapped) {
      return;
    }

    onOpen();
    const timeout = setTimeout(() => {
      onClose();
    }, 2 * 1000);

    return () => clearInterval(timeout);
  }, [disabled, isManuallyTapped, onOpen, onClose]);

  const toggle = useCallback(() => {
    setIsManuallyTapped(true);
    onToggle();
  }, [onToggle]);

  return {
    isOpen,
    toggle
  };
};
