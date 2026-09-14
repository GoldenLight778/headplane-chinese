import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";

interface Props {
  isEnabled: boolean;
  isDisabled: boolean;
}

export default function Modal({ isEnabled, isDisabled }: Props) {
  const { isZh } = useTranslation();

  return (
    <Dialog>
      <Button disabled={isDisabled}>
        {isEnabled ? (isZh ? "禁用" : "Disable") : isZh ? "启用" : "Enable"} Magic DNS
      </Button>
      <DialogPanel
        isDisabled={isDisabled}
        confirmText={isEnabled ? (isZh ? "确认禁用" : "Disable") : isZh ? "确认启用" : "Enable"}
      >
        <Title>
          {isEnabled ? (isZh ? "禁用" : "Disable") : isZh ? "启用" : "Enable"} Magic DNS
        </Title>
        <Text>
          {isZh
            ? "设备将不再能通过 Tailnet 域名进行访问，搜索域也将同时被禁用。"
            : "Devices will no longer be accessible via your tailnet domain. The search domain will also be disabled."}
        </Text>
        <input type="hidden" name="action_id" value="toggle_magic" />
        <input type="hidden" name="new_state" value={isEnabled ? "disabled" : "enabled"} />
      </DialogPanel>
    </Dialog>
  );
}
