import { Button as BaseButton } from "@base-ui/react/button";
import React from "react";

import cn from "~/utils/cn";

export interface ButtonProps extends React.ComponentProps<typeof BaseButton> {
  variant?: "heavy" | "light" | "danger" | "ghost";
}

export default function Button({ variant = "light", className, ...props }: ButtonProps) {
  return (
    <BaseButton
      {...props}
      className={cn(
        "inline-flex w-fit items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm",
        "cursor-pointer select-none",
        "transition-all duration-150 ease-out active:scale-[0.97] active:duration-75",
        "focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1",
        "dark:focus:ring-indigo-400/40 dark:focus:ring-offset-mist-900",
        props.disabled && "pointer-events-none opacity-50 active:scale-100",
        ...(variant === "heavy"
          ? [
              "bg-indigo-600 font-semibold text-white shadow-xs",
              "hover:bg-indigo-500 hover:shadow-sm hover:shadow-indigo-500/25",
              "active:bg-indigo-700",
              "dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:active:bg-indigo-600",
            ]
          : variant === "danger"
            ? [
                "bg-red-600 font-semibold text-white shadow-xs",
                "hover:bg-red-500 hover:shadow-sm hover:shadow-red-500/25",
                "active:bg-red-700",
                "dark:bg-red-500 dark:hover:bg-red-400 dark:active:bg-red-600",
              ]
            : variant === "ghost"
              ? [
                  "font-medium text-indigo-600 dark:text-indigo-400",
                  "hover:bg-indigo-50/80 dark:hover:bg-indigo-500/15",
                  "active:bg-indigo-100 dark:active:bg-indigo-500/25",
                ]
              : [
                  "border border-mist-200 bg-white font-medium shadow-xs",
                  "hover:bg-mist-50/90 hover:border-mist-300 hover:shadow-sm",
                  "active:bg-mist-100",
                  "dark:border-mist-700 dark:bg-mist-800/60",
                  "dark:hover:bg-mist-700/60 dark:hover:border-mist-600",
                  "dark:active:bg-mist-700/90",
                ]),
        className,
      )}
    />
  );
}
