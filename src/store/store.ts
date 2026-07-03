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
  consents: {},
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
  peers: {
    p1: { name: "MacBook — Israel", status: "online", lastSeen: "agora" },
    p2: { name: "iPhone — Israel", status: "syncing", lastSeen: "há 2 min" },
    p3: { name: "Ana Ribeiro", status: "offline", lastSeen: "há 3 h" },
  },
  notifications: {
    n1: { title: "Novo consentimento pendente", body: "Assistente de Agenda pediu acesso ao calendário.", read: false, createdAt: "2026-07-03T09:12:00Z", kind: "consent" },
    n2: { title: "Sincronização concluída", body: "Seus dispositivos estão em dia.", read: false, createdAt: "2026-07-03T08:44:00Z", kind: "sync" },
    n3: { title: "Ana comentou seu post", body: "\"Muito bom, adorei!\"", read: true, createdAt: "2026-07-02T21:03:00Z", kind: "social" },
    n4: { title: "Nova versão disponível", body: "SuperApp 1.4 traz melhorias no editor de tema.", read: false, createdAt: "2026-07-02T15:20:00Z", kind: "info" },
    n5: { title: "Peer offline", body: "iPhone — Israel ficou offline.", read: true, createdAt: "2026-07-01T22:11:00Z", kind: "sync" },
  },
  searchIndex: {
    s1: { title: "Ana Ribeiro", type: "person", snippet: "Contato — última msg 09:42", allowed: true },
    s2: { title: "Pedro L.", type: "person", snippet: "Contato — contrato assinado", allowed: true },
    s3: { title: "Equipe Studio", type: "person", snippet: "Grupo — 6 membros", allowed: true },
    s4: { title: "Boa! Combinamos amanhã.", type: "content", snippet: "Mensagem em Ana Ribeiro", allowed: true },
    s5: { title: "Novo mockup no board", type: "content", snippet: "Mensagem em Equipe Studio", allowed: true },
    s6: { title: "Contrato Q3.pdf", type: "content", snippet: "Arquivo restrito ao setor jurídico", allowed: false },
    s7: { title: "Salários 2026.xlsx", type: "content", snippet: "Planilha confidencial RH", allowed: false },
    s8: { title: "Fintech", type: "app", snippet: "Módulo — carteira e transferências", allowed: true },
    s9: { title: "Studio", type: "app", snippet: "Módulo — editor criativo", allowed: true },
    s10: { title: "Marketplace", type: "app", snippet: "Módulo — pedidos e vendas", allowed: true },
    s11: { title: "Abrir Configurações", type: "action", snippet: "Ir para /configuracoes", allowed: true },
    s12: { title: "Alternar tema claro/escuro", type: "action", snippet: "Ação rápida", allowed: true },
  },
  agentActions: {
    a1: { actor: "user", action: "Buscou por \"contrato Ana\"", timestamp: "2026-07-03T09:02:00Z", status: "done" },
    a2: { actor: "agent", action: "Resumiu 3 mensagens recentes de Ana Ribeiro", timestamp: "2026-07-03T09:03:00Z", status: "done" },
    a3: { actor: "user", action: "Pediu para agendar reunião com Pedro", timestamp: "2026-07-03T09:15:00Z", status: "done" },
    a4: { actor: "agent", action: "Rascunhou convite de calendário (aguardando aprovação)", timestamp: "2026-07-03T09:15:30Z", status: "in_progress" },
    a5: { actor: "user", action: "Abriu painel de permissões", timestamp: "2026-07-03T09:20:00Z", status: "done" },
    a6: { actor: "agent", action: "Sugeriu revogar acesso expirado de Backup Local", timestamp: "2026-07-03T09:21:00Z", status: "done" },
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
  locale: "pt-BR",
  density: "cozy" as "cozy" | "compact",
  reduceMotion: false,
  highContrast: false,
  commandPaletteOpen: false,
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