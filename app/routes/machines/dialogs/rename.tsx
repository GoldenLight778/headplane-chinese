import { type } from "arktype";

import Code from "~/components/code";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import type { Machine } from "~/types";

const renameSchema = type({
  name: "string > 0",
});

const dnsLabelPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

interface RenameProps {
  machine: Machine;
  isOpen: boolean;
  magic?: string;
  setIsOpen: (isOpen: boolean) => void;
}

import { useTranslation } from "~/i18n/context";

export default function Rename({ machine, magic, isOpen, setIsOpen }: RenameProps) {
  const { t, isZh } = useTranslation();
  const form = useForm({
    schema: renameSchema,
    defaultValues: { name: machine.givenName },
    validate: (values) => {
      const name = String(values.name ?? "").toLowerCase();
      if (!dnsLabelPattern.test(name)) {
        return {
          name: isZh
            ? "请输入有效的 DNS 主机名：仅限小写字母、数字和连字符，且必须以字母或数字开头和结尾。"
            : "Use a valid DNS label: lowercase letters, numbers, and hyphens only. It must start and end with a letter or number.",
        };
      }
    },
  });
  const name = form.values.name as string;

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel isDisabled={!form.canSubmit}>
        <Title>
          {isZh
            ? `修改机器名称: ${machine.givenName}`
            : `Edit machine name for ${machine.givenName}`}
        </Title>
        <Text className="mb-6">{t("machines.dialogs.renameDesc")}</Text>
        <input name="action_id" type="hidden" value="rename" />
        <input name="node_id" type="hidden" value={machine.id} />
        <Input
          {...form.field("name")}
          required
          label={t("machines.dialogs.machineName")}
          placeholder={t("machines.dialogs.machineName")}
        />
        {magic ? (
          name.length > 0 && name !== machine.givenName ? (
            <p className="mt-2 text-sm leading-tight text-mist-600 dark:text-mist-300">
              {t("machines.dialogs.renameHint")}
              <Code className="text-sm">{name.toLowerCase().replaceAll(/\s+/g, "-")}</Code>
              {isZh ? `。原主机名 ` : `. The hostname `}
              <Code className="text-sm">{machine.givenName}</Code>
              {isZh ? ` 将不再指向此机器。` : ` will no longer point to this machine.`}
            </p>
          ) : (
            <p className="mt-2 text-sm leading-tight text-mist-600 dark:text-mist-300">
              {t("machines.dialogs.renameCurrentHint")}
              <Code className="text-sm">{machine.givenName}</Code>.
            </p>
          )
        ) : undefined}
      </DialogPanel>
    </Dialog>
  );
}
