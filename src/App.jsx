import { useEffect, useMemo, useRef, useState } from 'react';
import RulesPanel from './RulesPanel.jsx';
import { ATTRIBUTES, SKILLS, AGE_MODIFIERS, DISTRICT_MODIFIERS, WEAPONS, weaponData, derived, effectiveSkills } from './rules.js';
import { BookOpen, Users, Flag, Swords, Settings, Plus, Search, Bird, ChevronRight, Trash2, Download, Upload, MapPin, Palette, History, Image as ImageIcon, ShieldCheck } from 'lucide-react';

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

function readSaved(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
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


const attributeInfo = {
  Força: 'Potência física, esforço e capacidade de impor força.',
  Agilidade: 'Coordenação, reflexos, equilíbrio e rapidez.',
  Vigor: 'Resistência, saúde e capacidade de suportar esforço.',
  Inteligência: 'Raciocínio, memória, análise e conhecimento.',
  Carisma: 'Presença, comunicação e influência sobre pessoas.'
};
const skillGroups = [
  { name:'Corpo & movimento', icon:'✦', skills:['Atletismo','Combate','Arremesso','Furtividade'] },
  { name:'Sobrevivência', icon:'⌖', skills:['Sobrevivência','Caça','Rastreamento','Primeiros Socorros','Conhecimento de Plantas','Conhecimento de Animais'] },
  { name:'Técnica & percepção', icon:'⚙', skills:['Engenharia','Percepção','Improvisação'] },
  { name:'Influência & social', icon:'◇', skills:['Persuasão','Enganação','Intimidação'] }
];
function CharacterBuildSheet({ stats = {}, skills = {}, age, district, onStats, onSkills, applyDistrictPenalty=false, onDistrictPenaltyChange }) {
  const calculated = derived({stats,district});
  const totalAttributes = ATTRIBUTES.reduce((sum, key) => sum + (Number(stats[key]) || 0), 0);
  const totalSkills = SKILLS.reduce((sum, key) => sum + (Number(skills[key]) || 0), 0);
  const finalSkills = effectiveSkills({ stats, skills, age, district, applyDistrictPenalty });
  const ageMod = AGE_MODIFIERS[Number(age)];
  const districtMod = DISTRICT_MODIFIERS[Number(district)];
  const changeValue = (group, key, delta, setter, max) => {
    const source = group || {};
    const total = Object.values(source).reduce((sum,v)=>sum+(Number(v)||0),0);
    const limit = group===stats ? 10 : 8;
    if(delta>0 && total>=limit)return;
    const value = Math.max(0, Math.min(max, (Number(source[key]) || 0) + delta));
    setter({ ...source, [key]: value });
  };
  const modifierFor = key => {
    let value = 0;
    if (ageMod?.[0] === key) value += ageMod[1];
    if (ageMod?.[2] === key) value += ageMod[3];
    if (districtMod?.[0] === key) value += districtMod[1];
    if (applyDistrictPenalty && districtMod?.[2] === key) value += districtMod[3];
    return value;
  };
  return <div className="character-build">
    <section className="build-panel attributes-panel">
      <div className="build-panel-heading"><div><span className="eyebrow">BASE DO TRIBUTO • 01</span><h3>Atributos</h3><p>As cinco capacidades fundamentais do personagem.</p></div><div className="point-counter"><strong>{totalAttributes}<small>/ 10</small></strong><span>PONTOS INICIAIS</span></div></div>
      <div className="attribute-grid">{ATTRIBUTES.map((key,index) => <article className="attribute-card" key={key}>
        <div className="attribute-index">0{index+1}</div><div className="attribute-copy"><strong>{key}</strong><small>{attributeInfo[key]}</small></div>
        <div className="attribute-control"><button type="button" onClick={() => changeValue(stats,key,-1,onStats,3)} aria-label={'Diminuir '+key}>−</button><input aria-label={key} type="number" min="0" max="3" value={Number(stats[key])||0} onChange={e=>{const next={...stats,[key]:Math.max(0,Math.min(3,Number(e.target.value)||0))};if(ATTRIBUTES.reduce((sum,k)=>sum+(Number(next[k])||0),0)<=10)onStats(next);}}/><button type="button" onClick={() => changeValue(stats,key,1,onStats,3)} aria-label={'Aumentar '+key}>+</button></div>
        <div className="attribute-meter"><i style={{width:((Number(stats[key])||0)/5*100)+'%'}}/></div>
      </article>)}</div>
      <div className="build-ruleline"><span>Criação: 10 pontos no total, até 3 por atributo.</span><span>O livro não define progressão de atributos.</span></div>
      {totalAttributes !== 10 && <p className="build-feedback">{totalAttributes < 10 ? 'Ainda há '+(10-totalAttributes)+' ponto(s) de atributo para distribuir.' : 'Atributos acima dos 10 pontos iniciais: progresso além da criação.'}</p>}
    </section>
    <section className="build-panel derived-panel"><div className="build-panel-heading"><div><span className="eyebrow">RESUMO DERIVADO • LIVRO BÁSICO</span><h3>Valores calculados</h3><p>Atualizados conforme atributos e distrito.</p></div></div><div className="modifier-summary"><div><span>PV MÁXIMOS</span><strong>{calculated.hpMax ?? 'Defina o distrito'}</strong></div><div><span>DEFESA</span><strong>{calculated.defense}</strong></div><div><span>INVENTÁRIO</span><strong>{calculated.carry} espaços</strong></div></div></section>
    <section className="build-panel skills-panel">
      <div className="build-panel-heading"><div><span className="eyebrow">APTIDÕES • 02</span><h3>Perícias</h3><p>Competências treinadas. Bônus de idade e distrito aparecem separados do valor base.</p></div><div className="point-counter"><strong>{totalSkills}<small>/ 8</small></strong><span>PONTOS INICIAIS</span></div></div>
      <div className="skill-groups">{skillGroups.map(group=><section className="skill-group" key={group.name}>
        <header><span>{group.icon}</span><h4>{group.name}</h4><small>{group.skills.length} perícias</small></header>
        <div className="skill-list">{group.skills.map(key=>{const base=Number(skills[key])||0, mod=modifierFor(key), effective=finalSkills[key]??base;return <div className="skill-row" key={key}>
          <div className="skill-name"><strong>{key}</strong><small>{mod ? (mod>0?'Bônus ':'Penalidade ')+(mod>0?'+':'')+mod+' contextual' : 'Sem modificador'}</small></div>
          <div className="skill-value"><button type="button" onClick={()=>changeValue(skills,key,-1,onSkills,2)} aria-label={'Diminuir '+key}>−</button><input aria-label={'Valor base de '+key} type="number" min="0" max="2" value={base} onChange={e=>{const next={...skills,[key]:Math.max(0,Math.min(2,Number(e.target.value)||0))};if(SKILLS.reduce((sum,k)=>sum+(Number(next[k])||0),0)<=8)onSkills(next);}}/><button type="button" onClick={()=>changeValue(skills,key,1,onSkills,2)} aria-label={'Aumentar '+key}>+</button></div>
          <div className="skill-effective"><span>FINAL</span><strong className={mod>0?'positive':mod<0?'negative':''}>{effective}</strong></div>
        </div>})}</div>
      </section>)}</div>
      <div className="build-ruleline"><span>Criação: 8 pontos no total, até 2 por perícia.</span><span>Valor final = base + idade + distrito.</span></div>
      {totalSkills !== 8 && <p className="build-feedback">{totalSkills < 8 ? 'Ainda há '+(8-totalSkills)+' ponto(s) de perícia para distribuir.' : 'Perícias acima dos 8 pontos iniciais: progresso além da criação.'}</p>}
      <div className="modifier-summary"><div><span>IDADE</span><strong>{ageMod ? ageMod[0]+' +'+ageMod[1]+' • '+ageMod[2]+' '+ageMod[3] : 'Defina idade entre 12 e 18'}</strong></div><div><span>DISTRITO</span><strong>{districtMod ? districtMod[0]+' +'+districtMod[1]+' • '+districtMod[2]+' '+districtMod[3] : Number(district)===13 ? 'Distrito 13 não jogável' : 'Defina o distrito'}</strong></div></div>{districtMod&&<label className="rule-line"><input type="checkbox" checked={applyDistrictPenalty} onChange={e=>onDistrictPenaltyChange?.(e.target.checked)}/> Aplicar limitação distrital proposta para teste (opcional)</label>}
    </section>
  </div>;
}


function StatusTracks({ tracks = [], stats = {}, district = '', capacityOverride, onCapacityOverride, onChange }) {
  const defaults = [
    {id:'vida',name:'Vida',current:16,max:16,autoMax:true},
    {id:'fome',name:'Fome',current:0,max:10,autoMax:true},
    {id:'sede',name:'Sede',current:0,max:10,autoMax:true},
    {id:'exaustao',name:'Exaustão',current:0,max:10,autoMax:true},
    {id:'estabilidade',name:'Estabilidade emocional',current:10,max:10,autoMax:true}
  ];
  const rows = [...defaults.map(base => tracks.find(item => item.id === base.id || (base.id==='exaustao'&&item.id==='cansaco') || String(item.name || '').toLowerCase() === base.name.toLowerCase()) || base), ...tracks.filter(item => !defaults.some(base => item.id === base.id || String(item.name || '').toLowerCase() === base.name.toLowerCase()))];
  const calculated = derived({stats,district});
  const update = (index, patch) => onChange(rows.map((track, i) => i === index ? { ...track, ...patch } : track));
  const restore = index => update(index, { maxOverride:false, autoMax:true, max: rows[index].id === 'vida' ? (calculated.hpMax ?? rows[index].max) : 10 });
  return <div className="custom-section status-workbench">
    <div className="custom-heading"><h4>Estado físico e necessidades</h4><button type="button" className="text-button" onClick={() => onChange([...rows, { id: Date.now(), name: 'Novo marcador', current: 0, max: 10, autoMax:false }])}><Plus size={14}/> Adicionar marcador</button></div>
    <p className="muted">Vida, fome, sede, exaustão e estabilidade emocional seguem os marcadores do capítulo 10. Marcadores extras ficam configuráveis. Você pode substituir qualquer máximo e restaurar o cálculo quando quiser.</p>
    {rows.map((track, index) => {
      const isLife = track.id === 'vida' || track.name?.toLowerCase() === 'vida';
      const isStandard = ['fome','sede','exaustao','estabilidade'].includes(track.id);
      const formulaMax = isLife ? calculated.hpMax : (isStandard ? 10 : null);
      const overridden = track.maxOverride === true;
      const maxValue = overridden ? track.max : (isLife && formulaMax === null ? '' : (formulaMax === null ? track.max : formulaMax));
      const current=Number(track.current)||0, max=Math.max(0,Number(maxValue)||0), pct=max>0?Math.max(0,Math.min(100,current/max*100)):0;
      return <div className="status-track-card" key={track.id || index}>
        <div className="status-track-head"><input aria-label="Nome do marcador" value={track.name} onChange={e => update(index, { name: e.target.value })}/><button type="button" className="icon-button" onClick={() => onChange(rows.filter((_, i) => i !== index))} aria-label="Excluir marcador"><Trash2 size={14}/></button></div>
        <div className="status-track-bar"><span style={{width:pct+'%'}}/></div>
        <div className="status-track-values"><label>Atual<input type="number" value={track.current} onChange={e => update(index, { current: e.target.value })}/></label><label>Máximo<input type="number" value={maxValue ?? ''} placeholder={isLife && calculated.hpMax === null ? 'Pendente' : '—'} onChange={e => update(index, { max: e.target.value, maxOverride:true })}/></label></div>
        {isLife && <div className="status-track-foot">{overridden ? 'Máximo definido manualmente.' : calculated.hpMax === null ? 'Cálculo indisponível: este personagem está marcado como Distrito 13, que não é jogável. Selecione um distrito de 1 a 12.' : 'Automático: 16 + (Vigor × 2) + bônus do Distrito = ' + calculated.hpMax + ' PV.'}{overridden && <button type="button" className="text-button" onClick={() => restore(index)}>Restaurar cálculo</button>}</div>}
        {isStandard && overridden && <div className="status-track-foot">Limite substituído manualmente. <button type="button" className="text-button" onClick={() => restore(index)}>Restaurar 10</button></div>}
      </div>;
    })}
    <div className="status-capacity"><span>Capacidade de inventário</span><label>Espaços<input type="number" value={capacityOverride ?? calculated.carry} onChange={e => onCapacityOverride(e.target.value)}/></label><small>{capacityOverride !== undefined && capacityOverride !== null ? "Valor definido manualmente." : "Automático: 6 + (Força × 2)."}</small>{capacityOverride !== undefined && capacityOverride !== null && <button type="button" className="text-button" onClick={() => onCapacityOverride(null)}>Restaurar cálculo</button>}</div>
  </div>;
}
function MasterPanel({ characters, setCharacters, campaigns }) {
  const [campaignId, setCampaignId] = useState('all');
  const [query, setQuery] = useState('');
  const defaults = [
    { id:'vida', name:'Vida', current:16, max:16 },
    { id:'fome', name:'Fome', current:0, max:10 },
    { id:'sede', name:'Sede', current:0, max:10 },
    { id:'exaustao', name:'Exaustão', current:0, max:10 },
    { id:'estabilidade', name:'Estabilidade emocional', current:10, max:10 }
  ];
  const campaign = campaigns.find(item => String(item.id) === campaignId);
  const roster = characters.filter(character => {
    const inCampaign = campaignId === 'all' || (campaign?.characterIds || []).includes(character.id);
    return inCampaign && (character.name || '').toLowerCase().includes(query.toLowerCase());
  });
  const tracksFor = character => defaults.map(base => {
    const saved = (character.tracks || []).find(track => track.id === base.id || (base.id==='exaustao'&&track.id==='cansaco') || String(track.name || '').toLowerCase() === base.name.toLowerCase());
    const merged = saved ? { ...base, ...saved, id:base.id } : base;
    if (base.id === 'vida' && merged.maxOverride !== true) {
      const calculated = derived({ stats: character.stats || {}, district: character.district || '' }).hpMax;
      return calculated === null ? { ...merged, masterPendingMax: true } : { ...merged, max: calculated, masterPendingMax: false };
    }
    return { ...merged, masterPendingMax: false };
  });
  const updateTrack = (characterId, trackId, patch) => setCharacters(items => items.map(character => {
    if (character.id !== characterId) return character;
    const tracks = tracksFor(character);
    const survivalKey = ({fome:'fome',sede:'sede',exaustao:'exaustao',estabilidade:'estabilidade'})[trackId];
    const nextTracks = tracks.map(track => track.id === trackId ? { ...track, ...patch } : track);
    return { ...character, tracks: nextTracks, ...(survivalKey&&patch.current!==undefined?{survival:{...(character.survival||{}),[survivalKey]:Math.max(0,Math.min(10,Number(patch.current)||0))}}:{}) };
  }));
  const updateNotes = (characterId, masterNotes) => setCharacters(items => items.map(character => character.id === characterId ? { ...character, masterNotes } : character));
  const updateConditions = (characterId, value) => setCharacters(items => items.map(character => character.id === characterId ? { ...character, conditions: value.split('\n').map(item => item.trim()).filter(Boolean) } : character));
  return <section className="content master-content">
    <div className="section-heading"><div><span className="eyebrow">ACESSO DO NARRADOR • CONTROLE DA CAMPANHA</span><h3>Painel do Mestre</h3></div><span className="master-seal"><ShieldCheck size={25}/></span></div>
    <div className="master-intro"><div><span className="eyebrow">CENTRAL DE CONTROLE</span><h4>Todos os tributos. Um só painel.</h4><p>Confira e atualize os status de cada jogador durante a sessão. As alterações são salvas automaticamente nas fichas dos personagens.</p></div><div className="master-count"><strong>{roster.length}</strong><span>TRIBUTOS NO PAINEL</span></div></div>
    <div className="master-toolbar">
      <label>Campanha<select value={campaignId} onChange={e => setCampaignId(e.target.value)}><option value="all">Todos os personagens</option>{campaigns.map(item => <option key={item.id} value={String(item.id)}>{item.name || 'Campanha sem nome'}</option>)}</select></label>
      <label className="master-search">Buscar tributo<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nome do personagem..."/></label>
    </div>
    {roster.length ? <div className="master-roster">{roster.map(character => {
      const tracks = tracksFor(character);
      const theme = getDistrictTheme(character.district);
      return <article className="master-tribute" key={character.id} style={theme ? {'--district-accent':theme.accent,'--district-deep':theme.deep} : {}}>
        <header className="master-tribute-head">
          <div className="master-portrait">{character.image ? <img src={character.image} alt={'Retrato de '+character.name}/> : <div className="avatar"><Users size={25}/></div>}</div>
          <div className="master-identity"><span className="eyebrow">DISTRITO {character.district || '—'} • {character.age || 'IDADE —'}</span><h4>{character.name || 'Tributo sem nome'}</h4><small>{theme?.name || 'Registro de tributo'}</small></div>
          <button type="button" className="text-button" onClick={() => { window.dispatchEvent(new CustomEvent('hv-open-character', { detail: character.id })); }}>Abrir ficha ↗</button>
        </header>
        <div className="master-status-grid">{tracks.map(track => {
          const current = Number(track.current) || 0;
          const max = Math.max(1, Number(track.max) || 10);
          const percent = Math.max(0, Math.min(100, current / max * 100));
          return <div className="master-status" key={track.id}>
            <div className="master-status-top"><strong>{track.name}</strong><span>{current} / {track.masterPendingMax ? 'Pendente' : max}</span></div>
            <div className="master-status-bar"><i style={{width:percent+'%'}}/></div>
            <div className="master-status-edit"><label>Atual<input type="number" value={track.current ?? 0} onChange={e => updateTrack(character.id, track.id, {current:e.target.value})}/></label><label>Máximo<input type="number" value={track.masterPendingMax ? '' : (track.max ?? 10)} placeholder={track.masterPendingMax ? 'Pendente' : ''} onChange={e => updateTrack(character.id, track.id, {max:e.target.value,maxOverride:true})}/></label><div><button type="button" onClick={() => updateTrack(character.id, track.id, {current:Math.max(0,current-1)})} aria-label={'Diminuir '+track.name}>−</button><button type="button" onClick={() => updateTrack(character.id, track.id, {current:Math.min(max,current+1)})} aria-label={'Aumentar '+track.name}>+</button></div></div>
          </div>;
        })}</div>
        <div className="master-extra-grid">
          <label>Condições atuais<textarea value={(character.conditions || []).join('\n')} onChange={e => updateConditions(character.id,e.target.value)} placeholder="Uma condição por linha..."/></label>
          <label>Anotações do mestre (salvas neste dispositivo)<textarea value={character.masterNotes || ''} onChange={e => updateNotes(character.id,e.target.value)} placeholder="Informações reservadas, consequências, segredos..."/></label>
        </div>
      </article>;
    })}</div> : <div className="empty">{characters.length ? 'Nenhum tributo corresponde a esse filtro.' : 'Cadastre os personagens dos jogadores para montar o painel do mestre.'}</div>}
    <p className="master-footnote">Os valores alterados aqui também aparecem na ficha individual do personagem. O painel é salvo neste dispositivo junto com os demais dados do aplicativo.</p>
  </section>;
}

function EditableItems({ title, items = [], onChange, stats = {}, carryOverride }) {
  const update = (index, patch) => onChange(items.map((item,i)=>{if(i!==index)return item;const current=typeof item==='string'?{name:item,kind:'item',spaces:1}:item;return {...current,...patch};}));
  const addItem = kind => onChange([...items,kind==='weapon'?{name:'Adaga',kind:'weapon',weaponType:'Leve',damage:'1d4',spaces:1}:{name:'',kind:'item',spaces:1}]);
  const normalized=items.map(item=>typeof item==='string'?{name:item,kind:'item',spaces:1}:item);
  const inventory=title==='Inventário';
  const used=normalized.reduce((sum,item)=>{const w=item.kind==='weapon'?weaponData(item.name):null;return sum+(w?.spaces??Math.max(0,Number(item.spaces??1)||0));},0);
  const capacity=carryOverride!==undefined&&carryOverride!==null&&carryOverride!==''?Math.max(0,Number(carryOverride)||0):6+Math.max(0,Math.min(5,Number(stats?.Força)||0))*2;
  return <div className={inventory?'custom-section inventory-section':'custom-section'}>
    <div className="custom-heading"><div><h4>{title}</h4>{inventory&&<><p className="inventory-subtitle">EQUIPAMENTO E PERTENCES DO TRIBUTO · {items.length} REGISTROS</p><div className="inventory-capacity"><strong>{used} / {capacity}</strong><span>ESPAÇOS OCUPADOS</span><i><b style={{width:(capacity?Math.min(100,used/capacity*100):0)+'%'}}/></i></div></>}</div>{inventory?<div className="inventory-actions"><button type="button" className="inventory-add item-add" onClick={()=>addItem('item')}><Plus size={14}/> Novo item</button><button type="button" className="inventory-add weapon-add" onClick={()=>addItem('weapon')}><Plus size={14}/> Nova arma</button></div>:<button type="button" className="text-button" onClick={()=>onChange([...items,''])}><Plus size={14}/> Adicionar</button>}</div>
    {inventory&&used>capacity&&<p className="inventory-overload">Limite de carga excedido em {used-capacity} espaço(s).</p>}
    {items.length===0&&inventory&&<div className="inventory-empty"><span className="inventory-empty-mark">✦</span><strong>Compartimento vazio</strong><p>Adicione equipamentos, suprimentos ou armas ao registro deste tributo.</p></div>}
    {items.length===0&&!inventory&&<p className="muted">Nenhum item cadastrado.</p>}
    {inventory?<div className="inventory-list">{normalized.map((item,index)=>{const weapon=item.kind==='weapon'?weaponData(item.name):null;return <article className={item.kind==='weapon'?'inventory-entry weapon-entry':'inventory-entry'} key={item.id||index}>
      <div className="inventory-card-top"><span className="inventory-symbol">{item.kind==='weapon'?'⚔':'◇'}</span><span className="inventory-category">{item.kind==='weapon'?'ARSENAL DA ARENA':'PERTENCE / SUPRIMENTO'}</span><select aria-label="Categoria do inventário" value={item.kind==='weapon'?'weapon':'item'} onChange={e=>update(index,e.target.value==='weapon'?{kind:'weapon',name:'Adaga',weaponType:'Leve',damage:'1d4',spaces:1}:{kind:'item',spaces:1})}><option value="item">Item</option><option value="weapon">Arma</option></select><button type="button" className="inventory-delete" onClick={()=>onChange(items.filter((_,i)=>i!==index))} aria-label="Excluir item"><Trash2 size={14}/></button></div>
      {item.kind==='weapon'?<><label className="weapon-select-label">ARMA / CATEGORIA DE MESA<select className="weapon-choice" value={weapon?item.name:''} onChange={e=>{const selected=weaponData(e.target.value);if(selected)update(index,{name:selected.name,weaponType:selected.category,damage:selected.damage,spaces:selected.spaces});}}><option value="" disabled>Selecione uma arma</option>{WEAPONS.map(w=><option key={w.name} value={w.name}>{w.name}</option>)}</select></label><div className="weapon-stats"><label><span>CATEGORIA</span><strong>{weapon?.category||'—'}</strong></label><label className="damage-field"><span>DADO DA CATEGORIA</span><strong>{weapon?.damage||'—'}</strong></label><label><span>ESPAÇOS</span><strong>{weapon?.spaces??'—'}</strong></label></div><div className="item-note">CRÍTICO: ROLE O DADO DE IMPACTO DUAS VEZES E SOME O BÔNUS UMA ÚNICA VEZ.</div><small className="muted">O livro define os dados por categoria (1d4, 1d6, 1d8), mas não fixa a categoria de cada arma pelo nome. Confirme a classificação com o mestre.</small></>:<><input className="inventory-name" aria-label="Nome do item" value={item.name||''} onChange={e=>update(index,{name:e.target.value})} placeholder="Nome do item"/><label className="item-space-select">ESPAÇOS OCUPADOS<select value={Number(item.spaces??1)} onChange={e=>update(index,{spaces:Number(e.target.value)})}><option value="1">1 espaço</option><option value="2">2 espaços</option></select></label></>}
    </article>;})}</div>:normalized.map((item,index)=><div className="custom-row single" key={index}><input value={typeof items[index]==='string'?items[index]:(item.name||'')} onChange={e=>onChange(items.map((value,i)=>i===index?e.target.value:value))} placeholder={'Novo item de '+title.toLowerCase()}/><button type="button" className="icon-button" onClick={()=>onChange(items.filter((_,i)=>i!==index))} aria-label="Excluir item"><Trash2 size={14}/></button></div>)}
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

const districtVisuals = {
  1: { query: 'luxury jewelry gold gemstones', label: 'Luxo e joalheria' },
  2: { query: 'marble quarry stone architecture', label: 'Pedreiras e mármore' },
  3: { query: 'electronics circuit board technology', label: 'Tecnologia e circuitos' },
  4: { query: 'fishing harbor coastal boats ocean', label: 'Pesca e litoral' },
  5: { query: 'hydroelectric dam power station', label: 'Energia e barragens' },
  6: { query: 'railway train transport station', label: 'Transporte e ferrovias' },
  7: { query: 'deep green forest timber lumber', label: 'Florestas e madeira' },
  8: { query: 'textile factory weaving fabric', label: 'Tecidos e tecelagem' },
  9: { query: 'golden wheat grain field harvest', label: 'Grãos e colheita' },
  10: { query: 'cattle ranch grazing pasture', label: 'Pecuária e campos' },
  11: { query: 'agriculture plantation orchard fields', label: 'Agricultura e plantações' },
  12: { query: 'coal mine industrial mining landscape', label: 'Mineração de carvão' },
  13: { query: 'underground bunker concrete architecture', label: 'Subsolo e concreto' }
};

const CAPITOL_ANTHEM = `${import.meta.env.BASE_URL}Horn%20of%20Plenty%20-%20Anthem%20of%20the%20Unified%20Districts%20of%20Panem.mp3`;

const nav = [
  ['Visão geral', 'overview', Flag], ['Personagens', 'characters', Users],
  ['Campanhas', 'campaigns', BookOpen], ['Sessões', 'games', Swords],
  ['Arena', 'arena', Bird], ['Mestre', 'master', ShieldCheck], ['Regras', 'rules', BookOpen], ['Configurações', 'settings', Settings]
];

export default function App() {
  const [page, setPage] = useState('overview');
  const [characters, setCharacters] = useState(() => readSaved('hv-characters'));
  const [campaigns, setCampaigns] = useState(() => readSaved('hv-campaigns'));
  const [sessions, setSessions] = useState(() => readSaved('hv-sessions'));
  const [arena, setArena] = useState(() => readSaved('hv-arena', {}));
  const [settings, setSettings] = useState(() => readSaved('hv-settings', { theme: 'capital', accent: 'theme', backgroundImage: '' }));
  const [districtImages, setDistrictImages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hv-district-images') || '{}'); }
    catch { return {}; }
  });
  const [importStatus, setImportStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const openingAudio = useRef(null);
  const fadeTimer = useRef(null);
  const fadeInterval = useRef(null);
  const startOpeningAudio = () => {
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    if (fadeInterval.current) window.clearInterval(fadeInterval.current);
    if (!openingAudio.current) {
      openingAudio.current = new Audio(CAPITOL_ANTHEM);
      openingAudio.current.preload = 'auto';
    }
    const audio = openingAudio.current;
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().then(() => {
      fadeTimer.current = window.setTimeout(() => {
        const fadeStarted = Date.now();
        fadeInterval.current = window.setInterval(() => {
          const progress = Math.min(1, (Date.now() - fadeStarted) / 2000);
          audio.volume = Math.max(0, 1 - progress);
          if (progress >= 1) {
            window.clearInterval(fadeInterval.current);
            fadeInterval.current = null;
            audio.pause();
            audio.currentTime = 0;
          }
        }, 40);
      }, 10000);
    }).catch(() => {
      // Alguns navegadores exigem uma interação antes de liberar a reprodução.
    });
  };
  useEffect(() => localStorage.setItem('hv-characters', JSON.stringify(characters)), [characters]);
  useEffect(() => localStorage.setItem('hv-campaigns', JSON.stringify(campaigns)), [campaigns]);
  useEffect(() => localStorage.setItem('hv-sessions', JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem('hv-arena', JSON.stringify(arena)), [arena]);
  useEffect(() => localStorage.setItem('hv-settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('hv-district-images', JSON.stringify(districtImages)), [districtImages]);
  useEffect(() => {
    let cancelled = false;
    const loadDistrictImages = async () => {
      const missing = Object.entries(districtVisuals).filter(([number]) => !districtImages[number]);
      const found = await Promise.all(missing.map(async ([number, visual]) => {
        try {
          const response = await fetch('https://quarry.siteko.tech/api/v1/images?q=' + encodeURIComponent(visual.query) + '&per_page=1');
          if (!response.ok) return null;
          const data = await response.json();
          const image = data.images?.[0];
          const url = image?.urls?.['1200'] || image?.urls?.['800'] || image?.urls?.['400'];
          return url ? [number, { url, title: image.title || visual.label, author: image.author || '', license: image.licence || 'cc0' }] : null;
        } catch { return null; }
      }));
      if (!cancelled) setDistrictImages(current => ({ ...current, ...Object.fromEntries(found.filter(Boolean)) }));
    };
    loadDistrictImages();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (settings.soundEnabled === false) return;
    const timer = window.setTimeout(startOpeningAudio, 450);
    return () => {
      window.clearTimeout(timer);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      if (fadeInterval.current) window.clearInterval(fadeInterval.current);
    };
  }, []);
  const active = characters.find(c => c.id === selected);
  const activeDistrictTheme = getDistrictTheme(active?.district);
  const activeDistrictImage = activeDistrictTheme ? districtImages[activeDistrictTheme.number]?.url : '';
  const filtered = useMemo(() => characters.filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase())), [characters, search]);
  const updateCharacter = patch => setCharacters(items => items.map(c => {if(c.id!==selected)return c;let next={...c,...patch};if(patch.tracks){const map={fome:'fome',sede:'sede',exaustao:'exaustao',estabilidade:'estabilidade'};const survival={...(c.survival||{})};patch.tracks.forEach(t=>{const key=map[t.id];if(key)survival[key]=Math.max(0,Math.min(10,Number(t.current)||0));});next={...next,survival};}return next;}));
  const addHistoryEntry = () => updateCharacter({ history: [...(active?.history || []), { id: Date.now(), date: new Date().toLocaleDateString('en-CA'), title: 'Novo acontecimento', description: '' }] });
  const updateHistoryEntry = (id, patch) => updateCharacter({ history: (active?.history || []).map(entry => entry.id === id ? { ...entry, ...patch } : entry) });
  const removeHistoryEntry = id => updateCharacter({ history: (active?.history || []).filter(entry => entry.id !== id) });
  const exportBackup = () => {
    const payload = { app: 'Jogos Vorazes RPG Companion', version: 1, exportedAt: new Date().toISOString(), characters, campaigns, sessions, arena, settings, districtImages };
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
        setSettings(data.settings && typeof data.settings === 'object' ? data.settings : { theme: 'capital', accent: 'theme', backgroundImage: '' });
        setDistrictImages(data.districtImages && typeof data.districtImages === 'object' ? data.districtImages : {});
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
    '--app-accent': settings.accent === 'red' ? '#b5363e' : settings.accent === 'teal' ? '#55a9a0' : settings.accent === 'gold' ? '#b9975c' : selectedDistrictTheme?.accent || baseTheme.accent,
    '--district-accent': selectedDistrictTheme?.accent || '#c6a36a',
    '--district-deep': selectedDistrictTheme?.deep || '#30251d',
    ...(settings.backgroundImage ? { backgroundImage: 'linear-gradient(rgba(18,17,15,.91),rgba(18,17,15,.96)), url("' + settings.backgroundImage.replace(/"/g, '') + '")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {})
  };
  useEffect(() => {
    const openCharacter = event => { setSelected(event.detail); setPage('characters'); };
    window.addEventListener('hv-open-character', openCharacter);
    return () => window.removeEventListener('hv-open-character', openCharacter);
  }, []);
  const uploadBackground = file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { window.alert('Selecione um arquivo de imagem.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1800;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        setSettings(s => ({ ...s, backgroundImage: canvas.toDataURL('image/jpeg', 0.8) }));
      };
      image.onerror = () => window.alert('Não foi possível abrir essa imagem.');
      image.src = reader.result;
    };
    reader.onerror = () => window.alert('Não foi possível carregar o arquivo.');
    reader.readAsDataURL(file);
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
    const c = { id: Date.now(), name: 'Novo tributo', district: '', age: '', story: '', objective:'', appearance: '', image: '', psychology:{Coragem:'',Disciplina:'',Instinto:'',Empatia:'',Astúcia:''}, importantBond:'', personalLimit:'', allianceName:'', xp:0, trainingGrade:null, social:{popularidade:20,reputacao:50,patrocinadores:10,confianca:50,coesao:50,influencia:20}, stats: {}, skills: {}, inventory: [], conditions: [], tracks: [{id:'vida',name:'Vida',current:16,max:16,autoMax:true},{id:'fome',name:'Fome',current:0,max:10},{id:'sede',name:'Sede',current:0,max:10},{id:'exaustao',name:'Exaustão',current:0,max:10},{id:'estabilidade',name:'Estabilidade emocional',current:10,max:10}] };
    setCharacters(items => [...items, c]); setSelected(c.id); setPage('characters');
  };
  const addCampaign = () => setCampaigns(items => [...items, { id: Date.now(), name: 'Nova campanha', description: '', characterIds: [] }]);
  const updateCampaign = (id, patch) => setCampaigns(items => items.map(c => c.id === id ? { ...c, ...patch } : c));
  const addSession = () => setSessions(items => [...items, { id: Date.now(), campaignId: campaigns[0]?.id ? String(campaigns[0].id) : '', title: 'Nova sessão', date: new Date().toLocaleDateString('en-CA'), summary: '', events: [] }]);
  const updateSession = (id, patch) => setSessions(items => items.map(session => session.id === id ? { ...session, ...patch } : session));
  const title = nav.find(n => n[1] === page)?.[0] || 'Visão geral';

  return <div className="shell" style={appearance}>
    <aside className="sidebar">
      <div className="brand"><div className="seal"><CapitolEmblem size={31}/></div><div><span>ARQUIVOS DA CAPITAL</span><strong>JOGOS VORAZES</strong></div></div>
      <div className="season-label">COMPANION DE RPG</div>
      <nav className="app-navigation" aria-label="Navegação principal">{nav.map(([label, key, Icon]) => <button key={key} aria-current={page === key ? 'page' : undefined} title={label} className={page === key ? 'nav-item active' : 'nav-item'} onClick={() => { setPage(key); setSelected(null); }}><Icon size={17}/><span className="nav-label">{label}</span><ChevronRight size={14}/></button>)}</nav>
      <div className="sidebar-bottom"><span>QUE A SORTE ESTEJA</span><b>SEMPRE A SEU FAVOR.</b><small>VERSÃO 0.2 · EM DESENVOLVIMENTO</small></div>
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
        {active ? <><button className="back" onClick={() => setSelected(null)}>← Todos os personagens</button><div className="tribute-identity" style={activeDistrictTheme ? {'--district-accent':activeDistrictTheme.accent,'--district-deep':activeDistrictTheme.deep} : {}}><div className="tribute-identity-portrait">{active.image ? <img src={active.image} alt={'Retrato de ' + active.name}/> : <div className="avatar large"><Users size={38}/></div>}</div><div className="tribute-identity-info"><span className="eyebrow">DOSSIÊ OFICIAL • TRIBUTO</span><h2>{active.name || 'Tributo sem nome'}</h2><div className="tribute-tags"><span>DISTRITO {active.district || '—'}</span><span>{active.age ? active.age + ' ANOS' : 'IDADE NÃO INFORMADA'}</span><span>{(active.conditions || []).length ? (active.conditions || []).length + ' CONDIÇÃO(ÕES)' : 'STATUS NÃO REGISTRADO'}</span></div><p>REGISTRO INDIVIDUAL • PANEM / ARQUIVO CENTRAL</p></div><span className="tribute-seal"><CapitolEmblem size={58}/></span></div>{(() => { const theme = getDistrictTheme(active.district); return <div className="district-profile" style={{...(theme ? {'--district-accent':theme.accent,'--district-deep':theme.deep} : {}), ...(activeDistrictImage ? {backgroundImage:'linear-gradient(90deg,rgba(13,12,11,.93),rgba(13,12,11,.65)),url("'+activeDistrictImage+'")'} : {})}}><div className="district-profile-top"><span className="eyebrow">IDENTIDADE DO DISTRITO {theme ? theme.number : ''}</span><strong>{theme ? theme.name : 'Distrito não definido'}</strong></div><p>{theme ? theme.note : 'Informe o número do distrito para aplicar sua identidade visual.'}</p></div>; })()}<div className="profile-overview"><div><span>DISTRITO</span><strong>{active.district || "—"}</strong></div><div><span>IDADE</span><strong>{active.age || "—"}</strong></div><div><span>ATRIBUTOS</span><strong>{Object.keys(active.stats || {}).length}</strong></div><div><span>REGISTROS</span><strong>{(active.history || []).length}</strong></div></div><div className="editor">
          <div className="portrait"><>{active.image ? <img className="portrait-image" src={active.image} alt="Retrato do personagem" onError={e => { e.currentTarget.style.display = 'none'; }}/> : <div className="avatar large"><Users size={38}/></div>}</><label className="photo-picker"><span><Plus size={15}/> Escolher foto da galeria</span><input type="file" accept="image/*" onChange={e => { uploadPortrait(e.target.files?.[0]); e.target.value = ''; }}/></label><label className="upload">Ou usar URL do retrato<input value={active.image || ''} onChange={e => updateCharacter({image:e.target.value})} placeholder="Cole um link de imagem"/></label>{active.image && <button type="button" className="text-button remove-photo" onClick={() => updateCharacter({image:''})}>Remover retrato</button>}</div>
          <div className="fields"><label>Nome<input value={active.name} onChange={e => updateCharacter({name:e.target.value})}/></label><div className="two"><label>Distrito<select value={active.district || ''} onChange={e => updateCharacter({district:e.target.value})}><option value="">Selecionar distrito</option>{Array.from({length:12},(_,i)=>i+1).map(n=><option key={n} value={String(n)}>Distrito {n}</option>)}</select></label><label>Idade<select value={active.age || ''} onChange={e => updateCharacter({age:e.target.value})}><option value="">Selecionar idade</option>{Array.from({length:7},(_,i)=>i+12).map(n=><option key={n} value={String(n)}>{n} anos</option>)}</select></label></div><label>História<textarea value={active.story} onChange={e => updateCharacter({story:e.target.value})} placeholder="Conte a história do personagem..."/></label><label>Objetivo pessoal<textarea value={active.objective||''} onChange={e=>updateCharacter({objective:e.target.value})} placeholder="O que este tributo deseja alcançar?"/></label><label>Aparência<textarea value={active.appearance || ''} onChange={e => updateCharacter({appearance:e.target.value})} placeholder="Descreva características visuais, roupas, marcas e detalhes do tributo..."/></label><section className="custom-section"><h4>Personalidade e vínculos pessoais</h4><p className="muted">Os cinco traços são narrativos: não concedem bônus numéricos nem obrigam o personagem a agir de determinada maneira.</p>{['Coragem','Disciplina','Instinto','Empatia','Astúcia'].map(k=><label className="rule-line" key={k}>{k}<textarea value={(active.psychology||{})[k]||''} onChange={e=>updateCharacter({psychology:{...(active.psychology||{}),[k]:e.target.value}})} placeholder={'Como '+k.toLowerCase()+' se manifesta neste tributo?'}/></label>)}<label className="rule-line">Vínculo importante<textarea value={active.importantBond||''} onChange={e=>updateCharacter({importantBond:e.target.value})} placeholder="Pessoa, promessa ou relação importante"/></label><label className="rule-line">Limite pessoal<textarea value={active.personalLimit||''} onChange={e=>updateCharacter({personalLimit:e.target.value})} placeholder="O que o personagem não aceita fazer?"/></label></section><p className="note">Ficha alinhada ao Livro Básico 2.0. Os valores derivados são calculados automaticamente; regras propostas para teste permanecem identificadas como tal.</p>
            <CharacterBuildSheet stats={active.stats || {}} skills={active.skills || {}} age={active.age} district={active.district} onStats={stats => updateCharacter({stats})} onSkills={skills => updateCharacter({skills})} applyDistrictPenalty={!!active.applyDistrictPenalty} onDistrictPenaltyChange={value=>updateCharacter({applyDistrictPenalty:value})}/>
            <StatusTracks tracks={active.tracks || []} stats={active.stats || {}} district={active.district || ""} capacityOverride={active.carryOverride} onCapacityOverride={carryOverride => updateCharacter({carryOverride})} onChange={tracks => updateCharacter({tracks})}/><section className="custom-section"><h4>Indicadores da ficha</h4><div className="modifier-summary"><div><span>POPULARIDADE</span><strong>{active.social?.popularidade??20}/100</strong></div><div><span>REPUTAÇÃO</span><strong>{active.social?.reputacao??50}/100</strong></div><div><span>INTERESSE</span><strong>{active.social?.patrocinadores??10}/100</strong></div><div><span>AVALIAÇÃO</span><strong>{active.trainingGrade??'—'} / 12</strong></div></div><label className="rule-line">XP<input type="number" min="0" value={active.xp??0} onChange={e=>updateCharacter({xp:Math.max(0,Number(e.target.value)||0)})}/></label><label className="rule-line">Condição<select value={active.conditionLevel||'Nenhuma'} onChange={e=>updateCharacter({conditionLevel:e.target.value})}>{['Nenhuma','Leve','Moderada','Grave','Crítica'].map(v=><option key={v}>{v}</option>)}</select></label><label className="rule-line">Nome da aliança<input value={active.allianceName||''} onChange={e=>updateCharacter({allianceName:e.target.value})} placeholder="Sem aliança"/></label><div className="modifier-summary"><div><span>CONFIANÇA</span><strong>{active.social?.confianca??50}/100</strong></div><div><span>COESÃO</span><strong>{active.social?.coesao??50}/100</strong></div><div><span>INFLUÊNCIA</span><strong>{active.social?.influencia??20}/100</strong></div></div></section><section className="custom-section"><h4>Relações individuais</h4><p className="muted">Valores direcionais de −5 a +5. Cada personagem pode ter uma relação diferente com este tributo.</p><select value="" onChange={e=>{const other=characters.find(c=>String(c.id)===e.target.value);if(other&&(active.relationships||[]).length<6&&!(active.relationships||[]).some(r=>String(r.characterId)===String(other.id)))updateCharacter({relationships:[...(active.relationships||[]),{id:Date.now(),characterId:other.id,value:0,notes:''}]});}}><option value="">Adicionar relação com outro personagem…</option>{(active.relationships||[]).length<6&&characters.filter(c=>c.id!==active.id&&!(active.relationships||[]).some(r=>String(r.characterId)===String(c.id))).map(c=><option key={c.id} value={String(c.id)}>{c.name} • Distrito {c.district||'—'}</option>)}</select>{(active.relationships||[]).map(r=>{const person=characters.find(c=>String(c.id)===String(r.characterId));return <div className="relationship-item" key={r.id}><strong>{person?.name||'Personagem removido'}</strong><label>Relação<input type="number" min="-5" max="5" value={r.value??0} onChange={e=>updateCharacter({relationships:(active.relationships||[]).map(x=>x.id===r.id?{...x,value:Math.max(-5,Math.min(5,Number(e.target.value)||0))}:x)})}/></label><input value={r.notes||''} placeholder="Histórico do vínculo" onChange={e=>updateCharacter({relationships:(active.relationships||[]).map(x=>x.id===r.id?{...x,notes:e.target.value}:x)})}/><button type="button" className="text-button" onClick={()=>updateCharacter({relationships:(active.relationships||[]).filter(x=>x.id!==r.id)})}>Remover</button></div>})}</section>
            <EditableItems title="Inventário" items={active.inventory} stats={active.stats || {}} carryOverride={active.carryOverride} onChange={inventory => updateCharacter({inventory})}/>
            <EditableItems title="Condições" items={active.conditions} onChange={conditions => updateCharacter({conditions})}/><section className="custom-section"><h4>Anotações da ficha</h4><textarea value={active.notes||''} onChange={e=>updateCharacter({notes:e.target.value})} placeholder="Anotações importantes sobre o tributo..."/></section>
            <div className="custom-section history-section">
              <div className="custom-heading"><h4><History size={16}/> Histórico do tributo</h4><button type="button" className="text-button" onClick={addHistoryEntry}><Plus size={14}/> Registrar acontecimento</button></div>
              {(active.history || []).length === 0 && <p className="muted">Ainda não há acontecimentos registrados para este personagem.</p>}
              {(active.history || []).map(entry => <article className="history-entry" key={entry.id}>
                <div className="history-entry-head"><input aria-label="Título do acontecimento" value={entry.title || ''} onChange={e => updateHistoryEntry(entry.id, {title:e.target.value})}/><button type="button" className="icon-button" onClick={() => removeHistoryEntry(entry.id)} aria-label="Excluir acontecimento"><Trash2 size={14}/></button></div>
                <input className="history-date" type="date" value={entry.date || ''} onChange={e => updateHistoryEntry(entry.id, {date:e.target.value})}/>
                <textarea value={entry.description || ''} onChange={e => updateHistoryEntry(entry.id, {description:e.target.value})} placeholder="O que aconteceu? Quem participou? Quais foram as consequências?"/>
              </article>)}
            </div>
            <button className="danger" onClick={() => { if (window.confirm('Excluir este tributo? Essa ação não pode ser desfeita.')) { setCharacters(items => items.filter(c => c.id !== active.id)); setCampaigns(items => items.map(campaign => ({ ...campaign, characterIds: (campaign.characterIds || []).filter(id => id !== active.id) }))); setSelected(null); } }}><Trash2 size={15}/> Excluir personagem</button></div>
        </div></> : <><div className="section-heading"><div><span className="eyebrow">CADASTRO DE TRIBUTOS</span><h3>Personagens</h3></div><button className="primary" onClick={addCharacter}><Plus size={16}/> Novo personagem</button></div><div className="search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar personagem..."/></div><div className="character-grid">{filtered.map(c => <button className="character-card" key={c.id} style={getDistrictTheme(c.district) ? {'--district-accent':getDistrictTheme(c.district).accent,'--district-deep':getDistrictTheme(c.district).deep} : {}} onClick={() => setSelected(c.id)}><>{c.image ? <img className="character-thumb" src={c.image} alt="" /> : <div className="avatar"><Users size={25}/></div>}</><span>{c.district || 'DISTRITO NÃO DEFINIDO'}</span><strong>{c.name}</strong><small>EDITAR FICHA <ChevronRight size={13}/></small></button>)}</div>{filtered.length === 0 && <div className="empty">Nenhum personagem encontrado com esse nome.</div>}</>}
      </section>}
      {page === 'campaigns' && <section className="content"><div className="section-heading"><div><span className="eyebrow">HISTÓRIAS DE PANEM</span><h3>Campanhas</h3></div><button className="primary" onClick={addCampaign}><Plus size={16}/> Nova campanha</button></div>
        {campaigns.map(c => <article className="campaign-card" key={c.id}>
          <div className="campaign-title"><input aria-label="Nome da campanha" value={c.name} onChange={e => updateCampaign(c.id, {name:e.target.value})}/><button className="icon-button" onClick={() => { if (window.confirm('Excluir esta campanha? As sessões serão mantidas, mas ficarão sem campanha vinculada.')) { setCampaigns(items => items.filter(x => x.id !== c.id)); setSessions(items => items.map(session => String(session.campaignId) === String(c.id) ? { ...session, campaignId: '' } : session)); } }} aria-label="Excluir campanha"><Trash2 size={16}/></button></div>
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
      {page === 'master' && <MasterPanel characters={characters} setCharacters={setCharacters} campaigns={campaigns}/>}
      {page === 'rules' && <RulesPanel characters={characters} setCharacters={setCharacters}/>}
      {page === 'settings' && <section className="content">
        <div className="section-heading"><div><span className="eyebrow">PREFERÊNCIAS DO APLICATIVO</span><h3>Personalização</h3></div><Palette size={22}/></div>
        <div className="settings-card theme-settings">
          <div className="theme-intro"><span className="eyebrow">IDENTIDADE VISUAL DE PANEM</span><h4>Escolha de qual distrito é o seu aplicativo</h4><p>Não é só uma troca de papel de parede. Cada identidade muda a paleta completa da interface: fundo, painéis, bordas, detalhes, cor dos destaques e atmosfera visual. A Capital tem sua própria identidade.</p></div>
          <div className="theme-preview-grid">
            <button type="button" className={(!selectedDistrictTheme ? 'theme-choice selected' : 'theme-choice')} style={{'--theme-accent':'#c6a36a','--theme-deep':'#30251d'}} onClick={() => setSettings(s => ({...s,theme:'capital'}))}><span className="theme-swatch"><i/><i/><i/></span><strong>A CAPITAL</strong><small>Carvão, aço e dourado</small><em>{!selectedDistrictTheme ? 'IDENTIDADE ATIVA' : 'Selecionar identidade'}</em></button>
            {Object.entries(districtThemes).map(([number, theme]) => <button type="button" key={number} className={selectedDistrictNumber === Number(number) ? 'theme-choice selected' : 'theme-choice'} style={{'--theme-accent':theme.accent,'--theme-deep':theme.deep}} onClick={() => setSettings(s => ({...s,theme:`district-${number}`,accent:'theme'}))}>{districtImages[number]?.url && <img className="theme-image" src={districtImages[number].url} alt="" loading="lazy"/>}<span className="theme-swatch"><i/><i/><i/></span><strong>DISTRITO {number.padStart(2,'0')}</strong><small>{theme.name}</small><em>{selectedDistrictNumber === Number(number) ? 'IDENTIDADE ATIVA' : 'Selecionar identidade'}</em></button>)}
          </div>
          {selectedDistrictTheme && <div className="active-theme-note"><span className="active-theme-number">D{String(selectedDistrictNumber).padStart(2,'0')}</span><div><strong>{selectedDistrictTheme.name}</strong><p>{selectedDistrictTheme.note}</p></div><span className="active-theme-line"/></div>}
          <label className="arena-field">Cor de destaque personalizada<select value={settings.accent || 'theme'} onChange={e => setSettings(s => ({...s,accent:e.target.value}))}><option value="theme">Usar as cores próprias da identidade</option><option value="gold">Dourado</option><option value="red">Vermelho da Capital</option><option value="teal">Turquesa</option></select></label>
          <div className="background-picker"><div><span className="eyebrow">CENÁRIO PERSONALIZADO</span><strong>Imagem de fundo do aplicativo</strong><p>Escolha uma imagem salva no celular ou cole um endereço de imagem.</p></div><label className="primary file-import"><ImageIcon size={15}/> Escolher da galeria<input type="file" accept="image/*" onChange={e => {uploadBackground(e.target.files?.[0]);e.target.value='';}}/></label><label className="arena-field">Ou usar URL<input value={settings.backgroundImage?.startsWith('data:') ? '' : (settings.backgroundImage || '')} onChange={e => setSettings(s => ({...s,backgroundImage:e.target.value}))} placeholder="Cole um link de imagem"/></label>{settings.backgroundImage && <div className="background-preview"><img src={settings.backgroundImage} alt="Prévia do fundo escolhido"/><button type="button" className="text-button" onClick={() => setSettings(s => ({...s,backgroundImage:''}))}>Remover imagem de fundo</button></div>}</div>
          <button className="text-button" onClick={() => setSettings({theme:'capital',accent:'theme',backgroundImage:''})}>Restaurar identidade da Capital</button>
        </div>
        <div className="settings-card sound-settings"><h4>Hino de Panem • Abertura da Capital</h4><p>O hino toca ao abrir o aplicativo: volume normal nos primeiros 10 segundos e redução gradual nos 2 segundos seguintes, até silenciar. A reprodução não reinicia ao trocar de tela.</p><div className="sound-actions"><label className="sound-toggle"><input type="checkbox" checked={settings.soundEnabled !== false} onChange={e => { setSettings(s => ({...s,soundEnabled:e.target.checked})); if (e.target.checked) startOpeningAudio(); else if (openingAudio.current) { openingAudio.current.pause(); openingAudio.current.currentTime = 0; if (fadeTimer.current) window.clearTimeout(fadeTimer.current); if (fadeInterval.current) window.clearInterval(fadeInterval.current); } }}/> Tocar ao abrir o aplicativo</label><button type="button" className="text-button" onClick={startOpeningAudio}>▶ Testar abertura</button></div><small>Faixa de áudio armazenada localmente no aplicativo.</small></div>
        <div className="settings-card"><h4><Download size={17}/> Backup e transferência</h4><p>Exporte personagens, campanhas, sessões, Arena e preferências em um arquivo JSON. Para recuperar ou transferir, importe esse arquivo em outro navegador.</p><div className="backup-actions"><button className="primary" onClick={exportBackup}><Download size={15}/> Exportar backup</button><label className="primary file-import"><Upload size={15}/> Importar backup<input type="file" accept="application/json,.json" onChange={e => {importBackup(e.target.files?.[0]);e.target.value='';}}/></label></div>{importStatus && <p className="backup-status">{importStatus}</p>}</div>
        <div className="settings-card"><h4>Sobre o salvamento</h4><p>Os dados são guardados neste navegador e neste dispositivo. O backup permite transportar os registros manualmente, mas ainda não existe sincronização automática na nuvem.</p></div>
      </section>}
      <footer>O QUE FAZEMOS NESTA ARENA ECOA POR PANEM. <span>JOGOS VORAZES RPG</span></footer>
    </main>
  </div>;
}