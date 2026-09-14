import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import type { Machine } from "~/types";

interface ExpireProps {
  machine: Machine;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Expire({ machine, isOpen, setIsOpen }: ExpireProps) {
  const { isZh } = useTranslation();

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant="destructive" confirmText={isZh ? "立即过期" : "Expire"}>
        <Title>
          {isZh ? `使机器密钥过期: ${machine.givenName}` : `Expire ${machine.givenName}`}
        </Title>
        <Text>
          {isZh
            ? "此操作将断开该设备与 Tailnet 的连接。若要重新连接，您需要从该设备重新进行身份验证登录。"
            : "This will disconnect the machine from your Tailnet. In order to reconnect, you will need to re-authenticate from the device."}
        </Text>
        <input name="action_id" type="hidden" value="expire" />
        <input name="node_id" type="hidden" value={machine.id} />
      </DialogPanel>
    </Dialog>
  );
}
