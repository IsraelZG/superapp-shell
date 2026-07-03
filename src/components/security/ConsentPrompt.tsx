import { useMemo } from "react";
import { Shield, Clock, Database, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useValue,
  useSetValueCallback,
  useSetRowCallback,
  store,
} from "@/store/hooks";

export function ConsentPrompt() {
  const open = (useValue("consentPromptOpen") as boolean) ?? false;
  const requesterName = (useValue("consentRequesterName") as string) ?? "";
  const capability = (useValue("consentCapability") as string) ?? "";
  const scopeDescription = (useValue("consentScopeDescription") as string) ?? "";
  const dataScope = (useValue("consentDataScope") as string) ?? "";
  const ttl = (useValue("consentTTL") as string) ?? "";

  const close = useSetValueCallback(
    "consentPromptOpen",
    () => false,
    [],
  );

  const grant = useSetRowCallback(
    "consents",
    () => `c_${Date.now()}`,
    () => ({
      requesterName,
      requesterIcon: "shield",
      capability,
      scopeDescription,
      dataScope,
      ttl,
      grantedAt: new Date().toISOString(),
      status: "granted",
    }),
    [requesterName, capability, scopeDescription, dataScope, ttl],
  );

  const deny = useSetRowCallback(
    "consents",
    () => `c_${Date.now()}`,
    () => ({
      requesterName,
      requesterIcon: "shield",
      capability,
      scopeDescription,
      dataScope,
      ttl,
      grantedAt: new Date().toISOString(),
      status: "denied",
    }),
    [requesterName, capability, scopeDescription, dataScope, ttl],
  );

  const onOpenChange = (v: boolean) => {
    if (!v) close();
  };

  const titleId = useMemo(() => "consent-title", []);
  const descId = useMemo(() => "consent-desc", []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="sm:max-w-lg"
        style={{
          background: "var(--ds-theme-surface-raised)",
          color: "var(--ds-theme-content-default)",
          borderRadius: "var(--ds-component-card-radius, 24px)",
          borderColor: "var(--ds-theme-border-subtle)",
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center"
              style={{
                borderRadius: 9999,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-default)",
              }}
              aria-hidden="true"
            >
              <Shield size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle id={titleId} className="text-base font-semibold">
                {requesterName || "Aplicativo"} quer sua permissão
              </DialogTitle>
              <Badge
                variant="outline"
                className="mt-1"
                style={{
                  borderColor: "var(--ds-theme-border-subtle)",
                  color: "var(--ds-theme-content-muted)",
                }}
              >
                Pedido de acesso
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription id={descId} asChild>
          <div className="space-y-3">
            <div
              className="p-3"
              style={{
                borderRadius: 16,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-default)",
              }}
            >
              <div className="text-sm font-medium">
                {capability || "Acessar dados"}
              </div>
              {scopeDescription ? (
                <div
                  className="mt-1 text-xs"
                  style={{ color: "var(--ds-theme-content-muted)" }}
                >
                  {scopeDescription}
                </div>
              ) : null}
            </div>

            <ul
              className="space-y-2 text-sm"
              style={{ color: "var(--ds-theme-content-muted)" }}
            >
              {dataScope ? (
                <li className="flex items-center gap-2">
                  <Database size={14} aria-hidden="true" />
                  <span>Sobre: {dataScope}</span>
                </li>
              ) : null}
              {ttl ? (
                <li className="flex items-center gap-2">
                  <Clock size={14} aria-hidden="true" />
                  <span>Duração: {ttl}</span>
                </li>
              ) : null}
              <li className="flex items-center gap-2">
                <Shield size={14} aria-hidden="true" />
                <span>Você pode revogar em Configurações › Permissões.</span>
              </li>
            </ul>
          </div>
        </DialogDescription>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              deny();
              close();
            }}
            style={{
              borderRadius: "var(--ds-component-button-radius, 9999px)",
              borderColor: "var(--ds-theme-border-default)",
              color: "var(--ds-theme-content-default)",
              background: "var(--ds-theme-surface-default)",
            }}
          >
            <X size={14} aria-hidden="true" />
            Negar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              grant();
              close();
            }}
            style={{
              borderRadius: "var(--ds-component-button-radius, 9999px)",
              borderColor: "var(--ds-theme-border-default)",
              color: "var(--ds-theme-content-default)",
              background: "var(--ds-theme-surface-default)",
            }}
          >
            <Shield size={14} aria-hidden="true" />
            Conceder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// DEV/mock trigger — populates a sample consent request and opens the modal.
// Remove when hooking into real capability requests.
export function useSimulateConsentRequest() {
  return () => {
    store.setValues({
      ...store.getValues(),
      consentRequesterName: "Assistente de Agenda",
      consentRequesterIcon: "shield",
      consentCapability: "Ler seus eventos de calendário",
      consentScopeDescription:
        "Precisamos ver seus eventos para sugerir horários livres.",
      consentDataScope: "Calendário pessoal",
      consentTTL: "7 dias",
      consentPromptOpen: true,
    });
  };
}