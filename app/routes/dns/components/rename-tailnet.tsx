import Button from "~/components/button";
import Code from "~/components/code";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";

interface Props {
  name: string;
  isDisabled: boolean;
}

export default function RenameTailnet({ name, isDisabled }: Props) {
  const { isZh } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-y-4 sm:w-2/3">
      <h1 className="mb-2 text-2xl font-medium">{isZh ? "Tailnet 域名名称" : "Tailnet Name"}</h1>
      <p>
        {isZh ? (
          <>
            这是您 Tailnet 的基础域名。启用 Magic DNS 后，设备可以通过 <Code>[device].{name}</Code>{" "}
            进行访问。
          </>
        ) : (
          <>
            This is the base domain name of your Tailnet. Devices are accessible at{" "}
            <Code>[device].{name}</Code> when Magic DNS is enabled.
          </>
        )}
      </p>
      <Input
        className="w-3/5 text-sm font-medium"
        readOnly
        label={isZh ? "Tailnet 域名名称" : "Tailnet name"}
        labelHidden
        onFocus={(event) => {
          (event.target as HTMLInputElement).select();
        }}
        value={name}
      />
      <Dialog>
        <Button disabled={isDisabled}>{isZh ? "重命名 Tailnet" : "Rename Tailnet"}</Button>
        <DialogPanel isDisabled={isDisabled} confirmText={isZh ? "确认重命名" : "Rename Tailnet"}>
          <Title>{isZh ? "重命名 Tailnet" : "Rename Tailnet"}</Title>
          <Text className="mb-8">
            {isZh
              ? "请注意，修改此项可能会导致各种非预期行为，并可能损坏当前 Tailnet 中的现有设备连接。"
              : "Keep in mind that changing this can lead to all sorts of unexpected behavior and may break existing devices in your tailnet."}
          </Text>
          <input name="action_id" type="hidden" value="rename_tailnet" />
          <Input
            defaultValue={name}
            required
            label={isZh ? "Tailnet 域名名称" : "Tailnet name"}
            name="new_name"
            placeholder="ts.net"
          />
        </DialogPanel>
      </Dialog>
    </div>
  );
}
