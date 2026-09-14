import { useNavigate } from "react-router";

import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import type { Machine } from "~/types";

interface DeleteProps {
  machine: Machine;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Delete({ machine, isOpen, setIsOpen }: DeleteProps) {
  const navigate = useNavigate();
  const { isZh } = useTranslation();

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        onSubmit={() => navigate("/machines")}
        variant="destructive"
        confirmText={isZh ? "确认移除" : "Remove"}
      >
        <Title>{isZh ? `移除设备: ${machine.givenName}` : `Remove ${machine.givenName}`}</Title>
        <Text>
          {isZh
            ? "此机器将从您的网络中永久移除。如需重新加入，您必须从该设备重新进行身份验证。"
            : "This machine will be permanently removed from your network. To re-add it, you will need to reauthenticate to your tailnet from the device."}
        </Text>
        <input name="action_id" type="hidden" value="delete" />
        <input name="node_id" type="hidden" value={machine.id} />
      </DialogPanel>
    </Dialog>
  );
}
