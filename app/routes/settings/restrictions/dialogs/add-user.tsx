import { type } from "arktype";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import { useTranslation } from "~/i18n/context";

const userSchema = type({
  user: "string > 0",
});

interface AddUserProps {
  users: string[];
  isDisabled?: boolean;
}

export default function AddUser({ users, isDisabled }: AddUserProps) {
  const { isZh } = useTranslation();
  const form = useForm({
    schema: userSchema,
    validate: (values) => {
      const user = (values.user as string).trim();
      if (user.length === 0) return undefined;

      if (users.includes(user)) {
        return { user: isZh ? "该用户已存在于列表中。" : "This user already exists in the list." };
      }

      return undefined;
    },
  });

  return (
    <Dialog>
      <Button disabled={isDisabled}>{isZh ? "添加用户" : "Add user"}</Button>
      <DialogPanel confirmText={isZh ? "添加用户" : "Add user"}>
        <Title>{isZh ? "添加用户" : "Add user"}</Title>
        <Text className="mb-4">
          {isZh
            ? "将此用户添加到允许通过 OIDC 在 Headscale 进行身份验证的用户列表中。"
            : "Add this user to a list of allowed users that can authenticate with Headscale via OIDC."}
        </Text>
        <input name="action_id" type="hidden" value="add_user" />
        <Input
          {...form.field("user")}
          description={
            isZh ? "允许进行 OIDC 身份验证的用户名。" : "The user to allow for OIDC authentication."
          }
          required
          label={isZh ? "用户" : "User"}
          placeholder="john_doe"
        />
      </DialogPanel>
    </Dialog>
  );
}
