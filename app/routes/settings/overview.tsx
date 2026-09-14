import { ArrowRight } from "lucide-react";

import Link from "~/components/link";
import PageError from "~/components/page-error";
import { headscaleConfigContext, oidcContext } from "~/server/context";

import type { Route } from "./+types/overview";

export async function loader({ context }: Route.LoaderArgs) {
  const headscaleConfig = context.get(headscaleConfigContext);
  const oidc = context.get(oidcContext);

  return {
    config: headscaleConfig.writable(),
    isOidcEnabled: oidc.state === "enabled" && oidc.value.status().state === "ready",
  };
}

import { useTranslation } from "~/i18n/context";

export default function Page({ loaderData: { config, isOidcEnabled } }: Route.ComponentProps) {
  const { t, isZh } = useTranslation();

  return (
    <div className="flex max-w-(--breakpoint-lg) flex-col gap-8">
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">{t("settings.title")}</h1>
        <p>
          {isZh
            ? "系统设置页面提供了预授权密钥、Headplane Agent 代理服务以及身份验证限制策略等全局配置。"
            : "The settings page provides configuration for pre-auth keys, Headplane agent telemetry, and authentication restrictions."}
        </p>
      </div>
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">{t("settings.authKeys.title")}</h1>
        <p>
          {isZh ? (
            <>
              Headscale 支持使用预授权密钥（Pre-Auth Keys）以便快捷自动地将新设备加入您的
              Tailnet。访问{" "}
              <Link external styled to="https://tailscale.com/kb/1085/auth-keys/">
                Tailscale 官方文档
              </Link>{" "}
              了解更多关于预授权密钥的使用说明。
            </>
          ) : (
            <>
              Headscale fully supports pre-authentication keys in order to easily add devices to
              your Tailnet. To learn more about using pre-authentication keys, visit the{" "}
              <Link external styled to="https://tailscale.com/kb/1085/auth-keys/">
                Tailscale documentation
              </Link>
            </>
          )}
        </p>
      </div>
      <Link
        to="/settings/auth-keys"
        className="inline-flex w-fit cursor-pointer items-center text-lg font-medium text-indigo-600 transition-all duration-150 ease-out hover:text-indigo-500 active:scale-[0.98] dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <div className="flex items-center">
          {isZh ? "管理预授权密钥" : "Manage Auth Keys"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </Link>
      <div className="flex w-full flex-col sm:w-2/3">
        <h1 className="mb-4 text-2xl font-medium">{t("settings.agent.title")}</h1>
        <p>
          {isZh
            ? "Headplane Agent 是后台轻量服务，可从 Tailnet 自动同步各节点的操作系统版本与在线网络详情。"
            : "The Headplane Agent syncs node information like OS version and connectivity details from your Tailnet."}
        </p>
      </div>
      <Link
        to="/settings/agent"
        className="inline-flex w-fit cursor-pointer items-center text-lg font-medium text-indigo-600 transition-all duration-150 ease-out hover:text-indigo-500 active:scale-[0.98] dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <div className="flex items-center">
          {isZh ? "Agent 代理设置" : "Agent Settings"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </div>
      </Link>
      {config && isOidcEnabled ? (
        <>
          <div className="flex w-full flex-col sm:w-2/3">
            <h1 className="mb-4 text-2xl font-medium">
              {isZh ? "身份验证限制" : "Authentication Restrictions"}
            </h1>
            <p>
              {isZh ? (
                <>
                  Headscale 支持限制 OIDC
                  登录身份，仅允许特定的邮箱域名、用户组或特定用户进行认证登录。{" "}
                  <Link
                    external
                    styled
                    to="https://headscale.net/stable/ref/oidc/#basic-configuration"
                  >
                    {t("common.learnMore")}
                  </Link>
                </>
              ) : (
                <>
                  Headscale supports restricting OIDC authentication to only allow certain email
                  domains, groups, or users to authenticate.{" "}
                  <Link
                    external
                    styled
                    to="https://headscale.net/stable/ref/oidc/#basic-configuration"
                  >
                    Learn More
                  </Link>
                </>
              )}
            </p>
          </div>
          <Link
            to="/settings/restrictions"
            className="inline-flex w-fit cursor-pointer items-center text-lg font-medium text-indigo-600 transition-all duration-150 ease-out hover:text-indigo-500 active:scale-[0.98] dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <div className="flex items-center">
              {isZh ? "管理限制规则" : "Manage Restrictions"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>
        </>
      ) : undefined}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <PageError error={error} page="Settings" />;
}
