import { data, redirect, type ActionFunctionArgs } from "react-router";

import { isValidLanguage, setLanguageCookie } from "~/utils/language";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const language = formData.get("language");
  const returnTo = safeRedirect(formData.get("returnTo"));

  if (!language || !isValidLanguage(language)) {
    throw data("Bad Request", { status: 400 });
  }

  return redirect(returnTo, {
    headers: {
      "Set-Cookie": await setLanguageCookie(language),
    },
  });
}

function safeRedirect(to: FormDataEntryValue | null) {
  if (!to || typeof to !== "string") {
    return "/";
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return "/";
  }

  return to;
}
