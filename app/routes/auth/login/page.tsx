import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Form, Link as RouterLink, redirect, useSearchParams } from "react-router";

import Button from "~/components/button";
import Card from "~/components/card";
import Code from "~/components/code";
import Input from "~/components/input";
import Link from "~/components/link";
import { appConfigContext, authContext, oidcContext } from "~/server/context";
import type { OidcError, OidcService } from "~/server/oidc/provider";
import cn from "~/utils/cn";
import { useLiveData } from "~/utils/live-data";
import log from "~/utils/log";

import type { Route } from "./+types/page";
import { loginAction } from "./action";
import { OidcConfigErrorNotice, OidcDiscoveryFailedNotice } from "./config-error";
import Logout from "./logout";
import { OidcErrorNotice } from "./oidc-error";

export async function loader({ request, context, url }: Route.LoaderArgs) {
  const auth = context.get(authContext);
  const config = context.get(appConfigContext);
  const oidc = context.get(oidcContext);

  try {
    await auth.require(request);
    return redirect("/machines");
  } catch {}

  const qp = url.searchParams;
  const urlState = qp.get("s") ?? undefined;

  const oidcService = oidc.state === "enabled" ? oidc.value : undefined;
  let oidcStatus: ReturnType<OidcService["status"]> | undefined;
  if (oidcService) {
    try {
      const result = await oidcService.discover();
      if (!result.ok) {
        logLoginOidcError("OIDC discovery failed", result.error);
      }
    } catch (error) {
      log.error("auth", "OIDC discovery failed unexpectedly: %s", String(error));
      log.debug("auth", "OIDC discovery error details: %o", error);
    }

    oidcStatus = oidcService.status();
  }

  if (
    oidcService &&
    config.oidc?.disable_api_key_login &&
    oidcStatus?.state === "ready" &&
    urlState !== "logout"
  ) {
    return redirect("/oidc/start");
  }

  const isOidcConnectorEnabled = oidcStatus?.state === "ready";
  const oidcErrorCodes = oidcStatus?.state === "error" ? [oidcStatus.error.code] : [];

  return {
    isCookieSecureEnabled: config.server.cookie_secure,
    isOidcConnectorEnabled,
    oidcErrorCodes,
    urlState,
  };
}

export const action = loginAction;

function logLoginOidcError(context: string, error: OidcError): void {
  log.error("auth", "%s [%s]: %s", context, error.code, error.message);
  if (error.hint) {
    log.error("auth", "Hint: %s", error.hint);
  }
}

import { useTranslation } from "~/i18n/context";

export default function Page({ loaderData, actionData }: Route.ComponentProps) {
  const { isCookieSecureEnabled, isOidcConnectorEnabled, oidcErrorCodes, urlState } = loaderData;
  const { t, isZh, language, setLanguage } = useTranslation();

  const [showCookieWarning, setShowCookieWarning] = useState(false);
  const [params] = useSearchParams();
  const { pause } = useLiveData();

  useEffect(() => {
    // This page does NOT need stale while revalidate logic
    pause();

    if (isCookieSecureEnabled && window.location.protocol !== "https:") {
      setShowCookieWarning(true);
    }
  });

  useEffect(() => {
    // State is a one time thing, we need to remove it after it has
    // Been consumed to prevent logic loops.
    if (urlState !== null) {
      const searchParams = new URLSearchParams(params);
      searchParams.delete("s");

      // Replacing because it's not a navigation, just a cleanup of the URL
      // We can't use the useSearchParams method since it revalidates
      // Which will trigger a full reload
      const newUrl = searchParams.toString()
        ? `{${window.location.pathname}?${searchParams.toString()}`
        : window.location.pathname;

      window.history.replaceState(null, "", newUrl);
    }
  }, [urlState, params]);

  if (urlState === "logout") {
    return <Logout />;
  }

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center p-4">
      {/* Quick Language Switcher on Login page */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer select-none",
            "border border-mist-200 dark:border-mist-700 bg-white/80 dark:bg-mist-900/80 backdrop-blur-xs",
            "text-mist-700 dark:text-mist-300 hover:border-mist-300 dark:hover:border-mist-600",
            "transition-all duration-150 ease-out active:scale-95",
          )}
        >
          {language === "zh" ? "English" : "简体中文"}
        </button>
      </div>

      <div className="w-full max-w-md">
        {urlState?.startsWith("error_") ? (
          <OidcErrorNotice code={urlState} />
        ) : oidcErrorCodes.includes("discovery_failed") ? (
          <OidcDiscoveryFailedNotice />
        ) : oidcErrorCodes.length > 0 ? (
          <OidcConfigErrorNotice errors={oidcErrorCodes} />
        ) : showCookieWarning ? (
          <Card className="m-4 mb-4 max-w-md border border-red-500 sm:m-0 sm:mb-4">
            <div className="flex items-center justify-between gap-4">
              <Card.Title className="text-red-500">
                {isZh ? "配置问题" : "Configuration Issue"}
              </Card.Title>
              <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
            </div>
            {showCookieWarning ? (
              <Card.Text className="text-sm">
                {isZh ? (
                  <>
                    Headplane 配置为使用安全
                    Cookie，但此站点正在通过不安全连接提供服务，登录将无法正常工作。{" "}
                    <Link
                      external
                      styled
                      to="https://headplane.net/configuration/common-issues#issue-logging-in-does-not-do-anything"
                    >
                      {t("common.learnMore")}
                    </Link>
                  </>
                ) : (
                  <>
                    Headplane is configured to use secure cookies, but this site is being served
                    over an insecure connection and login will not work correctly.{" "}
                    <Link
                      external
                      styled
                      to="https://headplane.net/configuration/common-issues#issue-logging-in-does-not-do-anything"
                    >
                      Learn more.
                    </Link>
                  </>
                )}
              </Card.Text>
            ) : undefined}
          </Card>
        ) : undefined}
        <Card className="max-w-md">
          <Card.Title>{isZh ? "欢迎使用 Headplane" : "Welcome to Headplane"}</Card.Title>
          <Form method="POST">
            <Card.Text>
              {isZh ? (
                <>
                  输入 API 密钥以登录 Headplane。您可以通过在终端中运行{" "}
                  <Code>headscale apikeys create</Code> 来生成密钥。
                </>
              ) : (
                <>
                  Enter an API key to authenticate with Headplane. You can generate one by running{" "}
                  <Code>headscale apikeys create</Code> in your terminal.
                </>
              )}
            </Card.Text>
            <Input
              className="mt-8 mb-2"
              required
              label={isZh ? "API 密钥" : "API Key"}
              labelHidden
              name="api_key"
              placeholder={
                isZh ? "API 密钥（测试模式输入 test 即可）" : "API Key (or type 'test' in dev)"
              }
              type="password"
            />
            {actionData?.success === false ? (
              <Card.Text className="mb-2 text-sm text-red-600 dark:text-red-300">
                {actionData.message}
              </Card.Text>
            ) : undefined}
            <Button className="w-full" type="submit" variant="heavy">
              {t("login.submit")}
            </Button>
          </Form>
          {isOidcConnectorEnabled ? (
            <RouterLink to="/oidc/start" prefetch="none" reloadDocument>
              <Button className="mt-2 w-full" disabled={oidcErrorCodes.length > 0} variant="light">
                {t("login.loginWithOidc")}
              </Button>
            </RouterLink>
          ) : undefined}

          <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <Form method="POST">
              <input type="hidden" name="api_key" value="test" />
              <Button
                className="w-full bg-emerald-600 font-medium text-white shadow-xs hover:bg-emerald-500"
                type="submit"
                variant="heavy"
              >
                {isZh ? "⚡ 测试模式免密直接体验" : "⚡ Quick Dev Preview (Bypass Check)"}
              </Button>
            </Form>
            <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {isZh
                ? "内置全套 Mock 模拟数据，无需 Headscale 即可直接进入后台"
                : "Includes full mock dataset; preview all pages without Headscale"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
