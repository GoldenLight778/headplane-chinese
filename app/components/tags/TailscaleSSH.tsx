import { useTranslation } from "~/i18n/context";
import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export function TailscaleSSHTag() {
  const { isZh } = useTranslation();

  return (
    <Tooltip
      content={
        isZh
          ? "此机器已启用 Tailscale SSH，允许您使用 Tailscale 身份验证并通过 Headplane Web UI 直接进行 SSH 终端连接。"
          : "This machine advertises Tailscale SSH, which allows you to authenticate SSH credentials using your Tailscale account and via the Headplane web UI."
      }
    >
      <Chip
        text="Tailscale SSH"
        className={cn("bg-lime-500 text-lime-900 dark:bg-lime-900 dark:text-lime-500")}
      />
    </Tooltip>
  );
}
