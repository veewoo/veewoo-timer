import React from "react";
import {
  Button,
  Dialog,
} from "@chakra-ui/react";

interface AlertDialogComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  cancelRef: React.RefObject<HTMLButtonElement>;
}

const AlertDialogComponent: React.FC<AlertDialogComponentProps> = ({
  isOpen,
  onClose,
  onContinue,
  cancelRef,
}) => {
  return (
    <Dialog.Root
      role="alertdialog"
      open={isOpen}
      initialFocusEl={() => cancelRef.current}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title fontSize="lg" fontWeight="bold">
              Timer Finished
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            The timer has finished. Would you like to continue?
          </Dialog.Body>
          <Dialog.Footer>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorPalette="teal" onClick={onContinue} ml={3}>
              Continue
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default AlertDialogComponent;
