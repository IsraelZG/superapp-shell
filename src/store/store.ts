import { createStore } from "tinybase";
import { createLocalPersister } from "tinybase/persisters/persister-browser";

export const store = createStore();

const initialTables = {
  currentUser: {
    me: { name: "Israel", avatarUrl: "" },
  },
  nav: {
    inicio: { label: "Início", icon: "home", order: 1 },
    mensagens: { label: "Mensagens", icon: "message-circle", order: 2 },
    rede: { label: "Rede", icon: "share-2", order: 3 },
    sync: { label: "Sync", icon: "refresh-cw", order: 4 },
    identidade: { label: "Identidade", icon: "user", order: 5 },
    midia: { label: "Mídia", icon: "image", order: 6 },
  },
  modules: {
    social: { label: "Social", icon: "users", order: 1 },
    fintech: { label: "Fintech", icon: "wallet", order: 2 },
    studio: { label: "Studio", icon: "palette", order: 3 },
    midia: { label: "Mídia", icon: "image", order: 4 },
    marketplace: { label: "Marketplace", icon: "shopping-bag", order: 5 },
    mensagens: { label: "Mensagens", icon: "message-circle", order: 6 },
  },
  commsMenu: {
    email: { label: "Email", icon: "mail", order: 1 },
    notificacoes: { label: "Notificações", icon: "bell", order: 2 },
    chat: { label: "Chat", icon: "message-square", order: 3 },
  },
  conversations: {
    c1: { name: "Ana Ribeiro", preview: "Boa! Combinamos amanhã.", time: "09:42", unread: 2, order: 1 },
    c2: { name: "Equipe Studio", preview: "Novo mockup no board 🎨", time: "09:10", unread: 0, order: 2 },
    c3: { name: "Pedro L.", preview: "Enviei o contrato assinado", time: "ontem", unread: 0, order: 3 },
    c4: { name: "Suporte Fintech", preview: "Sua transferência foi confirmada", time: "ontem", unread: 1, order: 4 },
    c5: { name: "Marketplace", preview: "Pedido #4821 despachado", time: "seg", unread: 0, order: 5 },
  },
  collapsed: {},
  identity: {},
  consents: {} as Record<string, Record<string, unknown>>,
  roles: {
    r1: {
      subjectName: "Assistente de Agenda",
      subjectType: "app",
      capability: "Ler seus eventos de calendário",
      scope: "Calendário pessoal",
      expiresAt: "2026-07-10",
    },
    r2: {
      subjectName: "Ana Ribeiro",
      subjectType: "person",
      capability: "Ver seu perfil e status",
      scope: "Perfil público",
      expiresAt: "Sem prazo",
    },
    r3: {
      subjectName: "Backup Local",
      subjectType: "app",
      capability: "Ler mídia da galeria",
      scope: "Álbum: Viagens",
      expiresAt: "2026-08-01",
    },
  },
  blocks: {
    b1: { profileName: "Perfil Spam #4821", blockedAt: "2026-06-20" },
  },
};

const initialValues = {
  activeNav: "social",
  activeComms: "chat",
  theme: "light" as "light" | "dark",
  sidebarCollapsed: false,
  commsRailCollapsed: false,
  modulesRailCollapsed: false,
  messagingVisible: true,
  layoutJson: "",
  syncStatus: "synced" as "synced" | "syncing" | "offline",
  online: true,
  mobileOverlay: "" as "" | "comms" | "modules",
  onboardingStep: "welcome" as "welcome" | "create" | "confirm" | "unlock" | "done",
  consentPromptOpen: false,
  consentRequesterName: "",
  consentRequesterIcon: "",
  consentCapability: "",
  consentScopeDescription: "",
  consentDataScope: "",
  consentTTL: "",
};

// Fake persister — swap this file for a real persistence layer later.
if (typeof window !== "undefined") {
  const persister = createLocalPersister(store, "superapp-mockup");
  persister
    .startAutoLoad([initialTables, initialValues])
    .then(() => persister.startAutoSave());
} else {
  store.setTables(initialTables).setValues(initialValues);
}