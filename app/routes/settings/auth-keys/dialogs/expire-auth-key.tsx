import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import type { PreAuthKey, User } from "~/types";

interface ExpireAuthKeyProps {
  authKey: PreAuthKey;
  user: User;
}

export default function ExpireAuthKey({ authKey, user }: ExpireAuthKeyProps) {
  const { isZh } = useTranslation();

  return (
    <Dialog>
      <Button variant="heavy">{isZh ? "使密钥失效" : "Expire Key"}</Button>
      <DialogPanel variant="destructive" confirmText={isZh ? "确认失效" : "Expire Key"}>
        <Title>{isZh ? "使预授权密钥失效？" : "Expire auth key?"}</Title>
        <input name="action_id" type="hidden" value="expire_preauthkey" />
        <input name="user_id" type="hidden" value={user.id} />
        <input name="key_id" type="hidden" value={authKey.id} />
        <input name="key" type="hidden" value={authKey.key} />
        <Text>
          {isZh
            ? "使此认证密钥失效将立即阻止其用于验证新设备。此操作无法撤销。"
            : "Expiring this authentication key will immediately prevent it from being used to authenticate new devices. This action cannot be undone."}
        </Text>
      </DialogPanel>
    </Dialog>
  );
}
