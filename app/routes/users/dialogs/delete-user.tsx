import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import type { Machine, User } from "~/types";

interface DeleteProps {
  user: User;
  machines: Machine[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function DeleteUser({ user, machines, isOpen, setIsOpen }: DeleteProps) {
  const { isZh } = useTranslation();
  const name = user.name || user.displayName;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        variant={machines.length > 0 ? "unactionable" : "normal"}
        confirmText={isZh ? "确认删除" : "Delete"}
      >
        <Title>{isZh ? `删除用户 ${name}？` : `Delete ${name}?`}</Title>
        {machines.length > 0 ? (
          <Text className="mb-6">
            {isZh
              ? "拥有机器的用户无法直接删除。在继续之前，请先删除或将他们的机器重新分配给其他用户。"
              : "Users cannot be deleted if they have machines. Please delete or re-assign their machines to other users before proceeding."}
          </Text>
        ) : (
          <Text className="mb-6">
            {isZh ? "已删除的用户无法恢复。" : "Deleted users cannot be recovered."}
            {user.provider === "oidc" && (
              <p className="mt-4 text-sm text-mist-600 dark:text-mist-300">
                {isZh
                  ? "由于此用户是通过外部提供商进行身份验证的，如果他们再次登录，将被重新创建。"
                  : "Since this user is authenticated via an external provider, they will be recreated if they sign in again."}
              </p>
            )}
          </Text>
        )}
        <input name="action_id" type="hidden" value="delete_user" />
        <input name="headscale_user_id" type="hidden" value={user.id} />
      </DialogPanel>
    </Dialog>
  );
}
