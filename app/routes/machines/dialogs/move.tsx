import { useState } from "react";

import Dialog, { DialogPanel } from "~/components/dialog";
import Select from "~/components/select";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import type { Machine, User } from "~/types";
import { getUserDisplayName } from "~/utils/user";

interface MoveProps {
  machine: Machine;
  users: User[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Move({ machine, users, isOpen, setIsOpen }: MoveProps) {
  const [userId, setUserId] = useState<string | null>(machine.user?.id ?? null);
  const { isZh } = useTranslation();

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        isDisabled={userId === machine.user?.id}
        confirmText={isZh ? "确认转移" : "Transfer"}
      >
        <Title>
          {isZh ? `变更所有者: ${machine.givenName}` : `Change the owner of ${machine.givenName}`}
        </Title>
        <Text>
          {isZh
            ? "机器的所有者是与其关联的 Headscale 用户。"
            : "The owner of the machine is the user associated with it."}
        </Text>
        <input name="action_id" type="hidden" value="reassign" />
        <input name="node_id" type="hidden" value={machine.id} />
        <input name="user_id" type="hidden" value={userId?.toString()} />
        <Select
          defaultValue={machine.user?.id}
          required
          label={isZh ? "所属用户" : "Owner"}
          name="user"
          onValueChange={(key) => {
            setUserId(key);
          }}
          placeholder={isZh ? "选择所属用户" : "Select a user"}
          items={users.map((user) => ({
            value: user.id,
            label: getUserDisplayName(user),
          }))}
        />
      </DialogPanel>
    </Dialog>
  );
}
