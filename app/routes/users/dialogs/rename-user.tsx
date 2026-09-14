import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import { User } from "~/types";
import { USERNAME_PATTERN, USERNAME_RULE } from "~/utils/user";

interface RenameProps {
  user: User;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function RenameUser({ user, isOpen, setIsOpen }: RenameProps) {
  const { isZh } = useTranslation();
  const displayName = user.name || user.displayName;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel confirmText={isZh ? "确认重命名" : "Rename"}>
        <Title>{isZh ? `重命名 ${displayName}？` : `Rename ${displayName}?`}</Title>
        <Text className="mb-6">
          {isZh
            ? `为 ${displayName} 输入新的用户名。更改用户名不会自动更新任何可能通过其旧用户名引用此用户的 ACL 策略。`
            : `Enter a new username for ${displayName}. Changing a username will not update any ACL policies that may refer to this user by their old username.`}
        </Text>
        <input name="action_id" type="hidden" value="rename_user" />
        <input name="headscale_user_id" type="hidden" value={user.id} />
        <Input
          defaultValue={user.name}
          description={
            isZh
              ? "用户名长度至少 2 位，必须以字母开头，且仅包含字母、数字、点、连字符和下划线。"
              : USERNAME_RULE
          }
          minLength={2}
          pattern={USERNAME_PATTERN}
          required
          title={
            isZh
              ? "用户名长度至少 2 位，必须以字母开头，且仅包含字母、数字、点、连字符和下划线。"
              : USERNAME_RULE
          }
          label={isZh ? "用户名" : "Username"}
          name="new_name"
          placeholder="my-new-name"
        />
      </DialogPanel>
    </Dialog>
  );
}
