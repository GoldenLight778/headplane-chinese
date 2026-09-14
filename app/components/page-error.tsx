import { RefreshCw, ServerOff } from "lucide-react";
import { isRouteErrorResponse, useRevalidator } from "react-router";

import { useTranslation } from "~/i18n/context";
import { isConnectionError } from "~/server/headscale/api/error-client";
import cn from "~/utils/cn";

import Button from "./button";
import { ErrorBanner } from "./error-banner";

interface PageErrorProps {
  error: unknown;
  page: string;
}

const pageNames: Record<string, string> = {
  Machines: "机器列表",
  Users: "用户管理",
  DNS: "DNS 设置",
  Settings: "系统设置",
  "Access Control": "访问控制",
};

export default function PageError({ error, page }: PageErrorProps) {
  const { isZh } = useTranslation();
  const { revalidate, state } = useRevalidator();
  const localizedPage = isZh ? (pageNames[page] ?? page) : page;

  if (isRouteErrorResponse(error) && isConnectionError(error.data)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ServerOff className={cn("h-12 w-12", "text-mist-400 dark:text-mist-500")} />
        <h2 className="mt-4 text-lg font-semibold">
          {isZh ? `${localizedPage} 暂不可用` : `${page} Unavailable`}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-mist-500 dark:text-mist-400">
          {isZh
            ? "由于无法连接到 Headscale 服务器，该页面无法加载。连接恢复后将恢复正常。"
            : "This page could not be loaded because the Headscale server is unreachable. It will be available once the connection is restored."}
        </p>
        <Button
          className="mt-6"
          variant="light"
          onClick={() => revalidate()}
          disabled={state === "loading"}
        >
          <RefreshCw
            className={cn("mr-2 inline-block h-4 w-4", state === "loading" && "animate-spin")}
          />
          {isZh ? "重试" : "Retry"}
        </Button>
      </div>
    );
  }

  return <ErrorBanner className="max-w-2xl" error={error} />;
}
