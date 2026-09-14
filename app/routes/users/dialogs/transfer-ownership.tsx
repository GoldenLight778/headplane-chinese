import Dialog, { DialogPanel } from "~/components/dialog";
import Notice from "~/components/notice";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";

interface TransferOwnershipProps {
  targetHeadplaneUserId: string;
  targetDisplayName: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function TransferOwnership({
  targetHeadplaneUserId,
  targetDisplayName,
  isOpen,
  setIsOpen,
}: TransferOwnershipProps) {
  const { isZh } = useTranslation();

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        variant="destructive"
        confirmText={isZh ? "确认转移所有权" : "Transfer ownership"}
      >
        <Title>
          {isZh
            ? `将所有权转移给 ${targetDisplayName}？`
            : `Transfer ownership to ${targetDisplayName}?`}
        </Title>
        <Text className="mb-6">
          {isZh
            ? `这将使 ${targetDisplayName} 成为此 Headplane 实例的新所有者。您将被降级为管理员。此操作无法轻易撤销。`
            : `This will make ${targetDisplayName} the new owner of this Headplane instance. You will be demoted to an Admin. This action cannot be easily undone.`}
        </Text>
        <Notice variant="warning">
          {isZh
            ? "只有所有者可以转移所有权。操作完成后，您将无法再管理所有权。"
            : "Only the owner can transfer ownership. After this, you will no longer be able to manage ownership."}
        </Notice>
        <input name="action_id" type="hidden" value="transfer_ownership" />
        <input name="headplane_user_id" type="hidden" value={targetHeadplaneUserId} />
      </DialogPanel>
    </Dialog>
  );
}
