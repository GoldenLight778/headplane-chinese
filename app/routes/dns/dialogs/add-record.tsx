import { type } from "arktype";

import Button from "~/components/button";
import Code from "~/components/code";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Select from "~/components/select";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import { useTranslation } from "~/i18n/context";

const recordSchema = type({
  record_type: "'A' | 'AAAA'",
  record_name: "string > 0",
  record_value: "string > 0",
});

interface Props {
  records: { name: string; type: "A" | "AAAA" | string; value: string }[];
}

export default function AddRecord({ records }: Props) {
  const { isZh } = useTranslation();
  const form = useForm({
    schema: recordSchema,
    defaultValues: { record_type: "A" },
    validate: (values) => {
      const name = values.record_name as string;
      const ip = values.record_value as string;
      if (name.length === 0 || ip.length === 0) return undefined;

      const lookup = records.find((r) => r.name === name);
      if (lookup?.value === ip) {
        return {
          record_name: isZh ? "该记录已存在。" : "This record already exists.",
          record_value: isZh ? "该记录已存在。" : "This record already exists.",
        };
      }

      return undefined;
    },
  });
  const name = form.values.record_name as string;
  const ip = form.values.record_value as string;
  const recordType = form.values.record_type as string;
  const isDuplicate =
    !!form.errors.record_name?.includes("already exists") &&
    !!form.errors.record_value?.includes("already exists");

  return (
    <Dialog>
      <Button>{isZh ? "添加 DNS 记录" : "Add DNS record"}</Button>
      <DialogPanel onSubmit={() => form.reset()} confirmText={isZh ? "添加记录" : "Add DNS record"}>
        <Title>{isZh ? "添加 DNS 记录" : "Add DNS record"}</Title>
        <Text>
          {isZh
            ? "为新的 DNS 记录输入域名和 IP 地址。"
            : "Enter the domain and IP address for the new DNS record."}
        </Text>
        <div className="mt-4 flex flex-col gap-2">
          <input type="hidden" name="action_id" value="add_record" />
          <Select
            required
            label={isZh ? "记录类型" : "Record Type"}
            name="record_type"
            defaultValue={recordType}
            onValueChange={(v) => {
              if (v) form.setValue("record_type", v);
            }}
            items={[
              { value: "A", label: "A" },
              { value: "AAAA", label: "AAAA" },
            ]}
          />
          <Input
            {...form.field("record_name")}
            required
            label={isZh ? "域名" : "Domain"}
            placeholder="test.example.com"
          />
          <Input
            {...form.field("record_value")}
            required
            label={isZh ? "IP 地址" : "IP Address"}
            placeholder={recordType === "AAAA" ? "2001:db8::ff00:42:8329" : "101.101.101.101"}
          />
          {isDuplicate ? (
            <p className="text-sm opacity-50">
              {isZh ? (
                <>
                  已存在域名为 <Code>{name}</Code> 且 IP 为 <Code>{ip}</Code> 的记录。
                </>
              ) : (
                <>
                  A record with the domain name <Code>{name}</Code> and IP address <Code>{ip}</Code>{" "}
                  already exists.
                </>
              )}
            </p>
          ) : undefined}
        </div>
      </DialogPanel>
    </Dialog>
  );
}
