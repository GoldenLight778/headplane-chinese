import { type } from "arktype";
import { Split } from "lucide-react";

import Button from "~/components/button";
import Chip from "~/components/chip";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Switch from "~/components/switch";
import Text from "~/components/text";
import Title from "~/components/title";
import Tooltip from "~/components/tooltip";
import { useForm } from "~/hooks/use-form";
import { useTranslation } from "~/i18n/context";
import cn from "~/utils/cn";

const nsSchema = type({
  ns: "string.ip",
  split_name: "string > 0",
});

interface Props {
  nameservers: Record<string, string[]>;
}

export default function AddNameserver({ nameservers }: Props) {
  const { isZh } = useTranslation();
  const form = useForm({
    schema: nsSchema,
    defaultValues: { split_name: "global" },
    validate: (values) => {
      const ns = values.ns as string;
      const domain = values.split_name as string;
      if (!ns) return undefined;

      const isSplit = domain !== "global";
      const isDuplicate = isSplit
        ? nameservers[domain]?.includes(ns)
        : Object.values(nameservers).some((nsList) => nsList.includes(ns));

      if (isDuplicate) {
        return { ns: isZh ? "该域名服务器已存在。" : "This nameserver already exists." };
      }

      return undefined;
    },
  });
  const split = (form.values.split_name as string) !== "global";

  return (
    <Dialog>
      <Button>{isZh ? "添加域名服务器" : "Add nameserver"}</Button>
      <DialogPanel confirmText={isZh ? "添加服务器" : "Add nameserver"}>
        <Title className="mb-4">{isZh ? "添加域名服务器" : "Add nameserver"}</Title>
        <input name="action_id" type="hidden" value="add_ns" />
        <Input
          {...form.field("ns")}
          description={
            isZh
              ? "使用此 IPv4 或 IPv6 地址解析域名。"
              : "Use this IPv4 or IPv6 address to resolve names."
          }
          required
          label={isZh ? "域名服务器" : "Nameserver"}
          placeholder="1.2.3.4"
        />
        <div className="mt-8 flex items-center justify-between">
          <div className="block">
            <div className="inline-flex items-center gap-2">
              <Text className="font-semibold">{isZh ? "限制特定域名" : "Restrict to domain"}</Text>
              <Tooltip
                content={
                  isZh
                    ? "仅支持分流 DNS 的客户端（大多数平台为 Tailscale v1.8 或更高版本）会使用此域名服务器，较旧的客户端将忽略它。"
                    : "Only clients that support split DNS (Tailscale v1.8 or later for most platforms) will use this nameserver. Older clients will ignore it."
                }
              >
                <Chip
                  className={cn("inline-flex items-center")}
                  leftIcon={<Split className="mr-0.5 h-3 w-3" />}
                  text={isZh ? "分流 DNS (Split DNS)" : "Split DNS"}
                />
              </Tooltip>
            </div>
            <Text className="text-sm">
              {isZh
                ? "此域名服务器将仅用于部分特定域名。"
                : "This nameserver will only be used for some domains."}
            </Text>
          </div>
          <Switch
            label={isZh ? "分流 DNS" : "Split DNS"}
            onCheckedChange={(checked) => {
              form.setValue("split_name", checked ? "" : "global");
            }}
          />
        </div>
        {split ? (
          <>
            <Text className="mt-8 font-semibold">{isZh ? "域名后缀" : "Domain"}</Text>
            <Input
              {...form.field("split_name")}
              required
              label={isZh ? "域名后缀" : "Domain"}
              placeholder="example.com"
            />
            <Text className="text-sm">
              {isZh
                ? "只有匹配此后缀的单标签或完全限定查询才会使用该域名服务器。"
                : "Only single-label or fully-qualified queries matching this suffix should use the nameserver."}
            </Text>
          </>
        ) : (
          <input name="split_name" type="hidden" value="global" />
        )}
      </DialogPanel>
    </Dialog>
  );
}
