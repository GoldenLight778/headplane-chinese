import { ChevronDown, X } from "lucide-react";
import type { JSX } from "react";

import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~/components/menu";
import { useTranslation } from "~/i18n/context";
import type { User } from "~/types/User";
import cn from "~/utils/cn";
import type { PopulatedNode } from "~/utils/node-info";
import { getUserDisplayName } from "~/utils/user";

import { useMachineFilterParams } from "../hooks/use-machine-filter-params";

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: readonly { value: string; label: string }[];
  onChange: (value: string | null) => void;
}): JSX.Element {
  const { t } = useTranslation();
  const activeOption = options.find((o) => o.value === value) ?? null;
  const isActive = activeOption !== null;

  return (
    <Menu>
      <MenuTrigger
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium",
          "border transition-all duration-150 ease-out",
          "flex items-center gap-1.5 cursor-pointer select-none active:scale-95 shadow-2xs hover:shadow-xs",
          isActive
            ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
            : "border-mist-200 dark:border-mist-700 text-mist-700 dark:text-mist-300 hover:border-mist-300 dark:hover:border-mist-600",
        )}
      >
        {activeOption?.label ?? label}
        <ChevronDown className="h-3.5 w-3.5" />
      </MenuTrigger>
      <MenuContent>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => onChange(value === option.value ? null : option.value)}
          >
            {option.value === value ? (
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {option.label}
              </span>
            ) : (
              option.label
            )}
          </MenuItem>
        ))}
        {isActive && (
          <>
            <MenuSeparator />
            <MenuItem onClick={() => onChange(null)}>{t("machines.filters.clearFilters")}</MenuItem>
          </>
        )}
      </MenuContent>
    </Menu>
  );
}

interface MachineFiltersProps {
  users: User[];
  populatedNodes: PopulatedNode[];
}

export function MachineFilters({ users, populatedNodes }: MachineFiltersProps): JSX.Element {
  const { t, isZh } = useTranslation();
  const {
    filterUser,
    filterTag,
    filterStatus,
    filterRoute,
    hasActiveFilters,
    setParam,
    clearFilters,
  } = useMachineFilterParams();

  const statusOptions = [
    { value: "online", label: t("common.online") },
    { value: "offline", label: t("common.offline") },
    { value: "expired", label: t("common.expired") },
  ] as const;

  const routeOptions = [
    { value: "exit-node", label: t("machines.filters.exitNode") },
    { value: "subnet", label: t("machines.filters.subnet") },
  ] as const;

  const tagOwnedExists = populatedNodes.some((n) => !n.user);
  const userOptions = [
    ...(tagOwnedExists ? [{ value: "tag-owned", label: t("machines.tagOwned") }] : []),
    ...users.map((u) => ({ value: u.name, label: getUserDisplayName(u) })),
  ];

  const tagOptions = Array.from(new Set(populatedNodes.flatMap((n) => n.tags)))
    .filter(Boolean)
    .sort()
    .map((tag) => ({ value: tag, label: tag }));

  return (
    <>
      {userOptions.length > 0 && (
        <FilterDropdown
          label={t("common.user")}
          onChange={(v) => setParam("user", v)}
          options={userOptions}
          value={filterUser}
        />
      )}
      {tagOptions.length > 0 && (
        <FilterDropdown
          label={isZh ? "标签" : "Tag"}
          onChange={(v) => setParam("tag", v)}
          options={tagOptions}
          value={filterTag}
        />
      )}
      <FilterDropdown
        label={t("common.status")}
        onChange={(v) => setParam("status", v)}
        options={statusOptions}
        value={filterStatus}
      />
      <FilterDropdown
        label={isZh ? "路由" : "Route"}
        onChange={(v) => setParam("route", v)}
        options={routeOptions}
        value={filterRoute}
      />
      {hasActiveFilters && (
        <button
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
            "border border-mist-200 dark:border-mist-700",
            "text-mist-600 dark:text-mist-400 cursor-pointer select-none",
            "hover:border-mist-300 dark:hover:border-mist-600 hover:text-mist-800 dark:hover:text-mist-200",
            "transition-all duration-150 ease-out active:scale-95",
          )}
          onClick={clearFilters}
          type="button"
        >
          {t("machines.filters.clearFilters")}
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </>
  );
}
