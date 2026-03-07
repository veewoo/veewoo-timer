import React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
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
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Timer Finished
          </AlertDialogHeader>

          <AlertDialogBody>
            The timer has finished. Would you like to continue?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={onContinue} ml={3}>
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default AlertDialogComponent;
