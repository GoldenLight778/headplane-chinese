import { CheckCircle, CircleSlash, Info, UserCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { data } from "react-router";

import Attribute from "~/components/attribute";
import Button from "~/components/button";
import Card from "~/components/card";
import Chip from "~/components/chip";
import Link from "~/components/link";
import StatusCircle from "~/components/status-circle";
import Tooltip from "~/components/tooltip";
import {
  agentsContext,
  headscaleConfigContext,
  headscaleContext,
  headscaleLiveStoreContext,
  requestApiContext,
} from "~/server/context";
import { nodesResource, usersResource } from "~/server/headscale/live-store";
import cn from "~/utils/cn";
import { getOSInfo, getTSVersion } from "~/utils/host-info";
import { extractTagOwnerTags, isNoExpiry, mapNodes, sortAssignableTags } from "~/utils/node-info";
import { getUserDisplayName } from "~/utils/user";

import type { Route } from "./+types/machine";
import { mapTagsToComponents, uiTagsForNode } from "./components/machine-row";
import MenuOptions from "./components/menu";
import Routes from "./dialogs/routes";
import { machineAction } from "./machine-actions";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const agentsFeature = context.get(agentsContext);
  const getRequestApi = context.get(requestApiContext);
  const headscale = context.get(headscaleContext);
  const headscaleConfig = context.get(headscaleConfigContext);
  const headscaleLiveStore = context.get(headscaleLiveStoreContext);

  if (!params.id) {
    throw new Error("No machine ID provided");
  }

  if (params.id.endsWith(".ico")) {
    throw data(null, { status: 204 });
  }

  const magic = headscaleConfig.getMagicDNSBaseDomain();

  const { api } = await getRequestApi(request);
  const [nodesSnap, usersSnap] = await Promise.all([
    headscaleLiveStore.get(nodesResource, api),
    headscaleLiveStore.get(usersResource, api),
  ]);
  const nodes = nodesSnap.data;
  const users = usersSnap.data;
  const node = nodes.find((node) => node.id === params.id);
  if (node == null) {
    throw data(null, { status: 404 });
  }

  const agents = agentsFeature.state === "enabled" ? agentsFeature.value : undefined;
  const [lookup, policyResult] = await Promise.allSettled([
    agents?.lookup([node.nodeKey]),
    api.policy.get(),
  ]);
  const stats = lookup.status === "fulfilled" ? lookup.value : undefined;
  const [enhancedNode] = mapNodes([node], stats);
  const tags = [...node.tags].toSorted();
  const supportsNodeOwnerChange = !headscale.capabilities.nodeOwnerIsImmutable;
  const supportsDisablingKeyExpiry = headscale.capabilities.keyExpiryCanBeDisabled;
  const agentSync = agents?.lastSync();
  const policy = policyResult.status === "fulfilled" ? policyResult.value.policy : undefined;

  return {
    agent: agentSync
      ? {
          syncedAt: agentSync.syncedAt?.toISOString() ?? null,
          nodeCount: agentSync.nodeCount,
          nodeKey: agents?.agentNodeKey(),
        }
      : undefined,
    existingTags: sortAssignableTags(nodes, policy),
    // `undefined` keeps the tag dialog from flagging every tag as undeclared.
    policyTags: extractTagOwnerTags(policy),
    magic,
    node: enhancedNode,
    stats: stats?.[enhancedNode.nodeKey],
    supportsNodeOwnerChange: supportsNodeOwnerChange,
    supportsDisablingKeyExpiry: supportsDisablingKeyExpiry,
    tags,
    users,
  };
}

export const action = machineAction;

import { useTranslation } from "~/i18n/context";

export default function Page({
  loaderData: {
    node,
    tags,
    users,
    magic,
    agent,
    stats,
    existingTags,
    policyTags,
    supportsNodeOwnerChange,
    supportsDisablingKeyExpiry,
  },
}: Route.ComponentProps) {
  const { t, isZh } = useTranslation();
  const [showRouting, setShowRouting] = useState(false);

  const uiTags = useMemo(() => {
    const tags = uiTagsForNode(node, agent?.nodeKey === node.nodeKey);
    return tags;
  }, [node, agent]);

  return (
    <div>
      <p className="text-md mb-8">
        <Link className="font-medium" to="/machines">
          {isZh ? "所有机器" : "All Machines"}
        </Link>
        <span className="mx-2">/</span>
        {node.givenName}
      </p>
      <div
        className={cn(
          "flex justify-between items-center pb-2",
          "border-b border-mist-100 dark:border-mist-800",
        )}
      >
        <span className="flex items-baseline gap-x-4 text-sm">
          <h1 className="text-2xl font-medium">{node.givenName}</h1>
          <StatusCircle className="h-4 w-4" isOnline={node.online} />
        </span>
        <MenuOptions
          existingTags={existingTags}
          policyTags={policyTags}
          isFullButton
          magic={magic}
          node={node}
          users={users}
          supportsNodeOwnerChange={supportsNodeOwnerChange}
          supportsDisablingKeyExpiry={supportsDisablingKeyExpiry}
        />
      </div>
      <div className="mb-4 flex gap-1">
        <div className="border-r border-mist-100 p-2 pr-4 dark:border-mist-800">
          <span className="flex items-center gap-x-1 text-sm text-mist-600 dark:text-mist-300">
            {isZh ? "所属管理者" : "Managed by"}
            <Tooltip
              content={
                isZh
                  ? "默认情况下，机器的权限与其创建者一致。"
                  : "By default, a machine’s permissions match its creator’s."
              }
            >
              <Info className="p-1" />
            </Tooltip>
          </span>
          <div className="mt-1 flex items-center gap-x-2.5">
            <UserCircle />
            {node.user ? getUserDisplayName(node.user) : t("machines.tagOwned")}
          </div>
        </div>
        <div className="p-2 pl-4">
          <p className="text-sm text-mist-600 dark:text-mist-300">{t("common.status")}</p>
          <div className="mt-1 mb-8 flex gap-1">
            {mapTagsToComponents(node, uiTags)}
            {tags.map((tag) => (
              <Chip key={tag} text={tag} />
            ))}
          </div>
        </div>
      </div>
      <Routes isOpen={showRouting} node={node} setIsOpen={setShowRouting} />
      <h2 className="mt-8 text-xl font-medium">{isZh ? "子网与路由" : "Subnets & Routing"}</h2>
      <div className="mb-4 flex items-center justify-between">
        <p>
          {isZh ? (
            <>
              子网路由允许您将物理网络路由暴露到 Tailscale 中。{" "}
              <Link external styled to="https://tailscale.com/kb/1019/subnets">
                {t("common.learnMore")}
              </Link>
            </>
          ) : (
            <>
              Subnets let you expose physical network routes onto Tailscale.{" "}
              <Link external styled to="https://tailscale.com/kb/1019/subnets">
                Learn More
              </Link>
            </>
          )}
        </p>
        <Button onClick={() => setShowRouting(true)}>{isZh ? "审核路由" : "Review"}</Button>
      </div>
      <Card
        className={cn(
          "w-full max-w-full grid sm:grid-cols-2",
          "md:grid-cols-4 gap-8 mr-2 text-sm mb-8",
        )}
        variant="flat"
      >
        <div>
          <span className="flex items-center gap-x-1 text-mist-600 dark:text-mist-300">
            {isZh ? "已批准" : "Approved"}
            <Tooltip
              content={
                isZh
                  ? "通往这些路由的网络流量正通过此机器转发。"
                  : "Traffic to these routes are being routed through this machine."
              }
            >
              <Info className="h-3.5 w-3.5" />
            </Tooltip>
          </span>
          <div className="mt-1">
            {node.customRouting.subnetApprovedRoutes.length === 0 ? (
              <span className="opacity-50">—</span>
            ) : (
              <ul className="leading-normal">
                {node.customRouting.subnetApprovedRoutes.map((route) => (
                  <li key={route}>{route}</li>
                ))}
              </ul>
            )}
          </div>
          <Button
            className="mt-1.5 px-1.5 py-0.5"
            onClick={() => setShowRouting(true)}
            variant="ghost"
          >
            {t("common.edit")}
          </Button>
        </div>
        <div>
          <span className="flex items-center gap-x-1 text-mist-600 dark:text-mist-300">
            {isZh ? "等待批准" : "Awaiting Approval"}
            <Tooltip
              content={
                isZh
                  ? "此机器正在宣告这些路由，但在流量被路由到这些子网前必须先通过批准。"
                  : "This machine is advertising these routes, but they must be approved before traffic will be routed to them."
              }
            >
              <Info className="h-3.5 w-3.5" />
            </Tooltip>
          </span>
          <div className="mt-1">
            {node.customRouting.subnetWaitingRoutes.length === 0 ? (
              <span className="opacity-50">—</span>
            ) : (
              <ul className="leading-normal">
                {node.customRouting.subnetWaitingRoutes.map((route) => (
                  <li key={route}>{route}</li>
                ))}
              </ul>
            )}
          </div>
          <Button
            className="mt-1.5 px-1.5 py-0.5"
            onClick={() => setShowRouting(true)}
            variant="ghost"
          >
            {t("common.edit")}
          </Button>
        </div>
        <div>
          <span className="flex items-center gap-x-1 text-mist-600 dark:text-mist-300">
            {isZh ? "出口节点" : "Exit Node"}
            <Tooltip
              content={
                isZh
                  ? "此机器是否可以作为当前 Tailnet 的出口节点。"
                  : "Whether this machine can act as an exit node for your tailnet."
              }
            >
              <Info className="h-3.5 w-3.5" />
            </Tooltip>
          </span>
          <div className="mt-1">
            {node.customRouting.exitRoutes.length === 0 ? (
              <span className="opacity-50">—</span>
            ) : node.customRouting.exitApproved ? (
              <span className="flex items-center gap-x-1">
                <CheckCircle className="h-3.5 w-3.5 text-green-700" />
                {isZh ? "已允许" : "Allowed"}
              </span>
            ) : (
              <span className="flex items-center gap-x-1">
                <CircleSlash className="h-3.5 w-3.5 text-red-700" />
                {isZh ? "等待批准" : "Awaiting Approval"}
              </span>
            )}
          </div>
          <Button
            className="mt-1.5 px-1.5 py-0.5"
            onClick={() => setShowRouting(true)}
            variant="ghost"
          >
            {t("common.edit")}
          </Button>
        </div>
      </Card>
      <h2 className="text-xl font-medium">{isZh ? "机器详情" : "Machine Details"}</h2>
      <p className="mb-4">
        {isZh
          ? "此机器的网络配置与调试信息，用于排查连接问题。"
          : "Information about this machine’s network. Used to debug connection issues."}
      </p>
      <Card
        className="grid w-full max-w-full grid-cols-1 gap-y-2 sm:gap-x-12 lg:grid-cols-2"
        variant="flat"
      >
        <div className="flex flex-col gap-1">
          <Attribute
            name={isZh ? "创建者" : "Creator"}
            value={node.user ? getUserDisplayName(node.user) : isZh ? "标签归属" : "Tag-owned"}
          />
          <Attribute name={isZh ? "机器名称" : "Machine name"} value={node.givenName} />
          <Attribute
            name={isZh ? "系统主机名" : "OS hostname"}
            tooltip={
              isZh
                ? "系统主机名由机器的操作系统发布，并作为机器的默认名称。"
                : "OS hostname is published by the machine’s operating system and is used as the default name for the machine."
            }
            value={node.name}
          />
          {stats ? (
            <>
              <Attribute name={isZh ? "操作系统" : "OS"} value={getOSInfo(stats)} />
              <Attribute
                name={isZh ? "Tailscale 版本" : "Tailscale version"}
                value={getTSVersion(stats)}
              />
            </>
          ) : undefined}
          <Attribute
            name="ID"
            tooltip={
              isZh
                ? "此机器的唯一标识符，用于 Headscale API。"
                : "ID for this machine. Used in the Headscale API."
            }
            value={node.id}
          />
          <Attribute
            isCopyable
            name={isZh ? "节点密钥" : "Node key"}
            tooltip={
              isZh ? "唯一标识此机器的公钥。" : "Public key which uniquely identifies this machine."
            }
            value={node.nodeKey}
          />
          <Attribute
            name={isZh ? "创建时间" : "Created"}
            value={new Date(node.createdAt).toLocaleString(isZh ? "zh-CN" : undefined)}
          />
          <Attribute
            name={isZh ? "最后活跃" : "Last Seen"}
            value={
              node.online
                ? isZh
                  ? "已连接"
                  : "Connected"
                : new Date(node.lastSeen).toLocaleString(isZh ? "zh-CN" : undefined)
            }
          />
          <Attribute
            name={isZh ? "密钥到期" : "Key expiry"}
            value={
              !isNoExpiry(node.expiry)
                ? new Date(node.expiry!).toLocaleString(isZh ? "zh-CN" : undefined)
                : isZh
                  ? "永不过期"
                  : "Never"
            }
          />
          {magic ? (
            <Attribute
              isCopyable
              name={isZh ? "域名" : "Domain"}
              value={`${node.givenName}.${magic}`}
            />
          ) : undefined}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-mist-600 uppercase dark:text-mist-300">
            {isZh ? "网络地址" : "Addresses"}
          </p>
          <Attribute
            isCopyable
            name={isZh ? "Tailscale IPv4" : "Tailscale IPv4"}
            tooltip={
              isZh
                ? "此机器在当前 Tailnet（您的 Tailscale 私有网络）内的 IPv4 地址。"
                : "This machine’s IPv4 address within your tailnet (your private Tailscale network)."
            }
            value={getIpv4Address(node.ipAddresses)}
          />
          <Attribute
            isCopyable
            name={isZh ? "Tailscale IPv6" : "Tailscale IPv6"}
            tooltip={
              isZh
                ? "此机器在当前 Tailnet 内的 IPv6 地址。即使您的网络运营商不支持 IPv6，Tailnet 内的连接也原生支持。"
                : "This machine’s IPv6 address within your tailnet (your private Tailscale network). Connections within your tailnet support IPv6 even if your ISP does not."
            }
            value={getIpv6Address(node.ipAddresses)}
          />
          <Attribute
            isCopyable
            name={isZh ? "短域名" : "Short domain"}
            tooltip={
              isZh
                ? "Tailnet 内的用户可以使用此 DNS 短名称访问此机器。"
                : "Users of your tailnet can use this DNS short name to access this machine."
            }
            value={node.givenName}
          />
          {magic ? (
            <Attribute
              isCopyable
              name={isZh ? "完整域名" : "Full domain"}
              tooltip={
                isZh
                  ? "Tailnet 内的用户可以使用此完整 DNS 域名访问此机器。"
                  : "Users of your tailnet can use this DNS name to access this machine."
              }
              value={`${node.givenName}.${magic}`}
            />
          ) : undefined}
          {stats?.Endpoints ? (
            <Attribute
              name={isZh ? "公网端点 (Endpoints)" : "Endpoints"}
              value={stats?.Endpoints?.join("\n") ?? "—"}
            />
          ) : undefined}
          {stats ? (
            <>
              <p className="mt-4 text-sm font-semibold text-mist-600 uppercase dark:text-mist-300">
                {isZh ? "客户端连通性" : "Client Connectivity"}
              </p>
              <Attribute
                name={isZh ? "动态端口映射 (Varies)" : "Varies"}
                tooltip={
                  isZh
                    ? "机器是否处于会对不同目标分配不同 IP/端口的对称型 NAT 之后。"
                    : "Whether the machine is behind a difficult NAT that varies the machine’s IP address depending on the destination."
                }
                value={
                  stats.NetInfo?.MappingVariesByDestIP ? (isZh ? "是" : "Yes") : isZh ? "否" : "No"
                }
              />
              <Attribute
                name={isZh ? "回流 (Hairpinning)" : "Hairpinning"}
                tooltip={
                  isZh
                    ? "机器是否需要穿透支持回流（NAT Loopback/Hairpinning）的路由器。"
                    : "Whether the machine needs to traverse NATs with hairpinning."
                }
                value={stats.NetInfo?.HairPinning ? (isZh ? "是" : "Yes") : isZh ? "否" : "No"}
              />
              <Attribute
                name="IPv6"
                value={stats.NetInfo?.WorkingIPv6 ? (isZh ? "正常" : "Yes") : isZh ? "否" : "No"}
              />
              <Attribute
                name="UDP"
                value={stats.NetInfo?.WorkingUDP ? (isZh ? "正常" : "Yes") : isZh ? "否" : "No"}
              />
              <Attribute
                name="UPnP"
                value={stats.NetInfo?.UPnP ? (isZh ? "支持" : "Yes") : isZh ? "否" : "No"}
              />
              <Attribute
                name="PCP"
                value={stats.NetInfo?.PCP ? (isZh ? "支持" : "Yes") : isZh ? "否" : "No"}
              />
              <Attribute
                name="NAT-PMP"
                value={stats.NetInfo?.PMP ? (isZh ? "支持" : "Yes") : isZh ? "否" : "No"}
              />
            </>
          ) : undefined}
        </div>
      </Card>
    </div>
  );
}

function getIpv4Address(addresses: string[]) {
  for (const address of addresses) {
    if (address.startsWith("100.")) {
      // Return the first CGNAT address
      return address;
    }
  }

  return "—";
}

function getIpv6Address(addresses: string[]) {
  for (const address of addresses) {
    if (address.startsWith("fd")) {
      // Return the first IPv6 address
      return address;
    }
  }

  return "—";
}
