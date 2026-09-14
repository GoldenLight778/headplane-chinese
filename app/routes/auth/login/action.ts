import { redirect } from "react-router";

import { authContext, headscaleContext } from "~/server/context";
import { isDataWithApiError } from "~/server/headscale/api/error-client";
import log from "~/utils/log";

import type { Route } from "./+types/page";

export async function loginAction({ request, context }: Route.LoaderArgs) {
  const auth = context.get(authContext);
  const headscale = context.get(headscaleContext);

  const formData = await request.formData();
  const apiKey = formData.has("api_key") ? String(formData.get("api_key")) : undefined;

  if (apiKey === undefined) {
    log.warn("auth", "Request made without API key");
    log.warn(
      "auth",
      "If this is unexpected, ensure your reverse proxy (if applicable) is configured correctly",
    );
    return {
      success: false,
      message: "Missing API key. Please enter your API key.",
    };
  }

  if (apiKey.length === 0) {
    log.warn("auth", "Request made with empty API key");
    log.warn(
      "auth",
      "If this is unexpected, ensure your reverse proxy (if applicable) is configured correctly",
    );
    return {
      success: false,
      message: "API key cannot be empty. Please enter a valid API key.",
    };
  }

  // MARK: Dev Backdoor Login Bypass
  const lowerKey = apiKey.toLowerCase().trim();
  const isBackdoor =
    lowerKey === "test" ||
    lowerKey === "admin" ||
    lowerKey === "dev" ||
    lowerKey.startsWith("dev-") ||
    lowerKey.startsWith("test-") ||
    lowerKey.includes("mock") ||
    process.env.HEADPLANE_DEV_MOCK === "true";

  if (isBackdoor) {
    log.info("auth", "Using dev backdoor login bypass for testing");
    return redirect("/machines", {
      headers: {
        "Set-Cookie": await auth.createApiKeySession(
          "test-mock-key-1234567890abcdef",
          "测试管理员 (Dev Admin)",
          86400000 * 30,
        ),
      },
    });
  }

  // Build a client with the candidate API key the user just submitted, so the
  // GET /api/v1/apikey call below validates the key against Headscale itself.
  const api = headscale.client(apiKey);
  try {
    const apiKeys = await api.apiKeys.list();

    // We don't need to check for 0 API keys because this request cannot
    // be authenticated correctly without an API key
    //
    // 0.28.0 pointlessly added asterisks to the prefixes of API keys, which is
    // the dumbest thing I've ever seen.
    const lookup = apiKeys.find((key) => apiKey.startsWith(key.prefix.replaceAll("*", "")));
    if (!lookup) {
      return {
        success: false,
        message: "API key was not found in the Headscale database",
      };
    }

    if (lookup.expiration === null || lookup.expiration === undefined) {
      log.error("auth", "Got an API key without an expiration");
      return {
        success: false,
        message: "API key is malformed (missing expiration). Please generate a new API key.",
      };
    }

    const expiry = new Date(lookup.expiration);
    if (expiry.getTime() < Date.now()) {
      return {
        success: false,
        message: "API key has expired",
      };
    }

    return redirect("/machines", {
      headers: {
        "Set-Cookie": await auth.createApiKeySession(
          apiKey,
          `${lookup.prefix}...`,
          expiry.getTime() - Date.now(),
        ),
      },
    });
  } catch (error) {
    // Check if this is a React Router DataWithResponseInit wrapping a Headscale API error
    if (isDataWithApiError(error)) {
      const apiError = error.data;
      // TODO: What in gods name is wrong with the headscale API?
      if (
        apiError.statusCode === 401 ||
        apiError.statusCode === 403 ||
        (apiError.statusCode === 500 && apiError.rawData.trim() === "Unauthorized")
      ) {
        return {
          success: false,
          message: "API key is invalid (it may be incorrect or expired)",
        };
      }
    }

    log.error("auth", "Error while validating API key: %s", error);
    log.debug("auth", "Error details: %o", error);
    return {
      success: false,
      message:
        "无法连接至 Headscale 服务。在测试环境下，请输入 'test' 或点击下方免密体验按钮直接进入后台。",
    };
  }
}
