const COLUMNS = [
  { id: "a-fazer", label: "A fazer" },
  { id: "em-andamento", label: "Em andamento" },
  { id: "aguardando", label: "Aguardando" },
  { id: "concluido", label: "Concluído" },
];

const PEDIDO_STAGES = [
  { id: "novo", label: "Novo caso" },
  { id: "elaboracao", label: "Elaboração do pedido" },
  { id: "judicial", label: "Pedido judicial realizado" },
  { id: "recurso", label: "Recurso apresentado" },
  { id: "pagamento", label: "Pagamento" },
  { id: "concluido", label: "Concluído" },
];

const PEDIDO_TIPOS = [
  "Atraso de voo",
  "Negativação indevida",
  "Restituição de INSS",
  "Bloqueio em rede social",
];

const STAGE_LABEL = {
  ...Object.fromEntries(PEDIDO_STAGES.map((s) => [s.id, s.label])),
  "aguardando-ext": "Aguardando o cliente",
};

const TODAY = new Date(2026, 7, 26);

function parseDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtShort(iso) {
  const dt = parseDate(iso);
  if (!dt) return "—";
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function fmtLong(iso) {
  const dt = parseDate(iso);
  if (!dt) return "—";
  return dt.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

function daysUntil(iso) {
  const dt = parseDate(iso);
  if (!dt) return Infinity;
  return Math.round((dt - TODAY) / 86400000);
}

function urgency(task) {
  if (task.column === "concluido") return "done";
  const fatal = daysUntil(task.prazoFatal);
  const interno = daysUntil(task.prazoInterno);
  if (fatal <= 2) return "crit";
  if (interno <= 3) return "warn";
  return "ok";
}

function prazoFilterMatch(task, filter) {
  if (filter === "todas") return true;
  if (task.column === "concluido") return false;
  const fatal = daysUntil(task.prazoFatal);
  const interno = daysUntil(task.prazoInterno);
  const nearest = Math.min(fatal, interno);
  if (filter === "hoje") return nearest <= 0;
  if (filter === "semana") return nearest <= 7;
  if (filter === "atrasadas") return nearest < 0;
  if (filter === "criticas") return urgency(task) === "crit";
  if (filter === "urgentes") return urgency(task) === "warn" || urgency(task) === "crit";
  if (filter === "aguardando") return task.column === "aguardando";
  return true;
}

const seedPedidos = [
  {
    id: "1034",
    cliente: "Larissa Prado Vianna",
    tipo: "Atraso de voo",
    sigla: "AV",
    origem: "Resolvvi",
    stage: "elaboracao",
    valor: 8500,
    statusFin: "Em aberto",
  },
  {
    id: "1230",
    cliente: "Camila Duarte Rocha",
    tipo: "Bloqueio em rede social",
    sigla: "BRS",
    origem: "Resolvvi",
    stage: "recurso",
    valor: 12000,
    statusFin: "Aguardando pagamento",
  },
  {
    id: "1188",
    cliente: "Bruno Nogueira Lima",
    tipo: "Restituição de INSS",
    sigla: "INSS",
    origem: "Resolvvi",
    stage: "judicial",
    valor: 6400,
    statusFin: "Em aberto",
  },
  {
    id: "1412",
    cliente: "Marina Costa Alves",
    tipo: "Negativação indevida",
    sigla: "NNI",
    origem: "Resolvvi",
    stage: "pagamento",
    valor: 7200,
    statusFin: "Pronto para faturar",
  },
  {
    id: "0901",
    cliente: "Felipe Andrade",
    tipo: "Atraso de voo",
    sigla: "AV",
    origem: "Resolvvi",
    stage: "concluido",
    valor: 4300,
    statusFin: "Faturado",
  },
  {
    id: "EXT-22",
    cliente: "João Mendes",
    tipo: "Negativação indevida",
    sigla: "NNI",
    origem: "Externo",
    stage: "elaboracao",
    valor: 5000,
    statusFin: "Em aberto",
  },
  {
    id: "EXT-31",
    cliente: "Vanessa Ribeiro",
    tipo: "Restituição de INSS",
    sigla: "INSS",
    origem: "Externo",
    stage: "aguardando-ext",
    valor: 9100,
    statusFin: "Em aberto",
  },
  {
    id: "EXT-08",
    cliente: "Eduardo Pires",
    tipo: "Bloqueio em rede social",
    sigla: "BRS",
    origem: "Externo",
    stage: "judicial",
    valor: 15000,
    statusFin: "Em aberto",
  },
];

const seedTasks = [
  {
    id: "t1",
    titulo: "Enviar provas para elaboração do pedido",
    pedidoId: "1034",
    column: "a-fazer",
    prazoInterno: "2026-08-27",
    prazoFatal: "2026-09-12",
    descricao: "Organizar prints da companhia aérea e cartão de embarque.",
    anexos: ["cartao-embarque.pdf"],
  },
  {
    id: "t2",
    titulo: "Preparar contestação",
    pedidoId: "EXT-22",
    column: "a-fazer",
    prazoInterno: "2026-08-29",
    prazoFatal: "2026-09-20",
    descricao: "Minuta da contestação para o cliente externo.",
    anexos: [],
  },
  {
    id: "t3",
    titulo: "Organizar documentos do caso",
    pedidoId: "EXT-31",
    column: "a-fazer",
    prazoInterno: "2026-09-02",
    prazoFatal: "2026-10-02",
    descricao: "Pasta de provas do cliente.",
    anexos: ["extratos.xlsx"],
  },
  {
    id: "t4",
    titulo: "Revisar minuta de recurso",
    pedidoId: "1230",
    column: "em-andamento",
    prazoInterno: "2026-08-25",
    prazoFatal: "2026-08-27",
    descricao: "Revisão da minuta enviada pela Resolvvi.",
    anexos: ["minuta-recurso.docx"],
  },
  {
    id: "t5",
    titulo: "Protocolar recurso",
    pedidoId: "1230",
    column: "em-andamento",
    prazoInterno: "2026-08-26",
    prazoFatal: "2026-08-27",
    descricao: "Protocolo no PJe após revisão.",
    anexos: [],
  },
  {
    id: "t6",
    titulo: "Complementar provas do pedido",
    pedidoId: "1188",
    column: "em-andamento",
    prazoInterno: "2026-08-30",
    prazoFatal: "2026-09-15",
    descricao: "Carnês e holerites faltantes.",
    anexos: [],
  },
  {
    id: "t7",
    titulo: "Responder ofício do banco",
    pedidoId: "EXT-08",
    column: "em-andamento",
    prazoInterno: "2026-09-04",
    prazoFatal: "2026-09-18",
    descricao: "",
    anexos: [],
  },
  {
    id: "t8",
    titulo: "Aguardar intimação",
    pedidoId: "1188",
    column: "aguardando",
    prazoInterno: "2026-09-10",
    prazoFatal: "2026-10-20",
    descricao: "Aguardando publicação.",
    anexos: [],
  },
  {
    id: "t9",
    titulo: "Aguardar retorno do cliente",
    pedidoId: "EXT-31",
    column: "aguardando",
    prazoInterno: "2026-09-08",
    prazoFatal: "2026-10-01",
    descricao: "",
    anexos: [],
  },
  {
    id: "t10",
    titulo: "Arquivar pasta do pedido",
    pedidoId: "0901",
    column: "concluido",
    prazoInterno: "2026-08-10",
    prazoFatal: "2026-08-12",
    descricao: "",
    anexos: ["recibo.pdf"],
  },
  {
    id: "t11",
    titulo: "Confirmar recebimento da indenização",
    pedidoId: "1412",
    column: "concluido",
    prazoInterno: "2026-08-20",
    prazoFatal: "2026-08-22",
    descricao: "",
    anexos: [],
  },
];

const seedAuthors = [
  "rafael@escritorio.com",
  "diego@escritorio.com",
  "camila@escritorio.com",
];
seedTasks.forEach((t, i) => {
  t.createdBy = seedAuthors[i % seedAuthors.length];
  const autor =
    t.createdBy === "rafael@escritorio.com"
      ? "Rafael Cardoso"
      : t.createdBy === "diego@escritorio.com"
        ? "Diego Martins"
        : "Camila Ferreira";
  t.historico = (t.anexos || []).map((arquivo, n) => ({
    tipo: "arquivo",
    arquivo,
    autor,
    at: `2026-08-${String(18 + (i % 6)).padStart(2, "0")}T${String(9 + n).padStart(2, "0")}:15:00.000Z`,
  }));
});
COLUMNS.forEach((col) => {
  const rank = { crit: 0, warn: 1, ok: 2, done: 3 };
  seedTasks
    .filter((t) => t.column === col.id)
    .sort((a, b) => rank[urgency(a)] - rank[urgency(b)] || a.titulo.localeCompare(b.titulo, "pt-BR"))
    .forEach((t, i) => {
      t.order = i;
    });
});

const seedMembers = [
  { nome: "Rafael Cardoso", papel: "Advogado", admin: true, email: "rafael@escritorio.com" },
  { nome: "Camila Ferreira", papel: "Financeiro", email: "camila@escritorio.com" },
  { nome: "Diego Martins", papel: "Advogado", email: "diego@escritorio.com" },
];

const state = {
  screen: "onboarding",
  onboardStep: 1,
  accountType: null,
  officeName: "",
  userName: "",
  oab: "",
  email: "",
  phone: "",
  specialty: "",
  role: "Advogado",
  view: "tarefas",
  seeded: false,
  search: "",
  prazoFilter: "todas",
  columnSort: {},
  columnFilters: {},
  colMenu: null,
  statusMenu: false,
  addingSubtask: false,
  subtasksOpen: true,
  scoreFilter: "todas",
  tasks: [],
  pedidos: [],
  members: [...seedMembers],
  modal: null,
  drawerTask: null,
  openPedido: null,
  toast: "",
  form: {},
};

function pedidoOf(task) {
  return state.pedidos.find((p) => p.id === task.pedidoId);
}

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return parts[0][0].toUpperCase();
}

function taskAuthor(task) {
  const email = task.createdBy;
  const m = email && state.members.find((x) => x.email === email);
  if (m) return m;
  if (email && email === state.email) return { nome: state.userName || "Você", email };
  return { nome: state.userName || "Você", email: state.email };
}

function currentActor() {
  return state.userName || "Você";
}

function fmtDateTime(iso) {
  const dt = iso ? new Date(iso) : new Date();
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pushHistory(task, entry) {
  if (!task) return;
  task.historico = task.historico || [];
  task.historico.push({
    at: new Date().toISOString(),
    autor: currentActor(),
    ...entry,
  });
}

function taskHistory(task) {
  const items = [...(task.historico || [])];
  (task.comentarios || []).forEach((c) => {
    items.push({
      tipo: "comentario",
      texto: c.texto,
      autor: c.autor || currentActor(),
      at: c.at || new Date().toISOString(),
    });
  });
  (task.anexos || []).forEach((arquivo) => {
    if (!items.some((i) => i.tipo === "arquivo" && i.arquivo === arquivo)) {
      items.push({
        tipo: "arquivo",
        arquivo,
        autor: taskAuthor(task).nome,
        at: new Date().toISOString(),
      });
    }
  });
  return items.sort((a, b) => new Date(a.at) - new Date(b.at));
}

function historyCopy(item) {
  if (item.tipo === "arquivo") return `Anexou ${item.arquivo}`;
  if (item.tipo === "subtarefa") return `Criou a subtarefa “${item.texto}”`;
  if (item.tipo === "status") return `alterou o status para ${item.texto}`;
  if (item.tipo === "comentario") return item.texto;
  return item.texto || "";
}

function colLabel(id) {
  return (COLUMNS.find((c) => c.id === id) || {}).label || id;
}

function logStatusChange(task, nextCol) {
  if (!task || !nextCol || task.column === nextCol) return false;
  pushHistory(task, { tipo: "status", texto: colLabel(nextCol) });
  task.column = nextCol;
  return true;
}

function icon(name) {
  const paths = {
    search:
      '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7"/><path d="M10 19a2 2 0 0 0 4 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7L12.7 18"/>',
    ext: '<path d="M14 5h5v5"/><path d="M19 5L10 14"/><path d="M5 8v11h11"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    warn: '<path d="M12 3L2 20h20L12 3z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
    paper: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12l4 4 10-10"/>',
    filter:
      '<path d="M4 5h16"/><path d="M7 12h10"/><path d="M10 19h4"/>',
    back: '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
  };
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ""}</svg>`;
}

function toast(msg) {
  state.toast = msg;
  render();
  setTimeout(() => {
    state.toast = "";
    render();
  }, 2400);
}

function roleLabel(papel) {
  if (papel === "Financeiro") return "Financeiro";
  if (papel === "Administrativo") return "Administrativo";
  return "Advogado";
}

function isAdmin(m) {
  return !!(m && (m.admin || m.papel === "Admin"));
}

function memberTags(m) {
  const tags = [];
  if (isAdmin(m)) tags.push("Admin");
  const job = m.papel === "Admin" ? "Advogado" : m.papel;
  if (job && !tags.includes(job)) tags.push(job);
  return tags;
}

function header() {
  const isFin = state.role === "Financeiro" || state.role === "Administrativo";
  return `
    <aside class="app-sidebar">
      <div class="brand">
        <img class="logo-word" src="./logo-resolvvi.png" alt="resolvvi" />
      </div>
      <div class="sidebar-profile">
        <button class="user-chip profile-switch" data-action="open-team-switch" type="button">
          <div class="avatar">${(state.userName || "R")[0]}</div>
          <div class="user-meta">
            <strong>${escapeHtml(state.userName)}</strong>
            <span>${roleLabel(state.role)}</span>
          </div>
        </button>
        <button class="icon-btn has-dot" data-action="notify" type="button">${icon("bell")}</button>
      </div>
      ${
        isFin
          ? ""
          : `<label class="search sidebar-search">${icon("search")}
        <input id="search" placeholder="Buscar cliente, pedido ou processo" value="${escapeHtml(state.search)}" />
      </label>
      <nav class="header-nav">
        <button class="nav-link ${state.view === "tarefas" ? "active" : ""}" data-view="tarefas">Tarefas</button>
        <button class="nav-link ${state.view === "pedidos" ? "active" : ""}" data-view="pedidos">Pedidos</button>
      </nav>`
      }
      <div class="header-spacer"></div>
      ${
        isFin
          ? ""
          : `<button class="btn btn-md btn-primary sidebar-add" data-action="open-pedido">${icon("plus")} Adicionar caso</button>`
      }
    </aside>
  `;
}

function taskCard(task) {
  const p = pedidoOf(task);
  const u = urgency(task);
  const origin = p?.origem === "Resolvvi";
  const author = taskAuthor(task);
  const barClass = task.column === "concluido" ? "done" : u === "crit" ? "crit" : u === "warn" ? "warn" : "ok";
  const barIcon = u === "crit" ? "warn" : "clock";
  const barText =
    task.column === "concluido"
      ? "Concluído"
      : `Prazo fatal: ${fmtLong(task.prazoFatal)}`;
  return `
    <div class="card ${u === "crit" ? "critical" : u === "warn" ? "urgent" : ""}" draggable="true" role="button" tabindex="0" data-open-task="${task.id}">
      <div class="card-top">
        <div class="card-top-start">
          <span class="avatar sm" title="${escapeHtml(author.nome)}">${escapeHtml(initials(author.nome))}</span>
          <span class="pill ${origin ? "pill-rosa" : "pill-navy"}">${origin ? icon("link") : icon("ext")} ${origin ? "Resolvvi" : "Externo"}</span>
        </div>
        <span class="id-tag">#${p?.id || "avulso"}</span>
      </div>
      <h4>${task.titulo}</h4>
      <div class="meta-row">Prazo interno: ${fmtShort(task.prazoInterno)}</div>
      <div class="prazo-bar ${barClass}">${icon(barIcon)} ${barText}</div>
    </div>
  `;
}

function visibleTasks() {
  const q = state.search.trim().toLowerCase();
  return state.tasks
    .filter((t) => !state.scoreFilter || prazoFilterMatch(t, state.scoreFilter))
    .filter((t) => {
      if (!q) return true;
      const p = pedidoOf(t);
      return (
        t.titulo.toLowerCase().includes(q) ||
        (p?.cliente || "").toLowerCase().includes(q) ||
        (p?.id || "").toLowerCase().includes(q)
      );
    });
}

function emptyColFilter() {
  return {
    sort: null,
    pedido: "",
    cliente: "",
    query: "",
    tipo: null,
    prazo: null,
    origem: null,
    createdBy: null,
  };
}

function colFilter(menuId) {
  return state.columnFilters[menuId] || emptyColFilter();
}

function ensureColFilter(menuId) {
  if (!state.columnFilters[menuId]) state.columnFilters[menuId] = emptyColFilter();
  return state.columnFilters[menuId];
}

function colFilterActive(f) {
  return !!(
    f.sort ||
    String(f.pedido || "").trim() ||
    String(f.cliente || "").trim() ||
    String(f.query || "").trim() ||
    f.tipo ||
    f.prazo ||
    f.origem ||
    f.createdBy
  );
}

function creatorOptions() {
  const seen = new Map();
  state.members.forEach((m) => {
    if (m.email) seen.set(m.email, m.nome);
  });
  if (state.email) seen.set(state.email, state.userName || "Você");
  state.tasks.forEach((t) => {
    if (t.createdBy && !seen.has(t.createdBy)) seen.set(t.createdBy, taskAuthor(t).nome);
  });
  return [...seen.entries()];
}

function applyColumnFilter(items, menuId) {
  const f = colFilter(menuId);
  let next = items;
  const pedidoQ = String(f.pedido || "")
    .trim()
    .toLowerCase()
    .replace(/^#/, "");
  const clienteQ = String(f.cliente || "").trim().toLowerCase();
  if (pedidoQ) {
    next = next.filter((t) => String(t.pedidoId || "").toLowerCase().includes(pedidoQ));
  }
  if (clienteQ) {
    next = next.filter((t) => (pedidoOf(t)?.cliente || "").toLowerCase().includes(clienteQ));
  }
  if (f.prazo) next = next.filter((t) => prazoFilterMatch(t, f.prazo));
  if (f.origem) {
    next = next.filter((t) => (pedidoOf(t)?.origem || "Externo") === f.origem);
  }
  if (f.createdBy) {
    next = next.filter((t) => (t.createdBy || "") === f.createdBy);
  }
  if (f.sort === "az") {
    next = [...next].sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
  } else if (f.sort === "za") {
    next = [...next].sort((a, b) => b.titulo.localeCompare(a.titulo, "pt-BR"));
  } else {
    next = [...next].sort(compareTaskOrder);
  }
  return next;
}

function compareTaskOrder(a, b) {
  const ao = Number.isFinite(a.order) ? a.order : 1e9;
  const bo = Number.isFinite(b.order) ? b.order : 1e9;
  if (ao !== bo) return ao - bo;
  const rank = { crit: 0, warn: 1, ok: 2, done: 3 };
  return rank[urgency(a)] - rank[urgency(b)] || a.titulo.localeCompare(b.titulo, "pt-BR");
}

function tasksInColumn(colId) {
  return applyColumnFilter(
    visibleTasks().filter((t) => t.column === colId),
    colId
  );
}

function taskFilterMenu(menuId, f) {
  const btn = (key, val, label) =>
    `<button type="button" class="${f[key] === val ? "active" : ""}" data-col-f="${menuId}" data-fkey="${key}" data-fval="${escapeHtml(val)}">${escapeHtml(label)}</button>`;
  return `
    <div class="col-menu col-menu-panel" data-stop>
      <div class="col-menu-kicker">Ordem alfabética</div>
      <div class="col-menu-row">
        ${btn("sort", "az", "A–Z")}
        ${btn("sort", "za", "Z–A")}
      </div>
      <div class="col-menu-kicker">Nº do pedido</div>
      <input id="cf-pedido-${menuId}" data-cf-col="${menuId}" data-cf-key="pedido" type="text" placeholder="Buscar pelo nº" value="${escapeHtml(f.pedido || "")}" />
      <div class="col-menu-kicker">Cliente</div>
      <input id="cf-cliente-${menuId}" data-cf-col="${menuId}" data-cf-key="cliente" type="text" placeholder="Buscar pelo cliente" value="${escapeHtml(f.cliente || "")}" />
      <div class="col-menu-kicker">Vencimento</div>
      ${btn("prazo", "hoje", "Hoje")}
      ${btn("prazo", "semana", "Nesta semana")}
      ${btn("prazo", "atrasadas", "Atrasados")}
      <div class="col-menu-kicker">Origem do caso</div>
      <div class="col-menu-row">
        ${btn("origem", "Resolvvi", "Resolvvi")}
        ${btn("origem", "Externo", "Externo")}
      </div>
      <div class="col-menu-kicker">Criada por</div>
      ${creatorOptions()
        .map(([email, nome]) => btn("createdBy", email, nome))
        .join("")}
      ${
        colFilterActive(f)
          ? `<button type="button" class="col-menu-clear" data-col-clear="${menuId}">Limpar filtros</button>`
          : ""
      }
    </div>
  `;
}

function pedidoFilterMenu(menuId, f) {
  const btn = (key, val, label) =>
    `<button type="button" class="${f[key] === val ? "active" : ""}" data-col-f="${menuId}" data-fkey="${key}" data-fval="${escapeHtml(val)}">${escapeHtml(label)}</button>`;
  return `
    <div class="col-menu col-menu-panel" data-stop>
      <div class="col-menu-kicker">Ordem alfabética</div>
      <div class="col-menu-row">
        ${btn("sort", "az", "A–Z")}
        ${btn("sort", "za", "Z–A")}
      </div>
      <div class="col-menu-kicker">Categoria</div>
      ${PEDIDO_TIPOS.map((tipo) => btn("tipo", tipo, tipo)).join("")}
      <div class="col-menu-kicker">Origem do caso</div>
      <div class="col-menu-row">
        ${btn("origem", "Resolvvi", "Resolvvi")}
        ${btn("origem", "Externo", "Externo")}
      </div>
      <div class="col-menu-kicker">Pedido ou cliente</div>
      <input id="cf-query-${menuId}" data-cf-col="${menuId}" data-cf-key="query" type="text" placeholder="Buscar pelo nº ou cliente" value="${escapeHtml(f.query || "")}" />
      ${
        colFilterActive(f)
          ? `<button type="button" class="col-menu-clear" data-col-clear="${menuId}">Limpar filtros</button>`
          : ""
      }
    </div>
  `;
}

function colHead(col, count, extra = {}) {
  const menuId = extra.menuId || col.id;
  const pedidoMenu = extra.kind === "pedido";
  const f = colFilter(menuId);
  const active = colFilterActive(f);
  const open = state.colMenu === menuId;
  const showAdd = extra.add !== false;
  return `
    <div class="col-head">
      <div class="col-head-left">
        <h3>${col.label}</h3>
        <span class="count">${count}</span>
      </div>
      <div class="col-head-actions">
        ${
          showAdd
            ? `<button class="col-icon ${extra.tip !== false && !state.seeded && col.id === "a-fazer" ? "hint" : ""}" type="button" title="Adicionar tarefa" data-col-add="${col.id}">${icon("plus")}</button>`
            : ""
        }
        <button class="col-icon ${active ? "active" : ""}" type="button" title="Filtrar" data-col-menu="${menuId}">${icon("filter")}</button>
        ${
          extra.tip !== false && showAdd && !state.seeded && col.id === "a-fazer"
            ? `<div class="first-tip">
                <div class="first-tip-arrow"></div>
                <div class="seal">Comece aqui</div>
                <p>Crie a primeira tarefa. É só tocar no +.</p>
              </div>`
            : ""
        }
        ${
          open
            ? pedidoMenu
              ? pedidoFilterMenu(menuId, f)
              : taskFilterMenu(menuId, f)
            : ""
        }
      </div>
    </div>
  `;
}

function applyPedidoFilter(items, menuId) {
  const f = colFilter(menuId);
  let next = items;
  const q = String(f.query || "")
    .trim()
    .toLowerCase()
    .replace(/^#/, "");
  if (q) {
    next = next.filter(
      (p) => p.id.toLowerCase().includes(q) || (p.cliente || "").toLowerCase().includes(q)
    );
  }
  if (f.tipo) next = next.filter((p) => p.tipo === f.tipo);
  if (f.origem) next = next.filter((p) => p.origem === f.origem);
  if (f.sort === "az") {
    next = [...next].sort((a, b) => a.cliente.localeCompare(b.cliente, "pt-BR"));
  } else if (f.sort === "za") {
    next = [...next].sort((a, b) => b.cliente.localeCompare(a.cliente, "pt-BR"));
  }
  return next;
}

function pedidosInStage(stageId, list) {
  return applyPedidoFilter(
    list.filter((p) => mapPedidoCol(p) === stageId),
    "p-" + stageId
  );
}

function pedidoCard(p) {
  const related = state.tasks.filter((t) => t.pedidoId === p.id);
  const done = related.filter((t) => t.column === "concluido").length;
  const pct = related.length ? Math.round((done / related.length) * 100) : 0;
  return `<button class="card pedido-card" data-open-pedido="${p.id}">
    <div class="card-top">
      <span class="pill ${p.origem === "Resolvvi" ? "pill-rosa" : "pill-navy"}">${p.origem}</span>
      <span class="id-tag">#${p.id}</span>
    </div>
    <h4>${p.cliente}</h4>
    <div class="sub">${p.tipo}</div>
    <div class="progress"><i style="width:${pct}%"></i></div>
    <div class="meta-row">${related.length} tarefa(s) · ${pct}% concluído</div>
    ${p.stage === "pagamento" ? `<div class="prazo-bar warn">${icon("warn")} Etapa de pagamento</div>` : ""}
  </button>`;
}

function scores(tasksAll) {
  const open = tasksAll.filter((t) => t.column !== "concluido");
  return {
    criticas: open.filter((t) => urgency(t) === "crit").length,
    urgentes: open.filter((t) => urgency(t) === "warn").length,
    aguardando: tasksAll.filter((t) => t.column === "aguardando").length,
    total: open.length,
  };
}

function boardView() {
  const sc = scores(state.tasks);
  return `
    <div class="workspace">
      <div class="scoreboard">
        <button class="score critical ${state.scoreFilter === "criticas" ? "active" : ""}" data-score="criticas">
          <div class="n">${sc.criticas}</div><div class="l">tarefas críticas<br>(prazo fatal)</div>
        </button>
        <button class="score urgent ${state.scoreFilter === "urgentes" ? "active" : ""}" data-score="urgentes">
          <div class="n">${sc.urgentes}</div><div class="l">tarefas urgentes<br>(prazo interno)</div>
        </button>
        <button class="score ${state.scoreFilter === "aguardando" ? "active" : ""}" data-score="aguardando">
          <div class="n">${sc.aguardando}</div><div class="l">aguardando<br>terceiros</div>
        </button>
        <button class="score ${state.scoreFilter === "todas" ? "active" : ""}" data-score="todas">
          <div class="n">${sc.total}</div><div class="l">tarefas<br>no total</div>
        </button>
      </div>
      <div class="board">
        ${COLUMNS.map((col) => {
          const items = tasksInColumn(col.id);
          return `<section class="col${!state.seeded && col.id === "a-fazer" ? " has-tip" : ""}" data-col="${col.id}">
            ${colHead(col, items.length)}
            <div class="col-body">
            ${items.map(taskCard).join("") || `<p class="muted" style="padding:8px">Nenhuma tarefa por aqui.</p>`}
            </div>
          </section>`;
        }).join("")}
      </div>
    </div>
  `;
}

function pedidosView() {
  const q = state.search.trim().toLowerCase();
  const list = state.pedidos.filter(
    (p) =>
      !q ||
      p.cliente.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.tipo.toLowerCase().includes(q)
  );
  return `
    <div class="workspace">
      <p class="muted" style="margin-bottom:16px">Cada card é um pedido. Abra para ver o board interno de tarefas daquele caso.</p>
      <div class="board pedidos">
        ${PEDIDO_STAGES.map((st) => {
          const items = pedidosInStage(st.id, list);
          return `<section class="col">
            ${colHead(st, items.length, {
              add: false,
              menuId: "p-" + st.id,
              kind: "pedido",
            })}
            <div class="col-body">
            ${items.map(pedidoCard).join("")}
            </div>
          </section>`;
        }).join("")}
      </div>
    </div>
  `;
}

function mapPedidoCol(p) {
  if (p.stage === "aguardando-ext") return "elaboracao";
  return p.stage;
}

function pedidoDetail() {
  const p = state.pedidos.find((x) => x.id === state.openPedido);
  if (!p) return "";
  const related = state.tasks.filter((t) => t.pedidoId === p.id);
  return `
    <div class="workspace">
      <div class="pedido-head">
        <div class="pedido-identity">
          <button class="icon-btn" type="button" title="Voltar para pedidos" data-action="back-pedidos">${icon("back")}</button>
          <div class="eyebrow">${p.origem} · #${p.id}</div>
          <h2 class="t2">${escapeHtml(p.cliente)}</h2>
          <p class="muted">${escapeHtml(p.tipo)} · ${STAGE_LABEL[p.stage] || p.stage}</p>
        </div>
      </div>
      <div class="nested-board">
        ${COLUMNS.map((col) => {
          const items = applyColumnFilter(
            related.filter((t) => t.column === col.id),
            "n-" + col.id
          );
          return `<section class="col" data-col="${col.id}">
            ${colHead(col, items.length, { menuId: "n-" + col.id, tip: false })}
            <div class="col-body">
            ${items.map(taskCard).join("") || `<p class="muted" style="padding:8px">Nenhuma tarefa por aqui.</p>`}
            </div>
          </section>`;
        }).join("")}
      </div>
      <h3 style="margin:28px 0 12px;font-size:16px">Documentos do pedido</h3>
      <div class="attach-box" data-action="fake-file">Clique para anexar provas neste pedido</div>
      ${(p.docs || []).map((d) => `<span class="file-chip">${icon("paper")} ${d}</span>`).join("")}
    </div>
  `;
}

function financeView() {
  const rows = state.pedidos;
  const ready = rows.filter((p) => p.stage === "pagamento" || p.statusFin === "Pronto para faturar");
  return `
    <div class="workspace">
      <div class="pay-banner">
        <div>
          <strong>${ready.length} pedido(s) na etapa de pagamento</strong>
          <div class="muted">Sem conteúdo jurídico — só o que o financeiro precisa para faturar.</div>
        </div>
        <span class="pill pill-pay">Atualizado agora</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Origem</th>
              <th>Status financeiro</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (p) => `<tr class="${p.stage === "pagamento" || p.statusFin === "Pronto para faturar" ? "highlight" : ""}">
                <td>#${p.id}</td>
                <td>${p.cliente}</td>
                <td>${p.origem}</td>
                <td>${p.statusFin}</td>
                <td>R$ ${p.valor.toLocaleString("pt-BR")}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function teamView() {
  return `
    <div class="workspace" style="max-width:760px">
      <div class="eyebrow">Escritório</div>
      <h2 class="t2" style="margin-bottom:8px">${state.officeName || "Escritório Cardoso"}</h2>
      <p class="muted" style="margin-bottom:24px">Convide pelo e-mail institucional e escolha o papel — e a visão — no convite.</p>
      ${memberList()}
      <button class="btn btn-md btn-primary" style="margin-top:16px" data-action="invite">${icon("plus")} Convidar pessoa</button>
    </div>
  `;
}

function memberList() {
  return state.members
    .map(
      (m) => `<button class="member-row" type="button" data-member="${escapeHtml(m.email)}">
            <div class="avatar">${m.nome[0]}</div>
            <div class="grow"><strong>${escapeHtml(m.nome)}</strong><div class="muted">${escapeHtml(m.email)}</div></div>
            <div class="member-tags">${memberTags(m)
              .map((tag) => `<span class="pill ${tag === "Admin" ? "pill-rosa" : "pill-navy"}">${tag}</span>`)
              .join("")}</div>
          </button>`
    )
    .join("");
}

function teamSwitchModal() {
  return `
    <div class="overlay center">
      <div class="modal team-switch-modal" data-stop>
        <div class="modal-head">
          <div>
            <div class="eyebrow">Equipe</div>
            <h2>${escapeHtml(state.officeName || "Escritório Cardoso")}</h2>
          </div>
          <button class="icon-btn" data-close="modal">${icon("close")}</button>
        </div>
        <div class="modal-body">
          <p class="muted" style="margin-bottom:16px">Escolha uma pessoa para ver a tela da função dela.</p>
          ${memberList()}
        </div>
        <div class="modal-actions">
          <button class="btn btn-md btn-primary" data-action="invite">${icon("plus")} Convidar pessoa</button>
        </div>
      </div>
    </div>
  `;
}

function onboardComplete() {
  const filled = [
    state.userName,
    state.oab,
    state.email,
    state.phone,
    state.specialty,
  ].every((v) => String(v || "").trim());
  if (state.accountType === "escritorio" && !String(state.officeName || "").trim()) {
    return false;
  }
  return filled;
}

function onboardVisual() {
  return `
    <aside class="onboard-visual">
      <img class="logo-word" src="./logo-resolvvi.png" alt="resolvvi" />
      <div>
        <div class="seal">Para o advogado parceiro</div>
        <h1>Seus pedidos e casos, num só board.</h1>
        <p>Tarefas da Resolvvi e casos externos juntos, com prazo interno e prazo fatal no mesmo lugar.</p>
        <div class="stat-row">
          <div class="stat"><b>90 a cada 100</b><span>clientes ganham com advogados parceiros</span></div>
          <div class="stat"><b>+ R$ 150 M</b><span>recuperados</span></div>
        </div>
      </div>
      <p class="muted">Um ponto de entrada. Você convida o restante depois.</p>
    </aside>
  `;
}

function onboarding() {
  const type = state.accountType;
  const step = state.onboardStep;
  const specialties = ["Consumidor", "Bancário", "Trabalhista", "Outro"];
  const form =
    step === 1
      ? `
        <div class="eyebrow">Criar conta · etapa 1 de 2</div>
        <h2 class="t2">Quem está abrindo esta conta?</h2>
        <p class="muted" style="margin:8px 0 0">Advogado autônomo ou responsável pelo escritório. Os demais entram por convite.</p>
        <div class="choice-grid">
          <button class="choice ${type === "autonomo" ? "selected" : ""}" data-type="autonomo">
            <strong>Advogado autônomo</strong>
            <span>Você trabalha sozinho e gerencia os próprios casos.</span>
          </button>
          <button class="choice ${type === "escritorio" ? "selected" : ""}" data-type="escritorio">
            <strong>Responsável pelo escritório</strong>
            <span>Você cria a conta Admin e convoca advogados, financeiro e administrativo.</span>
          </button>
        </div>
        <button class="btn btn-lg btn-primary" data-action="next-onboard" ${type ? "" : "disabled"}>Continuar</button>
      `
      : `
        <div class="eyebrow">Criar conta · etapa 2 de 2</div>
        <h2 class="t2">Seus dados</h2>
        <p class="muted" style="margin:8px 0 20px">${
          type === "escritorio"
            ? "Depois você convida o restante da equipe pelo e-mail institucional."
            : "Com isso a gente já deixa o board no seu nome."
        }</p>
        ${
          type === "escritorio"
            ? `<div class="field"><label>Nome do escritório</label><input id="office" placeholder="Ex.: Cardoso Advogados" value="${escapeHtml(state.officeName)}"></div>`
            : ""
        }
        <div class="field"><label>Nome</label><input id="uname" placeholder="Ex.: Rafael Cardoso" value="${escapeHtml(state.userName)}"></div>
        <div class="field"><label>Nº OAB</label><input id="oab" placeholder="Ex.: OAB/SP 123.456" value="${escapeHtml(state.oab)}"></div>
        <div class="field"><label>E-mail</label><input id="uemail" type="email" placeholder="Ex.: rafael@email.com" value="${escapeHtml(state.email)}"></div>
        <div class="field"><label>Telefone</label><input id="uphone" type="tel" placeholder="Ex.: (11) 99999-0000" value="${escapeHtml(state.phone)}"></div>
        <div class="field"><label>Especialidade</label>
          <select id="uspec">
            <option value="">Selecione</option>
            ${specialties
              .map(
                (s) =>
                  `<option value="${s}" ${state.specialty === s ? "selected" : ""}>${s}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="onboard-actions">
          <button class="btn btn-lg btn-ghost" data-action="back-onboard">Voltar</button>
          <button class="btn btn-lg btn-primary" data-action="finish-onboard" ${onboardComplete() ? "" : "disabled"}>Entrar no board</button>
        </div>
      `;
  return `
    <div class="onboard">
      ${onboardVisual()}
      <section class="onboard-form">${form}</section>
    </div>
  `;
}

function pedidoLabel(p) {
  return `#${p.id} · ${p.cliente}`;
}

function filteredPedidos() {
  const q = String(state.form.pedidoQuery || "")
    .trim()
    .toLowerCase()
    .replace(/^#/, "");
  return state.pedidos.filter(
    (p) => !q || p.id.toLowerCase().includes(q) || p.cliente.toLowerCase().includes(q)
  );
}

function tipoOptions(selected) {
  return PEDIDO_TIPOS
    .map((t) => `<option value="${t}" ${selected === t ? "selected" : ""}>${t}</option>`)
    .join("");
}

function createModal() {
  const f = state.form;
  const bind = f.bindMode === "pedido";
  const selected = state.pedidos.find((p) => p.id === f.pedidoId);
  const pedidoQuery = f.pedidoQuery || (selected ? pedidoLabel(selected) : "");
  const matches = filteredPedidos();
  return `
    <div class="overlay center">
      <div class="modal" data-stop>
        <div class="modal-head">
          <div>
            <div class="eyebrow">Nova tarefa</div>
            <h2>O que você precisa fazer?</h2>
          </div>
          <button class="icon-btn" data-close="modal">${icon("close")}</button>
        </div>
        <div class="modal-body">
        <div class="segment">
          <button class="${!bind ? "active" : ""}" data-bind-mode="avulso">Do zero</button>
          <button class="${bind ? "active" : ""}" data-bind-mode="pedido">Vincular ao pedido nº</button>
        </div>
        <div class="field"><label>Título</label><input id="f-title" placeholder="Ex.: Revisar minuta de recurso" value="${escapeHtml(f.title || "")}"></div>
        <div class="field"><label>Descrição</label><textarea id="f-desc" placeholder="O que precisa ser feito">${escapeHtml(f.desc || "")}</textarea></div>
        ${
          bind
            ? `<div class="field"><label>Pedido</label>
              <div class="pedido-combo">
                <input id="f-pedido-q" type="text" autocomplete="off" placeholder="Buscar pelo nº ou cliente" value="${escapeHtml(pedidoQuery)}" />
                <div class="pedido-results">
                  ${
                    matches.length
                      ? matches
                          .map(
                            (p) =>
                              `<button type="button" class="${f.pedidoId === p.id ? "active" : ""}" data-pick-pedido="${p.id}">${escapeHtml(pedidoLabel(p))}</button>`
                          )
                          .join("")
                      : `<p class="muted">Nenhum pedido encontrado.</p>`
                  }
                </div>
              </div></div>`
            : `<div class="field"><label>Cliente</label><input id="f-cliente" placeholder="Nome do cliente" value="${escapeHtml(f.cliente || "")}"></div>
              <div class="field"><label>Tipo</label>
                <select id="f-tipo">
                  <option value="">Selecione</option>
                  ${tipoOptions(f.tipo)}
                </select></div>`
        }
        <div class="field"><label>Prazo interno</label><input id="f-int" type="date" value="${f.interno || ""}"></div>
        <div class="field"><label>Prazo fatal</label><input id="f-fat" type="date" value="${f.fatal || ""}"></div>
        <button class="attach-box" data-action="add-file">Anexar provas nesta tarefa</button>
        ${(f.files || []).map((d) => `<span class="file-chip">${icon("paper")} ${d}</span>`).join("")}
        </div>
        <div class="modal-actions">
          <button class="btn btn-md btn-ghost" data-close="modal">Cancelar</button>
          <button class="btn btn-md btn-primary" data-action="save-task" ${createComplete() ? "" : "disabled"}>Adicionar tarefa</button>
        </div>
      </div>
    </div>
  `;
}

function pedidoModal() {
  const f = state.form;
  return `
    <div class="overlay center">
      <div class="modal" data-stop>
        <div class="modal-head">
          <div>
            <div class="eyebrow">Novo pedido</div>
            <h2>Cadastre o caso</h2>
          </div>
          <button class="icon-btn" data-close="modal">${icon("close")}</button>
        </div>
        <div class="modal-body">
        <div class="field"><label>Cliente</label><input id="f-cliente" placeholder="Nome do cliente" value="${escapeHtml(f.cliente || "")}"></div>
        <div class="field"><label>Descrição</label><textarea id="f-desc" placeholder="O que precisa ser feito">${escapeHtml(f.desc || "")}</textarea></div>
        <div class="field"><label>Tipo</label>
          <select id="f-tipo">
            <option value="">Selecione</option>
            ${tipoOptions(f.tipo)}
          </select>
        </div>
        <div class="field"><label>Prazo interno</label><input id="f-int" type="date" value="${f.interno || ""}"></div>
        <div class="field"><label>Prazo fatal</label><input id="f-fat" type="date" value="${f.fatal || ""}"></div>
        <button class="attach-box" data-action="add-file">Anexar provas neste pedido</button>
        ${(f.files || []).map((d) => `<span class="file-chip">${icon("paper")} ${d}</span>`).join("")}
        </div>
        <div class="modal-actions">
          <button class="btn btn-md btn-ghost" data-close="modal">Cancelar</button>
          <button class="btn btn-md btn-primary" data-action="save-pedido" ${pedidoComplete() ? "" : "disabled"}>Adicionar caso</button>
        </div>
      </div>
    </div>
  `;
}

function inviteModal() {
  return `
    <div class="overlay center">
      <div class="modal" data-stop>
        <div class="modal-head">
          <div>
            <div class="eyebrow">Convite</div>
            <h2>Convidar pelo e-mail institucional</h2>
          </div>
          <button class="icon-btn" data-close="modal">${icon("close")}</button>
        </div>
        <div class="modal-body">
        <div class="field"><label>E-mail</label><input id="inv-email" placeholder="nome@escritorio.com"></div>
        <div class="field"><label>Papel e visão</label>
          <select id="inv-role">
            <option>Advogado — board de tarefas e pedidos</option>
            <option>Financeiro — visão por pedido, sem conteúdo jurídico</option>
            <option>Administrativo — visão restrita por pedido</option>
            <option>Admin — gestão da conta e da equipe</option>
          </select>
        </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-md btn-ghost" data-close="modal">Cancelar</button>
          <button class="btn btn-md btn-primary" data-action="send-invite">Enviar convite</button>
        </div>
      </div>
    </div>
  `;
}

function taskDrawer() {
  const task = state.tasks.find((t) => t.id === state.drawerTask);
  if (!task) return "";
  const p = pedidoOf(task);
  const u = urgency(task);
  const author = taskAuthor(task);
  return `
    <div class="overlay">
      <aside class="drawer" data-stop>
        <div class="drawer-top">
          <div class="eyebrow">${u === "crit" ? "Tarefa crítica" : u === "warn" ? "Tarefa urgente" : "Tarefa"}</div>
          <button class="icon-btn" data-close="drawer">${icon("close")}</button>
        </div>
        <div class="drawer-scroll">
          <article class="drawer-card">
            <div class="drawer-author">
              <span class="avatar sm" title="${escapeHtml(author.nome)}">${escapeHtml(initials(author.nome))}</span>
              <span class="drawer-author-name">${escapeHtml(author.nome)}</span>
              <span class="pill ${p?.origem === "Resolvvi" ? "pill-rosa" : "pill-navy"}">${p?.origem || "Avulso"}</span>
              <span class="id-tag">#${p?.id || "—"}</span>
            </div>
            <h2>${escapeHtml(task.titulo)}</h2>
            <p class="muted">${p ? `${escapeHtml(p.cliente)} — ${escapeHtml(p.tipo)}` : "Sem pedido vinculado"}</p>
            ${p ? `<div class="stage">${icon("bolt")} ${STAGE_LABEL[p.stage] || p.stage}</div>` : ""}
            <p class="drawer-desc">${escapeHtml(task.descricao || "Sem descrição.")}</p>
            <div class="status-field">
              <span>Status</span>
              <div class="status-chip-wrap">
                <button type="button" class="status-chip" data-action="toggle-status">
                  ${(COLUMNS.find((c) => c.id === task.column) || {}).label || "A fazer"}
                  ${icon("chevron")}
                </button>
                ${
                  state.statusMenu
                    ? `<div class="status-menu" data-stop>
                    ${COLUMNS.map(
                      (c) =>
                        `<button type="button" class="${task.column === c.id ? "active" : ""}" data-set-col="${c.id}">${c.label}</button>`
                    ).join("")}
                  </div>`
                    : ""
                }
              </div>
            </div>
            <div class="meta-row">Prazo interno: ${fmtLong(task.prazoInterno)}</div>
            <div class="prazo-bar ${u === "crit" ? "crit" : u === "warn" ? "warn" : "ok"}">
              ${icon(u === "crit" ? "warn" : "clock")} Prazo fatal: ${fmtLong(task.prazoFatal)}
            </div>
            <div class="subtask-block">
              <button type="button" class="subtask-head" data-action="toggle-subtasks">
                <span>Subtarefas</span>
                <span class="subtask-caret ${state.subtasksOpen ? "open" : ""}">${icon("chevron")}</span>
              </button>
              ${
                state.subtasksOpen
                  ? `${(task.subtarefas || [])
                      .map((s) => {
                        const who = s.autor || currentActor();
                        return `<div class="subtask-row">
                    <button type="button" class="subtask-radio ${s.done ? "done" : ""}" data-toggle-sub="${s.id}" title="${s.done ? "Desmarcar" : "Concluir"}"></button>
                    <div class="subtask-info">
                      <span class="${s.done ? "is-done" : ""}">${escapeHtml(s.titulo)}</span>
                    </div>
                    <span class="avatar sm" title="${escapeHtml(who)}">${escapeHtml(initials(who))}</span>
                  </div>`;
                      })
                      .join("")}
              ${
                state.addingSubtask
                  ? `<input id="d-subtask" type="text" placeholder="Nome da subtarefa" />`
                  : ""
              }
              <button type="button" class="subtask-add" data-action="add-subtask">${icon("plus")} Adicionar subtarefa</button>`
                  : ""
              }
            </div>
          </article>
          <h3 class="drawer-section">Histórico</h3>
          ${
            taskHistory(task)
              .map((item) => {
                const who = item.autor || "Equipe";
                if (item.tipo === "status") {
                  return `<div class="history-status">
                    <span>${escapeHtml(who)} ${escapeHtml(historyCopy(item))}</span>
                    <time>${fmtDateTime(item.at)}</time>
                  </div>`;
                }
                return `<div class="history-item">
                  <div class="history-meta">
                    <span class="avatar sm">${escapeHtml(initials(who))}</span>
                    <strong>${escapeHtml(who)}</strong>
                    <time>${fmtDateTime(item.at)}</time>
                  </div>
                  <p>${item.tipo === "arquivo" ? `${icon("paper")} ` : item.tipo === "subtarefa" ? `${icon("plus")} ` : ""}${escapeHtml(historyCopy(item))}</p>
                </div>`;
              })
              .join("") || `<p class="muted">Nada no histórico ainda.</p>`
          }
        </div>
        <div class="drawer-compose">
          <input id="d-comment" type="text" placeholder="Comentar ou anexar prova" />
          <button class="icon-btn" type="button" title="Anexar prova" data-action="drawer-file">${icon("paper")}</button>
          <button class="icon-btn compose-send" type="button" title="Enviar comentário" data-action="drawer-comment">${icon("send")}</button>
        </div>
      </aside>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function titleFor() {
  if (state.role === "Financeiro") return "Financeiro";
  return "Meus casos";
}

function render() {
  const root = document.getElementById("app");
  if (state.screen === "onboarding") {
    root.innerHTML = onboarding();
    return;
  }
  let body = "";
  if (state.role === "Financeiro") body = financeView();
  else if (state.openPedido) body = pedidoDetail();
  else if (state.view === "pedidos") body = pedidosView();
  else if (state.view === "equipe") body = teamView();
  else body = boardView();

  root.innerHTML =
    `<div class="app-shell">${header()}<main class="app-main">${body}</main></div>` +
    (state.modal === "create" ? createModal() : "") +
    (state.modal === "pedido" ? pedidoModal() : "") +
    (state.modal === "invite" ? inviteModal() : "") +
    (state.modal === "team-switch" ? teamSwitchModal() : "") +
    (state.drawerTask ? taskDrawer() : "") +
    (state.toast ? `<div class="toast">${state.toast}</div>` : "");
  if (state.addingSubtask) {
    const field = document.getElementById("d-subtask");
    if (field) field.focus();
  }
}

function filled(v) {
  return String(v || "").trim().length > 0;
}

function createComplete() {
  const f = state.form || {};
  const base = [f.title, f.desc, f.interno, f.fatal].every(filled);
  if (!base) return false;
  if (f.bindMode === "pedido") return filled(f.pedidoId);
  return [f.cliente, f.tipo].every(filled);
}

function pedidoComplete() {
  const f = state.form || {};
  return [f.cliente, f.desc, f.tipo, f.interno, f.fatal].every(filled);
}

function newTaskForm(extra = {}) {
  return {
    bindMode: "avulso",
    pedidoId: "",
    pedidoQuery: "",
    files: [],
    column: "a-fazer",
    origem: "Externo",
    tipo: "",
    interno: "2026-08-28",
    fatal: "2026-09-10",
    ...extra,
  };
}

function syncCreateSave() {
  const taskBtn = document.querySelector('[data-action="save-task"]');
  const pedidoBtn = document.querySelector('[data-action="save-pedido"]');
  if (taskBtn) taskBtn.disabled = !createComplete();
  if (pedidoBtn) pedidoBtn.disabled = !pedidoComplete();
}

function collectForm() {
  const g = (id) => document.getElementById(id);
  if (g("f-title")) state.form.title = g("f-title").value;
  if (g("f-desc")) state.form.desc = g("f-desc").value;
  if (g("f-pedido-q")) state.form.pedidoQuery = g("f-pedido-q").value;
  if (g("f-cliente")) state.form.cliente = g("f-cliente").value;
  if (g("f-tipo")) state.form.tipo = g("f-tipo").value;
  if (g("f-int")) state.form.interno = g("f-int").value;
  if (g("f-fat")) state.form.fatal = g("f-fat").value;
  if (g("office")) state.officeName = g("office").value;
  if (g("uname")) state.userName = g("uname").value;
  if (g("oab")) state.oab = g("oab").value;
  if (g("uemail")) state.email = g("uemail").value;
  if (g("uphone")) state.phone = g("uphone").value;
  if (g("uspec")) state.specialty = g("uspec").value;
  if (g("search")) state.search = g("search").value;
}

document.addEventListener("input", (e) => {
  const createIds = ["f-title", "f-desc", "f-cliente", "f-tipo", "f-int", "f-fat"];
  if (createIds.includes(e.target.id)) {
    collectForm();
    syncCreateSave();
    return;
  }
  if (e.target.id === "f-pedido-q") {
    const sel = { start: e.target.selectionStart, end: e.target.selectionEnd };
    state.form.pedidoQuery = e.target.value;
    state.form.pedidoId = "";
    render();
    const n = document.getElementById("f-pedido-q");
    if (n) {
      n.focus();
      n.setSelectionRange(sel.start, sel.end);
    }
    syncCreateSave();
    return;
  }
  const onboardIds = ["office", "uname", "oab", "uemail", "uphone", "uspec"];
  if (onboardIds.includes(e.target.id)) {
    collectForm();
    const btn = document.querySelector('[data-action="finish-onboard"]');
    if (btn) btn.disabled = !onboardComplete();
    return;
  }
  if (e.target.id === "search") {
    state.search = e.target.value;
    const sel = { start: e.target.selectionStart, end: e.target.selectionEnd };
    render();
    const n = document.getElementById("search");
    if (n) {
      n.focus();
      n.setSelectionRange(sel.start, sel.end);
    }
    return;
  }
  if (e.target.dataset.cfCol) {
    const menuId = e.target.dataset.cfCol;
    const key = e.target.dataset.cfKey;
    const sel = { start: e.target.selectionStart, end: e.target.selectionEnd, id: e.target.id };
    ensureColFilter(menuId)[key] = e.target.value;
    render();
    const n = document.getElementById(sel.id);
    if (n) {
      n.focus();
      n.setSelectionRange(sel.start, sel.end);
    }
  }
});

document.addEventListener("change", (e) => {
  const createIds = ["f-tipo", "f-int", "f-fat"];
  if (createIds.includes(e.target.id)) {
    collectForm();
    syncCreateSave();
    return;
  }
  if (e.target.id === "uspec") {
    collectForm();
    const btn = document.querySelector('[data-action="finish-onboard"]');
    if (btn) btn.disabled = !onboardComplete();
  }
});

document.addEventListener("mousedown", (e) => {
  if (e.target.closest("[data-pick-pedido]")) e.preventDefault();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (e.target.id === "d-comment") {
    e.preventDefault();
    document.querySelector('[data-action="drawer-comment"]')?.click();
    return;
  }
  if (e.target.id === "d-subtask") {
    e.preventDefault();
    document.querySelector('[data-action="add-subtask"]')?.click();
    return;
  }
  if (e.target.id === "f-pedido-q") {
    e.preventDefault();
    const first = filteredPedidos()[0];
    if (!first) return;
    state.form.pedidoId = first.id;
    state.form.pedidoQuery = pedidoLabel(first);
    render();
    syncCreateSave();
  }
});

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-type],[data-view],[data-role],[data-action],[data-filter],[data-score],[data-open-task],[data-open-pedido],[data-close],[data-bind-mode],[data-member],[data-col-menu],[data-col-sort],[data-col-f],[data-col-clear],[data-col-add],[data-set-col],[data-toggle-sub],[data-pick-pedido]");
  if (e.target.closest("[data-stop]") && e.target.closest("[data-close]") === null && !t) return;
  if (e.target.dataset.close || e.target.closest("[data-close]") === e.currentTarget) {
    /* handled below */
  }

  if (e.target.classList.contains("overlay")) {
    state.modal = null;
    state.drawerTask = null;
    state.statusMenu = false;
    state.addingSubtask = false;
    render();
    return;
  }
  if (!t) {
    if (state.colMenu) {
      state.colMenu = null;
      render();
    }
    return;
  }
  if (!t.dataset.colMenu && !t.dataset.colSort && !t.dataset.colF && !t.dataset.colClear) state.colMenu = null;
  if (t.dataset.action !== "toggle-status" && !t.dataset.setCol) state.statusMenu = false;

  if (t.dataset.colMenu) {
    state.colMenu = state.colMenu === t.dataset.colMenu ? null : t.dataset.colMenu;
    render();
    return;
  }
  if (t.dataset.colSort) {
    const col = t.dataset.colSort;
    const sort = t.dataset.sort;
    state.columnSort[col] = state.columnSort[col] === sort ? null : sort;
    state.colMenu = null;
    render();
    return;
  }
  if (t.dataset.colF) {
    const f = ensureColFilter(t.dataset.colF);
    const key = t.dataset.fkey;
    const val = t.dataset.fval;
    f[key] = f[key] === val ? null : val;
    render();
    return;
  }
  if (t.dataset.colClear) {
    state.columnFilters[t.dataset.colClear] = emptyColFilter();
    render();
    return;
  }
  if (t.dataset.pickPedido) {
    const p = state.pedidos.find((x) => x.id === t.dataset.pickPedido);
    if (p) {
      state.form.pedidoId = p.id;
      state.form.pedidoQuery = pedidoLabel(p);
    }
    render();
    syncCreateSave();
    return;
  }
  if (t.dataset.setCol) {
    const task = state.tasks.find((x) => x.id === state.drawerTask);
    if (task) {
      logStatusChange(task, t.dataset.setCol);
      state.statusMenu = false;
      render();
    }
    return;
  }
  if (t.dataset.toggleSub) {
    const task = state.tasks.find((x) => x.id === state.drawerTask);
    const sub = task?.subtarefas?.find((s) => s.id === t.dataset.toggleSub);
    if (sub) {
      sub.done = !sub.done;
      sub.completedAt = sub.done ? new Date().toISOString() : null;
      render();
    }
    return;
  }
  if (t.dataset.colAdd) {
    const bind = state.openPedido;
    state.form = newTaskForm({
      bindMode: bind ? "pedido" : "avulso",
      pedidoId: bind || "",
      column: t.dataset.colAdd,
    });
    state.modal = "create";
    render();
    return;
  }

  if (t.dataset.type) {
    state.accountType = t.dataset.type;
    render();
    return;
  }
  if (t.dataset.view) {
    state.view = t.dataset.view;
    state.openPedido = null;
    render();
    return;
  }
  if (t.dataset.member) {
    const m = state.members.find((x) => x.email === t.dataset.member);
    if (m) {
      state.userName = m.nome;
      state.email = m.email;
      state.role = isAdmin(m)
        ? "Admin"
        : m.papel === "Administrativo"
          ? "Financeiro"
          : m.papel === "Admin"
            ? "Admin"
            : m.papel;
      state.openPedido = null;
      state.modal = null;
      if (state.role === "Financeiro") state.view = "financeiro";
      else if (state.view === "financeiro") state.view = "tarefas";
    }
    render();
    return;
  }
  if (t.dataset.role) {
    state.role = t.dataset.role;
    state.openPedido = null;
    if (state.role === "Financeiro") state.view = "financeiro";
    else if (state.view === "financeiro") state.view = "tarefas";
    render();
    return;
  }
  if (t.dataset.filter) {
    state.prazoFilter = t.dataset.filter;
    state.scoreFilter = "todas";
    render();
    return;
  }
  if (t.dataset.score) {
    state.scoreFilter = state.scoreFilter === t.dataset.score ? "todas" : t.dataset.score;
    render();
    return;
  }
  if (t.dataset.openTask) {
    if (skipTaskClick) {
      skipTaskClick = false;
      return;
    }
    state.drawerTask = t.dataset.openTask;
    state.statusMenu = false;
    state.addingSubtask = false;
    state.subtasksOpen = true;
    render();
    return;
  }
  if (t.dataset.openPedido) {
    state.openPedido = t.dataset.openPedido;
    render();
    return;
  }
  if (t.dataset.bindMode) {
    collectForm();
    state.form.bindMode = t.dataset.bindMode;
    render();
    return;
  }
  if (t.dataset.close) {
    state.modal = null;
    state.drawerTask = null;
    state.statusMenu = false;
    state.addingSubtask = false;
    render();
    return;
  }

  const action = t.dataset.action;
  if (action === "toggle-status") {
    state.statusMenu = !state.statusMenu;
    render();
    return;
  }
  if (action === "toggle-subtasks") {
    state.subtasksOpen = !state.subtasksOpen;
    if (!state.subtasksOpen) state.addingSubtask = false;
    render();
    return;
  }
  if (action === "add-subtask") {
    const task = state.tasks.find((x) => x.id === state.drawerTask);
    const texto = document.getElementById("d-subtask")?.value.trim();
    if (state.addingSubtask && texto && task) {
      task.subtarefas = task.subtarefas || [];
      task.subtarefas.push({
        id: "s" + Date.now(),
        titulo: texto,
        done: false,
        completedAt: null,
        autor: currentActor(),
        createdBy: state.email,
      });
      state.addingSubtask = false;
      render();
      return;
    }
    state.addingSubtask = true;
    render();
    return;
  }
  if (action === "next-onboard") {
    if (!state.accountType) return;
    state.onboardStep = 2;
    render();
    return;
  }
  if (action === "back-onboard") {
    collectForm();
    state.onboardStep = 1;
    render();
    return;
  }
  if (action === "open-team-switch") {
    state.modal = "team-switch";
    render();
    return;
  }
  if (action === "finish-onboard") {
    collectForm();
    if (!state.accountType || !onboardComplete()) return;
    state.role = state.accountType === "escritorio" ? "Admin" : "Advogado";
    const email = state.email || "rafael@escritorio.com";
    const member = {
      nome: state.userName,
      papel: "Advogado",
      admin: state.accountType === "escritorio",
      email,
    };
    if (!state.members.some((m) => m.email === email)) {
      state.members.unshift(member);
    } else {
      const me = state.members.find((m) => m.email === email);
      Object.assign(me, member);
    }
    state.screen = "app";
    state.view = "tarefas";
    render();
    return;
  }
  if (action === "open-pedido") {
    state.form = newTaskForm();
    state.modal = "pedido";
    render();
    return;
  }
  if (action === "open-create") {
    state.form = newTaskForm({
      bindMode: t.dataset.bind ? "pedido" : "avulso",
      pedidoId: t.dataset.bind || "",
      column: "a-fazer",
    });
    state.modal = "create";
    render();
    return;
  }
  if (action === "add-file") {
    collectForm();
    state.form.files = state.form.files || [];
    state.form.files.push("prova-" + (state.form.files.length + 1) + ".pdf");
    render();
    return;
  }
  if (action === "drawer-file") {
    const task = state.tasks.find((x) => x.id === state.drawerTask);
    if (task) {
      task.anexos = task.anexos || [];
      const arquivo = "prova-" + (task.anexos.length + 1) + ".pdf";
      task.anexos.push(arquivo);
      pushHistory(task, { tipo: "arquivo", arquivo });
      toast("Prova anexada à tarefa.");
    }
    return;
  }
  if (action === "drawer-comment") {
    const task = state.tasks.find((x) => x.id === state.drawerTask);
    const texto = document.getElementById("d-comment")?.value.trim();
    if (!task || !texto) return;
    pushHistory(task, { tipo: "comentario", texto });
    render();
    return;
  }
  if (action === "fake-file") {
    const p = state.pedidos.find((x) => x.id === state.openPedido);
    if (p) {
      p.docs = p.docs || [];
      p.docs.push("prova-pedido.pdf");
      toast("Prova anexada ao pedido.");
    }
    return;
  }
  if (action === "save-pedido") {
    collectForm();
    if (!pedidoComplete()) {
      toast("Preencha todos os campos para adicionar.");
      return;
    }
    const f = state.form;
    const first = !state.seeded;
    if (first) {
      state.tasks = JSON.parse(JSON.stringify(seedTasks));
      state.pedidos = JSON.parse(JSON.stringify(seedPedidos));
    }
    const pedidoId = "EXT-" + String(1500 + state.pedidos.length);
    state.pedidos.unshift({
      id: pedidoId,
      cliente: f.cliente,
      tipo: f.tipo,
      origem: "Externo",
      stage: "novo",
      valor: 0,
      statusFin: "Em aberto",
      descricao: f.desc,
      prazoInterno: f.interno,
      prazoFatal: f.fatal,
      docs: f.files || [],
    });
    state.seeded = true;
    state.modal = null;
    state.view = "pedidos";
    state.openPedido = null;
    toast(first ? "Board de exemplo carregado com o seu pedido." : "Pedido #" + pedidoId + " adicionado.");
    return;
  }
  if (action === "save-task") {
    collectForm();
    if (!createComplete()) {
      toast("Preencha todos os campos para adicionar.");
      return;
    }
    const f = state.form;
    const firstTask = !state.seeded;
    if (firstTask) {
      state.tasks = JSON.parse(JSON.stringify(seedTasks));
      state.pedidos = JSON.parse(JSON.stringify(seedPedidos));
    }
    let pedidoId = f.pedidoId;
    if (f.bindMode === "pedido") {
      if (!pedidoId) {
        toast("Escolha o nº do pedido.");
        return;
      }
    } else {
      pedidoId = "EXT-" + String(1500 + state.pedidos.length);
      state.pedidos.unshift({
        id: pedidoId,
        cliente: f.cliente || "Cliente sem nome",
        tipo: f.tipo || "Atraso de voo",
        origem: "Externo",
        stage: "novo",
        valor: 0,
        statusFin: "Em aberto",
      });
    }
    const colId = f.column || "a-fazer";
    const top = state.tasks
      .filter((t) => t.column === colId)
      .reduce((min, t) => Math.min(min, Number.isFinite(t.order) ? t.order : 0), 0);
    state.tasks.unshift({
      id: "t" + Date.now(),
      titulo: f.title,
      pedidoId,
      column: colId,
      prazoInterno: f.interno,
      prazoFatal: f.fatal,
      descricao: f.desc,
      anexos: f.files || [],
      historico: (f.files || []).map((arquivo) => ({
        tipo: "arquivo",
        arquivo,
        autor: currentActor(),
        at: new Date().toISOString(),
      })),
      createdBy: state.email || seedMembers[0].email,
      order: top - 1,
    });
    state.seeded = true;
    state.modal = null;
    const colName = (COLUMNS.find((c) => c.id === colId) || {}).label || "A fazer";
    toast(firstTask ? "Board de exemplo carregado com a sua tarefa." : "Tarefa adicionada em " + colName + ".");
    return;
  }
  if (action === "back-pedidos") {
    state.openPedido = null;
    state.view = "pedidos";
    render();
    return;
  }
  if (action === "invite") {
    state.modal = "invite";
    render();
    return;
  }
  if (action === "send-invite") {
    const email = document.getElementById("inv-email")?.value;
    const role = document.getElementById("inv-role")?.value || "Advogado";
    const papel = role.split(" — ")[0];
    if (!email) {
      toast("Informe o e-mail institucional.");
      return;
    }
    state.members.push({
      nome: email.split("@")[0],
      papel: papel === "Admin" ? "Advogado" : papel,
      admin: papel === "Admin",
      email,
    });
    state.modal = "team-switch";
    toast("Convite enviado.");
    return;
  }
  if (action === "notify") {
    toast("2 prazos fatais vencem amanhã.");
  }
});

let draggingTask = null;
let skipTaskClick = false;

function taskDropCol(el) {
  return el?.closest?.(".board:not(.pedidos) [data-col], .nested-board [data-col]");
}

function colFilterId(col) {
  if (!col) return "";
  const id = col.dataset.col;
  return col.closest(".nested-board") ? "n-" + id : id;
}

function columnCards(col, exceptId) {
  return [...col.querySelectorAll("[data-open-task]")].filter((el) => el.dataset.openTask !== exceptId);
}

function insertIndexAt(col, clientY, exceptId) {
  const cards = columnCards(col, exceptId);
  for (let i = 0; i < cards.length; i++) {
    const box = cards[i].getBoundingClientRect();
    if (clientY < box.top + box.height / 2) return i;
  }
  return cards.length;
}

function reindexColumn(colId, orderedIds) {
  const inCol = state.tasks.filter((t) => t.column === colId);
  const rest = inCol.filter((t) => !orderedIds.includes(t.id)).sort(compareTaskOrder);
  [...orderedIds, ...rest.map((t) => t.id)].forEach((id, i) => {
    const task = state.tasks.find((x) => x.id === id);
    if (task && task.column === colId) task.order = i;
  });
}

function clearDropTargets() {
  document.querySelectorAll(".col.drop-target, .card.drop-before, .col-body.drop-end").forEach((el) => {
    el.classList.remove("drop-target", "drop-before", "drop-end");
  });
}

function paintDropSlot(col, index, exceptId) {
  clearDropTargets();
  col.classList.add("drop-target");
  const cards = columnCards(col, exceptId);
  if (index < cards.length) cards[index].classList.add("drop-before");
  else col.querySelector(".col-body")?.classList.add("drop-end");
}

document.addEventListener("dragstart", (e) => {
  const card = e.target.closest("[data-open-task]");
  if (!card) return;
  draggingTask = card.dataset.openTask;
  skipTaskClick = false;
  e.dataTransfer.setData("text/plain", draggingTask);
  e.dataTransfer.effectAllowed = "move";
  card.classList.add("dragging");
});

document.addEventListener("dragend", () => {
  draggingTask = null;
  clearDropTargets();
});

document.addEventListener("dragover", (e) => {
  if (!draggingTask) return;
  const col = taskDropCol(e.target);
  if (!col) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  paintDropSlot(col, insertIndexAt(col, e.clientY, draggingTask), draggingTask);
});

document.addEventListener("drop", (e) => {
  const col = taskDropCol(e.target);
  if (!col || !draggingTask) return;
  e.preventDefault();
  const task = state.tasks.find((x) => x.id === draggingTask);
  const nextCol = col.dataset.col;
  const index = insertIndexAt(col, e.clientY, draggingTask);
  const orderedIds = columnCards(col, draggingTask).map((el) => el.dataset.openTask);
  orderedIds.splice(index, 0, draggingTask);
  skipTaskClick = true;
  draggingTask = null;
  clearDropTargets();
  if (!task || !nextCol) return;
  logStatusChange(task, nextCol);
  task.column = nextCol;
  const menuId = colFilterId(col);
  const f = ensureColFilter(menuId);
  f.sort = null;
  reindexColumn(nextCol, orderedIds);
  render();
});

render();
