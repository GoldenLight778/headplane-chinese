import {
  AlertCircle,
  Construction,
  Eye,
  FlaskConical,
  Pencil,
  Shield,
  TagsIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { isRouteErrorResponse, useFetcher, useRevalidator } from "react-router";

import Button from "~/components/button";
import Card from "~/components/card";
import Code from "~/components/code";
import Link from "~/components/link";
import Notice from "~/components/notice";
import PageError from "~/components/page-error";
import { Tabs, TabsList, TabsPanel, TabsTab } from "~/components/tabs";
import { isApiError } from "~/server/headscale/api/error-client";
import {
  parsePolicy,
  policyDestinations,
  policySources,
  serializePolicy,
  type Policy,
} from "~/utils/acl-policy";
import toast from "~/utils/toast";

import type { Route } from "./+types/overview";
import { aclAction } from "./acl-action";
import { aclLoader } from "./acl-loader";
import Fallback from "./components/fallback";
import RulesEditor from "./components/rules-editor";
import TagsGroupsEditor from "./components/tags-groups-editor";

const LazyEditor = lazy(() =>
  import("./components/cm.client").then((m) => ({ default: m.Editor })),
);
const LazyDiffer = lazy(() =>
  import("./components/cm.client").then((m) => ({ default: m.Differ })),
);

export const loader = aclLoader;
export const action = aclAction;

import { useTranslation } from "~/i18n/context";

export default function Page({
  loaderData: { access, writable, policy, users, tagUsage },
}: Route.ComponentProps) {
  const { t, isZh } = useTranslation();
  const [codePolicy, setCodePolicy] = useState(policy);
  const fetcher = useFetcher<typeof action>();
  const { revalidate } = useRevalidator();
  const disabled = !access || !writable; // Disable if no permission or not writable

  const parsed = useMemo(() => parsePolicy(codePolicy), [codePolicy]);
  const sources = useMemo(
    () => (parsed.ok ? policySources(parsed.policy, users) : []),
    [parsed, users],
  );
  const destinations = useMemo(
    () => (parsed.ok ? policyDestinations(parsed.policy, users) : []),
    [parsed, users],
  );

  useEffect(() => {
    // Update the codePolicy when the loader data changes
    if (policy !== codePolicy) {
      setCodePolicy(policy);
    }
  }, [policy]);

  useEffect(() => {
    if (!fetcher.data) {
      // No data yet, return
      return;
    }

    if (fetcher.data.success === true) {
      toast(isZh ? "策略已更新保存" : "Updated policy");
      revalidate();
    }
  }, [fetcher.data, isZh]);

  // The structured editors round-trip through the policy text, so the file
  // editor, the diff view and Save all work off one source of truth.
  function applyPolicy(next: Policy) {
    setCodePolicy(serializePolicy(next));
  }

  function structuredPanel(render: (value: Policy) => ReactNode) {
    if (!parsed.ok) {
      return (
        <div className="p-4">
          <Notice
            title={isZh ? "无法可视化编辑策略" : "Policy cannot be edited visually"}
            variant="error"
          >
            {isZh ? (
              <>
                策略解析失败 ({parsed.error})。请在 <Code>编辑策略文件</Code>{" "}
                选项卡中修复，修复后将重新恢复可视化编辑器。
              </>
            ) : (
              <>
                The policy could not be parsed ({parsed.error}). Fix it in the{" "}
                <Code>Edit file</Code> tab and the visual editor will come back.
              </>
            )}
          </Notice>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 p-4">
        {parsed.hasComments ? (
          <Notice title={isZh ? "注释将被移除" : "Comments will be removed"} variant="warning">
            {isZh
              ? "当前策略包含注释。在可视化编辑器中保存更改将重写策略并丢失这些注释。"
              : "This policy contains comments. Saving a change made in the visual editor rewrites the policy and drops them."}
          </Notice>
        ) : null}
        {render(parsed.policy)}
      </div>
    );
  }

  return (
    <div>
      {!access ? (
        <Notice title={isZh ? "ACL 策略访问受限" : "ACL Policy restricted"} variant="warning">
          {isZh
            ? "您没有编辑访问控制列表 (ACL) 策略的权限。请联系管理员申请权限或修改策略。"
            : "You do not have the necessary permissions to edit the Access Control List policy. Please contact your administrator to request access or to make changes to the ACL policy."}
        </Notice>
      ) : !writable ? (
        <Notice title={isZh ? "只读 ACL 策略" : "Read-only ACL Policy"} variant="error">
          {isZh ? (
            <>
              您的 Headscale 配置中 ACL 策略模式很可能设置为 <Code>file</Code>。这意味着无法通过 Web
              界面编辑 ACL 文件。若要解决此问题，请在 Headscale 配置中将 <Code>policy.mode</Code>{" "}
              设置为 <Code>database</Code>。
            </>
          ) : (
            <>
              The ACL policy mode is most likely set to <Code>file</Code> in your Headscale
              configuration. This means that the ACL file cannot be edited through the web
              interface. In order to resolve this, you'll need to set <Code>policy.mode</Code> to{" "}
              <Code>database</Code> in your Headscale configuration.
            </>
          )}
        </Notice>
      ) : undefined}
      <h1 className="mb-4 text-2xl font-medium">{t("acls.title")}</h1>
      <p className="mb-4 max-w-prose">
        {isZh ? (
          <>
            ACL 文件用于定义您网络中设备之间的访问控制规则。您可以在{" "}
            <Link external styled to="https://tailscale.com/kb/1018/acls">
              Tailscale ACL 指南
            </Link>{" "}
            和{" "}
            <Link external styled to="https://headscale.net/stable/ref/acls/">
              Headscale 文档
            </Link>{" "}
            中了解更多信息。
          </>
        ) : (
          <>
            The ACL file is used to define the access control rules for your network. You can find
            more information about the ACL file in the{" "}
            <Link external styled to="https://tailscale.com/kb/1018/acls">
              Tailscale ACL guide
            </Link>{" "}
            and the{" "}
            <Link external styled to="https://headscale.net/stable/ref/acls/">
              Headscale docs
            </Link>
            .
          </>
        )}
      </p>
      {fetcher.data?.error !== undefined ? (
        <Notice
          title={fetcher.data.error.split(":")[0] ?? (isZh ? "错误" : "Error")}
          variant="error"
        >
          {fetcher.data.error.split(":").slice(1).join(": ") ??
            (isZh
              ? "尝试更新 ACL 策略时发生未知错误。"
              : "An unknown error occurred while trying to update the ACL policy.")}
        </Notice>
      ) : undefined}
      <Tabs className="mb-4" label="ACL Editor" defaultValue="rules">
        <TabsList>
          <TabsTab value="rules">
            <div className="flex items-center gap-2">
              <Shield className="p-1" />
              <span>{t("acls.rules")}</span>
            </div>
          </TabsTab>
          <TabsTab value="tags">
            <div className="flex items-center gap-2">
              <TagsIcon className="p-1" />
              <span>{isZh ? "标签与用户组" : "Tags & Groups"}</span>
            </div>
          </TabsTab>
          <TabsTab value="edit">
            <div className="flex items-center gap-2">
              <Pencil className="p-1" />
              <span>{isZh ? "编辑策略文件" : "Edit file"}</span>
            </div>
          </TabsTab>
          <TabsTab value="diff">
            <div className="flex items-center gap-2">
              <Eye className="p-1" />
              <span>{isZh ? "对比变更" : "Preview changes"}</span>
            </div>
          </TabsTab>
          <TabsTab value="preview">
            <div className="flex items-center gap-2">
              <FlaskConical className="p-1" />
              <span>{isZh ? "规则预览" : "Preview rules"}</span>
            </div>
          </TabsTab>
        </TabsList>
        <TabsPanel value="rules">
          {structuredPanel((value) => (
            <RulesEditor
              destinations={destinations}
              isDisabled={disabled}
              onChange={applyPolicy}
              policy={value}
              sources={sources}
            />
          ))}
        </TabsPanel>
        <TabsPanel value="tags">
          {structuredPanel((value) => (
            <TagsGroupsEditor
              isDisabled={disabled}
              onChange={applyPolicy}
              policy={value}
              tagUsage={tagUsage}
              users={users}
            />
          ))}
        </TabsPanel>
        <TabsPanel value="edit">
          <Suspense fallback={<Fallback />}>
            <LazyEditor isDisabled={disabled} onChange={setCodePolicy} value={codePolicy} />
          </Suspense>
        </TabsPanel>
        <TabsPanel value="diff">
          <Suspense fallback={<Fallback />}>
            <LazyDiffer left={policy} right={codePolicy} />
          </Suspense>
        </TabsPanel>
        <TabsPanel value="preview">
          <div className="flex flex-col items-center py-8">
            <Construction />
            <p className="mt-4 w-1/2 text-center text-sm text-mist-500">
              {isZh
                ? "规则预览功能尚在开发中，敬请期待。"
                : "Previewing rules is not available yet. This feature is still in development."}
            </p>
          </div>
        </TabsPanel>
      </Tabs>
      <Button
        className="mr-2"
        disabled={
          disabled || fetcher.state !== "idle" || codePolicy.length === 0 || codePolicy === policy
        }
        onClick={() => {
          const formData = new FormData();
          formData.append("policy", codePolicy);
          fetcher.submit(formData, { method: "PATCH" });
        }}
        variant="heavy"
      >
        {t("acls.savePolicy")}
      </Button>
      <Button
        disabled={disabled || fetcher.state !== "idle" || codePolicy === policy}
        onClick={() => {
          // Reset the editor to the original policy
          setCodePolicy(policy);
        }}
      >
        {t("acls.discardChanges")}
      </Button>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (
    isRouteErrorResponse(error) &&
    isApiError(error.data) &&
    error.data.rawData.includes("reading policy from path") &&
    error.data.rawData.includes("no such file or directory")
  ) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="max-w-2xl" variant="flat">
          <div className="flex items-center justify-between gap-4">
            <Card.Title>ACL Policy Unavailable</Card.Title>
            <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
          </div>
          <Card.Text>
            The ACL policy is currently unavailable because the policy file does not exist on the
            server. This usually indicates that Headscale is running in <Code>file</Code> mode for
            ACLs, and the specified policy file is missing.
          </Card.Text>
        </Card>
        <Card className="max-w-2xl" variant="flat">
          <Card.Text>
            In order to resolve this issue, there are two possible actions you can take:
          </Card.Text>
          <ul className="mt-2 ml-4 list-outside list-disc space-y-1 text-sm">
            <li>
              Create the ACL policy file at the specified path in your Headscale configuration.
            </li>
            <li>
              Alternatively, you can switch Headscale to use <Code>database</Code> mode for ACLs by
              updating your Headscale configuration. This will allow Headplane to manage the ACL
              policy directly through the web interface.
            </li>
          </ul>
        </Card>
      </div>
    );
  }

  return <PageError error={error} page="Access Control" />;
}
