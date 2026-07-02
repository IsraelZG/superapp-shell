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
};

const initialValues = {
  activeNav: "inicio",
  theme: "light" as "light" | "dark",
  sidebarCollapsed: false,
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