import { type } from "arktype";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import { useTranslation } from "~/i18n/context";

const groupSchema = type({
  group: "string > 0",
});

interface AddGroupProps {
  groups: string[];
  isDisabled?: boolean;
}

export default function AddGroup({ groups, isDisabled }: AddGroupProps) {
  const { isZh } = useTranslation();
  const form = useForm({
    schema: groupSchema,
    validate: (values) => {
      const group = (values.group as string).trim();
      if (group.length === 0) return undefined;

      if (groups.includes(group)) {
        return {
          group: isZh ? "该用户组已存在于列表中。" : "This group already exists in the list.",
        };
      }

      return undefined;
    },
  });

  return (
    <Dialog>
      <Button disabled={isDisabled}>{isZh ? "添加用户组" : "Add group"}</Button>
      <DialogPanel confirmText={isZh ? "添加用户组" : "Add group"}>
        <Title>{isZh ? "添加用户组" : "Add group"}</Title>
        <Text className="mb-4">
          {isZh
            ? "将此用户组添加到允许通过 OIDC 在 Headscale 进行身份验证的用户组列表中。"
            : "Add this group to a list of allowed groups that can authenticate with Headscale via OIDC."}
        </Text>
        <input name="action_id" type="hidden" value="add_group" />
        <Input
          {...form.field("group")}
          description={
            isZh
              ? "允许进行 OIDC 身份验证的用户组名称。"
              : "The group to allow for OIDC authentication."
          }
          required
          label={isZh ? "用户组" : "Group"}
          placeholder="admin"
        />
      </DialogPanel>
    </Dialog>
  );
}
