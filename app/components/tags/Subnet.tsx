import { Info } from "lucide-react";

import { useTranslation } from "~/i18n/context";
import cn from "~/utils/cn";

import Chip from "../chip";
import Tooltip from "../tooltip";

export interface SubnetTagProps {
  isEnabled?: boolean;
}

export function SubnetTag({ isEnabled }: SubnetTagProps) {
  const { isZh } = useTranslation();

  return (
    <Tooltip
      content={
        isEnabled ? (
          <>{isZh ? "此机器正在宣告子网路由。" : "This machine advertises subnet routes."}</>
        ) : (
          <>
            {isZh
              ? "此机器存在未生效的子网路由。您可以在机器菜单的“编辑路由设置”中进行审核。"
              : 'This machine has unadvertised subnet routes. Review this from the "Edit route settings..." option in the machine\'s menu.'}
          </>
        )
      }
    >
      <Chip
        text={isZh ? "子网路由" : "Subnets"}
        className={cn("bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-300")}
        rightIcon={isEnabled ? undefined : <Info className="h-full w-fit" />}
      />
    </Tooltip>
  );
}
