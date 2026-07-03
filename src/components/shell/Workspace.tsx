import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Layout,
  Model,
  Actions,
  DockLocation,
  type TabNode,
  type IJsonModel,
  type ITabSetRenderValues,
} from "flexlayout-react";
import { store, useValue } from "@/store/hooks";
import { CommsRail, ModulesRail } from "./panels/CommsRail";
import { Messaging } from "./panels/Messaging";
import { CentralApp } from "./panels/CentralApp";
import { EditorPanel } from "./panels/EditorPanel";
import { CollapsedStack } from "./CollapsedStack";

const RAIL_WIDTH = 68;

const initialJson: IJsonModel = {
  global: {
    tabEnableClose: true,
    tabEnableRename: false,
    tabSetEnableMaximize: false,
    splitterSize: 6,
    splitterExtra: 4,
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        id: "ts-comms",
        width: RAIL_WIDTH,
        enableDrop: false,
        enableDrag: false,
        enableTabStrip: false,
        classNameTabStrip: "rail-tabset",
        classNameHeader: "rail-tabset",
        children: [
          {
            type: "tab",
            id: "tab-comms",
            name: "Comms",
            component: "comms-rail",
            enableClose: false,
            enableDrag: false,
          },
        ],
      },
      {
        type: "tabset",
        id: "ts-messaging",
        weight: 22,
        children: [
          {
            type: "tab",
            id: "tab-messaging",
            name: "Mensagens",
            component: "messaging",
            enableClose: false,
          },
        ],
      },
      {
        type: "tabset",
        id: "ts-central",
        weight: 55,
        children: [
          {
            type: "tab",
            id: "tab-central",
            name: "App",
            component: "central-app",
            enableClose: false,
          },
        ],
      },
      {
        type: "tabset",
        id: "ts-modules",
        width: RAIL_WIDTH,
        enableDrop: false,
        enableDrag: false,
        enableTabStrip: false,
        children: [
          {
            type: "tab",
            id: "tab-modules",
            name: "Modules",
            component: "modules-rail",
            enableClose: false,
            enableDrag: false,
          },
        ],
      },
    ],
  },
};

// Apply the rail tabset classname via a post-processor so FlexLayout applies it.
function applyRailClass(node: unknown) {
  const n = node as { classNameTabStrip?: string; className?: string };
  if (n && n.classNameTabStrip === "rail-tabset") {
    n.className = "rail-tabset";
  }
}

function loadModel(): Model {
  const saved = store.getValue("layoutJson") as string;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return Model.fromJson(parsed);
    } catch {
      /* fallthrough */
    }
  }
  // walk and mark rails
  const json = JSON.parse(JSON.stringify(initialJson));
  const walk = (n: unknown) => {
    applyRailClass(n);
    const c = n as { children?: unknown[] };
    if (c.children) c.children.forEach(walk);
  };
  walk(json.layout);
  return Model.fromJson(json);
}

export function Workspace() {
  const [model] = useState<Model>(() => loadModel());
  const layoutRef = useRef<Layout>(null);
  const openedCounter = useRef(0);

  useEffect(() => {
    // no-op: persistence handled in onModelChange
  }, []);

  const persist = useCallback((m: Model) => {
    store.setValue("layoutJson", JSON.stringify(m.toJson()));
  }, []);

  const openColumn = useCallback(
    (name: string, component = "app-view", wide = false) => {
      openedCounter.current += 1;
      const id = `tab-${component}-${Date.now()}-${openedCounter.current}`;
      // Guard: if window is too narrow, collapse the least-recent central-adjacent tabset.
      const shellWidth = window.innerWidth;
      const centralTs = model.getNodeById("ts-central");
      const rowChildren =
        (centralTs?.getParent() as { getChildren?: () => unknown[] } | undefined)?.getChildren?.() ??
        [];
      // Non-rail, non-messaging, non-central tabsets = user-opened columns
      const opened = rowChildren.filter((c) => {
        const node = c as { getId: () => string; getType: () => string };
        return (
          node.getType() === "tabset" &&
          !["ts-comms", "ts-messaging", "ts-central", "ts-modules"].includes(node.getId())
        );
      });
      const noRoom = shellWidth < 1280 || opened.length >= 3;
      if (noRoom && opened.length > 0) {
        const victim = opened[0] as { getId: () => string; getChildren: () => TabNode[] };
        const victimTab = victim.getChildren()[0];
        const victimName = victimTab?.getName?.() ?? "Coluna";
        store.setRow("collapsed", victim.getId(), {
          name: victimName,
          component: (victimTab?.getComponent?.() as string) ?? "app-view",
          time: Date.now(),
        });
        model.doAction(Actions.deleteTab(victimTab.getId()));
      }

      model.doAction(
        Actions.addNode(
          { type: "tab", id, name, component },
          "ts-central",
          DockLocation.RIGHT,
          -1,
        ),
      );
      if (wide) {
        // Bump the new tabset's weight
        const newTab = model.getNodeById(id);
        const newTs = newTab?.getParent();
        if (newTs) {
          model.doAction(Actions.updateNodeAttributes(newTs.getId(), { weight: 40 }));
        }
      }
      persist(model);
    },
    [model, persist],
  );

  const splitCentral = useCallback(() => {
    const id = `tab-split-${Date.now()}`;
    model.doAction(
      Actions.addNode(
        { type: "tab", id, name: "Detalhe (split)", component: "app-view" },
        "ts-central",
        DockLocation.BOTTOM,
        -1,
      ),
    );
    persist(model);
  }, [model, persist]);

  const composeEmail = useCallback(() => {
    openColumn("Escrever email", "editor", true);
  }, [openColumn]);

  const factory = useCallback(
    (node: TabNode) => {
      const c = node.getComponent();
      if (c === "comms-rail") return <CommsRail />;
      if (c === "modules-rail") return <ModulesRail />;
      if (c === "messaging") return <Messaging onCompose={composeEmail} />;
      if (c === "central-app")
        return <CentralApp onSplit={splitCentral} onOpenColumn={(l) => openColumn(l)} />;
      if (c === "editor") return <EditorPanel title={node.getName()} />;
      if (c === "app-view")
        return (
          <div className="flex h-full w-full flex-col p-6">
            <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
              Coluna aberta
            </p>
            <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              {node.getName()}
            </h3>
            <div
              className="mt-4 flex-1"
              style={{
                background: "var(--ds-theme-surface-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
                borderRadius: 20,
                boxShadow: "var(--ds-component-card-shadow)",
              }}
            />
          </div>
        );
      return <div />;
    },
    [composeEmail, openColumn, splitCentral],
  );

  // Style each rail tabset with rounded chrome-less look via className
  const onRenderTabSet = useCallback(
    (node: unknown, values: ITabSetRenderValues) => {
      const n = node as { getId: () => string };
      if (n.getId() === "ts-comms" || n.getId() === "ts-modules") {
        values.headerContent = null;
      }
    },
    [],
  );

  const restoreCollapsed = useCallback(
    (id: string, name: string, component: string) => {
      const newId = `tab-restore-${Date.now()}`;
      model.doAction(
        Actions.addNode(
          { type: "tab", id: newId, name, component },
          "ts-central",
          DockLocation.RIGHT,
          -1,
        ),
      );
      store.delRow("collapsed", id);
      persist(model);
    },
    [model, persist],
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <Layout
          ref={layoutRef}
          model={model}
          factory={factory}
          onModelChange={persist}
          onRenderTabSet={onRenderTabSet}
        />
      </div>
      <CollapsedStack onRestore={restoreCollapsed} />
    </div>
  );
}

// Mobile: single-column presenter — the central app fills the screen,
// rails toggle in from the footer as fullscreen overlays.
export function MobileWorkspace({ onOpenComms, onOpenModules }: { onOpenComms: () => void; onOpenModules: () => void }) {
  const overlay = useValue("mobileOverlay") as "" | "comms" | "modules";
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <CentralApp
          onOpenColumn={() => {
            /* in mobile, opening a column simply replaces the view */
          }}
        />
      </div>
      {overlay === "comms" && (
        <MobileOverlay onClose={onOpenComms} title="Comunicações">
          <CommsRail />
        </MobileOverlay>
      )}
      {overlay === "modules" && (
        <MobileOverlay onClose={onOpenModules} title="Apps">
          <ModulesRail />
        </MobileOverlay>
      )}
    </div>
  );
}

function MobileOverlay({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 z-40 flex flex-col"
      style={{ background: "var(--ds-theme-surface-canvas)" }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--ds-theme-border-subtle)" }}
      >
        <h3 className="text-base font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold"
          style={{ color: "var(--ds-theme-intent-accent-fill)" }}
        >
          Fechar
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

// Suppress unused warning
useMemo;