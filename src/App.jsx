import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, Flag, Swords, Settings, Plus, Search, Bird, ChevronRight, Trash2 } from 'lucide-react';

const initialCharacters = [
  { id: 1, name: 'Novo tributo', district: '—', age: '', story: '', image: '', stats: {}, skills: {}, inventory: [], conditions: [] }
];
const nav = [
  ['Visão geral', 'overview', Flag], ['Personagens', 'characters', Users],
  ['Campanhas', 'campaigns', BookOpen], ['Jogos', 'games', Swords],
  ['Arena', 'arena', Bird], ['Regras', 'rules', BookOpen], ['Configurações', 'settings', Settings]
];

export default function App() {
  const [page, setPage] = useState('overview');
  const [characters, setCharacters] = useState(() => JSON.parse(localStorage.getItem('hv-characters') || '[]'));
  const [campaigns, setCampaigns] = useState(() => JSON.parse(localStorage.getItem('hv-campaigns') || '[]'));
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  useEffect(() => localStorage.setItem('hv-characters', JSON.stringify(characters)), [characters]);
  useEffect(() => localStorage.setItem('hv-campaigns', JSON.stringify(campaigns)), [campaigns]);
  const active = characters.find(c => c.id === selected);
  const filtered = useMemo(() => characters.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [characters, search]);
  const updateCharacter = patch => setCharacters(items => items.map(c => c.id === selected ? { ...c, ...patch } : c));
  const addCharacter = () => {
    const c = { id: Date.now(), name: 'Novo tributo', district: '', age: '', story: '', image: '', stats: {}, skills: {}, inventory: [], conditions: [] };
    setCharacters(items => [...items, c]); setSelected(c.id); setPage('characters');
  };
  const addCampaign = () => setCampaigns(items => [...items, { id: Date.now(), name: 'Nova campanha', description: '' }]);
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
          <div className="portrait"><div className="avatar large"><Users size={38}/></div><label className="upload">URL do retrato<input value={active.image || ''} onChange={e => updateCharacter({image:e.target.value})} placeholder="Cole um link de imagem"/></label></div>
          <div className="fields"><label>Nome<input value={active.name} onChange={e => updateCharacter({name:e.target.value})}/></label><div className="two"><label>Distrito<input value={active.district} onChange={e => updateCharacter({district:e.target.value})} placeholder="Ex.: 3"/></label><label>Idade<input value={active.age} onChange={e => updateCharacter({age:e.target.value})} placeholder="Idade"/></label></div><label>História<textarea value={active.story} onChange={e => updateCharacter({story:e.target.value})} placeholder="Conte a história do personagem..."/></label><p className="note">Atributos, perícias, condições e inventário serão configurados conforme o livro de regras da mesa.</p><button className="danger" onClick={() => {setCharacters(items => items.filter(c => c.id !== active.id));setSelected(null)}}><Trash2 size={15}/> Excluir personagem</button></div>
        </div></> : <><div className="section-heading"><div><span className="eyebrow">CADASTRO DE TRIBUTOS</span><h3>Personagens</h3></div><button className="primary" onClick={addCharacter}><Plus size={16}/> Novo personagem</button></div><div className="search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar personagem..."/></div><div className="character-grid">{filtered.map(c => <button className="character-card" key={c.id} onClick={() => setSelected(c.id)}><div className="avatar"><Users size={25}/></div><span>{c.district || 'DISTRITO NÃO DEFINIDO'}</span><strong>{c.name}</strong><small>EDITAR FICHA <ChevronRight size={13}/></small></button>)}</div></>}
      </section>}
      {page === 'campaigns' && <section className="content"><div className="section-heading"><div><span className="eyebrow">HISTÓRIAS DE PANEM</span><h3>Campanhas</h3></div><button className="primary" onClick={addCampaign}><Plus size={16}/> Nova campanha</button></div>{campaigns.map(c => <div className="campaign" key={c.id}><input value={c.name} onChange={e => setCampaigns(items => items.map(x => x.id === c.id ? {...x,name:e.target.value}:x))}/><button className="icon-button" onClick={() => setCampaigns(items => items.filter(x => x.id !== c.id))}><Trash2 size={16}/></button></div>)}{!campaigns.length && <div className="empty">Nenhuma campanha criada ainda.</div>}</section>}
      {['games','arena','rules','settings'].includes(page) && <section className="content"><div className="placeholder"><div className="seal"><Bird size={30}/></div><span className="eyebrow">ÁREA EM PREPARAÇÃO</span><h2>{title}</h2><p>Esta seção será construída depois que recebermos o livro e confirmarmos as regras da campanha. Assim, o aplicativo acompanha o sistema real da mesa sem inventar mecânicas.</p></div></section>}
      <footer>O QUE FAZEMOS NESTA ARENA ECOA POR PANEM. <span>JOGOS VORAZES RPG</span></footer>
    </main>
  </div>;
}