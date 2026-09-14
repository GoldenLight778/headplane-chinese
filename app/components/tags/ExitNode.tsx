import { Info } from "lucide-react";

import { useTranslation } from "~/i18n/context";
import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export interface ExitNodeTagProps {
  isEnabled?: boolean;
}

export function ExitNodeTag({ isEnabled }: ExitNodeTagProps) {
  const { isZh } = useTranslation();

  return (
    <Tooltip
      content={
        isEnabled ? (
          <>{isZh ? "此机器正在作为出口节点运行。" : "This machine is acting as an exit node."}</>
        ) : (
          <>
            {isZh
              ? "此机器请求作为出口节点使用。您可以在机器菜单的“编辑路由设置”中进行审核。"
              : 'This machine is requesting to be used as an exit node. Review this from the "Edit route settings..." option in the machine\'s menu.'}
          </>
        )
      }
    >
      <Chip
        text={isZh ? "出口节点" : "Exit Node"}
        className={cn("bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-300")}
        rightIcon={isEnabled ? undefined : <Info className="h-full w-fit" />}
      />
    </Tooltip>
  );
}
