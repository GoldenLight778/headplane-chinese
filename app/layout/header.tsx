import {
  Check,
  CircleQuestionMark,
  CircleUser,
  Globe,
  Languages,
  Lock,
  Monitor,
  Moon,
  Server,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import { NavLink, unstable_useRoute as useRoute, useLocation, useSubmit } from "react-router";

import Link from "~/components/link";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "~/components/menu";
import { useTranslation } from "~/i18n/context";
import type { Language } from "~/i18n/types";
import logoBg from "~/logo/dark-bg.svg";
import logoDark from "~/logo/dark.svg";
import logoLight from "~/logo/light.svg";
import cn from "~/utils/cn";
import type { ColorScheme } from "~/utils/color-scheme";

export interface HeaderProps {
  user: {
    subject: string;
    name: string;
    email?: string;
    username?: string;
    picture?: string;
  };
  access: {
    ui: boolean;
    machines: boolean;
    dns: boolean;
    users: boolean;
    policy: boolean;
    settings: boolean;
  };
  configAvailable: boolean;
}

const tabConfigs = [
  { to: "/machines", icon: Server, key: "machines" as const, labelKey: "header.machines" },
  { to: "/users", icon: Users, key: "users" as const, labelKey: "header.users" },
  { to: "/acls", icon: Lock, key: "policy" as const, labelKey: "header.acls" },
  { to: "/dns", icon: Globe, key: "dns" as const, labelKey: "header.dns" },
  { to: "/settings", icon: Settings, key: "settings" as const, labelKey: "header.settings" },
] as const;

export default function Header({ user, access, configAvailable }: HeaderProps) {
  const { t, language, setLanguage } = useTranslation();
  const submit = useSubmit();
  const showTabs = access.ui;
  const rootRoute = useRoute("root");
  const currentColorScheme: ColorScheme = rootRoute?.loaderData?.colorScheme ?? "system";
  // useLocation returns the path with the basename already stripped, which is
  // what `redirect()` expects — react-router re-applies the basename when
  // following the redirect on the client.
  const location = useLocation();
  const returnTo = location.pathname + location.search;

  const colorSchemes = [
    { value: "system", label: t("header.colorSystem"), icon: Monitor },
    { value: "light", label: t("header.colorLight"), icon: Sun },
    { value: "dark", label: t("header.colorDark"), icon: Moon },
  ] as const;

  const languages: { value: Language; label: string }[] = [
    { value: "zh", label: t("header.langZh") },
    { value: "en", label: t("header.langEn") },
  ];

  return (
    <header
      className={cn(
        "bg-mist-200 dark:bg-mist-950 text-mist-800 dark:text-mist-200",
        "dark:border-b dark:border-mist-800 shadow-inner",
      )}
    >
      <div className="container flex items-center gap-x-4 py-4">
        <div className="flex min-w-0 items-center gap-x-4">
          <div className="flex items-center gap-x-2">
            <picture className="min-w-8">
              <source srcSet={logoLight} media="(prefers-color-scheme: dark)" />
              <source srcSet={logoDark} media="(prefers-color-scheme: light)" />
              <img src={logoBg} alt="Headplane logo" />
            </picture>
            <h1 className="text-2xl font-semibold">headplane</h1>
          </div>
          {showTabs && (
            <nav className="hidden items-center gap-x-2 overflow-x-auto p-1 text-sm font-medium md:flex">
              {tabConfigs.map((tab) => {
                if (!access[tab.key]) return null;
                if ((tab.key === "dns" || tab.key === "settings") && !configAvailable) return null;

                return (
                  <NavLink
                    key={tab.to}
                    className={({ isActive }) =>
                      cn(
                        "px-3 py-1.5 flex items-center gap-x-1.5 rounded-md text-nowrap",
                        "cursor-pointer select-none",
                        "transition-all duration-150 ease-out active:scale-[0.97] active:duration-75",
                        "hover:bg-mist-300/60 dark:hover:bg-mist-800",
                        "focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1",
                        "dark:focus:ring-indigo-400/40 dark:focus:ring-offset-mist-900",
                        isActive
                          ? "bg-mist-300/80 dark:bg-mist-800 text-mist-900 dark:text-mist-50 shadow-xs font-semibold"
                          : "text-mist-600 dark:text-mist-300",
                      )
                    }
                    prefetch="intent"
                    to={tab.to}
                  >
                    <tab.icon className="w-4" />
                    {t(tab.labelKey)}
                  </NavLink>
                );
              })}
            </nav>
          )}
        </div>
        <div className="ml-auto flex items-center gap-x-2 sm:gap-x-3">
          {/* Language Switcher */}
          <Menu>
            <MenuTrigger
              aria-label={t("header.language")}
              className="size-8 rounded-full p-1 text-mist-600 transition-colors hover:bg-mist-300/60 hover:text-mist-900 dark:text-mist-300 dark:hover:bg-mist-800 dark:hover:text-mist-100"
            >
              <Languages className="h-5 w-5" />
            </MenuTrigger>
            <MenuContent align="end">
              {languages.map((item) => (
                <MenuItem key={item.value} onClick={() => setLanguage(item.value)}>
                  <div className="flex items-center gap-x-2">
                    <span className="flex-1 font-medium">{item.label}</span>
                    {language === item.value && (
                      <Check className="size-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>

          {/* Help & Links */}
          <Menu>
            <MenuTrigger className="size-8 rounded-full p-1 text-mist-600 transition-colors hover:bg-mist-300/60 hover:text-mist-900 dark:text-mist-300 dark:hover:bg-mist-800 dark:hover:text-mist-100">
              <CircleQuestionMark className="h-5 w-5" />
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem>
                <Link external to="https://headplane.net">
                  {t("header.docs")}
                </Link>
              </MenuItem>
              <MenuItem>
                <Link external to="https://headscale.net">
                  {t("header.headscale")}
                </Link>
              </MenuItem>
              <MenuItem>
                <Link external to="https://tailscale.com/download">
                  {t("header.download")}
                </Link>
              </MenuItem>
            </MenuContent>
          </Menu>

          {/* User & Theme */}
          <Menu>
            <MenuTrigger className="size-8 overflow-hidden rounded-full transition-all hover:ring-2 hover:ring-indigo-500/40">
              {user.picture ? (
                <img alt={user.name} className="size-8" src={user.picture} />
              ) : (
                <CircleUser className="size-8" />
              )}
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem disabled>
                <div className="text-mist-900 dark:text-mist-50">
                  {user.subject === "api_key" ? (
                    <>
                      <p className="font-bold">{t("header.apiKey")}</p>
                      <p>{user.name}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold">{user.name}</p>
                      {user.email && <p>{user.email}</p>}
                    </>
                  )}
                </div>
              </MenuItem>
              <MenuSeparator />
              {colorSchemes.map(({ value, label, icon: Icon }) => (
                <MenuItem
                  key={value}
                  onClick={() =>
                    submit(
                      { colorScheme: value, returnTo },
                      { action: "/api/color-scheme", method: "POST" },
                    )
                  }
                >
                  <div className="flex items-center gap-x-2">
                    <Icon className="size-4" />
                    <span className="flex-1">{label}</span>
                    {currentColorScheme === value && <Check className="size-4" />}
                  </div>
                </MenuItem>
              ))}
              <MenuSeparator />
              <MenuItem
                variant="danger"
                onClick={() => submit({}, { action: "/logout", method: "POST" })}
              >
                {t("header.logout")}
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </div>
      {showTabs && (
        <div className="block overflow-x-auto p-2 md:hidden">
          <nav className="flex items-center gap-x-2 text-sm font-medium">
            {tabConfigs.map((tab) => {
              if (!access[tab.key]) return null;
              if ((tab.key === "dns" || tab.key === "settings") && !configAvailable) return null;

              return (
                <NavLink
                  key={tab.to}
                  className={({ isActive }) =>
                    cn(
                      "relative px-3 py-1.5 flex items-center gap-x-1.5 rounded-md text-nowrap",
                      "transition-all duration-150 ease-out active:scale-[0.97]",
                      "hover:bg-mist-300/50 dark:hover:bg-mist-800",
                      "focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1",
                      "dark:focus:ring-indigo-400/40 dark:focus:ring-offset-mist-900",
                      "text-mist-600 dark:text-mist-300",
                      isActive &&
                        "text-mist-900 dark:text-mist-50 font-semibold after:content-[''] after:absolute after:-bottom-2 after:inset-x-1 after:h-0.5 after:rounded-full after:bg-indigo-500",
                    )
                  }
                  prefetch="intent"
                  to={tab.to}
                >
                  <tab.icon className="w-4" />
                  {t(tab.labelKey)}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
