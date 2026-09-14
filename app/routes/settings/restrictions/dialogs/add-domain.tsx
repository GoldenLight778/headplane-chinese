import { type } from "arktype";

import Button from "~/components/button";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Text from "~/components/text";
import Title from "~/components/title";
import { useForm } from "~/hooks/use-form";
import { useTranslation } from "~/i18n/context";

const domainSchema = type({
  domain: "string > 0",
});

interface AddDomainProps {
  domains: string[];
  isDisabled?: boolean;
}

export default function AddDomain({ domains, isDisabled }: AddDomainProps) {
  const { isZh } = useTranslation();
  const form = useForm({
    schema: domainSchema,
    validate: (values) => {
      const domain = (values.domain as string).trim();
      if (domain.length === 0) return undefined;

      if (domains.includes(domain)) {
        return {
          domain: isZh ? "该域名已存在于列表中。" : "This domain already exists in the list.",
        };
      }

      try {
        const url = new URL(`http://${domain}`);
        if (url.hostname !== domain) {
          return { domain: isZh ? "这不是有效的域名。" : "This is not a valid domain." };
        }
      } catch {
        return { domain: isZh ? "这不是有效的域名。" : "This is not a valid domain." };
      }

      return undefined;
    },
  });
  const domain = (form.values.domain as string).trim();

  return (
    <Dialog>
      <Button disabled={isDisabled}>{isZh ? "添加域名" : "Add domain"}</Button>
      <DialogPanel confirmText={isZh ? "添加域名" : "Add domain"}>
        <Title>{isZh ? "添加域名" : "Add domain"}</Title>
        <Text className="mb-4">
          {isZh
            ? "将此域名添加到允许通过 OIDC 在 Headscale 进行身份验证的邮箱域名列表中。"
            : "Add this domain to a list of allowed email domains that can authenticate with Headscale via OIDC."}
        </Text>
        <input name="action_id" type="hidden" value="add_domain" />
        <Input
          {...form.field("domain")}
          description={
            domain.length > 0
              ? isZh
                ? `匹配 <user>@${domain} 格式的用户`
                : `Matches users with <user>@${domain}`
              : isZh
                ? "输入域名以按邮箱地址匹配用户。"
                : "Enter a domain to match users with their email addresses."
          }
          required
          label={isZh ? "域名" : "Domain"}
          placeholder="example.com"
        />
      </DialogPanel>
    </Dialog>
  );
}
