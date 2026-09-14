import { useTranslation } from "~/i18n/context";
import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export function HeadplaneAgentTag() {
  const { isZh } = useTranslation();

  return (
    <Tooltip
      content={
        isZh
          ? "此机器正在运行 Headplane Agent 代理服务，可向 Web 控制台提供详细的主机系统和版本信息。"
          : "This machine is running the Headplane agent, which allows it to provide host information in the web UI."
      }
    >
      <Chip
        text="Headplane Agent"
        className={cn("bg-purple-300 text-purple-900 dark:bg-purple-900 dark:text-purple-300")}
      />
    </Tooltip>
  );
}
