import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import Button from "~/components/button";
import CodeBlock from "~/components/code-block";
import Dialog, { DialogPanel } from "~/components/dialog";
import Input from "~/components/input";
import Link from "~/components/link";
import NumberInput from "~/components/number-input";
import Select from "~/components/select";
import Switch from "~/components/switch";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import type { User } from "~/types";
import { getUserDisplayName } from "~/utils/user";

interface AddAuthKeyProps {
  users: User[];
  url: string;
  selfServiceOnly: boolean;
  currentHeadscaleUserId?: string;
  currentSubject?: string;
}

function findCurrentUser(
  users: User[],
  headscaleUserId: string | undefined,
  subject: string | undefined,
): User | undefined {
  if (headscaleUserId) {
    const linked = users.find((u) => u.id === headscaleUserId);
    if (linked) {
      return linked;
    }
  }

  if (!subject) {
    return undefined;
  }
  return users.find((u) => {
    if (u.provider !== "oidc" || !u.providerId) {
      return false;
    }
    const segment = u.providerId.split("/").pop();
    return segment ? decodeURIComponent(segment) === subject : false;
  });
}

export default function AddAuthKey({
  users,
  url,
  selfServiceOnly,
  currentHeadscaleUserId,
  currentSubject,
}: AddAuthKeyProps) {
  const { isZh } = useTranslation();
  const fetcher = useFetcher();
  const submittingRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [reusable, setReusable] = useState(false);
  const [ephemeral, setEphemeral] = useState(false);
  const [tagOnly, setTagOnly] = useState(false);
  const currentUser = selfServiceOnly
    ? findCurrentUser(users, currentHeadscaleUserId, currentSubject)
    : null;
  const availableUsers = selfServiceOnly && currentUser ? [currentUser] : users;
  const [userId, setUserId] = useState<string | null>(availableUsers[0]?.id);
  const [tags, setTags] = useState("");

  const createdKey = fetcher.data?.success ? fetcher.data.key : null;

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      submittingRef.current = false;
    }
  }, [fetcher.data, fetcher.state]);

  useEffect(() => {
    if (!isOpen) {
      setReusable(false);
      setEphemeral(false);
      setTagOnly(false);
      setUserId(availableUsers[0]?.id);
      setTags("");
      fetcher.data = undefined;
    }
  }, [isOpen]);

  const parsedTags = tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => (t.startsWith("tag:") ? t : `tag:${t}`));

  const canSubmit = tagOnly ? parsedTags.length > 0 : userId != null;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open && submittingRef.current) {
          return;
        }
        setIsOpen(open);
      }}
    >
      <Button className="my-4" onClick={() => setIsOpen(true)}>
        {isZh ? "创建预授权密钥" : "Create pre-auth key"}
      </Button>
      {createdKey ? (
        <DialogPanel variant="unactionable" closeText={isZh ? "完成并关闭" : undefined}>
          <Title>{isZh ? "预授权密钥已创建" : "Pre-auth key created"}</Title>
          <Text>
            {isZh
              ? "请立即复制此密钥。关闭后您将无法再次查看完整密钥。"
              : "Copy this key now. You will not be able to see the full key again."}
          </Text>
          <CodeBlock className="mt-4">{createdKey}</CodeBlock>
          <Text className="mt-4 text-sm">
            {isZh ? "使用此密钥注册设备：" : "To register a device with this key:"}
          </Text>
          <CodeBlock className="mt-1">
            {`tailscale up --login-server=${url} --authkey ${createdKey}`}
          </CodeBlock>
        </DialogPanel>
      ) : (
        <DialogPanel
          onSubmit={(event) => {
            event.preventDefault();
            submittingRef.current = true;
            const form = new FormData(event.currentTarget as HTMLFormElement);
            form.set("action_id", "add_preauthkey");
            form.set("user_id", tagOnly ? "" : (userId?.toString() ?? ""));
            form.set("reusable", reusable ? "on" : "off");
            form.set("ephemeral", ephemeral ? "on" : "off");
            form.set("acl_tags", parsedTags.join(","));
            fetcher.submit(form, { method: "POST" });
          }}
          isDisabled={fetcher.state !== "idle" || !canSubmit}
          confirmText={isZh ? "生成密钥" : "Generate key"}
        >
          <Title>{isZh ? "生成预授权密钥" : "Generate auth key"}</Title>

          {!selfServiceOnly && (
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <Text className="font-semibold">{isZh ? "仅标签密钥" : "Tag-only key"}</Text>
                <Text className="text-sm">
                  {isZh
                    ? "创建由 ACL 标签拥有而非用户拥有的密钥。"
                    : "Create a key owned by ACL tags instead of a user."}
                </Text>
              </div>
              <Switch
                defaultChecked={tagOnly}
                label={isZh ? "仅标签" : "Tag-only"}
                onCheckedChange={() => setTagOnly(!tagOnly)}
              />
            </div>
          )}

          {!tagOnly && (
            <Select
              className="mb-2"
              description={
                selfServiceOnly
                  ? isZh
                    ? "您只能为自己的用户创建密钥。"
                    : "You can only create keys for your own user."
                  : isZh
                    ? "设备通过身份验证后将属于此用户。"
                    : "Machines will belong to this user when they authenticate."
              }
              disabled={selfServiceOnly}
              required
              label={isZh ? "所属用户" : "User"}
              onValueChange={(value) => setUserId(value)}
              placeholder={isZh ? "选择用户" : "Select a user"}
              value={userId}
              items={availableUsers.map((user) => ({
                value: user.id,
                label: getUserDisplayName(user),
              }))}
            />
          )}

          <Input
            className="mb-2"
            description={
              isZh
                ? "以英文逗号分隔的标签（例如 server, prod）。tag: 前缀将自动添加。"
                : "Comma-separated tags (e.g. server, prod). The tag: prefix is added automatically."
            }
            required={tagOnly}
            label={isZh ? "ACL 标签" : "ACL Tags"}
            onChange={(value) => setTags(value)}
            placeholder="server, prod"
            value={tags}
          />
          <NumberInput
            defaultValue={90}
            description={
              isZh
                ? "设置此密钥在指定天数后过期失效。"
                : "Set this key to expire after a certain number of days."
            }
            required
            label={isZh ? "密钥有效期 (天)" : "Key Expiration"}
            max={365_000}
            min={1}
            name="expiry"
          />
          <div className="mt-6 flex items-center justify-between gap-2">
            <div>
              <Text className="font-semibold">{isZh ? "可重复使用" : "Reusable"}</Text>
              <Text className="text-sm">
                {isZh
                  ? "使用此密钥可以对多台设备进行身份验证。"
                  : "Use this key to authenticate more than one device."}
              </Text>
            </div>
            <Switch
              defaultChecked={reusable}
              label={isZh ? "可重复使用" : "Reusable"}
              onCheckedChange={() => setReusable(!reusable)}
            />
          </div>
          <div className="mt-6 flex items-center justify-between gap-2">
            <div>
              <Text className="font-semibold">{isZh ? "临时节点" : "Ephemeral"}</Text>
              <Text className="text-sm">
                {isZh ? (
                  <>
                    使用此密钥认证的设备一旦离线将被自动移除。{" "}
                    <Link external styled to="https://tailscale.com/kb/1111/ephemeral-nodes">
                      了解更多
                    </Link>
                  </>
                ) : (
                  <>
                    Devices authenticated with this key will be automatically removed once they go
                    offline.{" "}
                    <Link external styled to="https://tailscale.com/kb/1111/ephemeral-nodes">
                      Learn more
                    </Link>
                  </>
                )}
              </Text>
            </div>
            <Switch
              defaultChecked={ephemeral}
              label={isZh ? "临时节点" : "Ephemeral"}
              onCheckedChange={() => setEphemeral(!ephemeral)}
            />
          </div>
        </DialogPanel>
      )}
    </Dialog>
  );
}
