import Dialog, { DialogPanel } from "~/components/dialog";
import Notice from "~/components/notice";
import Text from "~/components/text";
import Title from "~/components/title";
import { useTranslation } from "~/i18n/context";
import cn from "~/utils/cn";

interface LinkUserProps {
  headplaneUserId: string;
  displayName: string;
  headscaleUsers: { id: string; name: string }[];
  currentLink?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function LinkUser({
  headplaneUserId,
  displayName,
  headscaleUsers,
  currentLink,
  isOpen,
  setIsOpen,
}: LinkUserProps) {
  const { isZh } = useTranslation();

  return (
    <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <DialogPanel confirmText={isZh ? "确认关联" : "Link user"}>
        <Title>
          {isZh ? `关联 Headscale 用户: ${displayName}` : `Link Headscale user for ${displayName}`}
        </Title>
        <Text className="mb-6">
          {isZh
            ? "选择此身份应关联的 Headscale 用户。这控制了他们可以管理哪些机器，并启用自助服务功能。"
            : "Select which Headscale user this identity should be linked to. This controls which machines they can manage and enables self-service features."}
        </Text>
        {headscaleUsers.length === 0 ? (
          <Notice>
            {isZh
              ? "所有 Headscale 用户均已关联到其他账户。"
              : "All Headscale users are already linked to other accounts."}
          </Notice>
        ) : (
          <>
            <input name="action_id" type="hidden" value="link_user" />
            <input name="headplane_user_id" type="hidden" value={headplaneUserId} />
            <select
              className={cn(
                "w-full rounded-lg border p-2",
                "border-mist-200 dark:border-mist-700",
                "bg-mist-50 dark:bg-mist-900",
              )}
              defaultValue={currentLink ?? ""}
              name="headscale_user_id"
              required
            >
              <option value="">
                {isZh ? "选择 Headscale 用户..." : "Select a Headscale user..."}
              </option>
              {headscaleUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                  {u.id === currentLink ? (isZh ? " (当前)" : " (current)") : ""}
                </option>
              ))}
            </select>
          </>
        )}
      </DialogPanel>
    </Dialog>
  );
}
