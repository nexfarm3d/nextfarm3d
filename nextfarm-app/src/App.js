import { useState, useEffect, useRef } from "react";

const SURL = "https://twpcgpudwadqdqytktub.supabase.co";
const SKEY = "sb_publishable_XxQjvXIlooWiXRlcMV4cMg_pAf1jFHg";

const db = {
  async get(t, f="") {
    const r = await fetch(SURL+"/rest/v1/"+t+"?select=*"+f, {headers:{apikey:SKEY,Authorization:"Bearer "+SKEY}});
    return r.json();
  },
  async insert(t, d) {
    const r = await fetch(SURL+"/rest/v1/"+t, {method:"POST",headers:{apikey:SKEY,Authorization:"Bearer "+SKEY,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(d)});
    return r.json();
  },
  async update(t, id, d) {
    const r = await fetch(SURL+"/rest/v1/"+t+"?id=eq."+id, {method:"PATCH",headers:{apikey:SKEY,Authorization:"Bearer "+SKEY,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(d)});
    return r.json();
  },
  async updateUUID(t, id, d) {
    const r = await fetch(SURL+"/rest/v1/"+t+"?id=eq."+id, {method:"PATCH",headers:{apikey:SKEY,Authorization:"Bearer "+SKEY,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(d)});
    return r.json();
  }
};

const SP = {
  "Orcamento":{bg:"#F8FAFC",text:"#475569",dot:"#94A3B8"},
  "Aguardando Aprovacao":{bg:"#FFF7ED",text:"#C2410C",dot:"#F97316"},
  "Aprovado":{bg:"#EFF6FF",text:"#1D4ED8",dot:"#3B82F6"},
  "Em Producao":{bg:"#FDF4FF",text:"#7E22CE",dot:"#A855F7"},
  "Producao Concluida":{bg:"#F0FDF4",text:"#15803D",dot:"#22C55E"},
  "Separacao":{bg:"#FFFBEB",text:"#B45309",dot:"#F59E0B"},
  "Expedido":{bg:"#EFF6FF",text:"#1D4ED8",dot:"#60A5FA"},
  "Entregue":{bg:"#F0FDF4",text:"#166534",dot:"#16A34A"},
  "Cancelado":{bg:"#FEF2F2",text:"#DC2626",dot:"#EF4444"},
};
const SPROD = {
  "Aguardando":{bg:"#FFF7ED",text:"#C2410C",dot:"#F97316"},
  "Em producao":{bg:"#EFF6FF",text:"#1D4ED8",dot:"#3B82F6"},
  "Pronto":{bg:"#F0FDF4",text:"#15803D",dot:"#22C55E"},
  "Despachado":{bg:"#F5F3FF",text:"#6D28D9",dot:"#8B5CF6"},
};

const fmt = (v) => "R$ "+Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2});
const fmtD = (d) => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : "-";
const PMIN = 50;
const hoje = () => new Date().toISOString().split("T")[0];

function pgOpts(v) {
  const opts = ["Pix","Dinheiro","Cartao 1x"];
  for(let i=2;i<=10;i++) if(Number(v)/i>=PMIN) opts.push("Cartao "+i+"x");
  return opts;
}

// LOGO
function LogoNX({size=32}) {
  return (
    <div style={{width:size,height:size,background:"linear-gradient(135deg,#38BDF8,#0284C7)",borderRadius:size*0.25,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <svg width={size*0.65} height={size*0.65} viewBox="0 0 24 24" fill="none">
        <path d="M3 4h3.5L12 12 6.5 20H3l5.5-8L3 4z" fill="white"/>
        <path d="M10 4h3.5L19 12l-5.5 8H10l5.5-8L10 4z" fill="rgba(255,255,255,0.7)"/>
      </svg>
    </div>
  );
}

// BASE COMPONENTS
function Badge({label,map}) {
  const s = map[label]||{bg:"#f1f5f9",text:"#64748b",dot:"#94a3b8"};
  return <span style={{background:s.bg,color:s.text,padding:"4px 10px",borderRadius:20,fontSize:12,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}><span style={{width:6,height:6,borderRadius:"50%",background:s.dot,display:"inline-block"}}/>{label}</span>;
}
function Card({icon,label,value,sub,accent,onClick}) {
  return <div onClick={onClick} style={{background:"#fff",borderRadius:14,border:"1px solid #e2e8f0",padding:"20px 22px",borderLeft:accent?("4px solid "+accent):undefined,cursor:onClick?"pointer":undefined}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontSize:11,color:"#94a3b8",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>{label}</div><div style={{fontSize:22,fontWeight:700,color:"#0f172a"}}>{value}</div>{sub&&<div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{sub}</div>}</div><div style={{fontSize:22}}>{icon}</div></div></div>;
}
function FI({label,value,onChange,type="text",placeholder,required,erro,readOnly}) {
  return <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#94a3b8",letterSpacing:1.2,textTransform:"uppercase",display:"block",marginBottom:5}}>{label}{required&&<span style={{color:"#ef4444",marginLeft:3}}>*</span>}</label><input value={value||""} onChange={onChange} type={type} placeholder={placeholder} readOnly={readOnly} style={{width:"100%",background:readOnly?"#f1f5f9":"#f8fafc",border:"1px solid "+(erro?"#fca5a5":"#e2e8f0"),borderRadius:10,padding:"11px 14px",fontSize:14,color:"#1e293b",outline:"none",boxSizing:"border-box"}}/>{erro&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>{erro}</div>}</div>;
}
function FS({label,value,onChange,options,required}) {
  return <div style={{marginBottom:14}}><label style={{fontSize:11,color:"#94a3b8",letterSpacing:1.2,textTransform:"uppercase",display:"block",marginBottom:5}}>{label}{required&&<span style={{color:"#ef4444",marginLeft:3}}>*</span>}</label><select value={value||""} onChange={onChange} style={{width:"100%",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"11px 14px",fontSize:14,color:"#1e293b"}}>{options.map(o=><option key={o}>{o}</option>)}</select></div>;
}
function TH({cols}) {
  return <thead><tr style={{background:"#f8fafc"}}>{cols.map(c=><th key={c} style={{padding:"12px 16px",textAlign:"left",fontSize:11,color:"#94a3b8",letterSpacing:1.2,textTransform:"uppercase",fontWeight:600,whiteSpace:"nowrap"}}>{c}</th>)}</tr></thead>;
}
function Spin() {
  return <div style={{display:"flex",justifyContent:"center",padding:40}}><div style={{width:32,height:32,border:"3px solid #e2e8f0",borderTop:"3px solid #38BDF8",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div>;
}
function Modal({title,sub,onClose,children,maxW=520}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:maxW,overflow:"hidden",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{background:"linear-gradient(135deg,#0a1628,#0d2137)",padding:"22px 26px",position:"sticky",top:0,zIndex:1}}>
          {sub&&<div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:2,textTransform:"uppercase"}}>{sub}</div>}
          <div style={{fontSize:19,fontWeight:700,color:"#fff"}}>{title}</div>
        </div>
        <div style={{padding:26}}>{children}</div>
      </div>
    </div>
  );
}
function BtnPrimary({onClick,disabled,children}) {
  return <button onClick={onClick} disabled={disabled} style={{flex:2,background:"linear-gradient(135deg,#0284C7,#38BDF8)",border:"none",borderRadius:10,padding:13,fontSize:14,color:"#fff",cursor:"pointer",fontWeight:700,opacity:disabled?0.6:1}}>{children}</button>;
}
function BtnSecondary({onClick,children}) {
  return <button onClick={onClick} style={{flex:1,background:"#f1f5f9",border:"none",borderRadius:10,padding:13,fontSize:14,color:"#64748b",cursor:"pointer",fontWeight:600}}>{children}</button>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────
function ModuloDashboard({setAba}) {
  const [data,setData]=useState({pedidos:[],estoque:[],producao:[],clientes:[]});
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    Promise.all([
      db.get("pedidos","&order=created_at.desc"),
      db.get("estoque"),
      db.get("producao"),
      db.get("clientes","&deleted_at=is.null")
    ]).then(([p,e,pr,c])=>{
      setData({pedidos:Array.isArray(p)?p:[],estoque:Array.isArray(e)?e:[],producao:Array.isArray(pr)?pr:[],clientes:Array.isArray(c)?c:[]});
      setLoading(false);
    });
  },[]);
  if(loading)return <Spin/>;
  const {pedidos,estoque,producao,clientes}=data;
  const hj=new Date().toISOString().split("T")[0];
  const mesAtual=new Date().getMonth();
  const pedHoje=pedidos.filter(p=>p.data===hj).length;
  const pedMes=pedidos.filter(p=>new Date(p.data+"T12:00:00").getMonth()===mesAtual).length;
  const fatMes=pedidos.filter(p=>new Date(p.data+"T12:00:00").getMonth()===mesAtual&&["Entregue","Expedido"].includes(p.status)).reduce((s,p)=>s+Number(p.valor),0);
  const ticket=pedidos.length>0?pedidos.reduce((s,p)=>s+Number(p.valor),0)/pedidos.length:0;
  const opsAtivas=producao.filter(p=>["Aguardando","Em producao"].includes(p.status)).length;
  const opsConcluidas=producao.filter(p=>p.status==="Despachado").length;
  const criticos=estoque.filter(e=>e.estoque<=e.minimo).length;
  const tReceita=pedidos.filter(p=>["Entregue","Expedido","Entregue"].includes(p.status)).reduce((s,p)=>s+Number(p.valor),0);
  const mNomes=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const fMes=mNomes.map((m,i)=>({mes:m,val:pedidos.filter(p=>new Date(p.data+"T12:00:00").getMonth()===i&&["Entregue","Expedido"].includes(p.status)).reduce((s,p)=>s+Number(p.valor),0)}));
  const maxM=Math.max(...fMes.map(m=>m.val),1);
  const statusCount=Object.keys(SP).map(s=>({s,q:pedidos.filter(p=>p.status===s).length}));
  const topClientes=clientes.map(c=>({nome:c.nome,total:pedidos.filter(p=>p.cliente===c.nome).reduce((s,p)=>s+Number(p.valor),0)})).sort((a,b)=>b.total-a.total).slice(0,5);
  const cores=["#38BDF8","#22c55e","#f97316","#8b5cf6","#ec4899"];
  const maxC=Math.max(...topClientes.map(c=>c.total),1);
  return(
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:20,fontWeight:700,color:"#0f172a"}}>Dashboard Executivo</div><div style={{fontSize:13,color:"#64748b",marginTop:2}}>NexFarm3D — Visao completa do negocio</div></div>
      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:24}}>
        <div style={{background:"linear-gradient(135deg,#0284C7,#38BDF8)",borderRadius:14,padding:"20px 22px"}}><div style={{fontSize:11,color:"rgba(255,255,255,0.7)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Faturamento Mes</div><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>{fmt(fatMes)}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:2}}>Entregues + Expedidos</div></div>
        <div style={{background:"linear-gradient(135deg,#16a34a,#22c55e)",borderRadius:14,padding:"20px 22px"}}><div style={{fontSize:11,color:"rgba(255,255,255,0.7)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Pedidos Hoje</div><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>{pedHoje}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginTop:2}}>{pedMes} no mes</div></div>
        <Card icon="🎯" label="Ticket Medio" value={fmt(ticket)} sub="por pedido"/>
        <Card icon="🏭" label="OPs Ativas" value={opsAtivas} sub={opsConcluidas+" concluidas"} accent="#8B5CF6"/>
        <Card icon="⚠️" label="Est. Critico" value={criticos} sub="itens abaixo min." accent={criticos>0?"#F97316":"#22C55E"}/>
        <Card icon="👥" label="Clientes" value={clientes.length} sub="cadastrados" accent="#38BDF8"/>
      </div>
      {/* Graficos */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20,marginBottom:20}}>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",padding:24}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:4}}>Faturamento Mensal</div>
          <div style={{fontSize:12,color:"#94a3b8",marginBottom:20}}>Pedidos entregues e expedidos</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:120}}>
            {fMes.map((m,i)=>(
              <div key={m.mes} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontSize:9,color:"#0284C7",fontWeight:600}}>{m.val>0?fmt(m.val).replace("R$ ",""):""}</div>
                <div style={{width:"100%",background:i===mesAtual?"linear-gradient(180deg,#38BDF8,#0284C7)":m.val>0?"#BAE6FD":"#f1f5f9",borderRadius:"4px 4px 0 0",height:Math.max((m.val/maxM)*90,m.val>0?6:2)+"px",transition:"height 0.3s"}}/>
                <div style={{fontSize:9,color:i===mesAtual?"#0284C7":"#94a3b8",fontWeight:i===mesAtual?700:400}}>{m.mes}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",padding:24}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:20}}>Status dos Pedidos</div>
          {statusCount.filter(x=>x.q>0).map(({s,q})=>{const sc=SP[s];const pc=pedidos.length>0?(q/pedidos.length*100).toFixed(0):0;return(<div key={s} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:sc.text,fontWeight:600}}>{s}</span><span style={{fontSize:11,color:"#64748b"}}>{q}</span></div><div style={{background:"#f1f5f9",borderRadius:4,height:5}}><div style={{width:pc+"%",height:"100%",background:sc.dot,borderRadius:4}}/></div></div>);})}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",padding:24}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:4}}>Top Clientes</div>
          <div style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>Por valor total comprado</div>
          {topClientes.length===0?<div style={{color:"#94a3b8",fontSize:13}}>Sem dados ainda</div>:topClientes.map((c,i)=>{const pc=(c.total/maxC)*100;return(<div key={c.nome} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:22,height:22,borderRadius:"50%",background:cores[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700}}>{i+1}</div><span style={{fontSize:13,color:"#334155",fontWeight:600}}>{c.nome.split(" ")[0]}</span></div><span style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{fmt(c.total)}</span></div><div style={{background:"#f1f5f9",borderRadius:4,height:5}}><div style={{width:pc+"%",height:"100%",background:cores[i],borderRadius:4}}/></div></div>);})}
        </div>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",padding:24}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:20}}>Ultimos Pedidos</div>
          {pedidos.slice(0,6).map(p=>(<div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #f1f5f9"}}><div><div style={{fontSize:12,fontFamily:"monospace",color:"#0284C7",fontWeight:700}}>{p.id}</div><div style={{fontSize:11,color:"#64748b",marginTop:1}}>{p.cliente}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:700,color:"#0f172a"}}>{fmt(p.valor)}</div><Badge label={p.status} map={SP}/></div></div>))}
        </div>
      </div>
      {/* Acesso rapido */}
      <div style={{background:"linear-gradient(135deg,#0a1628,#0d2137)",borderRadius:16,padding:24}}>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:16}}>Acesso Rapido</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[["📋","Novo Pedido","pedidos"],["👥","Novo Cliente","clientes"],["🏭","Ver Producao","producao"],["📦","Ver Estoque","estoque"]].map(([icon,label,aba])=>(
            <button key={aba} onClick={()=>setAba(aba)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"10px 18px",color:"#fff",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:8,fontWeight:600}}>{icon} {label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CLIENTES ─────────────────────────────────────────────────────
function ModuloClientes() {
  const [clientes,setClientes]=useState([]);
  const [pedidos,setPedidos]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [detalhe,setDetalhe]=useState(null);
  const [editando,setEditando]=useState(false);
  const [salvando,setSalvando]=useState(false);
  const [busca,setBusca]=useState("");
  const [erros,setErros]=useState({});
  const vazio={nome:"",cpfcnpj:"",telefone:"",whatsapp:"",email:"",endereco:"",cidade:"",estado:"",cep:"",observacoes:"",status:"Ativo"};
  const [form,setForm]=useState(vazio);

  const load=async()=>{
    setLoading(true);
    const [c,p]=await Promise.all([db.get("clientes","&deleted_at=is.null&order=created_at.desc"),db.get("pedidos","&order=created_at.desc")]);
    setClientes(Array.isArray(c)?c:[]);
    setPedidos(Array.isArray(p)?p:[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const lista=clientes.filter(c=>c.nome.toLowerCase().includes(busca.toLowerCase())||c.cpfcnpj?.includes(busca)||c.telefone?.includes(busca));

  const validar=()=>{const e={};if(!form.nome)e.nome="Obrigatorio";setErros(e);return Object.keys(e).length===0;};

  const salvar=async()=>{
    if(!validar())return;
    setSalvando(true);
    if(editando){
      await db.updateUUID("clientes",editando,form);
    } else {
      await db.insert("clientes",{...form,created_at:new Date().toISOString()});
    }
    setForm(vazio);setModal(false);setEditando(false);setSalvando(false);load();
  };

  const excluir=async(id)=>{
    if(!window.confirm("Desativar este cliente?"))return;
    await db.updateUUID("clientes",id,{deleted_at:new Date().toISOString(),status:"Inativo"});
    load();
  };

  const pedidosCliente=(nome)=>pedidos.filter(p=>p.cliente===nome);
  const totalCliente=(nome)=>pedidosCliente(nome).reduce((s,p)=>s+Number(p.valor),0);
  const ticketCliente=(nome)=>{const ps=pedidosCliente(nome);return ps.length>0?totalCliente(nome)/ps.length:0;};
  const ultimaCompra=(nome)=>{const ps=pedidosCliente(nome).sort((a,b)=>new Date(b.data)-new Date(a.data));return ps.length>0?fmtD(ps[0].data):"—";};

  const ESTADOS=["","AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

  if(detalhe){
    const ps=pedidosCliente(detalhe.nome);
    return(
      <div>
        <button onClick={()=>setDetalhe(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b",fontSize:14,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Voltar</button>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
          <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden"}}>
            <div style={{background:"linear-gradient(135deg,#0a1628,#0d2137)",padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:2,textTransform:"uppercase"}}>Cliente</div><div style={{fontSize:22,fontWeight:700,color:"#fff"}}>{detalhe.nome}</div><div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginTop:2}}>{detalhe.cpfcnpj||"Sem CPF/CNPJ"}</div></div>
              <span style={{background:detalhe.status==="Ativo"?"#F0FDF4":"#FEF2F2",color:detalhe.status==="Ativo"?"#15803D":"#DC2626",padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600}}>{detalhe.status}</span>
            </div>
            <div style={{padding:"24px 28px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {[["Telefone",detalhe.telefone||"—"],["WhatsApp",detalhe.whatsapp||"—"],["Email",detalhe.email||"—"],["Cidade",detalhe.cidade?(detalhe.cidade+(detalhe.estado?" / "+detalhe.estado:"")):"—"],["Endereco",detalhe.endereco||"—"],["CEP",detalhe.cep||"—"]].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:11,color:"#94a3b8",letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>{l}</div><div style={{fontSize:14,color:"#1e293b",fontWeight:600}}>{v}</div></div>
                ))}
              </div>
              {detalhe.observacoes&&<div style={{marginTop:16,padding:"12px 14px",background:"#f8fafc",borderRadius:10,fontSize:13,color:"#64748b"}}>{detalhe.observacoes}</div>}
              <div style={{display:"flex",gap:10,marginTop:20}}>
                <button onClick={()=>{setForm(detalhe);setEditando(detalhe.id);setModal(true);}} style={{flex:1,background:"linear-gradient(135deg,#0284C7,#38BDF8)",border:"none",borderRadius:10,padding:"10px",color:"#fff",cursor:"pointer",fontWeight:700,fontSize:13}}>Editar Cliente</button>
                <button onClick={()=>excluir(detalhe.id)} style={{flex:1,background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"10px",color:"#DC2626",cursor:"pointer",fontWeight:700,fontSize:13}}>Desativar</button>
              </div>
            </div>
          </div>
          {/* Indicadores */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignContent:"start"}}>
            <Card icon="💰" label="Total Comprado" value={fmt(totalCliente(detalhe.nome))} accent="#22C55E"/>
            <Card icon="🎯" label="Ticket Medio" value={fmt(ticketCliente(detalhe.nome))} accent="#3B82F6"/>
            <Card icon="📋" label="Qtd Pedidos" value={ps.length} accent="#8B5CF6"/>
            <Card icon="📅" label="Ultima Compra" value={ultimaCompra(detalhe.nome)} accent="#F97316"/>
          </div>
        </div>
        {/* Historico pedidos */}
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden"}}>
          <div style={{padding:"16px 22px",borderBottom:"1px solid #f1f5f9",fontSize:13,fontWeight:700,color:"#0f172a"}}>Historico de Pedidos</div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><TH cols={["Ordem","Produto","Valor","Pagamento","Data","Status"]}/><tbody>{ps.length===0?<tr><td colSpan={6} style={{padding:30,textAlign:"center",color:"#94a3b8"}}>Nenhum pedido</td></tr>:ps.map(p=>(<tr key={p.id} style={{borderTop:"1px solid #f1f5f9"}}><td style={{padding:"12px 16px",fontFamily:"monospace",fontSize:13,fontWeight:700,color:"#0284C7"}}>{p.id}</td><td style={{padding:"12px 16px",fontSize:13,color:"#334155"}}>{p.produto}</td><td style={{padding:"12px 16px",fontSize:13,fontWeight:700}}>{fmt(p.valor)}</td><td style={{padding:"12px 16px",fontSize:12,color:"#64748b"}}>{p.pagamento||"—"}</td><td style={{padding:"12px 16px",fontSize:12,color:"#94a3b8"}}>{fmtD(p.data)}</td><td style={{padding:"12px 16px"}}><Badge label={p.status} map={SP}/></td></tr>))}</tbody></table></div>
        </div>
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:24}}>
        <Card icon="👥" label="Total Clientes" value={clientes.length}/>
        <Card icon="✅" label="Ativos" value={clientes.filter(c=>c.status==="Ativo").length} accent="#22C55E"/>
        <Card icon="💰" label="Receita Total" value={fmt(pedidos.reduce((s,p)=>s+Number(p.valor),0))} accent="#3B82F6"/>
        <Card icon="🎯" label="Ticket Medio" value={fmt(pedidos.length>0?pedidos.reduce((s,p)=>s+Number(p.valor),0)/pedidos.length:0)} accent="#8B5CF6"/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:12,flexWrap:"wrap"}}>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por nome, CPF/CNPJ ou telefone..." style={{flex:1,minWidth:200,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 16px",fontSize:14,color:"#1e293b",outline:"none"}}/>
        <button onClick={()=>{setForm(vazio);setEditando(false);setModal(true);}} style={{background:"linear-gradient(135deg,#0284C7,#38BDF8)",border:"none",borderRadius:10,padding:"10px 20px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>+ Novo Cliente</button>
      </div>
      <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        {loading?<Spin/>:(
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
            <TH cols={["Nome","CPF/CNPJ","Telefone","Cidade","Pedidos","Total","Status",""]}/>
            <tbody>
              {lista.length===0?<tr><td colSpan={8} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Nenhum cliente encontrado</td></tr>:
              lista.map(c=>{const np=pedidosCliente(c.nome).length;const tv=totalCliente(c.nome);return(
                <tr key={c.id} style={{borderTop:"1px solid #f1f5f9"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"13px 16px",fontSize:13,fontWeight:700,color:"#0f172a"}}>{c.nome}</td>
                  <td style={{padding:"13px 16px",fontSize:12,color:"#64748b",fontFamily:"monospace"}}>{c.cpfcnpj||"—"}</td>
                  <td style={{padding:"13px 16px",fontSize:13,color:"#64748b"}}>{c.telefone||"—"}</td>
                  <td style={{padding:"13px 16px",fontSize:13,color:"#64748b"}}>{c.cidade?(c.cidade+(c.estado?" / "+c.estado:"")):"—"}</td>
                  <td style={{padding:"13px 16px",fontSize:13,color:"#64748b",textAlign:"center"}}>{np}</td>
                  <td style={{padding:"13px 16px",fontSize:13,fontWeight:700,color:"#0f172a"}}>{fmt(tv)}</td>
                  <td style={{padding:"13px 16px"}}><span style={{background:c.status==="Ativo"?"#F0FDF4":"#FEF2F2",color:c.status==="Ativo"?"#15803D":"#DC2626",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{c.status}</span></td>
                  <td style={{padding:"13px 16px"}}><button onClick={()=>setDetalhe(c)} style={{background:"#f1f5f9",border:"none",borderRadius:6,padding:"5px 10px",fontSize:14,cursor:"pointer"}}>👁️</button></td>
                </tr>
              );})}
            </tbody>
          </table></div>
        )}
      </div>
      {modal&&(
        <Modal title={editando?"Editar Cliente":"Novo Cliente"} sub="Cadastro" onClose={()=>setModal(false)} maxW={600}>
          <FI label="Nome / Razao Social" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Nome completo ou razao social" required erro={erros.nome}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <FI label="CPF / CNPJ" value={form.cpfcnpj} onChange={e=>setForm({...form,cpfcnpj:e.target.value})} placeholder="000.000.000-00"/>
            <FI label="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" placeholder="email@exemplo.com"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <FI label="Telefone" value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} placeholder="(00) 00000-0000"/>
            <FI label="WhatsApp" value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="(00) 00000-0000"/>
          </div>
          <FI label="Endereco" value={form.endereco} onChange={e=>setForm({...form,endereco:e.target.value})} placeholder="Rua, numero, bairro"/>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:12}}>
            <FI label="Cidade" value={form.cidade} onChange={e=>setForm({...form,cidade:e.target.value})} placeholder="Cidade"/>
            <FS label="Estado" value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} options={ESTADOS}/>
            <FI label="CEP" value={form.cep} onChange={e=>setForm({...form,cep:e.target.value})} placeholder="00000-000"/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,color:"#94a3b8",letterSpacing:1.2,textTransform:"uppercase",display:"block",marginBottom:5}}>Observacoes</label>
            <textarea value={form.observacoes||""} onChange={e=>setForm({...form,observacoes:e.target.value})} placeholder="Notas sobre o cliente..." style={{width:"100%",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"11px 14px",fontSize:14,color:"#1e293b",outline:"none",boxSizing:"border-box",minHeight:80,resize:"vertical"}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <BtnSecondary onClick={()=>{setModal(false);setErros({});}}>Cancelar</BtnSecondary>
            <BtnPrimary onClick={salvar} disabled={salvando}>{salvando?"Salvando...":editando?"Salvar Alteracoes":"Cadastrar Cliente"}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PEDIDOS ──────────────────────────────────────────────────────
function ModuloPedidos({logado}) {
  const [pedidos,setPedidos]=useState([]);
  const [clientes,setClientes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filtro,setFiltro]=useState("Todos");
  const [modal,setModal]=useState(false);
  const [detalhe,setDetalhe]=useState(null);
  const [salvando,setSalvando]=useState(false);
  const [erros,setErros]=useState({});
  const ref=useRef(null);
  const vazio={cliente:"",cpfcnpj:"",telefone:"",produto:"",quantidade:"",valor:"",status:"Orcamento",pagamento:""};
  const [form,setForm]=useState(vazio);

  const load=async()=>{
    setLoading(true);
    const [p,c]=await Promise.all([db.get("pedidos","&order=created_at.desc"),db.get("clientes","&deleted_at=is.null&status=eq.Ativo&order=nome.asc")]);
    setPedidos(Array.isArray(p)?p:[]);
    setClientes(Array.isArray(c)?c:[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const lista=pedidos.filter(p=>(filtro==="Todos"||p.status===filtro)&&(logado.perfil==="admin"||p.vendedor===logado.nome));

  const selecionarCliente=(nome)=>{
    const c=clientes.find(x=>x.nome===nome);
    if(c) setForm({...form,cliente:c.nome,cpfcnpj:c.cpfcnpj||"",telefone:c.telefone||""});
    else setForm({...form,cliente:nome});
  };

  const validar=()=>{const e={};if(!form.cliente)e.cliente="Obrigatorio";if(!form.cpfcnpj)e.cpfcnpj="Obrigatorio";if(!form.telefone)e.telefone="Obrigatorio";if(!form.produto)e.produto="Obrigatorio";if(!form.quantidade)e.quantidade="Obrigatorio";if(!form.valor)e.valor="Obrigatorio";if(!form.pagamento)e.pagamento="Selecione";setErros(e);return Object.keys(e).length===0;};

  const criar=async()=>{
    if(!validar())return;
    setSalvando(true);
    const id="OF-"+String(pedidos.length+1).padStart(4,"0");
    await db.insert("pedidos",{id,...form,quantidade:Number(form.quantidade),valor:Number(form.valor),vendedor:logado.nome,data:hoje()});
    setForm(vazio);setErros({});setModal(false);setSalvando(false);load();
  };

  const upS=async(id,status)=>{await db.update("pedidos",id,{status});if(detalhe?.id===id)setDetalhe({...detalhe,status});load();};

  const exportPDF=()=>{
    const el=ref.current;if(!el)return;
    const w=window.open("","_blank");
    w.document.write("<html><head><title>Pedido "+detalhe.id+"</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;} .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0;} label{font-size:10px;color:#94a3b8;text-transform:uppercase;display:block;margin-bottom:4px;} span{font-size:15px;font-weight:600;display:block;}</style></head><body>"+el.innerHTML+"</body></html>");
    w.document.close();w.print();
  };

  const opts=pgOpts(form.valor);
  const statusList=Object.keys(SP);

  if(detalhe)return(
    <div>
      <button onClick={()=>setDetalhe(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#64748b",fontSize:14,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Voltar</button>
      <div ref={ref} style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden",maxWidth:660}}>
        <div style={{background:"linear-gradient(135deg,#0a1628,#0d2137)",padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:2,textTransform:"uppercase"}}>Ordem de Faturamento</div><div style={{fontSize:26,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{detalhe.id}</div><div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:2}}>{fmtD(detalhe.data)}</div></div>
          <Badge label={detalhe.status} map={SP}/>
        </div>
        <div style={{padding:"24px 28px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:24}}>
            {[["Cliente",detalhe.cliente],["CPF/CNPJ",detalhe.cpfcnpj||"—"],["Telefone",detalhe.telefone||"—"],["Produto",detalhe.produto],["Quantidade",detalhe.quantidade+" un."],["Valor Total",fmt(detalhe.valor)],["Pagamento",detalhe.pagamento||"—"],["Vendedor",detalhe.vendedor]].map(([l,v])=>(
              <div key={l}><div style={{fontSize:11,color:"#94a3b8",letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>{l}</div><div style={{fontSize:14,color:"#1e293b",fontWeight:600}}>{v}</div></div>
            ))}
          </div>
          {logado.perfil==="admin"&&(
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,color:"#94a3b8",letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>Atualizar Status</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {statusList.map(s=>{const sc=SP[s];const a=detalhe.status===s;return <button key={s} onClick={()=>upS(detalhe.id,s)} style={{padding:"7px 14px",borderRadius:8,border:"2px solid "+(a?sc.dot:"#e2e8f0"),background:a?sc.bg:"#fff",color:a?sc.text:"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>{s}</button>;})}
              </div>
            </div>
          )}
          <button onClick={exportPDF} style={{background:"linear-gradient(135deg,#0284C7,#38BDF8)",border:"none",borderRadius:10,padding:"10px 20px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>🖨️ Exportar PDF</button>
        </div>
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:24}}>
        <Card icon="📋" label="Total" value={lista.length}/>
        <Card icon="💰" label="Valor Total" value={fmt(lista.reduce((s,p)=>s+Number(p.valor),0))}/>
        <Card icon="⏳" label="Em Aberto" value={lista.filter(p=>["Orcamento","Aguardando Aprovacao","Aprovado"].includes(p.status)).length} accent="#F97316"/>
        <Card icon="✅" label="Entregues" value={lista.filter(p=>p.status==="Entregue").length} accent="#22C55E"/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <select value={filtro} onChange={e=>setFiltro(e.target.value)} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:13,color:"#475569"}}><option>Todos</option>{statusList.map(s=><option key={s}>{s}</option>)}</select>
          <button onClick={load} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",cursor:"pointer"}}>🔄</button>
        </div>
        <button onClick={()=>setModal(true)} style={{background:"linear-gradient(135deg,#0284C7,#38BDF8)",border:"none",borderRadius:10,padding:"10px 20px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>+ Novo Pedido</button>
      </div>
      <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        {loading?<Spin/>:(<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><TH cols={["Ordem","Cliente","Produto","Valor","Pagamento","Vendedor","Data","Status",""]}/><tbody>{lista.length===0?<tr><td colSpan={9} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Nenhum pedido</td></tr>:lista.map(p=>(<tr key={p.id} style={{borderTop:"1px solid #f1f5f9"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><td style={{padding:"13px 16px",fontFamily:"monospace",fontSize:13,fontWeight:700,color:"#0284C7"}}>{p.id}</td><td style={{padding:"13px 16px",fontSize:13,fontWeight:600,color:"#334155",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.cliente}</td><td style={{padding:"13px 16px",fontSize:13,color:"#64748b",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.produto}</td><td style={{padding:"13px 16px",fontSize:13,fontWeight:700,color:"#0f172a"}}>{fmt(p.valor)}</td><td style={{padding:"13px 16px",fontSize:12,color:"#64748b",whiteSpace:"nowrap"}}>{p.pagamento||"—"}</td><td style={{padding:"13px 16px",fontSize:13,color:"#64748b"}}>{p.vendedor}</td><td style={{padding:"13px 16px",fontSize:12,color:"#94a3b8",whiteSpace:"nowrap"}}>{fmtD(p.data)}</td><td style={{padding:"13px 16px"}}><Badge label={p.status} map={SP}/></td><td style={{padding:"13px 16px"}}><button onClick={()=>setDetalhe(p)} style={{background:"#f1f5f9",border:"none",borderRadius:6,padding:"5px 10px",fontSize:14,cursor:"pointer"}}>👁️</button></td></tr>))}</tbody></table></div>)}
      </div>
      {modal&&(
        <Modal title="Ordem de Faturamento" sub="Novo Pedido">
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,color:"#94a3b8",letterSpacing:1.2,textTransform:"uppercase",display:"block",marginBottom:5}}>Cliente / Empresa <span style={{color:"#ef4444"}}>*</span></label>
            <select value={form.cliente} onChange={e=>selecionarCliente(e.target.value)} style={{width:"100%",background:"#f8fafc",border:"1px solid "+(erros.cliente?"#fca5a5":"#e2e8f0"),borderRadius:10,padding:"11px 14px",fontSize:14,color:form.cliente?"#1e293b":"#94a3b8"}}>
              <option value="">Selecione um cliente...</option>
              {clientes.map(c=><option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
            {erros.cliente&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>{erros.cliente}</div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <FI label="CPF / CNPJ" value={form.cpfcnpj} onChange={e=>setForm({...form,cpfcnpj:e.target.value})} placeholder="000.000.000-00" required erro={erros.cpfcnpj}/>
            <FI label="Telefone" value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} placeholder="(00) 00000-0000" required erro={erros.telefone}/>
          </div>
          <FI label="Produto" value={form.produto} onChange={e=>setForm({...form,produto:e.target.value})} required erro={erros.produto}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <FI label="Quantidade" value={form.quantidade} onChange={e=>setForm({...form,quantidade:e.target.value})} type="number" placeholder="0" required erro={erros.quantidade}/>
            <FI label="Valor (R$)" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value,pagamento:""})} type="number" placeholder="0,00" required erro={erros.valor}/>
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,color:"#94a3b8",letterSpacing:1.2,textTransform:"uppercase",display:"block",marginBottom:5}}>Forma de Pagamento <span style={{color:"#ef4444"}}>*</span></label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{opts.map(op=>(<button key={op} onClick={()=>setForm({...form,pagamento:op})} style={{padding:"7px 14px",borderRadius:8,border:"2px solid "+(form.pagamento===op?"#38BDF8":"#e2e8f0"),background:form.pagamento===op?"#EFF6FF":"#f8fafc",color:form.pagamento===op?"#0284C7":"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>{op}</button>))}</div>
            {!form.valor&&<div style={{fontSize:11,color:"#94a3b8",marginTop:5}}>Digite o valor para ver as opcoes de parcelamento</div>}
            {erros.pagamento&&<div style={{fontSize:11,color:"#ef4444",marginTop:3}}>{erros.pagamento}</div>}
          </div>
          <FS label="Status" value={form.status} onChange={e=>setForm({...form,status:e.target.value})} options={statusList}/>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <BtnSecondary onClick={()=>{setModal(false);setErros({});}}>Cancelar</BtnSecondary>
            <BtnPrimary onClick={criar} disabled={salvando}>{salvando?"Salvando...":"Criar Ordem"}</BtnPrimary>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── FINANCEIRO ───────────────────────────────────────────────────
function ModuloFinanceiro() {
  const [pedidos,setPedidos]=useState([]);
  const [loading,setLoading]=useState(true);
  const [periodo,setPeriodo]=useState("Todos");
  const meses=["Janeiro","Fevereiro","Marco","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  useEffect(()=>{db.get("pedidos","&order=created_at.desc").then(d=>{setPedidos(Array.isArray(d)?d:[]);setLoading(false);});},[]);
  const filtrados=pedidos.filter(p=>periodo==="Todos"||meses[new Date(p.data+"T12:00:00").getMonth()]===periodo);
  const tG=filtrados.reduce((s,p)=>s+Number(p.valor),0);
  const tF=filtrados.filter(p=>["Entregue","Expedido"].includes(p.status)).reduce((s,p)=>s+Number(p.valor),0);
  const tP=filtrados.filter(p=>["Orcamento","Aguardando Aprovacao","Aprovado","Em Producao"].includes(p.status)).reduce((s,p)=>s+Number(p.valor),0);
  const vends=[...new Set(pedidos.map(p=>p.vendedor))];
  const porV=vends.map(v=>({nome:v,total:filtrados.filter(p=>p.vendedor===v).reduce((s,p)=>s+Number(p.valor),0),qtd:filtrados.filter(p=>p.vendedor===v).length})).filter(v=>v.qtd>0).sort((a,b)=>b.total-a.total);
  if(loading)return <Spin/>;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:10}}>
        <h2 style={{fontSize:18,fontWeight:700,color:"#0f172a",margin:0}}>Visao Financeira</h2>
        <select value={periodo} onChange={e=>setPeriodo(e.target.value)} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#475569"}}><option>Todos</option>{meses.map(m=><option key={m}>{m}</option>)}</select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:24}}>
        <Card icon="💵" label="Total Geral" value={fmt(tG)} accent="#3B82F6"/>
        <Card icon="✅" label="Faturado" value={fmt(tF)} accent="#22C55E"/>
        <Card icon="⏳" label="A Faturar" value={fmt(tP)} accent="#F97316"/>
        <Card icon="📊" label="Pedidos" value={filtrados.length}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",padding:24}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:20}}>Por Vendedor</div>
          {porV.length===0?<div style={{color:"#94a3b8",fontSize:13}}>Sem dados</div>:porV.map((v,i)=>{const p=(tG>0?(v.total/tG)*100:0);const cores=["#38BDF8","#22c55e","#f97316","#8b5cf6","#ec4899"];return(<div key={v.nome} style={{marginBottom:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:13,color:"#334155",fontWeight:600}}>{v.nome.split(" ")[0]}</span><span style={{fontSize:13,color:"#0f172a",fontWeight:700}}>{fmt(v.total)}</span></div><div style={{background:"#f1f5f9",borderRadius:4,height:6}}><div style={{width:p+"%",height:"100%",background:cores[i%5],borderRadius:4}}/></div><div style={{fontSize:11,color:"#94a3b8",marginTop:3}}>{v.qtd} pedido{v.qtd!==1?"s":""} · {p.toFixed(1)}%</div></div>);})}
        </div>
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",padding:24}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:20}}>Por Status</div>
          {Object.keys(SP).map(s=>{const t=filtrados.filter(p=>p.status===s).reduce((sum,p)=>sum+Number(p.valor),0);const q=filtrados.filter(p=>p.status===s).length;if(q===0)return null;return(<div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f1f5f9"}}><div style={{display:"flex",alignItems:"center",gap:10}}><Badge label={s} map={SP}/><span style={{fontSize:12,color:"#94a3b8"}}>{q} pedido{q!==1?"s":""}</span></div><span style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>{fmt(t)}</span></div>);})}
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden"}}><div style={{padding:"16px 22px",borderBottom:"1px solid #f1f5f9",fontSize:13,fontWeight:700,color:"#0f172a"}}>Extrato</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><TH cols={["Ordem","Cliente","Vendedor","Data","Valor","Status"]}/><tbody>{filtrados.map(p=>(<tr key={p.id} style={{borderTop:"1px solid #f1f5f9"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><td style={{padding:"12px 16px",fontFamily:"monospace",fontSize:13,fontWeight:700,color:"#0284C7"}}>{p.id}</td><td style={{padding:"12px 16px",fontSize:13,color:"#334155"}}>{p.cliente}</td><td style={{padding:"12px 16px",fontSize:13,color:"#64748b"}}>{p.vendedor}</td><td style={{padding:"12px 16px",fontSize:12,color:"#94a3b8"}}>{fmtD(p.data)}</td><td style={{padding:"12px 16px",fontSize:14,fontWeight:700}}>{fmt(p.valor)}</td><td style={{padding:"12px 16px"}}><Badge label={p.status} map={SP}/></td></tr>))}</tbody></table></div></div>
    </div>
  );
}

// ─── FLUXO DE CAIXA ───────────────────────────────────────────────
function ModuloFluxo() {
  const [pedidos,setPedidos]=useState([]);
  const [lancs,setLancs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [mes,setMes]=useState(new Date().getMonth());
  const [ano,setAno]=useState(new Date().getFullYear());
  const [form,setForm]=useState({descricao:"",valor:"",tipo:"receita",categoria:"",data:hoje()});
  const meses=["Janeiro","Fevereiro","Marco","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  useEffect(()=>{Promise.all([db.get("pedidos","&order=created_at.desc"),db.get("fluxo_caixa","&order=data.desc").catch(()=>[])]).then(([p,f])=>{setPedidos(Array.isArray(p)?p:[]);setLancs(Array.isArray(f)?f:[]);setLoading(false);});},[]);
  const entradas=pedidos.filter(p=>["Entregue","Expedido"].includes(p.status)).filter(p=>{const d=new Date(p.data+"T12:00:00");return d.getMonth()===mes&&d.getFullYear()===ano;}).map(p=>({id:"p_"+p.id,descricao:"Pedido "+p.id+" - "+p.cliente,valor:Number(p.valor),tipo:"receita",data:p.data,categoria:"Vendas"}));
  const lMes=lancs.filter(l=>{const d=new Date(l.data+"T12:00:00");return d.getMonth()===mes&&d.getFullYear()===ano;});
  const todos=[...entradas,...lMes].sort((a,b)=>new Date(b.data)-new Date(a.data));
  const tR=todos.filter(l=>l.tipo==="receita").reduce((s,l)=>s+Number(l.valor),0);
  const tD=todos.filter(l=>l.tipo==="despesa").reduce((s,l)=>s+Number(l.valor),0);
  const saldo=tR-tD;
  const salvar=async()=>{if(!form.descricao||!form.valor)return;const ni={...form,id:"l_"+Date.now(),valor:Number(form.valor)};try{await db.insert("fluxo_caixa",{...form,valor:Number(form.valor)});}catch{}setLancs(prev=>[...prev,ni]);setForm({descricao:"",valor:"",tipo:"receita",categoria:"",data:hoje()});setModal(false);};
  if(loading)return <Spin/>;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:10}}>
        <h2 style={{fontSize:18,fontWeight:700,color:"#0f172a",margin:0}}>Fluxo de Caixa</h2>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <select value={mes} onChange={e=>setMes(Number(e.target.value))} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:13,color:"#475569"}}>{meses.map((m,i)=><option key={m} value={i}>{m}</option>)}</select>
          <select value={ano} onChange={e=>setAno(Number(e.target.value))} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",fontSize:13,color:"#475569"}}>{[2024,2025,2026,2027].map(a=><option key={a}>{a}</option>)}</select>
          <button onClick={()=>setModal(true)} style={{background:"linear-gradient(135deg,#0284C7,#38BDF8)",border:"none",borderRadius:10,padding:"10px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>+ Lancamento</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:24}}>
        <Card icon="📈" label="Total Receitas" value={fmt(tR)} accent="#22C55E"/>
        <Card icon="📉" label="Total Despesas" value={fmt(tD)} accent="#EF4444"/>
        <div style={{background:saldo>=0?"#F0FDF4":"#FEF2F2",borderRadius:14,border:"1px solid "+(saldo>=0?"#86EFAC":"#FECACA"),padding:"20px 22px",borderLeft:"4px solid "+(saldo>=0?"#22C55E":"#EF4444")}}><div style={{fontSize:11,color:"#94a3b8",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Saldo do Mes</div><div style={{fontSize:22,fontWeight:700,color:saldo>=0?"#15803D":"#DC2626"}}>{fmt(saldo)}</div><div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{saldo>=0?"Positivo":"Negativo"}</div></div>
        <Card icon="📋" label="Movimentacoes" value={todos.length}/>
      </div>
      <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden"}}><div style={{padding:"16px 22px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between"}}><div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>Movimentacoes - {meses[mes]} {ano}</div><div style={{fontSize:12,color:"#94a3b8"}}>{todos.length} registros</div></div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><TH cols={["Data","Descricao","Categoria","Tipo","Valor"]}/><tbody>{todos.length===0?<tr><td colSpan={5} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Nenhuma movimentacao</td></tr>:todos.map((l,i)=>(<tr key={i} style={{borderTop:"1px solid #f1f5f9"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><td style={{padding:"12px 16px",fontSize:12,color:"#94a3b8",whiteSpace:"nowrap"}}>{fmtD(l.data)}</td><td style={{padding:"12px 16px",fontSize:13,color:"#334155",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.descricao}</td><td style={{padding:"12px 16px",fontSize:12,color:"#64748b"}}>{l.categoria||"—"}</td><td style={{padding:"12px 16px"}}><span style={{background:l.tipo==="receita"?"#F0FDF4":"#FEF2F2",color:l.tipo==="receita"?"#15803D":"#DC2626",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{l.tipo==="receita"?"Receita":"Despesa"}</span></td><td style={{padding:"12px 16px",fontSize:14,fontWeight:700,color:l.tipo==="receita"?"#15803D":"#DC2626"}}>{l.tipo==="receita"?"+":"-"}{fmt(l.valor)}</td></tr>))}</tbody></table></div></div>
      {modal&&(<Modal title="Novo Lancamento" sub="Fluxo de Caixa"><div style={{display:"flex",gap:10,marginBottom:16}}>{["receita","despesa"].map(t=>(<button key={t} onClick={()=>setForm({...form,tipo:t})} style={{flex:1,padding:12,borderRadius:10,border:"2px solid "+(form.tipo===t?(t==="receita"?"#22c55e":"#ef4444"):"#e2e8f0"),background:form.tipo===t?(t==="receita"?"#F0FDF4":"#FEF2F2"):"#f8fafc",color:form.tipo===t?(t==="receita"?"#15803D":"#DC2626"):"#64748b",cursor:"pointer",fontSize:14,fontWeight:700}}>{t==="receita"?"Receita":"Despesa"}</button>))}</div><FI label="Descricao" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} placeholder="Ex: Aluguel, Material..." required/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FI label="Valor (R$)" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})} type="number" placeholder="0,00" required/><FI label="Data" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} type="date" required/></div><FI label="Categoria" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} placeholder="Ex: Operacional, Vendas..."/><div style={{display:"flex",gap:10,marginTop:8}}><BtnSecondary onClick={()=>setModal(false)}>Cancelar</BtnSecondary><button onClick={salvar} style={{flex:2,background:form.tipo==="receita"?"linear-gradient(135deg,#22c55e,#16a34a)":"linear-gradient(135deg,#ef4444,#dc2626)",border:"none",borderRadius:10,padding:13,fontSize:14,color:"#fff",cursor:"pointer",fontWeight:700}}>Registrar {form.tipo==="receita"?"Receita":"Despesa"}</button></div></Modal>)}
    </div>
  );
}

// ─── ESTOQUE ──────────────────────────────────────────────────────
function ModuloEstoque() {
  const [estoque,setEstoque]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null);
  const [itemSel,setItemSel]=useState(null);
  const [salvando,setSalvando]=useState(false);
  const [form,setForm]=useState({nome:"",categoria:"",unidade:"",estoque:"",minimo:"",custo:"",preco:""});
  const [mov,setMov]=useState({tipo:"Entrada",quantidade:"",obs:""});
  const load=async()=>{const d=await db.get("estoque");setEstoque(Array.isArray(d)?d:[]);setLoading(false);};
  useEffect(()=>{load();},[]);
  const criar=async()=>{if(!form.nome)return;setSalvando(true);const id="EST-"+String(estoque.length+1).padStart(3,"0");await db.insert("estoque",{id,...form,estoque:Number(form.estoque||0),minimo:Number(form.minimo||0),custo:Number(form.custo||0),preco:Number(form.preco||0)});setForm({nome:"",categoria:"",unidade:"",estoque:"",minimo:"",custo:"",preco:""});setModal(null);setSalvando(false);load();};
  const mover=async()=>{if(!mov.quantidade)return;setSalvando(true);const q=Number(mov.quantidade);const ne=mov.tipo==="Entrada"?itemSel.estoque+q:Math.max(0,itemSel.estoque-q);await db.update("estoque",itemSel.id,{estoque:ne});setMov({tipo:"Entrada",quantidade:"",obs:""});setModal(null);setItemSel(null);setSalvando(false);load();};
  const criticos=estoque.filter(e=>e.estoque<=e.minimo);
  return(
    <div>
      {criticos.length>0&&<div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}>⚠️</span><div><div style={{fontSize:13,fontWeight:700,color:"#C2410C"}}>Atencao: {criticos.length} item{criticos.length!==1?"s":""} abaixo do minimo</div><div style={{fontSize:12,color:"#9A3412"}}>{criticos.map(e=>e.nome).join(", ")}</div></div></div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:24}}>
        <Card icon="📦" label="Itens" value={estoque.length}/>
        <Card icon="⚠️" label="Criticos" value={criticos.length} accent="#F97316"/>
        <Card icon="💰" label="Valor Estoque" value={fmt(estoque.reduce((s,e)=>s+(e.estoque*e.custo),0))} accent="#3B82F6"/>
        <Card icon="🏷️" label="Valor Venda" value={fmt(estoque.reduce((s,e)=>s+(e.estoque*e.preco),0))} accent="#22C55E"/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
        <button onClick={load} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",cursor:"pointer"}}>🔄</button>
        <button onClick={()=>setModal("novo")} style={{background:"linear-gradient(135deg,#0284C7,#38BDF8)",border:"none",borderRadius:10,padding:"10px 20px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>+ Novo Item</button>
      </div>
      <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        {loading?<Spin/>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><TH cols={["Codigo","Nome","Categoria","Unid.","Estoque","Minimo","Custo","Preco","Situacao",""]}/><tbody>{estoque.length===0?<tr><td colSpan={10} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Nenhum item</td></tr>:estoque.map(e=>{const c=e.estoque<=e.minimo;return(<tr key={e.id} style={{borderTop:"1px solid #f1f5f9"}} onMouseEnter={ev=>ev.currentTarget.style.background="#f8fafc"} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}><td style={{padding:"12px 16px",fontFamily:"monospace",fontSize:12,color:"#64748b"}}>{e.id}</td><td style={{padding:"12px 16px",fontSize:13,fontWeight:600,color:"#1e293b"}}>{e.nome}</td><td style={{padding:"12px 16px",fontSize:13,color:"#64748b"}}>{e.categoria}</td><td style={{padding:"12px 16px",fontSize:13,color:"#64748b"}}>{e.unidade}</td><td style={{padding:"12px 16px",fontSize:14,fontWeight:700,color:c?"#C2410C":"#0f172a"}}>{e.estoque}</td><td style={{padding:"12px 16px",fontSize:13,color:"#94a3b8"}}>{e.minimo}</td><td style={{padding:"12px 16px",fontSize:13,color:"#64748b"}}>{fmt(e.custo)}</td><td style={{padding:"12px 16px",fontSize:13,color:"#64748b"}}>{fmt(e.preco)}</td><td style={{padding:"12px 16px"}}><span style={{background:c?"#FFF7ED":"#F0FDF4",color:c?"#C2410C":"#15803D",padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:600}}>{c?"Critico":"OK"}</span></td><td style={{padding:"12px 16px"}}><button onClick={()=>{setItemSel(e);setModal("mov");}} style={{background:"#f1f5f9",border:"none",borderRadius:6,padding:"5px 10px",fontSize:12,color:"#475569",cursor:"pointer",fontWeight:600}}>Movimentar</button></td></tr>);})}</tbody></table></div>}
      </div>
      {modal==="novo"&&<Modal title="Novo Item" sub="Cadastrar"><FI label="Nome do Produto" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Ex: Filamento PLA 1kg"/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FI label="Categoria" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}/><FI label="Unidade" value={form.unidade} onChange={e=>setForm({...form,unidade:e.target.value})}/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FI label="Qtd Inicial" value={form.estoque} onChange={e=>setForm({...form,estoque:e.target.value})} type="number"/><FI label="Minimo" value={form.minimo} onChange={e=>setForm({...form,minimo:e.target.value})} type="number"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><FI label="Custo R$" value={form.custo} onChange={e=>setForm({...form,custo:e.target.value})} type="number"/><FI label="Preco R$" value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})} type="number"/></div><div style={{display:"flex",gap:10,marginTop:8}}><BtnSecondary onClick={()=>setModal(null)}>Cancelar</BtnSecondary><BtnPrimary onClick={criar} disabled={salvando}>{salvando?"Salvando...":"Cadastrar"}</BtnPrimary></div></Modal>}
      {modal==="mov"&&itemSel&&<Modal title={itemSel.nome} sub="Movimentacao"><div style={{display:"flex",gap:10,marginBottom:16}}>{["Entrada","Saida"].map(t=>(<button key={t} onClick={()=>setMov({...mov,tipo:t})} style={{flex:1,padding:10,borderRadius:10,border:"2px solid "+(mov.tipo===t?(t==="Entrada"?"#22c55e":"#f97316"):"#e2e8f0"),background:mov.tipo===t?(t==="Entrada"?"#F0FDF4":"#FFF7ED"):"#f8fafc",color:mov.tipo===t?(t==="Entrada"?"#15803D":"#C2410C"):"#64748b",cursor:"pointer",fontSize:13,fontWeight:700}}>{t==="Entrada"?"Entrada":"Saida"}</button>))}</div><FI label="Quantidade" value={mov.quantidade} onChange={e=>setMov({...mov,quantidade:e.target.value})} type="number"/><FI label="Observacao" value={mov.obs} onChange={e=>setMov({...mov,obs:e.target.value})}/><div style={{display:"flex",gap:10}}><BtnSecondary onClick={()=>{setModal(null);setItemSel(null);}}>Cancelar</BtnSecondary><button onClick={mover} disabled={salvando} style={{flex:2,background:mov.tipo==="Entrada"?"linear-gradient(135deg,#22c55e,#16a34a)":"linear-gradient(135deg,#f97316,#ea580c)",border:"none",borderRadius:10,padding:13,fontSize:14,color:"#fff",cursor:"pointer",fontWeight:700}}>{salvando?"Salvando...":mov.tipo==="Entrada"?"Confirmar Entrada":"Confirmar Saida"}</button></div></Modal>}
    </div>
  );
}

// ─── PRODUCAO ─────────────────────────────────────────────────────
function ModuloProducao() {
  const [prod,setProd]=useState([]);
  const [peds,setPeds]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [salvando,setSalvando]=useState(false);
  const [form,setForm]=useState({pedido_ref:"",cliente:"",produto:"",quantidade:""});
  const load=async()=>{const [p,pe]=await Promise.all([db.get("producao","&order=created_at.desc"),db.get("pedidos","&order=created_at.desc")]);setProd(Array.isArray(p)?p:[]);setPeds(Array.isArray(pe)?pe:[]);setLoading(false);};
  useEffect(()=>{load();},[]);
  const criar=async()=>{if(!form.cliente||!form.produto||!form.quantidade)return;setSalvando(true);const id="PR-"+String(prod.length+1).padStart(4,"0");await db.insert("producao",{id,...form,quantidade:Number(form.quantidade),data_inicio:hoje(),status:"Aguardando"});setForm({pedido_ref:"",cliente:"",produto:"",quantidade:""});setModal(false);setSalvando(false);load();};
  const upS=async(id,status)=>{await db.update("producao",id,{status});load();};
  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:24}}>
        <Card icon="🏭" label="Total Ordens" value={prod.length}/>
        <Card icon="⏳" label="Pendentes" value={prod.filter(p=>["Aguardando","Em producao"].includes(p.status)).length} accent="#F97316"/>
        <Card icon="🔧" label="Em Producao" value={prod.filter(p=>p.status==="Em producao").length} accent="#3B82F6"/>
        <Card icon="✅" label="Concluidos" value={prod.filter(p=>["Pronto","Despachado"].includes(p.status)).length} accent="#22C55E"/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
        <button onClick={load} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"8px 12px",cursor:"pointer"}}>🔄</button>
        <button onClick={()=>setModal(true)} style={{background:"linear-gradient(135deg,#0284C7,#38BDF8)",border:"none",borderRadius:10,padding:"10px 20px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>+ Nova Ordem</button>
      </div>
      <div style={{background:"#fff",borderRadius:16,border:"1px solid #e2e8f0",overflow:"hidden"}}>
        {loading?<Spin/>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><TH cols={["Ordem","Ref.","Cliente","Produto","Qtd","Inicio","Status","Acoes"]}/><tbody>{prod.length===0?<tr><td colSpan={8} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Nenhuma ordem</td></tr>:prod.map(p=>(<tr key={p.id} style={{borderTop:"1px solid #f1f5f9"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><td style={{padding:"12px 16px",fontFamily:"monospace",fontSize:13,fontWeight:700,color:"#0284C7"}}>{p.id}</td><td style={{padding:"12px 16px",fontFamily:"monospace",fontSize:12,color:"#64748b"}}>{p.pedido_ref||"—"}</td><td style={{padding:"12px 16px",fontSize:13,fontWeight:600,color:"#334155"}}>{p.cliente}</td><td style={{padding:"12px 16px",fontSize:13,color:"#64748b",maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.produto}</td><td style={{padding:"12px 16px",fontSize:13,fontWeight:700}}>{p.quantidade}</td><td style={{padding:"12px 16px",fontSize:12,color:"#94a3b8"}}>{fmtD(p.data_inicio)}</td><td style={{padding:"12px 16px"}}><Badge label={p.status} map={SPROD}/></td><td style={{padding:"12px 16px"}}><div style={{display:"flex",gap:6}}>{p.status==="Aguardando"&&<button onClick={()=>upS(p.id,"Em producao")} style={{background:"#EFF6FF",border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,color:"#1D4ED8",cursor:"pointer",fontWeight:600}}>Iniciar</button>}{p.status==="Em producao"&&<button onClick={()=>upS(p.id,"Pronto")} style={{background:"#F0FDF4",border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,color:"#15803D",cursor:"pointer",fontWeight:600}}>Pronto</button>}{p.status==="Pronto"&&<button onClick={()=>upS(p.id,"Despachado")} style={{background:"#F5F3FF",border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,color:"#6D28D9",cursor:"pointer",fontWeight:600}}>Despachar</button>}{p.status==="Despachado"&&<span style={{fontSize:12,color:"#94a3b8"}}>Concluido</span>}</div></td></tr>))}</tbody></table></div>}
      </div>
      {modal&&<Modal title="Nova Ordem de Producao" sub="Producao"><div style={{marginBottom:16}}><label style={{fontSize:11,color:"#94a3b8",letterSpacing:1.2,textTransform:"uppercase",display:"block",marginBottom:6}}>Vincular Pedido (opcional)</label><select value={form.pedido_ref} onChange={e=>{const p=peds.find(x=>x.id===e.target.value);setForm({...form,pedido_ref:e.target.value,cliente:p?.cliente||form.cliente,produto:p?.produto||form.produto,quantidade:p?String(p.quantidade):form.quantidade});}} style={{width:"100%",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"11px 14px",fontSize:14,color:"#1e293b"}}><option value="">Sem vinculo</option>{peds.filter(p=>["Aprovado","Em Producao"].includes(p.status)).map(p=><option key={p.id} value={p.id}>{p.id} - {p.cliente}</option>)}</select></div><FI label="Cliente" value={form.cliente} onChange={e=>setForm({...form,cliente:e.target.value})}/><FI label="Produto" value={form.produto} onChange={e=>setForm({...form,produto:e.target.value})}/><FI label="Quantidade" value={form.quantidade} onChange={e=>setForm({...form,quantidade:e.target.value})} type="number"/><div style={{display:"flex",gap:10,marginTop:8}}><BtnSecondary onClick={()=>setModal(false)}>Cancelar</BtnSecondary><BtnPrimary onClick={criar} disabled={salvando}>{salvando?"Salvando...":"Criar Ordem"}</BtnPrimary></div></Modal>}
    </div>
  );
}

// ─── CALCULADORA (INALTERADA) ─────────────────────────────────────
const FILS={PLA:{fator:0.140},PETG:{fator:0.125},TPU:{fator:0.160}};
const FV={varejo:3,atacado:2.2};
function ModuloCalc() {
  const [form,setForm]=useState({produto:"",peso:"",filamento:"",venda:""});
  const [resultado,setResultado]=useState(null);
  const [erro,setErro]=useState("");
  const fmtR=(v)=>"R$ "+Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
  const calc=()=>{if(!form.produto){setErro("Preencha o nome do produto.");return;}if(!form.peso||parseFloat(form.peso)<=0){setErro("Preencha o peso.");return;}if(!form.filamento){setErro("Selecione o filamento.");return;}if(!form.venda){setErro("Selecione o tipo de venda.");return;}setErro("");const preco=parseFloat(form.peso)*FILS[form.filamento].fator*FV[form.venda];setResultado({preco,produto:form.produto,filamento:form.filamento,venda:form.venda,peso:form.peso});};
  const limpar=()=>{setForm({produto:"",peso:"",filamento:"",venda:""});setResultado(null);setErro("");};
  const CO=({grupo,valor,label,icon})=>{const ativo=form[grupo]===valor;return(<div onClick={()=>setForm({...form,[grupo]:valor})} style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:10,border:"2px solid "+(ativo?"#38BDF8":"#e2e8f0"),background:ativo?"#EFF6FF":"#f8fafc",cursor:"pointer"}}><div style={{width:20,height:20,borderRadius:"50%",border:"2px solid "+(ativo?"#38BDF8":"#cbd5e1"),background:ativo?"#38BDF8":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{ativo&&<div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}</div><div style={{fontSize:13,fontWeight:700,color:ativo?"#0284C7":"#334155"}}>{icon} {label}</div></div>);};
  return(
    <div style={{maxWidth:680,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><div><div style={{fontSize:18,fontWeight:700,color:"#0f172a"}}>Calculadora de Precificacao</div><div style={{fontSize:13,color:"#64748b",marginTop:2}}>Calcule o preco ideal dos seus produtos 3D</div></div><button onClick={limpar} style={{background:"#f1f5f9",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,color:"#475569",cursor:"pointer",fontWeight:600}}>Limpar</button></div>
      <div style={{background:"#fff",borderRadius:20,border:"1px solid #e2e8f0",padding:28,marginBottom:20}}>
        <FI label="Nome do Produto" value={form.produto} onChange={e=>setForm({...form,produto:e.target.value})} placeholder="Ex: Boneco Homem Aranha" required/>
        <FI label="Peso Estimado (gramas)" value={form.peso} onChange={e=>setForm({...form,peso:e.target.value})} type="number" placeholder="Ex: 85" required/>
        <div style={{marginBottom:20}}><label style={{fontSize:11,color:"#94a3b8",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:8,fontWeight:600}}>Tipo de Filamento <span style={{color:"#ef4444"}}>*</span></label><div style={{display:"flex",gap:10}}><CO grupo="filamento" valor="PLA" label="PLA" icon="🟢"/><CO grupo="filamento" valor="PETG" label="PETG" icon="🔵"/><CO grupo="filamento" valor="TPU" label="TPU" icon="🟠"/></div></div>
        <div style={{marginBottom:20}}><label style={{fontSize:11,color:"#94a3b8",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:8,fontWeight:600}}>Tipo de Venda <span style={{color:"#ef4444"}}>*</span></label><div style={{display:"flex",gap:10}}><CO grupo="venda" valor="varejo" label="Varejo" icon="🛍️"/><CO grupo="venda" valor="atacado" label="Atacado" icon="📦"/></div></div>
        {erro&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#DC2626"}}>⚠️ {erro}</div>}
        <button onClick={calc} style={{width:"100%",background:"linear-gradient(135deg,#0284C7,#38BDF8)",border:"none",borderRadius:12,padding:15,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer"}}>Calcular Preco de Venda</button>
      </div>
      {resultado&&<div style={{background:"linear-gradient(135deg,#0a1628,#0d2137)",borderRadius:20,padding:28}}><div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Resultado</div><div style={{fontSize:20,fontWeight:700,color:"#fff",marginBottom:20}}>{resultado.produto}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:24}}>{[["Peso",resultado.peso+"g"],["Filamento",resultado.filamento],["Modalidade",resultado.venda==="varejo"?"Varejo":"Atacado"]].map(([l,v])=>(<div key={l} style={{background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{l}</div><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{v}</div></div>))}</div><div style={{background:"rgba(56,189,248,0.15)",border:"1px solid rgba(56,189,248,0.3)",borderRadius:14,padding:"20px 24px",textAlign:"center"}}><div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:8}}>Preco de Venda Sugerido</div><div style={{fontSize:42,fontWeight:700,color:"#38BDF8"}}>{fmtR(resultado.preco)}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:6}}>Frete por conta do cliente</div></div></div>}
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────
export default function App() {
  const [logado,setLogado]=useState(null);
  const [aba,setAba]=useState("dashboard");
  const [lf,setLf]=useState({usuario:"",senha:""});
  const [le,setLe]=useState("");
  const [car,setCar]=useState(false);

  const login=async()=>{setCar(true);setLe("");try{const d=await db.get("usuarios","&usuario=eq."+lf.usuario+"&senha=eq."+lf.senha);if(Array.isArray(d)&&d.length>0){setLogado(d[0]);}else setLe("Usuario ou senha incorretos.");}catch{setLe("Erro de conexao.");}setCar(false);};

  const ABAS=[
    {id:"dashboard",label:"Dashboard",icon:"📊",admin:true},
    {id:"clientes",label:"Clientes",icon:"👥",admin:true},
    {id:"pedidos",label:"Pedidos",icon:"📋"},
    {id:"financeiro",label:"Financeiro",icon:"💰",admin:true},
    {id:"fluxo",label:"Fluxo de Caixa",icon:"💳",admin:true},
    {id:"estoque",label:"Estoque",icon:"📦",admin:true},
    {id:"producao",label:"Producao",icon:"🏭",admin:true},
    {id:"calculadora",label:"Calculadora",icon:"🧮"},
  ];

  if(!logado)return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#020b18 0%,#0a1628 50%,#020b18 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Georgia',serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 20% 50%,rgba(56,189,248,0.08) 0%,transparent 50%)"}}/>
      <div style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"48px 44px",width:360,position:"relative"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><LogoNX size={64}/></div>
          <div style={{fontSize:24,fontWeight:700,color:"#fff"}}>NexFarm<span style={{color:"#38BDF8"}}>3D</span></div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:4,letterSpacing:2.5,textTransform:"uppercase",fontFamily:"monospace"}}>Sistema Interno</div>
        </div>
        <div style={{marginBottom:14}}><label style={{fontSize:11,color:"rgba(255,255,255,0.45)",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Usuario</label><input value={lf.usuario} onChange={e=>setLf({...lf,usuario:e.target.value})} onKeyDown={e=>e.key==="Enter"&&login()} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"12px 14px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}} placeholder="seu.usuario"/></div>
        <div style={{marginBottom:22}}><label style={{fontSize:11,color:"rgba(255,255,255,0.45)",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:6}}>Senha</label><input type="password" value={lf.senha} onChange={e=>setLf({...lf,senha:e.target.value})} onKeyDown={e=>e.key==="Enter"&&login()} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"12px 14px",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box"}} placeholder="••••••••"/></div>
        {le&&<div style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"10px 12px",color:"#fca5a5",fontSize:13,marginBottom:14}}>{le}</div>}
        <button onClick={login} disabled={car} style={{width:"100%",background:"linear-gradient(135deg,#0284C7,#38BDF8)",border:"none",borderRadius:10,padding:14,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {car?<><div style={{width:18,height:18,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Entrando...</>:"Entrar"}
        </button>
      </div>
    </div>
  );

  const abasFilt=ABAS.filter(a=>!a.admin||logado.perfil==="admin");
  return(
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Georgia',serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <header style={{background:"#0a1628",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:60,position:"sticky",top:0,zIndex:50,borderBottom:"1px solid rgba(56,189,248,0.15)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><LogoNX size={34}/><div><span style={{color:"#fff",fontSize:15,fontWeight:700}}>NexFarm</span><span style={{color:"#38BDF8",fontSize:15,fontWeight:700}}>3D</span></div></div>
        <nav style={{display:"flex",gap:2,flexWrap:"wrap"}}>
          {abasFilt.map(a=>(<button key={a.id} onClick={()=>setAba(a.id)} style={{background:aba===a.id?"rgba(56,189,248,0.15)":"transparent",border:aba===a.id?"1px solid rgba(56,189,248,0.3)":"1px solid transparent",borderRadius:8,padding:"6px 12px",color:aba===a.id?"#38BDF8":"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:5,fontWeight:aba===a.id?700:400}}>{a.icon} {a.label}</button>))}
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{textAlign:"right"}}><div style={{color:"#fff",fontSize:12,fontWeight:600}}>{logado.nome.split(" ")[0]}</div><div style={{color:"rgba(255,255,255,0.35)",fontSize:10,textTransform:"capitalize"}}>{logado.perfil}</div></div><button onClick={()=>setLogado(null)} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,padding:"5px 12px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:11}}>Sair</button></div>
      </header>
      <main style={{maxWidth:1200,margin:"0 auto",padding:"28px 20px"}}>
        {aba==="dashboard"&&<ModuloDashboard setAba={setAba}/>}
        {aba==="clientes"&&<ModuloClientes/>}
        {aba==="pedidos"&&<ModuloPedidos logado={logado}/>}
        {aba==="financeiro"&&<ModuloFinanceiro/>}
        {aba==="fluxo"&&<ModuloFluxo/>}
        {aba==="estoque"&&<ModuloEstoque/>}
        {aba==="producao"&&<ModuloProducao/>}
        {aba==="calculadora"&&<ModuloCalc/>}
      </main>
    </div>
  );
}
