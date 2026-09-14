import { type } from "arktype";
import { Computer, FileKey2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import CodeBlock from "~/components/code-block";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "~/components/menu";
import Select from "~/components/select";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import type { User } from "~/types";
import { normalizeRegistrationKey } from "~/utils/register-key";
import { getUserDisplayName } from "~/utils/user";

const registerSchema = type({
  register_key: "string > 0",
  user: "string > 0",
});

export interface NewMachineProps {
  server: string;
  users: User[];
  isDisabled?: boolean;
  disabledKeys?: string[];
}

import { useTranslation } from "~/i18n/context";

export default function NewMachine(data: NewMachineProps) {
  const [pushDialog, setPushDialog] = useState(false);
  const { isZh } = useTranslation();
  const form = useForm({
    schema: registerSchema,
    validate: (values) =>
      normalizeRegistrationKey(String(values.register_key ?? ""))
        ? undefined
        : {
            register_key: isZh
              ? "请粘贴 tailscale up 提示的注册 URL 或完整的 hskey-authreq-... 密钥。"
              : "Paste the registration URL or full hskey-authreq-... key from tailscale up.",
          },
  });
  const navigate = useNavigate();

  return (
    <>
      <Dialog isOpen={pushDialog} onOpenChange={setPushDialog}>
        <DialogPanel isDisabled={!form.canSubmit}>
          <Title>{isZh ? "注册机器密钥" : "Register Machine Key"}</Title>
          <Text>
            {isZh
              ? "在您的设备上运行以下命令后即可获取机器密钥："
              : "The machine key is given when you run the following command on your device:"}
          </Text>
          <CodeBlock className="mb-4">{`tailscale up --login-server=${data.server}`}</CodeBlock>
          <input name="action_id" type="hidden" value="register" />
          <Input
            {...form.field("register_key")}
            required
            label={isZh ? "机器密钥" : "Machine Key"}
            placeholder="hskey-authreq-XXXXXXXXXXXXXXXXXXXXXXXX"
            description={
              isZh
                ? "粘贴 tailscale up 输出中显示的注册 URL 或完整密钥。"
                : "Paste the registration URL or full key shown by tailscale up."
            }
          />
          <Select
            required
            label={isZh ? "所属用户" : "Owner"}
            name="user"
            onValueChange={(v) => form.setValue("user", v)}
            placeholder={isZh ? "选择所属用户" : "Select a user"}
            items={data.users.map((user) => ({
              // Headscale's v1/node/register endpoint resolves the owner by
              // username via GetUserByName, so we must pass user.name (not id).
              value: user.name,
              label: getUserDisplayName(user),
            }))}
          />
        </DialogPanel>
      </Dialog>
      <Menu disabled={data.isDisabled}>
        <MenuTrigger className="cursor-pointer rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out select-none hover:bg-indigo-500 hover:shadow-sm hover:shadow-indigo-500/25 active:scale-[0.97] active:bg-indigo-700 active:duration-75 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:active:bg-indigo-600">
          {isZh ? "添加设备" : "Add Device"}
        </MenuTrigger>
        <MenuContent>
          <MenuItem
            disabled={data.disabledKeys?.includes("register")}
            onClick={() => setPushDialog(true)}
          >
            <div className="flex items-center gap-x-3">
              <Computer className="w-4" />
              {isZh ? "注册机器密钥" : "Register Machine Key"}
            </div>
          </MenuItem>
          <MenuItem
            disabled={data.disabledKeys?.includes("pre-auth")}
            onClick={() => navigate("/settings/auth-keys")}
          >
            <div className="flex items-center gap-x-3">
              <FileKey2 className="w-4" />
              {isZh ? "生成预授权密钥" : "Generate Pre-auth Key"}
            </div>
          </MenuItem>
        </MenuContent>
      </Menu>
    </>
  );
}
