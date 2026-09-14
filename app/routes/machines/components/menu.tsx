import { Cog, Ellipsis, SquareTerminal } from "lucide-react";
import { useState } from "react";
import { useSubmit } from "react-router";

import Button from "~/components/button";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~/components/menu";
import type { User } from "~/types";
import cn from "~/utils/cn";
import { isNoExpiry, type PopulatedNode } from "~/utils/node-info";

import Delete from "../dialogs/delete";
import Expire from "../dialogs/expire";
import Move from "../dialogs/move";
import Rename from "../dialogs/rename";
import Routes from "../dialogs/routes";
import Tags from "../dialogs/tags";

interface MenuProps {
  node: PopulatedNode;
  users: User[];
  magic?: string;
  isFullButton?: boolean;
  isDisabled?: boolean;
  existingTags?: string[];
  policyTags?: string[];
  supportsNodeOwnerChange: boolean;
  supportsDisablingKeyExpiry: boolean;
}

type Modal = "rename" | "expire" | "remove" | "routes" | "move" | "tags" | null;

import { useTranslation } from "~/i18n/context";

export default function MachineMenu({
  node,
  magic,
  users,
  isFullButton,
  isDisabled,
  existingTags,
  policyTags,
  supportsNodeOwnerChange,
  supportsDisablingKeyExpiry,
}: MenuProps) {
  const { t } = useTranslation();
  const submit = useSubmit();
  const [modal, setModal] = useState<Modal>(null);
  const supportsTailscaleSSH = node.hostInfo?.sshHostKeys && node.hostInfo?.sshHostKeys.length > 0;

  return (
    <div className="flex items-center justify-end gap-1.5 px-4">
      {modal === "remove" && (
        <Delete
          isOpen={modal === "remove"}
          machine={node}
          setIsOpen={(isOpen) => {
            if (!isOpen) setModal(null);
          }}
        />
      )}
      {modal === "move" && (
        <Move
          isOpen={modal === "move"}
          machine={node}
          setIsOpen={(isOpen) => {
            if (!isOpen) setModal(null);
          }}
          users={users}
        />
      )}
      {modal === "rename" && (
        <Rename
          isOpen={modal === "rename"}
          machine={node}
          magic={magic}
          setIsOpen={(isOpen) => {
            if (!isOpen) setModal(null);
          }}
        />
      )}
      {modal === "routes" && (
        <Routes
          isOpen={modal === "routes"}
          node={node}
          setIsOpen={(isOpen) => {
            if (!isOpen) setModal(null);
          }}
        />
      )}
      {modal === "tags" && (
        <Tags
          existingTags={existingTags}
          policyTags={policyTags}
          isOpen={modal === "tags"}
          machine={node}
          setIsOpen={(isOpen) => {
            if (!isOpen) setModal(null);
          }}
        />
      )}
      {node.expired && modal === "expire" ? undefined : (
        <Expire
          isOpen={modal === "expire"}
          machine={node}
          setIsOpen={(isOpen) => {
            if (!isOpen) setModal(null);
          }}
        />
      )}

      {supportsTailscaleSSH ? (
        isFullButton ? (
          <Button
            className="flex items-center gap-x-2"
            onClick={() => {
              // We need to use JS to open the SSH URL
              // in a new WINDOW since href can only
              // do a new TAB.
              window.open(
                `${__PREFIX__}/ssh/${node.givenName}`,
                "_blank",
                "noopener,noreferrer,width=800,height=600",
              );
            }}
            variant="heavy"
          >
            <SquareTerminal className="h-5" />
            <p>{t("machines.menu.ssh")}</p>
          </Button>
        ) : (
          <Button
            className={cn(
              "py-0.5 rounded-lg",
              "opacity-0 pointer-events-none group-hover:opacity-100",
              "group-hover:pointer-events-auto",
            )}
            variant="light"
            onClick={() => {
              window.open(
                `${__PREFIX__}/ssh/${node.givenName}`,
                "_blank",
                "noopener,noreferrer,width=800,height=600",
              );
            }}
          >
            {t("machines.menu.ssh")}
          </Button>
        )
      ) : undefined}
      <Menu disabled={isDisabled}>
        <MenuTrigger
          className={
            isFullButton
              ? "cursor-pointer gap-x-2 rounded-md border border-mist-200 bg-white px-3.5 py-2 text-sm font-medium shadow-xs transition-all duration-150 ease-out select-none hover:border-mist-300 hover:bg-mist-50/90 active:scale-[0.97] active:bg-mist-100 dark:border-mist-700 dark:bg-mist-800/60 dark:hover:bg-mist-700/60 dark:active:bg-mist-700/90"
              : "w-10 cursor-pointer rounded-full bg-transparent p-1 transition-all duration-150 ease-out hover:bg-mist-200/60 active:scale-90 dark:hover:bg-mist-800"
          }
        >
          {isFullButton ? (
            <>
              <Cog className="h-5" />
              <p>{t("machines.menu.settings")}</p>
            </>
          ) : (
            <Ellipsis className="h-5" />
          )}
        </MenuTrigger>
        <MenuContent>
          <MenuItem onClick={() => setModal("rename")}>{t("machines.menu.rename")}</MenuItem>
          {supportsDisablingKeyExpiry && (
            <MenuItem
              onClick={() =>
                submit(
                  {
                    action_id: "toggle_expiry",
                    node_id: node.id,
                    disableExpiry: !isNoExpiry(node.expiry),
                  },
                  { method: "post" },
                )
              }
            >
              {isNoExpiry(node.expiry)
                ? t("machines.menu.enableExpiry")
                : t("machines.menu.disableExpiry")}
            </MenuItem>
          )}
          <MenuItem onClick={() => setModal("routes")}>{t("machines.menu.routes")}</MenuItem>
          <MenuItem onClick={() => setModal("tags")}>{t("machines.menu.tags")}</MenuItem>
          {supportsNodeOwnerChange && (
            <MenuItem onClick={() => setModal("move")}>{t("machines.menu.changeOwner")}</MenuItem>
          )}
          <MenuSeparator />
          {!isNoExpiry(node.expiry) && (
            <MenuItem variant="danger" disabled={node.expired} onClick={() => setModal("expire")}>
              {t("machines.menu.expire")}
            </MenuItem>
          )}
          <MenuItem variant="danger" onClick={() => setModal("remove")}>
            {t("machines.menu.remove")}
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}
