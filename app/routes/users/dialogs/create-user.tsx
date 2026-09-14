import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import { USERNAME_PATTERN, USERNAME_RULE } from "~/utils/user";

interface CreateUserProps {
  isOidc?: boolean;
  isDisabled?: boolean;
}

export default function CreateUser({ isOidc, isDisabled }: CreateUserProps) {
  const { isZh } = useTranslation();

  return (
    <Dialog>
      <Button disabled={isDisabled}>{isZh ? "添加用户" : "Add user"}</Button>
      <DialogPanel confirmText={isZh ? "创建用户" : "Create user"}>
        <Title>{isZh ? "创建 Headscale 用户" : "Create a Headscale user"}</Title>
        <Text className="mb-6">
          {isZh
            ? `这将在 Headscale 中创建一个新用户。该用户将显示在“未关联的 Headscale 用户”部分，直到他们${isOidc ? "通过您的 OIDC 身份提供商" : ""}登录并自动关联到 Headplane 账户。`
            : `This creates a new user in Headscale. The user will appear in the “Unlinked Headscale Users” section until they sign in${isOidc ? " through your OIDC provider" : ""} and are automatically linked to a Headplane account.`}
        </Text>
        <input name="action_id" type="hidden" value="create_user" />
        <div className="flex flex-col gap-4">
          <Input
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
            name="username"
            placeholder="my-new-user"
            type="text"
          />
          <Input
            label={isZh ? "显示名称" : "Display Name"}
            name="display_name"
            placeholder="John Doe"
            type="text"
          />
          <Input
            label={isZh ? "电子邮箱" : "Email"}
            name="email"
            placeholder="name@example.com"
            type="email"
          />
        </div>
      </DialogPanel>
    </Dialog>
  );
}
