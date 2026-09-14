import { useFetcher } from "react-router";

import Button from "~/components/button";
import Link from "~/components/link";
import Notice from "~/components/notice";
import StatusCircle from "~/components/status-circle";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import { agentsContext, authContext } from "~/server/context";
import { formatTimeDelta } from "~/utils/time";

import type { Route } from "./+types/agent";

export async function loader({ request, context }: Route.LoaderArgs) {
  const agents = context.get(agentsContext);
  const auth = context.get(authContext);

  await auth.require(request);

  if (agents.state !== "enabled") {
    return { enabled: false as const, reason: agents.reason };
  }

  const sync = agents.value.lastSync();
  return {
    enabled: true as const,
    syncedAt: sync.syncedAt?.toISOString() ?? null,
    nodeCount: sync.nodeCount,
    error: sync.error,
    authUrl: sync.authUrl,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const agents = context.get(agentsContext);
  const auth = context.get(authContext);

  await auth.require(request);

  if (agents.state !== "enabled") {
    return { success: false, error: agents.reason };
  }

  await agents.value.triggerSync();
  const sync = agents.value.lastSync();
  return {
    success: !sync.error,
    error: sync.error,
    authUrl: sync.authUrl,
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { isZh } = useTranslation();
  const fetcher = useFetcher<typeof action>();
  const isSyncing = fetcher.state !== "idle";

  if (!loaderData.enabled) {
    return (
      <div className="flex max-w-(--breakpoint-lg) flex-col gap-8">
        <Title>{isZh ? "Headplane Agent 代理" : "Headplane Agent"}</Title>
        <Notice title={isZh ? "Agent 未启用" : "Agent Not Enabled"}>
          {loaderData.reason}.{" "}
          {isZh ? "了解如何设置 Agent，请参阅 " : "To learn how to set up the agent, visit the "}
          <Link external styled to="https://headplane.net/features/agent">
            {isZh ? "官方文档" : "documentation"}
          </Link>
          。
        </Notice>
      </div>
    );
  }

  const isPending = !loaderData.syncedAt && loaderData.authUrl;
  const hasError = Boolean(loaderData.error);

  return (
    <div className="flex max-w-(--breakpoint-lg) flex-col gap-8">
      <div className="flex w-full flex-col sm:w-2/3">
        <Title>{isZh ? "Headplane Agent 代理" : "Headplane Agent"}</Title>
        <Text>
          {isZh
            ? "Headplane Agent 从您的 Tailnet 中同步节点信息（如操作系统版本和网络连接细节）。"
            : "The Headplane Agent syncs node information like OS version and connectivity details from your Tailnet."}
        </Text>
      </div>

      <div className="flex items-center gap-3">
        <StatusCircle isOnline={!hasError && !isPending} className="h-5 w-5" />
        <span className="text-lg font-medium">
          {hasError
            ? isZh
              ? "异常"
              : "Error"
            : isPending
              ? isZh
                ? "等待批准"
                : "Waiting for approval"
              : isZh
                ? "运行正常"
                : "Healthy"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Text>
          <span className="font-medium">{isZh ? "最后同步: " : "Last synced: "}</span>
          {loaderData.syncedAt ? (
            <span suppressHydrationWarning>
              {formatTimeDelta(new Date(loaderData.syncedAt), isZh)}
            </span>
          ) : isZh ? (
            "从未同步"
          ) : (
            "Never"
          )}
        </Text>
        <Text>
          <span className="font-medium">{isZh ? "已同步节点数: " : "Nodes synced: "}</span>
          {loaderData.nodeCount}
        </Text>
      </div>

      {isPending ? (
        <Notice variant="warning" title={isZh ? "Agent 需要批准" : "Agent Needs Approval"}>
          {isZh ? (
            <>
              Agent 正在等待其 Tailnet 注册被批准。Headplane
              将尝试自动批准它，但如果失败，您可以访问{" "}
              <Link external styled to={loaderData.authUrl!}>
                此链接
              </Link>{" "}
              手动完成批准。
            </>
          ) : (
            <>
              The agent is waiting for its Tailnet registration to be approved. Headplane will
              attempt to auto-approve it, but if that fails, you can complete approval by visiting{" "}
              <Link external styled to={loaderData.authUrl!}>
                this link
              </Link>
              .
            </>
          )}
        </Notice>
      ) : undefined}

      {loaderData.error ? (
        <Notice variant="error" title={isZh ? "同步错误" : "Sync Error"}>
          {loaderData.error}
        </Notice>
      ) : undefined}

      <fetcher.Form method="post">
        <Button type="submit" variant="heavy" disabled={isSyncing}>
          {isSyncing ? (isZh ? "同步中…" : "Syncing…") : isZh ? "立即同步" : "Sync Now"}
        </Button>
      </fetcher.Form>
    </div>
  );
}
