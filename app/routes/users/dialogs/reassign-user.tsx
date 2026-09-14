import Dialog, { DialogPanel } from "~/components/dialog";
import Link from "~/components/link";
import Notice from "~/components/notice";
import RadioGroup from "~/components/radio-group";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import { Roles } from "~/server/web/roles";
import type { Role } from "~/server/web/roles";

interface ReassignProps {
  headplaneUserId: string;
  displayName: string;
  role: Role;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ReassignUser({
  headplaneUserId,
  displayName,
  role,
  isOpen,
  setIsOpen,
}: ReassignProps) {
  const { isZh } = useTranslation();

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel
        variant={role === "owner" ? "unactionable" : "normal"}
        confirmText={isZh ? "保存角色" : "Change role"}
      >
        <Title>{isZh ? `更改角色: ${displayName}？` : `Change role for ${displayName}?`}</Title>
        <Text className="mb-6">
          {isZh ? (
            <>
              角色控制用户在 Headplane 中的访问权限。每个角色授予特定的功能权限。{" "}
              <Link external styled to="https://tailscale.com/kb/1138/user-roles">
                了解更多
              </Link>
            </>
          ) : (
            <>
              Roles control what the user can access in Headplane. Each role grants a specific set
              of capabilities.{" "}
              <Link external styled to="https://tailscale.com/kb/1138/user-roles">
                Learn More
              </Link>
            </>
          )}
        </Text>
        {role === "owner" ? (
          <Notice>
            {isZh ? "Tailnet 所有者角色无法被更改。" : "The Tailnet owner cannot be reassigned."}
          </Notice>
        ) : (
          <>
            <input name="action_id" type="hidden" value="reassign_user" />
            <input name="headplane_user_id" type="hidden" value={headplaneUserId} />
            <RadioGroup
              className="gap-4"
              defaultValue={role}
              label={isZh ? "角色" : "Role"}
              name="new_role"
            >
              {Object.keys(Roles)
                .filter((r) => r !== "owner")
                .map((r) => {
                  const { name, desc } = mapRoleToName(r, isZh);
                  return (
                    <RadioGroup.Radio key={r} label={name} value={r}>
                      <div className="block">
                        <p className="font-bold">{name}</p>
                        <p className="opacity-70">{desc}</p>
                      </div>
                    </RadioGroup.Radio>
                  );
                })}
            </RadioGroup>
          </>
        )}
      </DialogPanel>
    </Dialog>
  );
}

function mapRoleToName(role: string, isZh?: boolean) {
  switch (role) {
    case "admin":
      return {
        name: isZh ? "管理员" : "Admin",
        desc: isZh
          ? "可以查看管理控制台，管理网络、机器和用户设置。"
          : "Can view the admin console, manage network, machine, and user settings.",
      };
    case "network_admin":
      return {
        name: isZh ? "网络管理员" : "Network Admin",
        desc: isZh
          ? "可以查看管理控制台并管理 ACL 和网络设置。无法管理机器或用户。"
          : "Can view the admin console and manage ACLs and network settings. Cannot manage machines or users.",
      };
    case "it_admin":
      return {
        name: isZh ? "IT 管理员" : "IT Admin",
        desc: isZh
          ? "可以查看管理控制台并管理机器和用户。无法管理 ACL 或网络设置。"
          : "Can view the admin console and manage machines and users. Cannot manage ACLs or network settings.",
      };
    case "auditor":
      return {
        name: isZh ? "审计员" : "Auditor",
        desc: isZh ? "可以查看管理控制台。" : "Can view the admin console.",
      };
    case "viewer":
      return {
        name: isZh ? "观察者" : "Viewer",
        desc: isZh
          ? "可以查看机器、用户，并生成自己的预授权密钥。"
          : "Can view machines, users, and generate their own auth keys.",
      };
    case "member":
      return {
        name: isZh ? "普通成员" : "Member",
        desc: isZh ? "无法查看管理控制台。" : "Cannot view the admin console.",
      };
    default:
      return {
        name: role,
        desc: isZh ? "无描述信息。" : "No description available.",
      };
  }
}
