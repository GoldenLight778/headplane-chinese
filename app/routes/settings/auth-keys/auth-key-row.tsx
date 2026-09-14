import Attribute from "~/components/attribute";
import { useTranslation } from "~/i18n/context";
import type { PreAuthKey, User } from "~/types";
import { getUserDisplayName } from "~/utils/user";

import ExpireAuthKey from "./dialogs/expire-auth-key";

interface Props {
  authKey: PreAuthKey;
  user: User | null;
}

export default function AuthKeyRow({ authKey, user }: Props) {
  const { isZh } = useTranslation();
  const createdAt = new Date(authKey.createdAt).toLocaleString(isZh ? "zh-CN" : undefined);
  const expiration = new Date(authKey.expiration).toLocaleString(isZh ? "zh-CN" : undefined);
  const isExpired =
    (authKey.used && !authKey.reusable) || new Date(authKey.expiration) < new Date();
  const userDisplay = user ? getUserDisplayName(user) : isZh ? "(仅标签)" : "(Tag Only)";

  return (
    <div className="w-full">
      <Attribute name={isZh ? "密钥" : "Key"} value={authKey.key} />
      <Attribute name={isZh ? "所属用户" : "User"} value={userDisplay} />
      <Attribute
        name={isZh ? "可重复使用" : "Reusable"}
        value={authKey.reusable ? (isZh ? "是" : "Yes") : isZh ? "否" : "No"}
      />
      <Attribute
        name={isZh ? "临时节点" : "Ephemeral"}
        value={authKey.ephemeral ? (isZh ? "是" : "Yes") : isZh ? "否" : "No"}
      />
      <Attribute
        name={isZh ? "已使用" : "Used"}
        value={authKey.used ? (isZh ? "是" : "Yes") : isZh ? "否" : "No"}
      />
      <Attribute name={isZh ? "创建时间" : "Created"} value={createdAt} />
      <Attribute name={isZh ? "到期时间" : "Expiration"} value={expiration} />
      {!isExpired && user && (
        <div className="mt-2" suppressHydrationWarning>
          <ExpireAuthKey authKey={authKey} user={user} />
        </div>
      )}
    </div>
  );
}
