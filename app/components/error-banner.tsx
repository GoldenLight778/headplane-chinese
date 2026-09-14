import { AlertCircle } from "lucide-react";
import { isRouteErrorResponse } from "react-router";

import { useTranslation } from "~/i18n/context";
import { isApiError, isConnectionError } from "~/server/headscale/api/error-client";
import cn from "~/utils/cn";

import Card from "./card";
import Code from "./code";
import Link from "./link";

export function getErrorMessage(
  error: Error | unknown,
  isZh?: boolean,
): {
  title: string;
  jsxMessage: React.ReactNode;
} {
  if (isRouteErrorResponse(error)) {
    if (isApiError(error.data)) {
      const { statusCode, rawData, data, requestUrl } = error.data;
      if (statusCode >= 500) {
        return {
          jsxMessage: (
            <>
              <Card.Text>
                {isZh ? (
                  <>
                    与 Headscale API 通信时发生错误。
                    <br />
                    服务器返回了状态码 <strong>{statusCode}</strong>，表明服务端出现异常。请检查
                    Headscale 服务状态后重试。
                  </>
                ) : (
                  <>
                    There was an error communicating with the Headscale API.
                    <br />
                    The server responded with a status code of <strong>{statusCode}</strong>,
                    indicating a server-side issue. Please check the Headscale server status and try
                    again later.
                  </>
                )}
              </Card.Text>
              {(error.data.data != null || error.data.rawData != null) && (
                <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
                  {error.data.data != null ? (
                    <code>{JSON.stringify(error.data.data, null, 2)}</code>
                  ) : (
                    <code>{error.data.rawData}</code>
                  )}
                </pre>
              )}
            </>
          ),
          title: isZh ? "Headscale API 错误" : "Headscale API Error",
        };
      }

      const authError = error.data.statusCode === 401 || error.data.statusCode === 403;

      return {
        jsxMessage: (
          <>
            <Card.Text className="leading-snug">
              {isZh ? (
                <>
                  Headscale API 返回了异常响应。
                  {authError ? (
                    <> 状态码表明身份验证失败，请验证您的 API 密钥与 Headplane 配置。</>
                  ) : (
                    <> 您可能在使用不受支持的 Headscale 版本，或者这可能是一个程序缺陷。</>
                  )}
                </>
              ) : (
                <>
                  The Headscale API returned an unexpected response.
                  {authError ? (
                    <>
                      {" "}
                      The status code indicates an authentication error. Please verify your API key
                      and Headplane configuration.
                    </>
                  ) : (
                    <> You may be using an unsupported version of Headscale or this may be a bug.</>
                  )}
                </>
              )}
            </Card.Text>
            <ul className="mt-2 list-inside list-disc">
              <li>
                {isZh ? "请求地址: " : "Request URL: "}
                <Code>{requestUrl}</Code>
              </li>
              <li>
                {isZh ? "状态码: " : "Status Code: "}{" "}
                <Code>
                  {/* @ts-expect-error */}
                  {data === null ? (
                    <>
                      {statusCode} {rawData}
                    </>
                  ) : (
                    <>
                      {statusCode} {error.statusText}
                    </>
                  )}
                </Code>
              </li>
            </ul>
            <Card.Text className="mt-4 text-lg font-semibold">
              {isZh ? "错误详情" : "Error Details"}
            </Card.Text>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
              <code>{JSON.stringify(error.data, null, 2)}</code>
            </pre>
          </>
        ),
        title: isZh ? "Headscale API 响应无效" : "Invalid response from Headscale API",
      };
    }

    if (isConnectionError(error.data)) {
      const { requestUrl, errorCode, errorMessage, extraData } = error.data;
      return {
        jsxMessage: (
          <>
            <Card.Text className="leading-snug">
              {isZh
                ? "Headplane 无法访问 Headscale API。请检查您的网络连接与配置，确保 Headplane 能够正常连接到 Headscale。"
                : "Headplane was unable to reach the Headscale API. Please check your network setup and configuration to ensure Headplane is able to connect."}
            </Card.Text>
            <Card.Text className="mt-4 text-lg font-semibold">
              {isZh ? "错误详情" : "Error Details"}
            </Card.Text>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
              {requestUrl}
              <br />
              {errorCode}: {errorMessage}
              {extraData != null && (
                <>
                  <br />
                  <br />
                  <code>{JSON.stringify(extraData, null, 2)}</code>
                </>
              )}
            </pre>
          </>
        ),
        title: isZh ? "无法连接到 Headscale API" : "Cannot connect to Headscale API",
      };
    }

    return {
      jsxMessage: (
        <>
          {isZh ? "处理您的请求时发生错误。" : "There was an error processing your request."}
          <br />
          {isZh ? "状态码: " : "Status Code: "}
          <strong>{error.status}</strong>
          <br />
          {isZh ? "状态说明: " : "Status Text: "}
          <strong>{error.data}</strong>
        </>
      ),
      title: isZh ? `错误 ${error.status}` : `Error ${error.status}`,
    };
  }

  if (!(error instanceof Error)) {
    return {
      jsxMessage: (
        <>
          <Card.Text>
            {isZh ? (
              <>发生了一个意外错误，这可能是程序缺陷所致。请考虑携带以下详情反馈给开发者。</>
            ) : (
              <>
                An unexpected error occurred which is most likely a bug. Please consider reporting
                filing an issue on the{" "}
                <Link external styled to="https://github.com/tale/headplane/issues">
                  Headplane GitHub
                </Link>{" "}
                repository with the details below.
              </>
            )}
          </Card.Text>
          <Card.Text className="mt-4 text-lg font-semibold">
            {isZh ? "错误详情" : "Error Details"}
          </Card.Text>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-mist-100 p-2 dark:bg-mist-800">
            <code>{JSON.stringify(error, null, 2)}</code>
          </pre>
        </>
      ),
      title: isZh ? "意外错误" : "Unexpected Error",
    };
  }

  // Traverse the error chain to find the root cause
  let rootError = error;
  if (error.cause != null) {
    rootError = error.cause as Error;
    while (rootError.cause != null) {
      rootError = rootError.cause as Error;
    }
  }

  // TODO: If we are aggregate, concat into a single message
  if (rootError instanceof AggregateError) {
    throw new Error("AggregateError handling not implemented yet");
  }

  return {
    jsxMessage: rootError.message,
    title:
      rootError.name.length > 0 && rootError.name !== "Error"
        ? isZh
          ? `错误: ${rootError.name}`
          : `Error: ${rootError.name}`
        : isZh
          ? "错误"
          : "Error",
  };
}

interface ErrorBannerProps {
  error: unknown;
  className?: string;
}

export function ErrorBanner({ error, className }: ErrorBannerProps) {
  const { isZh } = useTranslation();
  const { title, jsxMessage } = getErrorMessage(error, isZh);

  return (
    <Card className={cn("w-screen", className)} variant="flat">
      <div className="flex items-center justify-between gap-4">
        <Card.Title>{title}</Card.Title>
        <AlertCircle className="mb-2 h-6 w-6 text-red-500" />
      </div>
      {jsxMessage}
    </Card>
  );
}
