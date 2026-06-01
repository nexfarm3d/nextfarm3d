import { useState, useEffect } from "react";

const SUPABASE_URL = "https://twpcgpudwadqdqytktub.supabase.co";
const SUPABASE_KEY = "sb_publishable_XxQjvXIlooWiXRlcMV4cMg_pAf1jFHg";

const db = {
  async get(table, filters = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*${filters}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async update(table, id, data, idField = "id") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${idField}=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async delete(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  }
};

const STATUS_PEDIDO = {
  "Em aberto": { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  "Aprovado":  { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  "Faturado":  { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  "Entregue":  { bg: "#F5F3FF", text: "#6D28D9", dot: "#8B5CF6" },
};

const STATUS_PROD = {
  "Aguardando":  { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  "Em produção": { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  "Pronto":      { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  "Despachado":  { bg: "#F5F3FF", text: "#6D28D9", dot: "#8B5CF6" },
};

const fmt = (v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const fmtData = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "-";

function Badge({ label, map }) {
  const s = map[label] || { bg: "#f1f5f9", text: "#64748b", dot: "#94a3b8" };
  return (
    <span style={{ background: s.bg, color: s.text, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />{label}
    </span>
  );
}

function Card({ icon, label, value, sub, accent }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "20px 22px", borderLeft: accent ? `4px solid ${accent}` : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 22 }}>{icon}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
      <input value={value} onChange={onChange} type={type} placeholder={placeholder}
        style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#1e293b", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
      <select value={value} onChange={onChange}
        style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#1e293b" }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function THead({ cols }) {
  return (
    <thead>
      <tr style={{ background: "#f8fafc" }}>
        {cols.map(c => <th key={c} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap" }}>{c}</th>)}
      </tr>
    </thead>
  );
}

function Spinner() {
  return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTop: "3px solid #22c55e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /></div>;
}

// ─── MÓDULO PEDIDOS ───────────────────────────────────────────────
function ModuloPedidos({ logado }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modal, setModal] = useState(false);
  const [detalhe, setDetalhe] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ cliente: "", produto: "", quantidade: "", valor: "", status: "Em aberto" });

  const carregar = async () => {
    setLoading(true);
    const data = await db.get("pedidos", "&order=created_at.desc");
    setPedidos(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const lista = pedidos.filter(p => {
    const okS = filtroStatus === "Todos" || p.status === filtroStatus;
    const okP = logado.perfil === "admin" || p.vendedor === logado.nome;
    return okS && okP;
  });

  const criar = async () => {
    if (!form.cliente || !form.produto || !form.quantidade || !form.valor) return;
    setSalvando(true);
    const id = `OF-${String(pedidos.length + 1).padStart(4, "0")}`;
    await db.insert("pedidos", { id, ...form, quantidade: Number(form.quantidade), valor: Number(form.valor), vendedor: logado.nome, data: new Date().toISOString().split("T")[0] });
    setForm({ cliente: "", produto: "", quantidade: "", valor: "", status: "Em aberto" });
    setModal(false);
    setSalvando(false);
    carregar();
  };

  const atualizarStatus = async (id, status) => {
    await db.update("pedidos", id, { status });
    if (detalhe?.id === id) setDetalhe({ ...detalhe, status });
    carregar();
  };

  if (detalhe) return (
    <div>
      <button onClick={() => setDetalhe(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>← Voltar</button>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", maxWidth: 600 }}>
        <div style={{ background: "linear-gradient(135deg,#0a1628,#0d2137)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>Ordem de Faturamento</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{detalhe.id}</div>
          </div>
          <Badge label={detalhe.status} map={STATUS_PEDIDO} />
        </div>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {[["Cliente", detalhe.cliente], ["Produto", detalhe.produto], ["Quantidade", detalhe.quantidade + " un."], ["Valor Total", fmt(detalhe.valor)], ["Vendedor", detalhe.vendedor], ["Data", fmtData(detalhe.data)]].map(([l, v]) => (
              <div key={l}><div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>{l}</div><div style={{ fontSize: 15, color: "#1e293b", fontWeight: 600 }}>{v}</div></div>
            ))}
          </div>
          {logado.perfil === "admin" && (
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Atualizar Status</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.keys(STATUS_PEDIDO).map(s => {
                  const sc = STATUS_PEDIDO[s];
                  const ativo = detalhe.status === s;
                  return <button key={s} onClick={() => atualizarStatus(detalhe.id, s)}
                    style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${ativo ? sc.dot : "#e2e8f0"}`, background: ativo ? sc.bg : "#fff", color: ativo ? sc.text : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{s}</button>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 24 }}>
        <Card icon="📋" label="Total" value={lista.length} />
        <Card icon="💰" label="Valor Total" value={fmt(lista.reduce((s, p) => s + Number(p.valor), 0))} />
        <Card icon="⏳" label="Em Aberto" value={lista.filter(p => p.status === "Em aberto").length} accent="#F97316" />
        <Card icon="✅" label="Entregues" value={lista.filter(p => p.status === "Entregue").length} accent="#22C55E" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#475569" }}>
            <option>Todos</option>{Object.keys(STATUS_PEDIDO).map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={carregar} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#475569", cursor: "pointer" }}>🔄</button>
        </div>
        <button onClick={() => setModal(true)} style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Novo Pedido</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <THead cols={["Nº Ordem", "Cliente", "Produto", "Qtd", "Valor", "Vendedor", "Data", "Status", ""]} />
              <tbody>
                {lista.length === 0 ? <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Nenhum pedido encontrado</td></tr>
                  : lista.map(p => (
                    <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "13px 16px", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{p.id}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#334155", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.cliente}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.produto}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{p.quantidade}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{fmt(p.valor)}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748b" }}>{p.vendedor}</td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{fmtData(p.data)}</td>
                      <td style={{ padding: "13px 16px" }}><Badge label={p.status} map={STATUS_PEDIDO} /></td>
                      <td style={{ padding: "13px 16px" }}><button onClick={() => setDetalhe(p)} style={{ background: "#f1f5f9", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#475569", cursor: "pointer", fontWeight: 600 }}>Ver</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 460, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#0a1628,#0d2137)", padding: "22px 26px" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>Nova</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#fff" }}>Ordem de Faturamento</div>
            </div>
            <div style={{ padding: 26 }}>
              <Input label="Cliente / Empresa" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} placeholder="Nome da empresa" />
              <Input label="Produto" value={form.produto} onChange={e => setForm({ ...form, produto: e.target.value })} placeholder="Ex: Adubo Orgânico 50kg" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Quantidade" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} type="number" placeholder="0" />
                <Input label="Valor (R$)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} type="number" placeholder="0,00" />
              </div>
              <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={Object.keys(STATUS_PEDIDO)} />
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setModal(false)} style={{ flex: 1, background: "#f1f5f9", border: "none", borderRadius: 10, padding: 13, fontSize: 14, color: "#64748b", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
                <button onClick={criar} disabled={salvando} style={{ flex: 2, background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 10, padding: 13, fontSize: 14, color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                  {salvando ? "Salvando..." : "Criar Ordem"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MÓDULO FINANCEIRO ────────────────────────────────────────────
function ModuloFinanceiro() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("Todos");
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  useEffect(() => {
    db.get("pedidos", "&order=created_at.desc").then(d => { setPedidos(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const filtrados = pedidos.filter(p => {
    if (periodo === "Todos") return true;
    return meses[new Date(p.data + "T12:00:00").getMonth()] === periodo;
  });

  const totalGeral = filtrados.reduce((s, p) => s + Number(p.valor), 0);
  const totalFaturado = filtrados.filter(p => ["Faturado", "Entregue"].includes(p.status)).reduce((s, p) => s + Number(p.valor), 0);
  const totalPendente = filtrados.filter(p => ["Em aberto", "Aprovado"].includes(p.status)).reduce((s, p) => s + Number(p.valor), 0);

  const vendedores = [...new Set(pedidos.map(p => p.vendedor))];
  const porVendedor = vendedores.map(v => ({
    nome: v,
    total: filtrados.filter(p => p.vendedor === v).reduce((s, p) => s + Number(p.valor), 0),
    qtd: filtrados.filter(p => p.vendedor === v).length,
  })).filter(v => v.qtd > 0).sort((a, b) => b.total - a.total);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>Visão Financeira</h2>
        <select value={periodo} onChange={e => setPeriodo(e.target.value)} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#475569" }}>
          <option>Todos</option>{meses.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 24 }}>
        <Card icon="💵" label="Total Geral" value={fmt(totalGeral)} accent="#3B82F6" />
        <Card icon="✅" label="Faturado/Entregue" value={fmt(totalFaturado)} accent="#22C55E" />
        <Card icon="⏳" label="A Faturar" value={fmt(totalPendente)} accent="#F97316" />
        <Card icon="📊" label="Pedidos" value={filtrados.length} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Por Vendedor</div>
          {porVendedor.length === 0 ? <div style={{ color: "#94a3b8", fontSize: 13 }}>Sem dados</div> :
            porVendedor.map((v, i) => {
              const pct = totalGeral > 0 ? (v.total / totalGeral) * 100 : 0;
              const cores = ["#22c55e", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"];
              return (
                <div key={v.nome} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>{v.nome.split(" ")[0]}</span>
                    <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>{fmt(v.total)}</span>
                  </div>
                  <div style={{ background: "#f1f5f9", borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: cores[i % cores.length], borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{v.qtd} pedido{v.qtd !== 1 ? "s" : ""} · {pct.toFixed(1)}%</div>
                </div>
              );
            })}
        </div>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Por Status</div>
          {Object.keys(STATUS_PEDIDO).map(s => {
            const total = filtrados.filter(p => p.status === s).reduce((sum, p) => sum + Number(p.valor), 0);
            const qtd = filtrados.filter(p => p.status === s).length;
            return (
              <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge label={s} map={STATUS_PEDIDO} />
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{qtd} pedido{qtd !== 1 ? "s" : ""}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{fmt(total)}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #f1f5f9", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Extrato</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <THead cols={["Ordem", "Cliente", "Vendedor", "Data", "Valor", "Status"]} />
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{p.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#334155" }}>{p.cliente}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{p.vendedor}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>{fmtData(p.data)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700 }}>{fmt(p.valor)}</td>
                  <td style={{ padding: "12px 16px" }}><Badge label={p.status} map={STATUS_PEDIDO} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MÓDULO ESTOQUE ───────────────────────────────────────────────
function ModuloEstoque() {
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [itemSel, setItemSel] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nome: "", categoria: "", unidade: "", estoque: "", minimo: "", custo: "", preco: "" });
  const [mov, setMov] = useState({ tipo: "Entrada", quantidade: "", obs: "" });

  const carregar = async () => {
    const data = await db.get("estoque");
    setEstoque(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const criar = async () => {
    if (!form.nome) return;
    setSalvando(true);
    const id = `EST-${String(estoque.length + 1).padStart(3, "0")}`;
    await db.insert("estoque", { id, ...form, estoque: Number(form.estoque || 0), minimo: Number(form.minimo || 0), custo: Number(form.custo || 0), preco: Number(form.preco || 0) });
    setForm({ nome: "", categoria: "", unidade: "", estoque: "", minimo: "", custo: "", preco: "" });
    setModal(null);
    setSalvando(false);
    carregar();
  };

  const movimentar = async () => {
    if (!mov.quantidade) return;
    setSalvando(true);
    const qtd = Number(mov.quantidade);
    const novoEstoque = mov.tipo === "Entrada" ? itemSel.estoque + qtd : Math.max(0, itemSel.estoque - qtd);
    await db.update("estoque", itemSel.id, { estoque: novoEstoque });
    setMov({ tipo: "Entrada", quantidade: "", obs: "" });
    setModal(null);
    setItemSel(null);
    setSalvando(false);
    carregar();
  };

  const criticos = estoque.filter(e => e.estoque <= e.minimo);

  return (
    <div>
      {criticos.length > 0 && (
        <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#C2410C" }}>Atenção: {criticos.length} item{criticos.length !== 1 ? "s" : ""} abaixo do mínimo</div>
            <div style={{ fontSize: 12, color: "#9A3412" }}>{criticos.map(e => e.nome).join(", ")}</div>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 24 }}>
        <Card icon="📦" label="Itens" value={estoque.length} />
        <Card icon="⚠️" label="Críticos" value={criticos.length} accent="#F97316" />
        <Card icon="💰" label="Valor em Estoque" value={fmt(estoque.reduce((s, e) => s + (e.estoque * e.custo), 0))} accent="#3B82F6" />
        <Card icon="🏷️" label="Valor a Venda" value={fmt(estoque.reduce((s, e) => s + (e.estoque * e.preco), 0))} accent="#22C55E" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={carregar} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#475569", cursor: "pointer" }}>🔄 Atualizar</button>
        <button onClick={() => setModal("novo")} style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Novo Item</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <THead cols={["Código", "Nome", "Categoria", "Unid.", "Estoque", "Mínimo", "Custo", "Preço", "Situação", ""]} />
              <tbody>
                {estoque.length === 0 ? <tr><td colSpan={10} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Nenhum item cadastrado</td></tr>
                  : estoque.map(e => {
                    const critico = e.estoque <= e.minimo;
                    return (
                      <tr key={e.id} style={{ borderTop: "1px solid #f1f5f9" }}
                        onMouseEnter={ev => ev.currentTarget.style.background = "#f8fafc"} onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{e.id}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{e.nome}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{e.categoria}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{e.unidade}</td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: critico ? "#C2410C" : "#0f172a" }}>{e.estoque}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#94a3b8" }}>{e.minimo}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{fmt(e.custo)}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{fmt(e.preco)}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: critico ? "#FFF7ED" : "#F0FDF4", color: critico ? "#C2410C" : "#15803D", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                            {critico ? "⚠️ Crítico" : "✅ OK"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button onClick={() => { setItemSel(e); setModal("movimentar"); }} style={{ background: "#f1f5f9", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, color: "#475569", cursor: "pointer", fontWeight: 600 }}>Movimentar</button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal === "novo" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 460, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#0a1628,#0d2137)", padding: "22px 26px" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>Cadastrar</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#fff" }}>Novo Item de Estoque</div>
            </div>
            <div style={{ padding: 26 }}>
              <Input label="Nome do Produto" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Adubo Orgânico 50kg" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Categoria" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Fertilizante" />
                <Input label="Unidade" value={form.unidade} onChange={e => setForm({ ...form, unidade: e.target.value })} placeholder="Ex: Saco, Kg" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Qtd. Inicial" value={form.estoque} onChange={e => setForm({ ...form, estoque: e.target.value })} type="number" placeholder="0" />
                <Input label="Estoque Mínimo" value={form.minimo} onChange={e => setForm({ ...form, minimo: e.target.value })} type="number" placeholder="0" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Custo (R$)" value={form.custo} onChange={e => setForm({ ...form, custo: e.target.value })} type="number" placeholder="0" />
                <Input label="Preço Venda (R$)" value={form.preco} onChange={e => setForm({ ...form, preco: e.target.value })} type="number" placeholder="0" />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setModal(null)} style={{ flex: 1, background: "#f1f5f9", border: "none", borderRadius: 10, padding: 13, fontSize: 14, color: "#64748b", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
                <button onClick={criar} disabled={salvando} style={{ flex: 2, background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 10, padding: 13, fontSize: 14, color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                  {salvando ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal === "movimentar" && itemSel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 380, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#0a1628,#0d2137)", padding: "22px 26px" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>Movimentação</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{itemSel.nome}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Estoque atual: {itemSel.estoque} {itemSel.unidade}</div>
            </div>
            <div style={{ padding: 26 }}>
              <Select label="Tipo" value={mov.tipo} onChange={e => setMov({ ...mov, tipo: e.target.value })} options={["Entrada", "Saída"]} />
              <Input label="Quantidade" value={mov.quantidade} onChange={e => setMov({ ...mov, quantidade: e.target.value })} type="number" placeholder="0" />
              <Input label="Observação (opcional)" value={mov.obs} onChange={e => setMov({ ...mov, obs: e.target.value })} placeholder="Ex: Compra fornecedor X" />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setModal(null); setItemSel(null); }} style={{ flex: 1, background: "#f1f5f9", border: "none", borderRadius: 10, padding: 13, fontSize: 14, color: "#64748b", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
                <button onClick={movimentar} disabled={salvando} style={{ flex: 2, background: mov.tipo === "Entrada" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#f97316,#ea580c)", border: "none", borderRadius: 10, padding: 13, fontSize: 14, color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                  {salvando ? "Salvando..." : mov.tipo === "Entrada" ? "✅ Dar Entrada" : "📤 Dar Saída"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MÓDULO PRODUÇÃO ──────────────────────────────────────────────
function ModuloProducao() {
  const [producao, setProducao] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ pedido_ref: "", cliente: "", produto: "", quantidade: "" });

  const carregar = async () => {
    const [prod, peds] = await Promise.all([db.get("producao", "&order=created_at.desc"), db.get("pedidos", "&order=created_at.desc")]);
    setProducao(Array.isArray(prod) ? prod : []);
    setPedidos(Array.isArray(peds) ? peds : []);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const criar = async () => {
    if (!form.cliente || !form.produto || !form.quantidade) return;
    setSalvando(true);
    const id = `PR-${String(producao.length + 1).padStart(4, "0")}`;
    await db.insert("producao", { id, ...form, quantidade: Number(form.quantidade), data_inicio: new Date().toISOString().split("T")[0], status: "Aguardando" });
    setForm({ pedido_ref: "", cliente: "", produto: "", quantidade: "" });
    setModal(false);
    setSalvando(false);
    carregar();
  };

  const atualizarStatus = async (id, status) => {
    await db.update("producao", id, { status });
    carregar();
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14, marginBottom: 24 }}>
        <Card icon="🏭" label="Total Ordens" value={producao.length} />
        <Card icon="⏳" label="Pendentes" value={producao.filter(p => ["Aguardando", "Em produção"].includes(p.status)).length} accent="#F97316" />
        <Card icon="🔧" label="Em Produção" value={producao.filter(p => p.status === "Em produção").length} accent="#3B82F6" />
        <Card icon="✅" label="Concluídos" value={producao.filter(p => ["Pronto", "Despachado"].includes(p.status)).length} accent="#22C55E" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={carregar} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#475569", cursor: "pointer" }}>🔄 Atualizar</button>
        <button onClick={() => setModal(true)} style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Nova Ordem de Produção</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <THead cols={["Ordem", "Ref. Pedido", "Cliente", "Produto", "Qtd", "Início", "Status", "Ações"]} />
              <tbody>
                {producao.length === 0 ? <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Nenhuma ordem de produção</td></tr>
                  : producao.map(p => (
                    <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{p.id}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{p.pedido_ref || "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#334155" }}>{p.cliente}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.produto}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>{p.quantidade}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>{fmtData(p.data_inicio)}</td>
                      <td style={{ padding: "12px 16px" }}><Badge label={p.status} map={STATUS_PROD} /></td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {p.status === "Aguardando" && <button onClick={() => atualizarStatus(p.id, "Em produção")} style={{ background: "#EFF6FF", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#1D4ED8", cursor: "pointer", fontWeight: 600 }}>▶ Iniciar</button>}
                          {p.status === "Em produção" && <button onClick={() => atualizarStatus(p.id, "Pronto")} style={{ background: "#F0FDF4", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#15803D", cursor: "pointer", fontWeight: 600 }}>✓ Pronto</button>}
                          {p.status === "Pronto" && <button onClick={() => atualizarStatus(p.id, "Despachado")} style={{ background: "#F5F3FF", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#6D28D9", cursor: "pointer", fontWeight: 600 }}>🚚 Despachar</button>}
                          {p.status === "Despachado" && <span style={{ fontSize: 12, color: "#94a3b8" }}>Concluído</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 440, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#0a1628,#0d2137)", padding: "22px 26px" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>Nova</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#fff" }}>Ordem de Produção</div>
            </div>
            <div style={{ padding: 26 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Vincular Pedido (opcional)</label>
                <select value={form.pedido_ref} onChange={e => {
                  const p = pedidos.find(x => x.id === e.target.value);
                  setForm({ ...form, pedido_ref: e.target.value, cliente: p?.cliente || form.cliente, produto: p?.produto || form.produto, quantidade: p ? String(p.quantidade) : form.quantidade });
                }} style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#1e293b" }}>
                  <option value="">— Sem vínculo —</option>
                  {pedidos.filter(p => ["Em aberto", "Aprovado"].includes(p.status)).map(p => <option key={p.id} value={p.id}>{p.id} — {p.cliente}</option>)}
                </select>
              </div>
              <Input label="Cliente" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} placeholder="Nome do cliente" />
              <Input label="Produto a Produzir" value={form.produto} onChange={e => setForm({ ...form, produto: e.target.value })} placeholder="Ex: Adubo Orgânico 50kg" />
              <Input label="Quantidade" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} type="number" placeholder="0" />
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setModal(false)} style={{ flex: 1, background: "#f1f5f9", border: "none", borderRadius: 10, padding: 13, fontSize: 14, color: "#64748b", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
                <button onClick={criar} disabled={salvando} style={{ flex: 2, background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 10, padding: 13, fontSize: 14, color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                  {salvando ? "Salvando..." : "Criar Ordem"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MÓDULO CALCULADORA ───────────────────────────────────────────
const FILAMENTOS = {
  PLA:  { fator: 0.140 },
  PETG: { fator: 0.125 },
  TPU:  { fator: 0.160 },
};
const FATORES_VENDA = { varejo: 3, atacado: 2.2 };

function ModuloCalculadora() {
  const [form, setForm] = useState({ produto: "", peso: "", filamento: "", venda: "" });
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");

  const fmtR = (v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const calcular = () => {
    if (!form.produto) { setErro("Preencha o nome do produto."); return; }
    if (!form.peso || parseFloat(form.peso) <= 0) { setErro("Preencha o peso do produto."); return; }
    if (!form.filamento) { setErro("Selecione o tipo de filamento."); return; }
    if (!form.venda) { setErro("Selecione o tipo de venda."); return; }
    setErro("");
    const peso = parseFloat(form.peso);
    const fatorFil = FILAMENTOS[form.filamento].fator;
    const fatorVenda = FATORES_VENDA[form.venda];
    const preco = peso * fatorFil * fatorVenda;
    setResultado({ preco, produto: form.produto, filamento: form.filamento, venda: form.venda, peso });
  };

  const limpar = () => {
    setForm({ produto: "", peso: "", filamento: "", venda: "" });
    setResultado(null);
    setErro("");
  };

  const CheckOpt = ({ grupo, valor, label, icon }) => {
    const ativo = form[grupo] === valor;
    return (
      <div onClick={() => setForm({ ...form, [grupo]: valor })}
        style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: `2px solid ${ativo ? "#22c55e" : "#e2e8f0"}`, background: ativo ? "#F0FDF4" : "#f8fafc", cursor: "pointer", transition: "all 0.15s" }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${ativo ? "#22c55e" : "#cbd5e1"}`, background: ativo ? "#22c55e" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {ativo && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: ativo ? "#15803D" : "#334155" }}>{icon} {label}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>🧮 Calculadora de Precificação</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Calcule o preço ideal dos seus produtos 3D</div>
        </div>
        <button onClick={limpar} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, color: "#475569", cursor: "pointer", fontWeight: 600 }}>🔄 Limpar</button>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", padding: 28, marginBottom: 20 }}>

        {/* Nome do produto */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 600 }}>Nome do Produto *</label>
          <input value={form.produto} onChange={e => setForm({ ...form, produto: e.target.value })} placeholder="Ex: Boneco Homem Aranha"
            style={{ width: "100%", background: "#f8fafc", border: `1px solid ${!form.produto && erro ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 12, padding: "13px 16px", fontSize: 15, color: "#1e293b", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Peso */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 600 }}>Peso Estimado do Produto (gramas) *</label>
          <input value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} type="number" placeholder="Ex: 85"
            style={{ width: "100%", background: "#f8fafc", border: `1px solid ${!form.peso && erro ? "#fca5a5" : "#e2e8f0"}`, borderRadius: 12, padding: "13px 16px", fontSize: 15, color: "#1e293b", outline: "none", boxSizing: "border-box" }} />
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>💡 Consulte o peso no Bambu Studio, Cura ou fatiador que usar</div>
        </div>

        {/* Tipo de filamento */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 10, fontWeight: 600 }}>Tipo de Filamento *</label>
          <div style={{ display: "flex", gap: 10 }}>
            <CheckOpt grupo="filamento" valor="PLA"  label="PLA"  icon="🟢" />
            <CheckOpt grupo="filamento" valor="PETG" label="PETG" icon="🔵" />
            <CheckOpt grupo="filamento" valor="TPU"  label="TPU"  icon="🟠" />
          </div>
        </div>

        {/* Tipo de venda */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 10, fontWeight: 600 }}>Tipo de Venda *</label>
          <div style={{ display: "flex", gap: 10 }}>
            <CheckOpt grupo="venda" valor="varejo"  label="Varejo"  icon="🛍️" />
            <CheckOpt grupo="venda" valor="atacado" label="Atacado" icon="📦" />
          </div>
        </div>

        {/* Erro */}
        {erro && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#DC2626", display: "flex", alignItems: "center", gap: 8 }}>
            ⚠️ {erro}
          </div>
        )}

        {/* Botão */}
        <button onClick={calcular}
          style={{ width: "100%", background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 12, padding: 15, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
          Calcular Preço de Venda
        </button>
      </div>

      {/* Resultado */}
      {resultado && (
        <div style={{ background: "linear-gradient(135deg,#0a1628,#0d2137)", borderRadius: 20, padding: 28, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "radial-gradient(circle,rgba(34,197,94,0.15) 0%,transparent 70%)" }} />
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Resultado da Simulação</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 20 }}>{resultado.produto}</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[["Peso", resultado.peso + "g"], ["Filamento", resultado.filamento], ["Modalidade", resultado.venda === "varejo" ? "Varejo" : "Atacado"]].map(([l, v]) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 14, padding: "20px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>💰 Preço de Venda Sugerido</div>
            <div style={{ fontSize: 42, fontWeight: 700, color: "#4ade80", letterSpacing: "-1px" }}>{fmtR(resultado.preco)}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>🚚 Frete por conta do cliente</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────
export default function App() {
  const [logado, setLogado] = useState(null);
  const [aba, setAba] = useState("pedidos");
  const [loginForm, setLoginForm] = useState({ usuario: "", senha: "" });
  const [loginErro, setLoginErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async () => {
    setCarregando(true);
    setLoginErro("");
    try {
      const data = await db.get("usuarios", `&usuario=eq.${loginForm.usuario}&senha=eq.${loginForm.senha}`);
      if (Array.isArray(data) && data.length > 0) {
        setLogado(data[0]);
      } else {
        setLoginErro("Usuário ou senha incorretos.");
      }
    } catch {
      setLoginErro("Erro de conexão. Tente novamente.");
    }
    setCarregando(false);
  };

  const ABAS = [
    { id: "pedidos", label: "Pedidos", icon: "📋" },
    { id: "financeiro", label: "Financeiro", icon: "💰", admin: true },
    { id: "estoque", label: "Estoque", icon: "📦", admin: true },
    { id: "producao", label: "Produção", icon: "🏭", admin: true },
    { id: "calculadora", label: "Calculadora", icon: "🧮" },
  ];

  if (!logado) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0a1628 0%,#0d2137 50%,#0a1628 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia',serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%,rgba(34,197,94,0.08) 0%,transparent 50%)" }} />
      <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "48px 44px", width: 360, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 58, height: 58, background: "linear-gradient(135deg,#22c55e,#16a34a)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 26 }}>🌱</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Nextfarm 3D</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, letterSpacing: 2.5, textTransform: "uppercase", fontFamily: "monospace" }}>Sistema Interno</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Usuário</label>
          <input value={loginForm.usuario} onChange={e => setLoginForm({ ...loginForm, usuario: e.target.value })} onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="seu.usuario" />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Senha</label>
          <input type="password" value={loginForm.senha} onChange={e => setLoginForm({ ...loginForm, senha: e.target.value })} onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} placeholder="••••••••" />
        </div>
        {loginErro && <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 12px", color: "#fca5a5", fontSize: 13, marginBottom: 14 }}>{loginErro}</div>}
        <button onClick={handleLogin} disabled={carregando}
          style={{ width: "100%", background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 10, padding: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {carregando ? <><div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Entrando...</> : "Entrar"}
        </button>
      </div>
    </div>
  );

  const abasFiltradas = ABAS.filter(a => !a.admin || logado.perfil === "admin");

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Georgia',serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <header style={{ background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 60, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#22c55e,#16a34a)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🌱</div>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Nextfarm 3D</span>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {abasFiltradas.map(a => (
            <button key={a.id} onClick={() => setAba(a.id)}
              style={{ background: aba === a.id ? "rgba(34,197,94,0.15)" : "transparent", border: aba === a.id ? "1px solid rgba(34,197,94,0.3)" : "1px solid transparent", borderRadius: 8, padding: "6px 14px", color: aba === a.id ? "#22c55e" : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, fontWeight: aba === a.id ? 700 : 400 }}>
              {a.icon} {a.label}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{logado.nome.split(" ")[0]}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textTransform: "capitalize" }}>{logado.perfil}</div>
          </div>
          <button onClick={() => setLogado(null)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "5px 12px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 11 }}>Sair</button>
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        {aba === "pedidos"      && <ModuloPedidos logado={logado} />}
        {aba === "financeiro"   && <ModuloFinanceiro />}
        {aba === "estoque"      && <ModuloEstoque />}
        {aba === "producao"     && <ModuloProducao />}
        {aba === "calculadora"  && <ModuloCalculadora />}
      </main>
    </div>
  );
}
