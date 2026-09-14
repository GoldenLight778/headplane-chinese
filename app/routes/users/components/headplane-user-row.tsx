import { CircleUser } from "lucide-react";

import Chip from "~/components/chip";
import StatusCircle from "~/components/status-circle";
import { useTranslation } from "~/i18n/context";
import type { Role } from "~/server/web/roles";
import cn from "~/utils/cn";

import type { HeadplaneUserData } from "../overview";
import MenuOptions from "./menu";

interface HeadplaneUserRowProps {
  user: HeadplaneUserData;
  headscaleUsers: { id: string; name: string; claimed: boolean }[];
  isSelf?: boolean;
  isOwner?: boolean;
  canEditGroups?: boolean;
  policyGroups?: string[];
  policyHasComments?: boolean;
}

export default function HeadplaneUserRow({
  user,
  headscaleUsers,
  isSelf,
  isOwner,
  canEditGroups,
  policyGroups,
  policyHasComments,
}: HeadplaneUserRowProps) {
  const { isZh } = useTranslation();
  const isOnline = user.machines.some((machine) => machine.online);
  const lastSeen = user.machines.reduce(
    (acc, machine) => Math.max(acc, new Date(machine.lastSeen).getTime()),
    0,
  );

  const displayName = user.linkedHeadscaleUser?.displayName || user.name || user.email || user.sub;
  const displayUsername =
    user.linkedHeadscaleUser?.displayName &&
    user.linkedHeadscaleUser.displayName !== user.linkedHeadscaleUser.name
      ? user.linkedHeadscaleUser.name
      : undefined;
  const displayEmail = user.linkedHeadscaleUser?.email ?? user.email;

  return (
    <tr className="group hover:bg-mist-100 dark:hover:bg-mist-800" key={user.id}>
      <td className="py-2 pl-2">
        <div className="flex items-center">
          {user.profilePicUrl ? (
            <img alt={displayName} className="h-10 w-10 rounded-full" src={user.profilePicUrl} />
          ) : (
            <CircleUser className="h-10 w-10" />
          )}
          <div className="ml-4">
            <p className="leading-snug font-semibold">{displayName}</p>
            {displayUsername && <p className="text-sm opacity-50">{displayUsername}</p>}
            {displayEmail && <p className="text-sm opacity-50">{displayEmail}</p>}
            {!user.headscaleUserId && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {isZh ? "未关联" : "Not linked"}
              </p>
            )}
            {user.groups.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {user.groups.map((group) => (
                  <Chip className="font-mono" key={group} text={group} />
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="py-2 pl-0.5">
        <p>{mapRoleToName(user.role, isZh)}</p>
      </td>
      <td className="py-2 pl-0.5">
        <p className="text-sm text-mist-600 dark:text-mist-300" suppressHydrationWarning>
          {user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleDateString(isZh ? "zh-CN" : undefined)
            : isZh
              ? "从未登录"
              : "Never"}
        </p>
      </td>
      <td className="py-2 pl-0.5">
        {user.machines.length > 0 ? (
          <span
            className={cn("flex items-center gap-x-1 text-sm", "text-mist-600 dark:text-mist-300")}
          >
            <StatusCircle className="h-4 w-4" isOnline={isOnline} />
            <p suppressHydrationWarning>
              {isOnline
                ? isZh
                  ? "已连接"
                  : "Connected"
                : new Date(lastSeen).toLocaleString(isZh ? "zh-CN" : undefined)}
            </p>
          </span>
        ) : (
          <p className="text-sm text-mist-600 dark:text-mist-300">
            {isZh ? "无机器" : "No machines"}
          </p>
        )}
      </td>
      <td className="py-2 pr-0.5">
        <MenuOptions
          canEditGroups={canEditGroups}
          currentLink={user.headscaleUserId ?? undefined}
          headscaleUsers={headscaleUsers}
          isOwner={isOwner}
          isSelf={isSelf}
          policyGroups={policyGroups}
          policyHasComments={policyHasComments}
          user={user}
        />
      </td>
    </tr>
  );
}

function mapRoleToName(role: Role, isZh?: boolean) {
  switch (role) {
    case "owner":
      return isZh ? "所有者" : "Owner";
    case "admin":
      return isZh ? "管理员" : "Admin";
    case "network_admin":
      return isZh ? "网络管理员" : "Network Admin";
    case "it_admin":
      return isZh ? "IT 管理员" : "IT Admin";
    case "auditor":
      return isZh ? "审计员" : "Auditor";
    case "viewer":
      return isZh ? "观察者" : "Viewer";
    case "member":
      return <p className="opacity-50">{isZh ? "成员" : "Member"}</p>;
    default:
      return isZh ? "未知" : "Unknown";
  }
}
