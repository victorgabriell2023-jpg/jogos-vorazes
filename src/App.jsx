import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, Flag, Swords, Settings, Plus, Search, Bird, ChevronRight, Trash2 } from 'lucide-react';

function readSaved(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function EditableValues({ title, values = {}, onChange }) {
  const entries = Object.entries(values || {});
  const add = () => onChange({ ...values, [`Novo campo ${entries.length + 1}`]: '' });
  const rename = (oldKey, newKey, value) => {
    const next = { ...values };
    delete next[oldKey];
    next[newKey || oldKey] = value;
    onChange(next);
  };
  const remove = key => {
    const next = { ...values };
    delete next[key];
    onChange(next);
  };
  return <div className="custom-section">
    <div className="custom-heading"><h4>{title}</h4><button type="button" className="text-button" onClick={add}><Plus size={14}/> Adicionar</button></div>
    {entries.length === 0 && <p className="muted">Nenhum item cadastrado.</p>}
    {entries.map(([key, value], index) => <div className="custom-row" key={key + index}>
      <input aria-label={`Nome do campo de ${title}`} value={key} onChange={e => rename(key, e.target.value, value)} />
      <input aria-label={`Valor de ${key}`} value={value} onChange={e => onChange({ ...values, [key]: e.target.value })} placeholder="Valor" />
      <button type="button" className="icon-button" onClick={() => remove(key)} aria-label="Excluir campo"><Trash2 size={14}/></button>
    </div>)}
  </div>;
}


function StatusTracks({ tracks = [], onChange }) {
  const update = (index, patch) => onChange(tracks.map((track, i) => i === index ? { ...track, ...patch } : track));
  return <div className="custom-section">
    <div className="custom-heading"><h4>Marcadores de status</h4><button type="button" className="text-button" onClick={() => onChange([...tracks, { id: Date.now(), name: 'Novo marcador', current: 0, max: 10 }])}><Plus size={14}/> Adicionar</button></div>
    <p className="muted">Marcadores genéricos e editáveis. Defina nomes e limites conforme as regras da mesa.</p>
    {tracks.map((track, index) => <div className="track-row" key={track.id || index}>
      <input aria-label="Nome do marcador" value={track.name} onChange={e => update(index, { name: e.target.value })}/>
      <label>Atual<input type="number" value={track.current} onChange={e => update(index, { current: e.target.value })}/></label>
      <label>Máximo<input type="number" value={track.max} onChange={e => update(index, { max: e.target.value })}/></label>
      <button type="button" className="icon-button" onClick={() => onChange(tracks.filter((_, i) => i !== index))} aria-label="Excluir marcador"><Trash2 size={14}/></button>
    </div>)}
  </div>;
}

function EditableItems({ title, items = [], onChange }) {
  const update = (index, value) => onChange(items.map((item, i) => i === index ? value : item));
  return <div className="custom-section">
    <div className="custom-heading"><h4>{title}</h4><button type="button" className="text-button" onClick={() => onChange([...items, ''])}><Plus size={14}/> Adicionar</button></div>
    {items.length === 0 && <p className="muted">Nenhum item cadastrado.</p>}
    {items.map((item, index) => <div className="custom-row single" key={index}>
      <input value={item} onChange={e => update(index, e.target.value)} placeholder={`Novo item de ${title.toLowerCase()}`} />
      <button type="button" className="icon-button" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Excluir item"><Trash2 size={14}/></button>
    </div>)}
  </div>;
}
const nav = [
  ['Visão geral', 'overview', Flag], ['Personagens', 'characters', Users],
  ['Campanhas', 'campaigns', BookOpen], ['Jogos', 'games', Swords],
  ['Arena', 'arena', Bird], ['Regras', 'rules', BookOpen], ['Configurações', 'settings', Settings]
];

export default function App() {
  const [page, setPage] = useState('overview');
  const [characters, setCharacters] = useState(() => readSaved('hv-characters'));
  const [campaigns, setCampaigns] = useState(() => readSaved('hv-campaigns'));
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  useEffect(() => localStorage.setItem('hv-characters', JSON.stringify(characters)), [characters]);
  useEffect(() => localStorage.setItem('hv-campaigns', JSON.stringify(campaigns)), [campaigns]);
  const active = characters.find(c => c.id === selected);
  const filtered = useMemo(() => characters.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [characters, search]);
  const updateCharacter = patch => setCharacters(items => items.map(c => c.id === selected ? { ...c, ...patch } : c));
  const addCharacter = () => {
    const c = { id: Date.now(), name: 'Novo tributo', district: '', age: '', story: '', image: '', stats: {}, skills: {}, inventory: [], conditions: [], tracks: [] };
    setCharacters(items => [...items, c]); setSelected(c.id); setPage('characters');
  };
  const addCampaign = () => setCampaigns(items => [...items, { id: Date.now(), name: 'Nova campanha', description: '', characterIds: [] }]);
  const updateCampaign = (id, patch) => setCampaigns(items => items.map(c => c.id === id ? { ...c, ...patch } : c));
  const title = nav.find(n => n[1] === page)?.[0] || 'Visão geral';

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="seal"><Bird size={25}/></div><div><span>ARQUIVOS DA CAPITAL</span><strong>JOGOS VORAZES</strong></div></div>
      <div className="season-label">COMPANION DE RPG</div>
      <nav>{nav.map(([label, key, Icon]) => <button key={key} className={page === key ? 'nav-item active' : 'nav-item'} onClick={() => { setPage(key); setSelected(null); }}><Icon size={17}/>{label}<ChevronRight size={14}/></button>)}</nav>
      <div className="sidebar-bottom"><span>QUE A SORTE ESTEJA</span><b>SEMPRE A SEU FAVOR.</b><small>VERSÃO 0.1 · EM DESENVOLVIMENTO</small></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><span className="eyebrow">PANEM / REGISTRO CENTRAL</span><h1>{active ? active.name : title}</h1></div><div className="top-actions"><span className="status-dot"/> DADOS SALVOS LOCALMENTE</div></header>
      {page === 'overview' && <section className="content">
        <div className="hero"><div className="hero-copy"><span className="eyebrow">O REGISTRO COMEÇA AQUI</span><h2>Que os jogos<br/><em>comecem.</em></h2><p>Organize seus tributos, campanhas e sessões em um só lugar. Este espaço será moldado pelo sistema de regras da sua mesa.</p><button className="primary" onClick={addCharacter}><Plus size={16}/> Criar personagem</button></div><div className="mock-seal"><Bird size={116}/><span>CAPITÓLIO</span></div></div>
        <div className="stats-row"><div className="stat-card"><span>TRIBUTOS REGISTRADOS</span><strong>{characters.length}</strong><small>Personagens cadastrados</small></div><div className="stat-card"><span>CAMPANHAS</span><strong>{campaigns.length}</strong><small>Histórias em andamento</small></div><div className="stat-card"><span>SISTEMA</span><strong>—</strong><small>Aguardando livro de regras</small></div></div>
        <div className="section-heading"><div><span className="eyebrow">ACESSO RÁPIDO</span><h3>Seus registros</h3></div><button className="text-button" onClick={() => setPage('characters')}>Ver personagens <ChevronRight size={15}/></button></div>
        {characters.length ? <div className="character-grid">{characters.slice(0,3).map(c => <button className="character-card" key={c.id} onClick={() => {setSelected(c.id);setPage('characters')}}><div className="avatar"><Users size={25}/></div><span>{c.district || 'DISTRITO NÃO DEFINIDO'}</span><strong>{c.name}</strong><small>ABRIR FICHA <ChevronRight size={13}/></small></button>)}</div> : <div className="empty">Nenhum tributo registrado. Crie o primeiro personagem para começar.</div>}
      </section>}
      {page === 'characters' && <section className="content">
        {active ? <><button className="back" onClick={() => setSelected(null)}>← Todos os personagens</button><div className="editor">
          <div className="portrait"><>{active.image ? <img className="portrait-image" src={active.image} alt="Retrato do personagem" onError={e => { e.currentTarget.style.display = 'none'; }}/> : <div className="avatar large"><Users size={38}/></div>}</><label className="upload">URL do retrato<input value={active.image || ''} onChange={e => updateCharacter({image:e.target.value})} placeholder="Cole um link de imagem"/></label></div>
          <div className="fields"><label>Nome<input value={active.name} onChange={e => updateCharacter({name:e.target.value})}/></label><div className="two"><label>Distrito<input value={active.district} onChange={e => updateCharacter({district:e.target.value})} placeholder="Ex.: 3"/></label><label>Idade<input value={active.age} onChange={e => updateCharacter({age:e.target.value})} placeholder="Idade"/></label></div><label>História<textarea value={active.story} onChange={e => updateCharacter({story:e.target.value})} placeholder="Conte a história do personagem..."/></label><p className="note">Campos livres para organizar a ficha. Os nomes e valores são editáveis; as regras e cálculos oficiais serão adicionados depois de recebermos o livro.</p>
            <EditableValues title="Atributos" values={active.stats} onChange={stats => updateCharacter({stats})}/>
            <EditableValues title="Perícias" values={active.skills} onChange={skills => updateCharacter({skills})}/>
            <StatusTracks tracks={active.tracks || []} onChange={tracks => updateCharacter({tracks})}/>
            <EditableItems title="Inventário" items={active.inventory} onChange={inventory => updateCharacter({inventory})}/>
            <EditableItems title="Condições" items={active.conditions} onChange={conditions => updateCharacter({conditions})}/>
            <button className="danger" onClick={() => {setCharacters(items => items.filter(c => c.id !== active.id));setSelected(null)}}><Trash2 size={15}/> Excluir personagem</button></div>
        </div></> : <><div className="section-heading"><div><span className="eyebrow">CADASTRO DE TRIBUTOS</span><h3>Personagens</h3></div><button className="primary" onClick={addCharacter}><Plus size={16}/> Novo personagem</button></div><div className="search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar personagem..."/></div><div className="character-grid">{filtered.map(c => <button className="character-card" key={c.id} onClick={() => setSelected(c.id)}><div className="avatar"><Users size={25}/></div><span>{c.district || 'DISTRITO NÃO DEFINIDO'}</span><strong>{c.name}</strong><small>EDITAR FICHA <ChevronRight size={13}/></small></button>)}</div></>}
      </section>}
      {page === 'campaigns' && <section className="content"><div className="section-heading"><div><span className="eyebrow">HISTÓRIAS DE PANEM</span><h3>Campanhas</h3></div><button className="primary" onClick={addCampaign}><Plus size={16}/> Nova campanha</button></div>
        {campaigns.map(c => <article className="campaign-card" key={c.id}>
          <div className="campaign-title"><input aria-label="Nome da campanha" value={c.name} onChange={e => updateCampaign(c.id, {name:e.target.value})}/><button className="icon-button" onClick={() => setCampaigns(items => items.filter(x => x.id !== c.id))} aria-label="Excluir campanha"><Trash2 size={16}/></button></div>
          <label className="campaign-description">Descrição / resumo<textarea value={c.description || ''} onChange={e => updateCampaign(c.id, {description:e.target.value})} placeholder="Registre o cenário, os acontecimentos e os objetivos desta campanha..."/></label>
          <div className="campaign-members"><strong>Personagens participantes</strong>{characters.length ? characters.map(ch => <label key={ch.id}><input type="checkbox" checked={(c.characterIds || []).includes(ch.id)} onChange={e => updateCampaign(c.id, {characterIds:e.target.checked ? [...(c.characterIds || []), ch.id] : (c.characterIds || []).filter(id => id !== ch.id)})}/>{ch.name} <span>({ch.district || 'Distrito não definido'})</span></label>) : <p className="muted">Cadastre personagens para vinculá-los à campanha.</p>}</div>
        </article>)}
        {!campaigns.length && <div className="empty">Nenhuma campanha criada ainda. Crie uma para organizar a história e seus participantes.</div>}</section>}
      {['games','arena','rules','settings'].includes(page) && <section className="content"><div className="placeholder"><div className="seal"><Bird size={30}/></div><span className="eyebrow">ÁREA EM PREPARAÇÃO</span><h2>{title}</h2><p>Esta seção será construída depois que recebermos o livro e confirmarmos as regras da campanha. Assim, o aplicativo acompanha o sistema real da mesa sem inventar mecânicas.</p></div></section>}
      <footer>O QUE FAZEMOS NESTA ARENA ECOA POR PANEM. <span>JOGOS VORAZES RPG</span></footer>
    </main>
  </div>;
}