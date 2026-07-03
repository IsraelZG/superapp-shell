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
    erp: { label: "ERP", icon: "briefcase", order: 7 },
    contabil: { label: "Contábil", icon: "calculator", order: 8 },
    mapa: { label: "Mapa", icon: "map-pin", order: 9 },
  },
  commsMenu: {
    email: { label: "Email", icon: "mail", order: 1 },
    notificacoes: { label: "Notificações", icon: "bell", order: 2 },
    chat: { label: "Chat", icon: "message-square", order: 3 },
  },
  conversations: {
    c1: { name: "Ana Ribeiro", preview: "Boa! Combinamos amanhã.", time: "09:42", unread: 2, order: 1, isGroup: false },
    c2: { name: "Equipe Studio", preview: "Novo mockup no board 🎨", time: "09:10", unread: 0, order: 2, isGroup: true },
    c3: { name: "Pedro L.", preview: "Enviei o contrato assinado", time: "ontem", unread: 0, order: 3, isGroup: false },
    c4: { name: "Suporte Fintech", preview: "Sua transferência foi confirmada", time: "ontem", unread: 1, order: 4, isGroup: false },
    c5: { name: "Marketplace", preview: "Pedido #4821 despachado", time: "seg", unread: 0, order: 5, isGroup: false },
  },
  messages: {
    m1: { conversationId: "c1", author: "Ana Ribeiro", authorType: "contact", text: "Oi! Você viu o briefing que mandei?", time: "09:30", status: "read", order: 1 },
    m2: { conversationId: "c1", author: "Israel", authorType: "me", text: "Vi sim, tô revisando agora.", time: "09:32", status: "read", order: 2 },
    m3: { conversationId: "c1", author: "Sistema", authorType: "system", text: "Ana ativou verificação ponta-a-ponta.", time: "09:33", status: "sent", order: 3 },
    m4: { conversationId: "c1", author: "Ana Ribeiro", authorType: "contact", text: "Perfeito, me avisa quando terminar 🙌", time: "09:35", status: "read", order: 4 },
    m5: { conversationId: "c1", author: "Assistente", authorType: "ai", text: "Resumo: Ana pediu revisão do briefing e confirmação de horário para amanhã.", time: "09:36", status: "sent", order: 5 },
    m6: { conversationId: "c1", author: "Israel", authorType: "me", text: "Combinamos 10h então?", time: "09:40", status: "delivered", order: 6 },
    m7: { conversationId: "c1", author: "Ana Ribeiro", authorType: "contact", text: "Boa! Combinamos amanhã.", time: "09:42", status: "read", order: 7 },
    m8: { conversationId: "c1", author: "Israel", authorType: "me", text: "Enviando os arquivos finais...", time: "09:43", status: "sending", order: 8 },
    g1: { conversationId: "c2", author: "Sistema", authorType: "system", text: "Marina criou o grupo Equipe Studio.", time: "08:00", status: "sent", order: 1 },
    g2: { conversationId: "c2", author: "Marina", authorType: "contact", text: "Bom dia pessoal! Subi o novo mockup no board.", time: "08:52", status: "read", order: 2 },
    g3: { conversationId: "c2", author: "Rafael", authorType: "contact", text: "Massa, tô abrindo aqui.", time: "08:55", status: "read", order: 3 },
    g4: { conversationId: "c2", author: "Israel", authorType: "me", text: "Curti a paleta nova 🎨", time: "09:01", status: "read", order: 4 },
    g5: { conversationId: "c2", author: "Assistente", authorType: "ai", text: "Sugestão: consolidar as 3 variações em um único frame para revisão.", time: "09:04", status: "sent", order: 5 },
    g6: { conversationId: "c2", author: "Julia", authorType: "contact", text: "Boa ideia! Faço isso agora.", time: "09:08", status: "read", order: 6 },
    g7: { conversationId: "c2", author: "Marina", authorType: "contact", text: "Novo mockup no board 🎨", time: "09:10", status: "read", order: 7 },
  },
  participants: {
    pa1: { conversationId: "c2", name: "Marina", avatarUrl: "" },
    pa2: { conversationId: "c2", name: "Rafael", avatarUrl: "" },
    pa3: { conversationId: "c2", name: "Julia", avatarUrl: "" },
    pa4: { conversationId: "c2", name: "Israel", avatarUrl: "" },
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
  catalogItems: {
    ci1: { title: "Pedido #4821", subtitle: "Marketplace — despachado", status: "done", order: 1 },
    ci2: { title: "Transferência R$ 320,00", subtitle: "Fintech — pendente de compensação", status: "pending", order: 2 },
    ci3: { title: "Reserva de sala Aurora", subtitle: "Studio — bloqueada até 14:32", status: "pending", order: 3 },
    ci4: { title: "Backup local", subtitle: "Sync — finalizado", status: "done", order: 4 },
    ci5: { title: "Convite de calendário", subtitle: "Agente — rascunho aguardando aprovação", status: "pending", order: 5 },
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
  // ============ B7 — Social & Feed ============
  // Invariante de privacidade retroativa: quando `visibility` de um post é
  // reduzida (ex.: "public" → "private"), a UI de quem não tem mais acesso
  // simplesmente não lista o post. Neste mockup single-user, apenas garantimos
  // que o autor SEMPRE vê o badge de visibilidade atual do próprio post.
  posts: {
    p1: { authorId: "u1", authorName: "Ana Ribeiro", authorAvatar: "", text: "Fechei o briefing do projeto Aurora — quem topa revisar amanhã 10h?", imageUrl: "", createdAt: "2026-07-03T09:42:00Z", likes: 12, comments: 4, visibility: "public", isAd: false, rank: 1 },
    p2: { authorId: "u_me", authorName: "Israel", authorAvatar: "", text: "Testando o novo editor de tema do SuperApp. Curti bastante os tokens semânticos.", imageUrl: "", createdAt: "2026-07-03T08:15:00Z", likes: 5, comments: 1, visibility: "connections", isAd: false, rank: 2 },
    p3: { authorId: "ad_studio", authorName: "Studio Aurora", authorAvatar: "", text: "Novos templates de design local-first — sem lock-in de nuvem. Baixe grátis.", imageUrl: "", createdAt: "2026-07-03T07:00:00Z", likes: 88, comments: 12, visibility: "public", isAd: true, rank: 3 },
    p4: { authorId: "u2", authorName: "Pedro L.", authorAvatar: "", text: "Contrato Q3 assinado ✍️ próxima etapa: reunião de kickoff.", imageUrl: "", createdAt: "2026-07-02T21:03:00Z", likes: 3, comments: 0, visibility: "public", isAd: false, rank: 4 },
    p5: { authorId: "u_me", authorName: "Israel", authorAvatar: "", text: "Rascunho privado — anotações para mim mesmo sobre a arquitetura de sync.", imageUrl: "", createdAt: "2026-07-02T18:20:00Z", likes: 0, comments: 0, visibility: "private", isAd: false, rank: 5 },
  },
  stories: {
    // expiresAt no futuro = válido; no passado = expirado (teste explícito)
    st1: { authorId: "u1", authorName: "Ana Ribeiro", authorAvatar: "", createdAt: "2026-07-03T08:00:00Z", expiresAt: "2026-07-04T08:00:00Z", viewed: false, mediaUrl: "" },
    st2: { authorId: "u_me", authorName: "Israel", authorAvatar: "", createdAt: "2026-07-03T09:00:00Z", expiresAt: "2026-07-04T09:00:00Z", viewed: false, mediaUrl: "" },
    st3: { authorId: "u2", authorName: "Pedro L.", authorAvatar: "", createdAt: "2026-07-03T07:30:00Z", expiresAt: "2026-07-04T07:30:00Z", viewed: true, mediaUrl: "" },
    st4: { authorId: "u_old", authorName: "Marina", authorAvatar: "", createdAt: "2026-07-01T10:00:00Z", expiresAt: "2026-07-02T10:00:00Z", viewed: false, mediaUrl: "" },
  },
  profiles: {
    u_me: { name: "Israel", avatar: "", bio: "Construindo o SuperApp local-first.", followers: 128, following: 84, visibility: "public", isFollowing: false },
    u1: { name: "Ana Ribeiro", avatar: "", bio: "Design de sistemas · Aurora Studio.", followers: 452, following: 210, visibility: "public", isFollowing: true },
    u2: { name: "Pedro L.", avatar: "", bio: "Jurídico e contratos.", followers: 92, following: 55, visibility: "private", isFollowing: false },
    u3: { name: "Marina", avatar: "", bio: "Arte digital · perfil privado.", followers: 1204, following: 88, visibility: "private", isFollowing: true },
  },
  // ============ B2 — Marketplace + Fintech ============
  // Invariantes:
  // - `stock` é a fonte da verdade; comprar decrementa e nunca deve permitir
  //   `stock < 0` (oversell). O botão "Simular concorrência" no detalhe zera
  //   o estoque antes do submit para forçar o erro amigável no fluxo.
  // - Saga: pendente → pago → enviado → compensado (estado terminal alternativo).
  //   `compensado` sinaliza estorno + reposição de estoque.
  products: {
    pr1: { sellerName: "Aurora Studio", title: "Kit de ícones semânticos", description: "Coleção com 240 ícones alinhados a tokens de design.", price: 89.9, currency: "BRL", imageUrl: "", stock: 42, category: "design", rating: 4.8, acceptsOffers: false },
    pr2: { sellerName: "Pedro L.", title: "Template de contrato B2B", description: "Modelo revisado por advogado, com cláusulas de SLA e LGPD.", price: 149, currency: "BRL", imageUrl: "", stock: 1, category: "juridico", rating: 4.6, acceptsOffers: true },
    pr3: { sellerName: "Marina Arte", title: "Print A3 — série Aurora", description: "Impressão numerada e assinada. Edição limitada.", price: 220, currency: "BRL", imageUrl: "", stock: 0, category: "arte", rating: 5.0, acceptsOffers: true },
    pr4: { sellerName: "Fintech Labs", title: "Curso: Sagas em pagamentos", description: "12h de aulas + estudos de caso reais de compensação.", price: 59, currency: "BRL", imageUrl: "", stock: 200, category: "cursos", rating: 4.4, acceptsOffers: false },
    pr5: { sellerName: "Aurora Studio", title: "Componente de tema (Figma)", description: "Biblioteca com tokens light/dark prontos para o SuperApp.", price: 39, currency: "BRL", imageUrl: "", stock: 15, category: "design", rating: 4.9, acceptsOffers: false },
    pr6: { sellerName: "Coletivo Aurora", title: "Assinatura mensal — comunidade", description: "Acesso ao grupo, mentorias e replay das lives.", price: 29, currency: "BRL", imageUrl: "", stock: 999, category: "assinatura", rating: 4.7, acceptsOffers: false },
  },
  cart: {},
  orders: {
    o1: { productId: "pr4", productTitle: "Curso: Sagas em pagamentos", buyerNote: "Enviar nota fiscal por email.", totalPrice: 59, sagaStep: "enviado", createdAt: "2026-07-02T14:00:00Z", disputeOpen: false },
    o2: { productId: "pr1", productTitle: "Kit de ícones semânticos", buyerNote: "", totalPrice: 89.9, sagaStep: "pago", createdAt: "2026-07-03T08:20:00Z", disputeOpen: false },
    o3: { productId: "pr5", productTitle: "Componente de tema (Figma)", buyerNote: "Duplicado por engano — solicitei estorno.", totalPrice: 39, sagaStep: "compensado", createdAt: "2026-07-01T19:10:00Z", disputeOpen: true },
  },
  sellerListings: {
    sl1: { productId: "pr1", title: "Kit de ícones semânticos", status: "ativo", views: 1284, sales: 46, revenue: 4135.4 },
    sl2: { productId: "pr5", title: "Componente de tema (Figma)", status: "ativo", views: 902, sales: 21, revenue: 819 },
    sl3: { productId: "pr3", title: "Print A3 — série Aurora", status: "vendido", views: 640, sales: 12, revenue: 2640 },
    sl4: { productId: "pr6", title: "Assinatura mensal — comunidade", status: "pausado", views: 210, sales: 4, revenue: 116 },
  },
  // ============ B12 — Studio (Office & Criação) ============
  // Invariantes:
  // - `documents.kind` ∈ {doc, sheet, slide, media} determina o editor renderizado.
  // - `syncStatus` ∈ {synced, syncing, conflict-resolved}. `conflict-resolved` é uma
  //   nota de auditoria SILENCIOSA (mescla CRDT automática), não é erro nem alerta.
  // - Editores rodam em OVERLAY fixed inset-0 (exceção "editor precisa de mais área");
  //   ver comentário em `src/components/studio/StudioModule.tsx`.
  documents: {
    d1: { title: "Briefing — Projeto Aurora", kind: "doc", updatedAt: "2026-07-03T09:42:00Z", ownerName: "Israel", collaborators: "Ana Ribeiro, Pedro L.", syncStatus: "synced" },
    d2: { title: "Notas da reunião de kickoff", kind: "doc", updatedAt: "2026-07-02T15:10:00Z", ownerName: "Israel", collaborators: "Ana Ribeiro", syncStatus: "conflict-resolved" },
    d3: { title: "Orçamento Q3", kind: "sheet", updatedAt: "2026-07-03T08:20:00Z", ownerName: "Israel", collaborators: "Pedro L.", syncStatus: "synced" },
    d4: { title: "Roadmap 2026", kind: "sheet", updatedAt: "2026-07-01T18:40:00Z", ownerName: "Israel", collaborators: "", syncStatus: "syncing" },
    d5: { title: "Deck de investidores", kind: "slide", updatedAt: "2026-07-02T22:05:00Z", ownerName: "Israel", collaborators: "Marina, Ana Ribeiro", syncStatus: "synced" },
    d6: { title: "Capa Aurora — série", kind: "media", updatedAt: "2026-06-30T11:30:00Z", ownerName: "Israel", collaborators: "Marina", syncStatus: "synced" },
  },
  // Grade 6x4 (row 0..5, col 0..3) para d3 e d4. Só populamos células com conteúdo.
  sheets: {
    // d3 — Orçamento Q3 (cabeçalho + 3 linhas)
    s_d3_r0c0: { documentId: "d3", row: 0, col: 0, value: "Categoria" },
    s_d3_r0c1: { documentId: "d3", row: 0, col: 1, value: "Jul" },
    s_d3_r0c2: { documentId: "d3", row: 0, col: 2, value: "Ago" },
    s_d3_r0c3: { documentId: "d3", row: 0, col: 3, value: "Set" },
    s_d3_r1c0: { documentId: "d3", row: 1, col: 0, value: "Infra" },
    s_d3_r1c1: { documentId: "d3", row: 1, col: 1, value: "1200" },
    s_d3_r1c2: { documentId: "d3", row: 1, col: 2, value: "1250" },
    s_d3_r1c3: { documentId: "d3", row: 1, col: 3, value: "1300" },
    s_d3_r2c0: { documentId: "d3", row: 2, col: 0, value: "Marketing" },
    s_d3_r2c1: { documentId: "d3", row: 2, col: 1, value: "800" },
    s_d3_r2c2: { documentId: "d3", row: 2, col: 2, value: "950" },
    s_d3_r2c3: { documentId: "d3", row: 2, col: 3, value: "1100" },
    s_d3_r3c0: { documentId: "d3", row: 3, col: 0, value: "Equipe" },
    s_d3_r3c1: { documentId: "d3", row: 3, col: 1, value: "5400" },
    s_d3_r3c2: { documentId: "d3", row: 3, col: 2, value: "5400" },
    s_d3_r3c3: { documentId: "d3", row: 3, col: 3, value: "5600" },
    // d4 — Roadmap 2026 (cabeçalho + 2 linhas)
    s_d4_r0c0: { documentId: "d4", row: 0, col: 0, value: "Sprint" },
    s_d4_r0c1: { documentId: "d4", row: 0, col: 1, value: "Escopo" },
    s_d4_r0c2: { documentId: "d4", row: 0, col: 2, value: "Owner" },
    s_d4_r0c3: { documentId: "d4", row: 0, col: 3, value: "Status" },
    s_d4_r1c0: { documentId: "d4", row: 1, col: 0, value: "S1" },
    s_d4_r1c1: { documentId: "d4", row: 1, col: 1, value: "Studio home" },
    s_d4_r1c2: { documentId: "d4", row: 1, col: 2, value: "Israel" },
    s_d4_r1c3: { documentId: "d4", row: 1, col: 3, value: "Em curso" },
    s_d4_r2c0: { documentId: "d4", row: 2, col: 0, value: "S2" },
    s_d4_r2c1: { documentId: "d4", row: 2, col: 1, value: "Editor de mídia" },
    s_d4_r2c2: { documentId: "d4", row: 2, col: 2, value: "Israel" },
    s_d4_r2c3: { documentId: "d4", row: 2, col: 3, value: "Planejado" },
  },
  // Slides mock (parent: documentId). Cada slide tem título + corpo simples.
  slides: {
    sl_d5_1: { documentId: "d5", order: 1, title: "SuperApp — visão", body: "Local-first · P2P · privacidade por padrão." },
    sl_d5_2: { documentId: "d5", order: 2, title: "Problema", body: "Silos de dados, lock-in de nuvem, custo por usuário." },
    sl_d5_3: { documentId: "d5", order: 3, title: "Solução", body: "Um app modular com sincronização CRDT entre dispositivos do usuário." },
    sl_d5_4: { documentId: "d5", order: 4, title: "Tração", body: "Marketplace + Studio + Social integrados. 3 pilotos ativos." },
  },
  // Biblioteca de "arquivos" mock para o Insert Media modal.
  mediaLibrary: {
    ml1: { name: "aurora-cover.jpg", kind: "image", size: "2.4 MB" },
    ml2: { name: "onboarding.mp4", kind: "video", size: "18.1 MB" },
    ml3: { name: "voz-do-cliente.wav", kind: "audio", size: "6.7 MB" },
    ml4: { name: "logo-mono.svg", kind: "image", size: "12 KB" },
  },
  // ============ B3 — ERP / CRM ============
  // Invariantes:
  // - `inventory` é multi-depósito: mesmo `sku` pode aparecer em vários
  //   `warehouseId`. Agrupamos por SKU na UI, não no store.
  // - `lockExpiresAt` é ISO string. Se já passou → UI mostra "Reserva expirada"
  //   (nota informativa; não liberamos qtyReserved automaticamente no mockup).
  // - `pipeline.stage` ∈ {prospecção, qualificação, proposta, fechamento} —
  //   drag-and-drop atualiza o campo direto no TinyBase.
  // - Visão 360 do cliente é traversal por `customerName` (mockup: filter, não
  //   índice).
  salesOrders: {
    so1: { customerName: "Ana Ribeiro", items: "3× Kit branding · 1× Consultoria", total: 4200, status: "faturado", createdAt: "2026-06-28T14:20:00Z" },
    so2: { customerName: "Pedro L.", items: "1× Assinatura anual Studio", total: 1188, status: "confirmado", createdAt: "2026-07-01T09:05:00Z" },
    so3: { customerName: "Marina", items: "2× Print série Aurora A3", total: 440, status: "rascunho", createdAt: "2026-07-03T08:12:00Z" },
    so4: { customerName: "Ana Ribeiro", items: "1× Workshop presencial", total: 2800, status: "confirmado", createdAt: "2026-07-02T16:40:00Z" },
  },
  purchaseOrders: {
    po1: { supplierName: "Papelaria Norte", items: "20× Bloco A4 · 5× Tinta CMYK", total: 890, status: "recebido", createdAt: "2026-06-20T10:00:00Z" },
    po2: { supplierName: "TechSupply", items: "3× Monitor 27\"", total: 6300, status: "aprovado", createdAt: "2026-06-30T15:30:00Z" },
    po3: { supplierName: "Cafés do Sul", items: "10kg grão especial", total: 480, status: "solicitado", createdAt: "2026-07-03T07:45:00Z" },
  },
  inventory: {
    // SKU-001 em 2 depósitos, com reserva ativa em SP
    inv1: { sku: "SKU-001", name: "Kit branding premium", warehouseId: "wh-sp", warehouseName: "Depósito SP", qtyAvailable: 40, qtyReserved: 3, lockExpiresAt: new Date(Date.now() + 12 * 60 * 1000).toISOString() },
    inv2: { sku: "SKU-001", name: "Kit branding premium", warehouseId: "wh-rj", warehouseName: "Depósito RJ", qtyAvailable: 12, qtyReserved: 0, lockExpiresAt: "" },
    // SKU-014 em 2 depósitos, com reserva EXPIRADA em RJ
    inv3: { sku: "SKU-014", name: "Print Aurora A3", warehouseId: "wh-sp", warehouseName: "Depósito SP", qtyAvailable: 24, qtyReserved: 0, lockExpiresAt: "" },
    inv4: { sku: "SKU-014", name: "Print Aurora A3", warehouseId: "wh-rj", warehouseName: "Depósito RJ", qtyAvailable: 8, qtyReserved: 2, lockExpiresAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    // SKU-032 só em SP
    inv5: { sku: "SKU-032", name: "Monitor 27\"", warehouseId: "wh-sp", warehouseName: "Depósito SP", qtyAvailable: 6, qtyReserved: 0, lockExpiresAt: "" },
    inv6: { sku: "SKU-047", name: "Bloco A4 pautado", warehouseId: "wh-rj", warehouseName: "Depósito RJ", qtyAvailable: 120, qtyReserved: 0, lockExpiresAt: "" },
  },
  pipeline: {
    pl1: { dealName: "Rebranding Aurora", customerName: "Ana Ribeiro", stage: "proposta", value: 18000, owner: "Israel" },
    pl2: { dealName: "Renovação anual Studio", customerName: "Pedro L.", stage: "fechamento", value: 1188, owner: "Israel" },
    pl3: { dealName: "Consultoria trimestral", customerName: "Marina", stage: "qualificação", value: 6400, owner: "Ana" },
    pl4: { dealName: "Piloto Marketplace", customerName: "Rafael", stage: "prospecção", value: 3200, owner: "Israel" },
    pl5: { dealName: "Pacote onboarding", customerName: "Julia", stage: "prospecção", value: 890, owner: "Ana" },
    pl6: { dealName: "Expansão SP", customerName: "Ana Ribeiro", stage: "qualificação", value: 12500, owner: "Israel" },
  },
  customers: {
    cu1: { name: "Ana Ribeiro", email: "ana@aurora.co", segment: "Enterprise", lifetimeValue: 42800, lastContact: "2026-07-02T16:40:00Z" },
    cu2: { name: "Pedro L.", email: "pedro@lopes.dev", segment: "SMB", lifetimeValue: 4356, lastContact: "2026-07-01T09:05:00Z" },
    cu3: { name: "Marina", email: "marina@marina.studio", segment: "Creator", lifetimeValue: 12440, lastContact: "2026-07-03T08:12:00Z" },
    cu4: { name: "Rafael", email: "rafael@rmarket.br", segment: "SMB", lifetimeValue: 1800, lastContact: "2026-06-18T11:00:00Z" },
  },
  // ============ B4 — Contábil / Fiscal / RH ============
  // Invariantes:
  // - `accounts` é uma árvore por `parentCode` (null = raiz). Sem ciclos.
  // - `entries.derivedFrom` sinaliza a origem sistêmica (ex. "Pedido #o_123");
  //   reforça o princípio de que lançamentos vêm de eventos, não digitação livre.
  // - `entries.taxPeriodId` referencia `taxPeriods`. Período com
  //   `status:"fechado"` torna todos os `entries` daquele período read-only na UI.
  // - Jurisdição fiscal NÃO existe no mockup por design — qualquer export
  //   fiscal (SPED/NF-e) deve mostrar o estado "conector/jurisdição ausente".
  accounts: {
    a1:     { code: "1",     name: "Ativo",                parentCode: null,    kind: "ativo" },
    a11:    { code: "1.1",   name: "Ativo Circulante",     parentCode: "1",     kind: "ativo" },
    a111:   { code: "1.1.1", name: "Caixa",                parentCode: "1.1",   kind: "ativo" },
    a112:   { code: "1.1.2", name: "Bancos",               parentCode: "1.1",   kind: "ativo" },
    a2:     { code: "2",     name: "Passivo",              parentCode: null,    kind: "passivo" },
    a21:    { code: "2.1",   name: "Fornecedores",         parentCode: "2",     kind: "passivo" },
    a3:     { code: "3",     name: "Receitas",             parentCode: null,    kind: "receita" },
    a31:    { code: "3.1",   name: "Vendas de serviços",   parentCode: "3",     kind: "receita" },
    a4:     { code: "4",     name: "Despesas",             parentCode: null,    kind: "despesa" },
    a41:    { code: "4.1",   name: "Despesas operacionais", parentCode: "4",    kind: "despesa" },
  },
  taxPeriods: {
    tp1: { label: "2026-Q1", status: "fechado", closedAt: "2026-04-10T18:00:00Z" },
    tp2: { label: "2026-Q2", status: "aberto",  closedAt: null },
    tp3: { label: "2026-Q3", status: "aberto",  closedAt: null },
  },
  entries: {
    e1: { accountCode: "3.1",   description: "Receita — Consultoria Aurora",   amount: 4200,  date: "2026-06-28T14:20:00Z", derivedFrom: "Pedido #so1",    taxPeriodId: "tp2" },
    e2: { accountCode: "1.1.2", description: "Recebimento em conta corrente",  amount: 4200,  date: "2026-06-29T09:00:00Z", derivedFrom: "Pedido #so1",    taxPeriodId: "tp2" },
    e3: { accountCode: "4.1",   description: "Compra de material — Papelaria", amount: -890,  date: "2026-06-20T10:00:00Z", derivedFrom: "Compra #po1",    taxPeriodId: "tp2" },
    e4: { accountCode: "3.1",   description: "Receita — Assinatura Studio",    amount: 1188,  date: "2026-07-01T09:05:00Z", derivedFrom: "Pedido #so2",    taxPeriodId: "tp3" },
    e5: { accountCode: "4.1",   description: "Folha — competência Mar/26",     amount: -8400, date: "2026-03-30T12:00:00Z", derivedFrom: "Folha #mar26",   taxPeriodId: "tp1" },
    e6: { accountCode: "3.1",   description: "Receita — Workshop presencial",  amount: 2800,  date: "2026-07-02T16:40:00Z", derivedFrom: "Pedido #so4",    taxPeriodId: "tp3" },
  },
  employees: {
    emp1: { name: "Ana Ribeiro",  role: "Designer sênior", department: "Design",     hiredAt: "2024-03-11", status: "ativo" },
    emp2: { name: "Pedro L.",     role: "Advogado",        department: "Jurídico",   hiredAt: "2023-08-01", status: "ativo" },
    emp3: { name: "Rafael",       role: "Engenheiro",      department: "Engenharia", hiredAt: "2025-01-15", status: "ativo" },
    emp4: { name: "Julia",        role: "Product manager", department: "Produto",    hiredAt: "2022-11-20", status: "desligado" },
  },
  // ============ B5 — Mapa ============
  // Invariantes:
  // - Coordenadas mock em torno de São Paulo. `distanceKm` é pré-calculada
  //   (mockup) porque não pedimos geolocalização real do browser.
  // - `savedByMe` é um toggle local por usuário — sem sync remoto.
  // - Categorias livres (café, coworking, farmácia…). Sem enum estrito para
  //   deixar a busca por categoria simples via substring.
  places: {
    pl_map1: { name: "Café Aurora",         category: "café",      lat: -23.561, lng: -46.656, distanceKm: 0.4, addressLabel: "R. Consolação, 2200 · Consolação",     savedByMe: true  },
    pl_map2: { name: "Coworking Central",   category: "coworking", lat: -23.549, lng: -46.639, distanceKm: 1.1, addressLabel: "Av. Paulista, 1000 · Bela Vista",       savedByMe: false },
    pl_map3: { name: "Farmácia São João",   category: "farmácia",  lat: -23.567, lng: -46.649, distanceKm: 0.6, addressLabel: "R. Augusta, 900 · Consolação",          savedByMe: false },
    pl_map4: { name: "Padaria Bella",       category: "padaria",   lat: -23.556, lng: -46.671, distanceKm: 0.9, addressLabel: "R. Cardeal Arcoverde, 500 · Pinheiros", savedByMe: false },
    pl_map5: { name: "Livraria da Vila",    category: "livraria",  lat: -23.577, lng: -46.688, distanceKm: 2.4, addressLabel: "R. Fradique Coutinho, 915 · Pinheiros", savedByMe: true  },
    pl_map6: { name: "Academia FitLab",     category: "academia",  lat: -23.552, lng: -46.660, distanceKm: 0.8, addressLabel: "R. Estados Unidos, 1500 · Jardins",     savedByMe: false },
    pl_map7: { name: "Parque Ibirapuera",   category: "parque",    lat: -23.587, lng: -46.657, distanceKm: 3.2, addressLabel: "Av. Pedro Álvares Cabral · Vila Mariana", savedByMe: false },
    pl_map8: { name: "Mercado Municipal",   category: "mercado",   lat: -23.542, lng: -46.629, distanceKm: 2.1, addressLabel: "R. da Cantareira, 306 · Centro",         savedByMe: false },
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
  activeConversationId: "c1",
};

// Fake persister — swap this file for a real persistence layer later.
if (typeof window !== "undefined") {
  const persister = createLocalPersister(store, "superapp-mockup-v8");
  persister
    .startAutoLoad([initialTables, initialValues])
    .then(() => persister.startAutoSave());
} else {
  store.setTables(initialTables).setValues(initialValues);
}