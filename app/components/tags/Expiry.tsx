import { useTranslation } from "~/i18n/context";

import Chip from "../chip";
import Tooltip from "../tooltip";

export interface ExpiryTagProps {
  variant: "expired" | "no-expiry";
  expiry?: string;
}

export function ExpiryTag({ variant, expiry }: ExpiryTagProps) {
  const { isZh } = useTranslation();
  const formatter = new Intl.DateTimeFormat(isZh ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Tooltip
      content={
        variant === "expired" ? (
          <>
            {isZh
              ? "此机器的密钥已过期，无法连接到网络。请在机器上使用 Tailscale 重新进行身份验证以重新启用。"
              : "This machine is expired and will not be able to connect to the network. Re-authenticate with Tailscale on the machine to re-enable it."}
          </>
        ) : (
          <>
            {isZh
              ? "此机器已停用密钥过期机制，无需重新进行身份验证。"
              : "This machine has key expiry disabled and will never need to re-authenticate."}
          </>
        )
      }
    >
      <Chip
        text={
          variant === "expired"
            ? isZh
              ? `已过期 (${formatter.format(new Date(expiry!))})`
              : `Expired ${formatter.format(new Date(expiry!))}`
            : isZh
              ? "永不过期"
              : "No expiry"
        }
        className="bg-mist-200 text-mist-800 dark:bg-mist-800 dark:text-mist-200"
      />
    </Tooltip>
  );
}
