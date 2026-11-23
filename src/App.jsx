import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, Flag, Swords, Settings, Plus, Search, Bird, ChevronRight, Trash2, Download, Upload, MapPin, Palette, History, Image as ImageIcon } from 'lucide-react';

function CapitolEmblem({ size = 28 }) {
  return <svg className="capitol-emblem" width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Emblema da Capital">
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="50" cy="50" r="39" fill="none" stroke="currentColor" strokeWidth=".7" strokeDasharray="2 3"/>
    <path d="M18 37 L50 17 L82 37" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M24 40 H76 M29 43 V69 M40 43 V69 M50 43 V69 M60 43 V69 M71 43 V69 M23 72 H77 L82 78 H18 Z" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round"/>
    <path d="M12 84 H88 M50 7 V13 M50 87 V93 M7 50 H13 M87 50 H93" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M33 31 L50 25 L67 31" fill="none" stroke="currentColor" strokeWidth="1.4"/>
  </svg>;
}

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

const districtThemes = {
  1: { name: 'Luxo da Capital', accent: '#d8b76e', deep: '#45351e', note: 'Elegância, metais dourados e vitrines sofisticadas.' },
  2: { name: 'Pedra & Mármore', accent: '#b9b7ad', deep: '#373a3b', note: 'Pedra clara, aço e arquitetura monumental.' },
  3: { name: 'Circuitos & Neon', accent: '#55b9b0', deep: '#173b3c', note: 'Circuitos, telas e luzes tecnológicas.' },
  4: { name: 'Marés & Sal', accent: '#65a9bd', deep: '#193c4b', note: 'Azuis oceânicos, redes e texturas marítimas.' },
  5: { name: 'Energia', accent: '#e0bd55', deep: '#514019', note: 'Luz elétrica, cobre e estruturas industriais.' },
  6: { name: 'Asfalto & Movimento', accent: '#9ca7b4', deep: '#303b49', note: 'Metal escovado, concreto e linhas de transporte.' },
  7: { name: 'Madeira & Floresta', accent: '#91a66a', deep: '#30402a', note: 'Verdes profundos, madeira e marcas de corte.' },
  8: { name: 'Fios & Tecidos', accent: '#bd7895', deep: '#492b3a', note: 'Tramas, costuras e padrões têxteis.' },
  9: { name: 'Campos de Grãos', accent: '#c7a45c', deep: '#49391f', note: 'Dourado de trigo, juta e tons de terra.' },
  10: { name: 'Ferro & Pecuária', accent: '#b77d55', deep: '#4a3024', note: 'Couro, ferragens e tons quentes de celeiro.' },
  11: { name: 'Colheita', accent: '#86a56a', deep: '#2e402a', note: 'Verde de plantação, folhas e terra fértil.' },
  12: { name: 'Carvão & Cinzas', accent: '#a87967', deep: '#3e2d2a', note: 'Carvão, fuligem e madeira escurecida.' },
  13: { name: 'Subsolo', accent: '#9b91b8', deep: '#302b43', note: 'Grafite, concreto frio e luz subterrânea.' }
};
function getDistrictTheme(value) {
  const match = String(value || '').match(/\d+/);
  const number = match ? Number(match[0]) : 0;
  return districtThemes[number] ? { number, ...districtThemes[number] } : null;
}

const nav = [
  ['Visão geral', 'overview', Flag], ['Personagens', 'characters', Users],
  ['Campanhas', 'campaigns', BookOpen], ['Sessões', 'games', Swords],
  ['Arena', 'arena', Bird], ['Regras', 'rules', BookOpen], ['Configurações', 'settings', Settings]
];

export default function App() {
  const [page, setPage] = useState('overview');
  const [characters, setCharacters] = useState(() => readSaved('hv-characters'));
  const [campaigns, setCampaigns] = useState(() => readSaved('hv-campaigns'));
  const [sessions, setSessions] = useState(() => readSaved('hv-sessions'));
  const [arena, setArena] = useState(() => readSaved('hv-arena') || {});
  const [settings, setSettings] = useState(() => readSaved('hv-settings') || { theme: 'capital', accent: 'gold', backgroundImage: '' });
  const [importStatus, setImportStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  useEffect(() => localStorage.setItem('hv-characters', JSON.stringify(characters)), [characters]);
  useEffect(() => localStorage.setItem('hv-campaigns', JSON.stringify(campaigns)), [campaigns]);
  useEffect(() => localStorage.setItem('hv-sessions', JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem('hv-arena', JSON.stringify(arena)), [arena]);
  useEffect(() => localStorage.setItem('hv-settings', JSON.stringify(settings)), [settings]);
  const active = characters.find(c => c.id === selected);
  const filtered = useMemo(() => characters.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [characters, search]);
  const updateCharacter = patch => setCharacters(items => items.map(c => c.id === selected ? { ...c, ...patch } : c));
  const addHistoryEntry = () => updateCharacter({ history: [...(active?.history || []), { id: Date.now(), date: new Date().toLocaleDateString('en-CA'), title: 'Novo acontecimento', description: '' }] });
  const updateHistoryEntry = (id, patch) => updateCharacter({ history: (active?.history || []).map(entry => entry.id === id ? { ...entry, ...patch } : entry) });
  const removeHistoryEntry = id => updateCharacter({ history: (active?.history || []).filter(entry => entry.id !== id) });
  const exportBackup = () => {
    const payload = { app: 'Jogos Vorazes RPG Companion', version: 1, exportedAt: new Date().toISOString(), characters, campaigns, sessions, arena, settings };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'jogos-vorazes-backup.json'; link.click();
    URL.revokeObjectURL(url);
    setImportStatus('Backup exportado. Guarde o arquivo em um local seguro.');
  };
  const importBackup = file => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || !Array.isArray(data.characters) || !Array.isArray(data.campaigns) || !Array.isArray(data.sessions)) throw new Error('invalid');
        if (!window.confirm('Importar este backup substituirá os dados atuais deste navegador. Deseja continuar?')) return;
        setCharacters(data.characters); setCampaigns(data.campaigns); setSessions(data.sessions);
        setArena(data.arena && typeof data.arena === 'object' ? data.arena : {});
        setSettings(data.settings && typeof data.settings === 'object' ? data.settings : { theme: 'capital', accent: 'gold', backgroundImage: '' });
        setSelected(null); setPage('overview');
        setImportStatus('Backup importado com sucesso.');
      } catch { setImportStatus('Não foi possível importar. Confira se o arquivo é um backup válido do aplicativo.'); }
    };
    reader.onerror = () => setImportStatus('Falha ao ler o arquivo selecionado.');
    reader.readAsText(file);
  };
  const selectedDistrictNumber = String(settings.theme || '').startsWith('district-')
    ? Number(String(settings.theme).replace('district-', '')) : null;
  const selectedDistrictTheme = selectedDistrictNumber ? districtThemes[selectedDistrictNumber] : null;
  const baseTheme = { bg: '#171716', panel: '#24211d', accent: '#b9975c' };
  const appearance = {
    '--app-bg': selectedDistrictTheme?.deep || baseTheme.bg,
    '--app-panel': selectedDistrictTheme ? `color-mix(in srgb, ${selectedDistrictTheme.deep} 72%, #171614)` : baseTheme.panel,
    '--app-accent': settings.accent === 'red' ? '#b5363e' : settings.accent === 'teal' ? '#55a9a0' : selectedDistrictTheme?.accent || baseTheme.accent,
    '--district-accent': selectedDistrictTheme?.accent || '#c6a36a',
    '--district-deep': selectedDistrictTheme?.deep || '#30251d',
    ...(settings.backgroundImage ? { backgroundImage: 'linear-gradient(rgba(18,17,15,.91),rgba(18,17,15,.96)), url("' + settings.backgroundImage.replace(/"/g, '') + '")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {})
  };
  const uploadPortrait = file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      window.alert('Selecione um arquivo de imagem.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1000;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        updateCharacter({ image: canvas.toDataURL('image/jpeg', 0.82) });
      };
      image.onerror = () => window.alert('Não foi possível abrir essa imagem.');
      image.src = reader.result;
    };
    reader.onerror = () => window.alert('Não foi possível carregar o arquivo.');
    reader.readAsDataURL(file);
  };
  const addCharacter = () => {
    const c = { id: Date.now(), name: 'Novo tributo', district: '', age: '', story: '', image: '', stats: {}, skills: {}, inventory: [], conditions: [], tracks: [] };
    setCharacters(items => [...items, c]); setSelected(c.id); setPage('characters');
  };
  const addCampaign = () => setCampaigns(items => [...items, { id: Date.now(), name: 'Nova campanha', description: '', characterIds: [] }]);
  const updateCampaign = (id, patch) => setCampaigns(items => items.map(c => c.id === id ? { ...c, ...patch } : c));
  const addSession = () => setSessions(items => [...items, { id: Date.now(), campaignId: campaigns[0]?.id || '', title: 'Nova sessão', date: new Date().toLocaleDateString('en-CA'), summary: '', events: [] }]);
  const updateSession = (id, patch) => setSessions(items => items.map(session => session.id === id ? { ...session, ...patch } : session));
  const title = nav.find(n => n[1] === page)?.[0] || 'Visão geral';

  return <div className="shell" style={appearance}>
    <aside className="sidebar">
      <div className="brand"><div className="seal"><CapitolEmblem size={31}/></div><div><span>ARQUIVOS DA CAPITAL</span><strong>JOGOS VORAZES</strong></div></div>
      <div className="season-label">COMPANION DE RPG</div>
      <nav>{nav.map(([label, key, Icon]) => <button key={key} className={page === key ? 'nav-item active' : 'nav-item'} onClick={() => { setPage(key); setSelected(null); }}><Icon size={17}/>{label}<ChevronRight size={14}/></button>)}</nav>
      <div className="sidebar-bottom"><span>QUE A SORTE ESTEJA</span><b>SEMPRE A SEU FAVOR.</b><small>VERSÃO 0.1 · EM DESENVOLVIMENTO</small></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><span className="eyebrow">PANEM / REGISTRO CENTRAL</span><h1>{active ? active.name : title}</h1></div><div className="top-actions"><span className="status-dot"/> DADOS SALVOS LOCALMENTE</div></header>
      {page === 'overview' && <section className="content">
        <div className="hero"><div className="hero-copy"><span className="eyebrow">O REGISTRO COMEÇA AQUI</span><h2>Que os jogos<br/><em>comecem.</em></h2><p>Organize seus tributos, campanhas e sessões em um só lugar. Este espaço será moldado pelo sistema de regras da sua mesa.</p><button className="primary" onClick={addCharacter}><Plus size={16}/> Criar personagem</button></div><div className="mock-seal"><CapitolEmblem size={142}/><span>A CAPITAL DE PANEM</span></div></div>
        <div className="stats-row"><div className="stat-card"><span>TRIBUTOS REGISTRADOS</span><strong>{characters.length}</strong><small>Personagens cadastrados</small></div><div className="stat-card"><span>CAMPANHAS</span><strong>{campaigns.length}</strong><small>Histórias em andamento</small></div><div className="stat-card"><span>SESSÕES REGISTRADAS</span><strong>{sessions.length}</strong><small>Encontros documentados</small></div></div>
        <div className="section-heading"><div><span className="eyebrow">ACESSO RÁPIDO</span><h3>Seus registros</h3></div><button className="text-button" onClick={() => setPage('characters')}>Ver personagens <ChevronRight size={15}/></button></div>
        {characters.length ? <div className="character-grid">{characters.slice(0,3).map(c => <button className="character-card" key={c.id} style={getDistrictTheme(c.district) ? {'--district-accent':getDistrictTheme(c.district).accent,'--district-deep':getDistrictTheme(c.district).deep} : {}} onClick={() => {setSelected(c.id);setPage('characters')}}><>{c.image ? <img className="character-thumb" src={c.image} alt="" /> : <div className="avatar"><Users size={25}/></div>}</><span>{c.district || 'DISTRITO NÃO DEFINIDO'}</span><strong>{c.name}</strong><small>ABRIR FICHA <ChevronRight size={13}/></small></button>)}</div> : <div className="empty">Nenhum tributo registrado. Crie o primeiro personagem para começar.</div>}
      </section>}
      {page === 'characters' && <section className="content">
        {active ? <><button className="back" onClick={() => setSelected(null)}>← Todos os personagens</button>{(() => { const theme = getDistrictTheme(active.district); return <div className="district-profile" style={theme ? {'--district-accent':theme.accent,'--district-deep':theme.deep} : {}}><div className="district-profile-top"><span className="eyebrow">IDENTIDADE DO DISTRITO {theme ? theme.number : ''}</span><strong>{theme ? theme.name : 'Distrito não definido'}</strong></div><p>{theme ? theme.note : 'Informe o número do distrito para aplicar sua identidade visual.'}</p></div>; })()}<div className="profile-overview"><div><span>DISTRITO</span><strong>{active.district || "—"}</strong></div><div><span>IDADE</span><strong>{active.age || "—"}</strong></div><div><span>ATRIBUTOS</span><strong>{Object.keys(active.stats || {}).length}</strong></div><div><span>REGISTROS</span><strong>{(active.history || []).length}</strong></div></div><div className="editor">
          <div className="portrait"><>{active.image ? <img className="portrait-image" src={active.image} alt="Retrato do personagem" onError={e => { e.currentTarget.style.display = 'none'; }}/> : <div className="avatar large"><Users size={38}/></div>}</><label className="photo-picker"><span><Plus size={15}/> Escolher foto da galeria</span><input type="file" accept="image/*" onChange={e => { uploadPortrait(e.target.files?.[0]); e.target.value = ''; }}/></label><label className="upload">Ou usar URL do retrato<input value={active.image || ''} onChange={e => updateCharacter({image:e.target.value})} placeholder="Cole um link de imagem"/></label>{active.image && <button type="button" className="text-button remove-photo" onClick={() => updateCharacter({image:''})}>Remover retrato</button>}</div>
          <div className="fields"><label>Nome<input value={active.name} onChange={e => updateCharacter({name:e.target.value})}/></label><div className="two"><label>Distrito<input value={active.district} onChange={e => updateCharacter({district:e.target.value})} placeholder="Ex.: 3"/></label><label>Idade<input value={active.age} onChange={e => updateCharacter({age:e.target.value})} placeholder="Idade"/></label></div><label>História<textarea value={active.story} onChange={e => updateCharacter({story:e.target.value})} placeholder="Conte a história do personagem..."/></label><p className="note">Campos livres para organizar a ficha. Os nomes e valores são editáveis; as regras e cálculos oficiais serão adicionados depois de recebermos o livro.</p>
            <EditableValues title="Atributos" values={active.stats} onChange={stats => updateCharacter({stats})}/>
            <EditableValues title="Perícias" values={active.skills} onChange={skills => updateCharacter({skills})}/>
            <StatusTracks tracks={active.tracks || []} onChange={tracks => updateCharacter({tracks})}/>
            <EditableItems title="Inventário" items={active.inventory} onChange={inventory => updateCharacter({inventory})}/>
            <EditableItems title="Condições" items={active.conditions} onChange={conditions => updateCharacter({conditions})}/>
            <div className="custom-section history-section">
              <div className="custom-heading"><h4><History size={16}/> Histórico do tributo</h4><button type="button" className="text-button" onClick={addHistoryEntry}><Plus size={14}/> Registrar acontecimento</button></div>
              {(active.history || []).length === 0 && <p className="muted">Ainda não há acontecimentos registrados para este personagem.</p>}
              {(active.history || []).map(entry => <article className="history-entry" key={entry.id}>
                <div className="history-entry-head"><input aria-label="Título do acontecimento" value={entry.title || ''} onChange={e => updateHistoryEntry(entry.id, {title:e.target.value})}/><button type="button" className="icon-button" onClick={() => removeHistoryEntry(entry.id)} aria-label="Excluir acontecimento"><Trash2 size={14}/></button></div>
                <input className="history-date" type="date" value={entry.date || ''} onChange={e => updateHistoryEntry(entry.id, {date:e.target.value})}/>
                <textarea value={entry.description || ''} onChange={e => updateHistoryEntry(entry.id, {description:e.target.value})} placeholder="O que aconteceu? Quem participou? Quais foram as consequências?"/>
              </article>)}
            </div>
            <button className="danger" onClick={() => {setCharacters(items => items.filter(c => c.id !== active.id));setSelected(null)}}><Trash2 size={15}/> Excluir personagem</button></div>
        </div></> : <><div className="section-heading"><div><span className="eyebrow">CADASTRO DE TRIBUTOS</span><h3>Personagens</h3></div><button className="primary" onClick={addCharacter}><Plus size={16}/> Novo personagem</button></div><div className="search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar personagem..."/></div><div className="character-grid">{filtered.map(c => <button className="character-card" key={c.id} style={getDistrictTheme(c.district) ? {'--district-accent':getDistrictTheme(c.district).accent,'--district-deep':getDistrictTheme(c.district).deep} : {}} onClick={() => setSelected(c.id)}><>{c.image ? <img className="character-thumb" src={c.image} alt="" /> : <div className="avatar"><Users size={25}/></div>}</><span>{c.district || 'DISTRITO NÃO DEFINIDO'}</span><strong>{c.name}</strong><small>EDITAR FICHA <ChevronRight size={13}/></small></button>)}</div></>}
      </section>}
      {page === 'campaigns' && <section className="content"><div className="section-heading"><div><span className="eyebrow">HISTÓRIAS DE PANEM</span><h3>Campanhas</h3></div><button className="primary" onClick={addCampaign}><Plus size={16}/> Nova campanha</button></div>
        {campaigns.map(c => <article className="campaign-card" key={c.id}>
          <div className="campaign-title"><input aria-label="Nome da campanha" value={c.name} onChange={e => updateCampaign(c.id, {name:e.target.value})}/><button className="icon-button" onClick={() => setCampaigns(items => items.filter(x => x.id !== c.id))} aria-label="Excluir campanha"><Trash2 size={16}/></button></div>
          <label className="campaign-description">Descrição / resumo<textarea value={c.description || ''} onChange={e => updateCampaign(c.id, {description:e.target.value})} placeholder="Registre o cenário, os acontecimentos e os objetivos desta campanha..."/></label>
          <div className="campaign-members"><strong>Personagens participantes</strong>{characters.length ? characters.map(ch => <label key={ch.id}><input type="checkbox" checked={(c.characterIds || []).includes(ch.id)} onChange={e => updateCampaign(c.id, {characterIds:e.target.checked ? [...(c.characterIds || []), ch.id] : (c.characterIds || []).filter(id => id !== ch.id)})}/>{ch.name} <span>({ch.district || 'Distrito não definido'})</span></label>) : <p className="muted">Cadastre personagens para vinculá-los à campanha.</p>}</div>
        </article>)}
        {!campaigns.length && <div className="empty">Nenhuma campanha criada ainda. Crie uma para organizar a história e seus participantes.</div>}</section>}
      {page === 'games' && <section className="content">
        <div className="section-heading"><div><span className="eyebrow">DIÁRIO DE PANEM</span><h3>Sessões de jogo</h3></div><button className="primary" onClick={addSession}><Plus size={16}/> Registrar sessão</button></div>
        <p className="note">Use este espaço para documentar cada encontro da mesa. Os registros são narrativos e não dependem de regras específicas.</p>
        {sessions.slice().sort((a,b) => (b.date || '').localeCompare(a.date || '')).map(session => <article className="session-card" key={session.id}>
          <div className="session-heading"><input aria-label="Título da sessão" value={session.title} onChange={e => updateSession(session.id, {title:e.target.value})}/><button className="icon-button" onClick={() => setSessions(items => items.filter(x => x.id !== session.id))} aria-label="Excluir sessão"><Trash2 size={16}/></button></div>
          <div className="session-meta">
            <label>Data<input type="date" value={session.date || ''} onChange={e => updateSession(session.id, {date:e.target.value})}/></label>
            <label>Campanha<select value={session.campaignId || ''} onChange={e => updateSession(session.id, {campaignId:e.target.value})}><option value="">Sem campanha vinculada</option>{campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          </div>
          <label className="session-summary">Resumo do encontro<textarea value={session.summary || ''} onChange={e => updateSession(session.id, {summary:e.target.value})} placeholder="O que aconteceu nesta sessão? Como terminou?"/></label>
          <EditableItems title="Acontecimentos importantes" items={session.events || []} onChange={events => updateSession(session.id, {events})}/>
        </article>)}
        {!sessions.length && <div className="empty">Nenhuma sessão registrada. Crie a primeira para começar o diário da campanha.</div>}
      </section>}
      {page === 'arena' && <section className="content">
        <div className="section-heading"><div><span className="eyebrow">REGISTRO DO CAMPO DE JOGO</span><h3>Arena</h3></div><span className="arena-tag"><MapPin size={14}/> Painel narrativo</span></div>
        <p className="note">Organize o cenário e os acontecimentos da arena. Este painel não presume regras, distâncias, dano ou mecânicas: tudo permanece editável até recebermos o livro.</p>
        <label className="arena-field">Nome ou identificação da arena<input value={arena.name || ''} onChange={e => setArena(a => ({...a,name:e.target.value}))} placeholder="Ex.: Arena da campanha atual"/></label>
        <label className="arena-field">Descrição geral<textarea value={arena.description || ''} onChange={e => setArena(a => ({...a,description:e.target.value}))} placeholder="Descreva o ambiente, clima, aparência e características conhecidas..."/></label>
        <label className="arena-field">Imagem ou mapa por URL<input value={arena.mapImage || ''} onChange={e => setArena(a => ({...a,mapImage:e.target.value}))} placeholder="Cole o link de uma imagem ou mapa"/></label>
        {arena.mapImage && <img className="arena-map" src={arena.mapImage} alt="Mapa ou imagem da arena" onError={e => {e.currentTarget.style.display='none'}}/>}
        <div className="arena-columns"><EditableItems title="Regiões e locais" items={arena.locations || []} onChange={locations => setArena(a => ({...a,locations}))}/><EditableItems title="Perigos e elementos conhecidos" items={arena.dangers || []} onChange={dangers => setArena(a => ({...a,dangers}))}/></div>
        <EditableItems title="Acontecimentos na arena" items={arena.events || []} onChange={events => setArena(a => ({...a,events}))}/>
        <label className="arena-field">Observações livres<textarea value={arena.notes || ''} onChange={e => setArena(a => ({...a,notes:e.target.value}))} placeholder="Anotações do mestre e informações descobertas..."/></label>
      </section>}
      {page === 'rules' && <section className="content"><div className="placeholder"><div className="seal"><BookOpen size={30}/></div><span className="eyebrow">SISTEMA DA MESA</span><h2>Livro de regras</h2><p>Área reservada para cadastrar atributos, testes, recursos e cálculos oficiais quando o livro de regras for enviado. Nenhuma mecânica foi presumida.</p></div></section>}
      {page === 'settings' && <section className="content">
        <div className="section-heading"><div><span className="eyebrow">PREFERÊNCIAS DO APLICATIVO</span><h3>Personalização</h3></div><Palette size={22}/></div>
        <div className="settings-card theme-settings">
          <div className="theme-intro"><span className="eyebrow">IDENTIDADE VISUAL DE PANEM</span><h4>Escolha de qual distrito é o seu aplicativo</h4><p>Não é só uma troca de papel de parede. Cada identidade muda a paleta completa da interface: fundo, painéis, bordas, detalhes, cor dos destaques e atmosfera visual. A Capital tem sua própria identidade.</p></div>
          <div className="theme-preview-grid">
            <button type="button" className={(!selectedDistrictTheme ? 'theme-choice selected' : 'theme-choice')} style={{'--theme-accent':'#c6a36a','--theme-deep':'#30251d'}} onClick={() => setSettings(s => ({...s,theme:'capital'}))}><span className="theme-swatch"><i/><i/><i/></span><strong>A CAPITAL</strong><small>Carvão, aço e dourado</small><em>{!selectedDistrictTheme ? 'IDENTIDADE ATIVA' : 'Selecionar identidade'}</em></button>
            {Object.entries(districtThemes).map(([number, theme]) => <button type="button" key={number} className={selectedDistrictNumber === Number(number) ? 'theme-choice selected' : 'theme-choice'} style={{'--theme-accent':theme.accent,'--theme-deep':theme.deep}} onClick={() => setSettings(s => ({...s,theme:`district-${number}`,accent:'theme'}))}><span className="theme-swatch"><i/><i/><i/></span><strong>DISTRITO {number.padStart(2,'0')}</strong><small>{theme.name}</small><em>{selectedDistrictNumber === Number(number) ? 'IDENTIDADE ATIVA' : 'Selecionar identidade'}</em></button>)}
          </div>
          {selectedDistrictTheme && <div className="active-theme-note"><span className="active-theme-number">D{String(selectedDistrictNumber).padStart(2,'0')}</span><div><strong>{selectedDistrictTheme.name}</strong><p>{selectedDistrictTheme.note}</p></div><span className="active-theme-line"/></div>}
          <label className="arena-field">Cor de destaque personalizada<select value={settings.accent || 'theme'} onChange={e => setSettings(s => ({...s,accent:e.target.value}))}><option value="theme">Usar as cores próprias da identidade</option><option value="gold">Dourado</option><option value="red">Vermelho da Capital</option><option value="teal">Turquesa</option></select></label>
          <label className="arena-field">Imagem adicional de fundo (opcional)<input value={settings.backgroundImage || ''} onChange={e => setSettings(s => ({...s,backgroundImage:e.target.value}))} placeholder="Cole um link de imagem para personalizar ainda mais"/></label>
          <button className="text-button" onClick={() => setSettings({theme:'capital',accent:'theme',backgroundImage:''})}>Restaurar identidade da Capital</button>
        </div>
        <div className="settings-card"><h4><Download size={17}/> Backup e transferência</h4><p>Exporte personagens, campanhas, sessões, Arena e preferências em um arquivo JSON. Para recuperar ou transferir, importe esse arquivo em outro navegador.</p><div className="backup-actions"><button className="primary" onClick={exportBackup}><Download size={15}/> Exportar backup</button><label className="primary file-import"><Upload size={15}/> Importar backup<input type="file" accept="application/json,.json" onChange={e => {importBackup(e.target.files?.[0]);e.target.value='';}}/></label></div>{importStatus && <p className="backup-status">{importStatus}</p>}</div>
        <div className="settings-card"><h4>Sobre o salvamento</h4><p>Os dados são guardados neste navegador e neste dispositivo. O backup permite transportar os registros manualmente, mas ainda não existe sincronização automática na nuvem.</p></div>
      </section>}
      <footer>O QUE FAZEMOS NESTA ARENA ECOA POR PANEM. <span>JOGOS VORAZES RPG</span></footer>
    </main>
  </div>;
}