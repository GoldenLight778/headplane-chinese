import { GlobeLock, RouteOff } from "lucide-react";
import { useFetcher } from "react-router";

import Dialog, { DialogPanel } from "~/components/dialog";
import Link from "~/components/link";
import Switch from "~/components/switch";
import TableList from "~/components/table-list";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import { PopulatedNode } from "~/utils/node-info";

interface RoutesProps {
  node: PopulatedNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// TODO: Support deleting routes
export default function Routes({ node, isOpen, setIsOpen }: RoutesProps) {
  const { isZh } = useTranslation();
  const fetcher = useFetcher();

  const subnets = [
    ...node.customRouting.subnetApprovedRoutes,
    ...node.customRouting.subnetWaitingRoutes,
  ];

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel variant="unactionable">
        <Title>
          {isZh ? `编辑 ${node.givenName} 的路由设置` : `Edit route settings of ${node.givenName}`}
        </Title>
        <Text className="font-bold">{isZh ? "子网路由" : "Subnet routes"}</Text>
        <Text>
          {isZh ? (
            <>
              通过宣告 IP 地址段作为子网路由，连接无法安装 Tailscale 的设备。{" "}
              <Link external styled to="https://tailscale.com/kb/1019/subnets">
                了解更多
              </Link>
            </>
          ) : (
            <>
              Connect to devices you can&apos;t install Tailscale on by advertising IP ranges as
              subnet routes.{" "}
              <Link external styled to="https://tailscale.com/kb/1019/subnets">
                Learn More
              </Link>
            </>
          )}
        </Text>
        <TableList className="mt-4">
          {subnets.length === 0 ? (
            <TableList.Item className="flex flex-col items-center gap-2.5 py-4 opacity-70">
              <RouteOff />
              <p className="font-semibold">
                {isZh ? "此机器未宣告任何路由" : "No routes are advertised by this machine"}
              </p>
            </TableList.Item>
          ) : undefined}
          {subnets.map((route) => (
            <TableList.Item key={route}>
              <p>{route}</p>
              <Switch
                defaultChecked={node.approvedRoutes.includes(route)}
                label={isZh ? "已启用" : "Enabled"}
                onCheckedChange={(checked) => {
                  const form = new FormData();
                  form.set("action_id", "update_routes");
                  form.set("node_id", node.id);
                  form.set("routes", [route].join(","));

                  form.set("enabled", String(checked));
                  fetcher.submit(form, {
                    method: "POST",
                  });
                }}
              />
            </TableList.Item>
          ))}
        </TableList>
        <Text className="mt-8 font-bold">{isZh ? "出口节点" : "Exit nodes"}</Text>
        <Text>
          {isZh ? (
            <>
              允许您的网络通过此机器转发互联网流量。{" "}
              <Link external styled to="https://tailscale.com/kb/1103/exit-nodes">
                了解更多
              </Link>
            </>
          ) : (
            <>
              Allow your network to route internet traffic through this machine.{" "}
              <Link external styled to="https://tailscale.com/kb/1103/exit-nodes">
                Learn More
              </Link>
            </>
          )}
        </Text>
        <TableList className="mt-4">
          {node.customRouting.exitRoutes.length === 0 ? (
            <TableList.Item className="flex flex-col items-center gap-2.5 py-4 opacity-70">
              <GlobeLock />
              <p className="font-semibold">
                {isZh ? "此机器不是出口节点" : "This machine is not an exit node"}
              </p>
            </TableList.Item>
          ) : (
            <TableList.Item>
              <p>{isZh ? "用作出口节点" : "Use as exit node"}</p>
              <Switch
                defaultChecked={node.customRouting.exitApproved}
                label={isZh ? "已启用" : "Enabled"}
                onCheckedChange={(checked) => {
                  const form = new FormData();
                  form.set("action_id", "update_routes");
                  form.set("node_id", node.id);
                  form.set("routes", node.customRouting.exitRoutes.map((route) => route).join(","));

                  form.set("enabled", String(checked));
                  fetcher.submit(form, {
                    method: "POST",
                  });
                }}
              />
            </TableList.Item>
          )}
        </TableList>
      </DialogPanel>
    </Dialog>
  );
}
