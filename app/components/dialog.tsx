import { AlertDialog } from "@base-ui/react/alert-dialog";
import React, { cloneElement, useEffect, useRef } from "react";
import { Form, type HTMLFormMethod } from "react-router";

import Button, { type ButtonProps } from "~/components/button";
import cn from "~/utils/cn";
import { useLiveData } from "~/utils/live-data";

export interface DialogProps {
  children:
    | [React.ReactElement<ButtonProps>, React.ReactElement<DialogPanelProps>]
    | React.ReactElement<DialogPanelProps>;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

function Dialog(props: DialogProps) {
  const { pause, resume } = useLiveData();
  const { isOpen, onOpenChange } = props;

  useEffect(() => {
    if (isOpen) {
      pause();
    } else {
      resume();
    }
  }, [isOpen]);

  if (Array.isArray(props.children)) {
    const [button, panel] = props.children;
    return (
      <AlertDialog.Root open={isOpen} onOpenChange={(open) => onOpenChange?.(open)}>
        <AlertDialog.Trigger render={cloneElement(button)} />
        <DialogOverlay>{panel}</DialogOverlay>
      </AlertDialog.Root>
    );
  }

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={(open) => onOpenChange?.(open)}>
      <DialogOverlay>{props.children}</DialogOverlay>
    </AlertDialog.Root>
  );
}

import { useTranslation } from "~/i18n/context";

export interface DialogPanelProps {
  children: React.ReactNode;
  variant?: "normal" | "destructive" | "unactionable";
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  method?: HTMLFormMethod;
  isDisabled?: boolean;
  confirmText?: string;
  cancelText?: string;
  closeText?: string;
}

function Panel(props: DialogPanelProps) {
  const {
    children,
    onSubmit,
    isDisabled,
    variant,
    method = "POST",
    confirmText,
    cancelText,
    closeText,
  } = props;
  const closeRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  return (
    <AlertDialog.Popup
      className={cn(
        "flex w-full max-w-lg flex-col rounded-xl p-5",
        "max-h-[90dvh]",
        "outline-hidden",
        "bg-white dark:bg-mist-900",
        "border border-mist-200 dark:border-mist-800",
        "shadow-overlay",
        "transition-all duration-200 ease-out",
      )}
    >
      <Form
        method={method ?? "POST"}
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          if (onSubmit) {
            onSubmit(event);
          }

          if (!event.defaultPrevented) {
            closeRef.current?.click();
          }
        }}
      >
        {/* px-1 -mx-1 gives focus rings on inputs/buttons room to render
            without being clipped by overflow-y-auto (which implicitly forces
            overflow-x: auto per CSS spec). */}
        <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">
          {children}
        </div>
        <div className="mt-6 flex shrink-0 justify-end gap-3">
          {variant === "unactionable" ? (
            <AlertDialog.Close render={<Button>{closeText ?? t("common.close")}</Button>} />
          ) : (
            <>
              <AlertDialog.Close render={<Button>{cancelText ?? t("common.cancel")}</Button>} />
              <AlertDialog.Close ref={closeRef} className="hidden" aria-hidden tabIndex={-1} />
              <Button
                disabled={isDisabled}
                type="submit"
                variant={variant === "destructive" ? "danger" : "heavy"}
              >
                {confirmText ?? t("common.confirm")}
              </Button>
            </>
          )}
        </div>
      </Form>
    </AlertDialog.Popup>
  );
}

function DialogOverlay({ children }: { children: React.ReactNode }) {
  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop
        className={cn(
          "fixed inset-0 z-20 h-screen w-screen",
          "bg-mist-900/40 dark:bg-mist-950/70",
          "backdrop-blur-[1px]",
          "transition-opacity duration-200 ease-out",
        )}
      />
      <div
        className={cn(
          "fixed inset-0 z-20 h-screen w-screen",
          "flex items-center justify-center p-4",
        )}
      >
        {children}
      </div>
    </AlertDialog.Portal>
  );
}

export { Panel as DialogPanel };
export default Dialog;
