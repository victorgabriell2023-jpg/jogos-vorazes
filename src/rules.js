export const ATTRIBUTES = ['Força','Agilidade','Vigor','Inteligência','Carisma'];
export const SKILLS = ['Atletismo','Combate','Furtividade','Arremesso','Sobrevivência','Caça','Rastreamento','Primeiros Socorros','Conhecimento de Plantas','Conhecimento de Animais','Engenharia','Percepção','Persuasão','Enganação','Intimidação','Improvisação'];
export const WEAPONS = [{"name":"Adaga","category":"Leve","damage":"1d4","spaces":1},{"name":"Faca de caça","category":"Leve","damage":"1d4","spaces":1},{"name":"Funda","category":"Leve","damage":"1d4","spaces":1},{"name":"Estilingue","category":"Leve","damage":"1d4","spaces":1},{"name":"Bastão","category":"Leve","damage":"1d4","spaces":1},{"name":"Dardo","category":"Leve","damage":"1d4","spaces":1},{"name":"Facão","category":"Intermediária","damage":"1d6","spaces":2},{"name":"Arco","category":"Intermediária","damage":"1d6","spaces":2},{"name":"Clava","category":"Intermediária","damage":"1d6","spaces":2},{"name":"Martelo","category":"Intermediária","damage":"1d6","spaces":2},{"name":"Espada","category":"Pesada","damage":"1d8","spaces":3},{"name":"Machado","category":"Pesada","damage":"1d8","spaces":3},{"name":"Lança","category":"Pesada","damage":"1d8","spaces":3},{"name":"Tridente","category":"Pesada","damage":"1d8","spaces":3},{"name":"Besta","category":"Pesada","damage":"1d8","spaces":3}];
export const weaponData = name => WEAPONS.find(weapon => weapon.name === name) || null;
export const PSYCHOLOGY = ['Coragem','Disciplina','Instinto','Empatia','Astúcia'];
export const AGE_MODIFIERS = {12:['Furtividade',1,'Atletismo',-1],13:['Percepção',1,'Intimidação',-1],14:['Improvisação',1,'Combate',-1],15:['Atletismo',1,'Primeiros Socorros',-1],16:['Rastreamento',1,'Persuasão',-1],17:['Sobrevivência',1,'Enganação',-1],18:['Persuasão',1,'Furtividade',-1]};
export const DISTRICT_MODIFIERS = {
  1:['Persuasão',1,'Sobrevivência',-1,'Etiqueta, luxo e produtos refinados.'],2:['Combate',1,'Enganação',-1,'Treinamento físico e construção.'],3:['Engenharia',1,'Atletismo',-1,'Eletrônicos e mecanismos.'],4:['Sobrevivência',1,'Engenharia',-1,'Pesca e ambientes aquáticos.'],5:['Engenharia',1,'Combate',-1,'Energia e eletricidade.'],6:['Engenharia',1,'Intimidação',-1,'Transportes e veículos.'],7:['Atletismo',1,'Persuasão',-1,'Madeira e ambientes florestais.'],8:['Improvisação',1,'Combate',-1,'Tecidos, costura e reparos.'],9:['Conhecimento de Plantas',1,'Intimidação',-1,'Grãos e agricultura.'],10:['Conhecimento de Animais',1,'Engenharia',-1,'Criação e comportamento animal.'],11:['Conhecimento de Plantas',1,'Persuasão',-1,'Agricultura e plantações.'],12:['Sobrevivência',1,'Persuasão',-1,'Mineração e ambientes subterrâneos.']
};
export const DISTRICT_HP = {1:1,2:2,3:0,4:1,5:0,6:0,7:1,8:0,9:0,10:1,11:1,12:1};
export const DIFFICULTIES = [['Muito fácil',6],['Fácil',9],['Moderada',12],['Difícil',15],['Muito difícil',18],['Extrema',21],['Excepcional',24]];
export const TRAINING_SCORE_BANDS = [[-Infinity,8,2],[9,11,4],[12,14,6],[15,17,8],[18,20,10],[21,Infinity,12]];
export const trainingScore = total => { if(total===undefined||total===null||total==='') return null; const n=Number(total); return Number.isFinite(n) ? (TRAINING_SCORE_BANDS.find(([min,max])=>n>=min&&n<=max)?.[2] ?? 2) : null; };
export const ARENA_EVENTS = ['Mudança climática ficcional','Mensagem pública','Encontro social','Oportunidade de recurso','Desafio ambiental abstrato','Momento de descanso'];
export const SPONSOR_GIFTS = [{name:'Comum',cost:15,examples:'Porção de alimento ou água'},{name:'Útil',cost:30,examples:'Kit simples ou recurso de exploração'},{name:'Raro',cost:50,examples:'Kit completo ou recurso narrativo especial'}];
export function sponsorDailyGain(popularity=20,reputation=50){const tier=[[0,19,2],[20,39,4],[40,59,6],[60,79,8],[80,100,10]].find(([a,b])=>popularity>=a&&popularity<=b);return Math.max(0,(tier?.[2]||2)+(reputation>75?2:reputation<25?-2:0));}
export function weightedTrainingGrade(scores={}){return Math.max(1,Math.min(12,Math.round(TRAINING_WEIGHTS.reduce((sum,g)=>sum+Number(scores[g.name]??2)*g.weight/100,0))));}
export const TRAINING_WEIGHTS = [
  {name:'Combate (provas abstratas)',weight:30,skills:['Combate','Atletismo','Arremesso']},
  {name:'Criatividade',weight:20,skills:['Improvisação','Furtividade','Enganação']},
  {name:'Inteligência',weight:20,skills:['Engenharia','Percepção','Conhecimento de Plantas','Conhecimento de Animais']},
  {name:'Sobrevivência',weight:20,skills:['Sobrevivência','Caça','Rastreamento','Primeiros Socorros']},
  {name:'Apresentação',weight:10,skills:['Persuasão','Intimidação'],note:'Pode ser avaliada em cena própria.'}
];
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number(n)||0));
export function effectiveSkills(character={}) {
  const base=character.skills||{}, age=AGE_MODIFIERS[Number(character.age)], district=DISTRICT_MODIFIERS[Number(character.district)], result={};
  SKILLS.forEach(skill=>{let v=clamp(base[skill],0,99);if(age?.[0]===skill)v+=age[1];if(age?.[2]===skill)v+=age[3];if(district?.[0]===skill)v+=district[1];if(district?.[2]===skill)v+=district[3];result[skill]=Math.max(0,v);});
  return result;
}
export function derived(character={}) {
  const stats=character.stats||{}, vigor=clamp(stats.Vigor,0,5), strength=clamp(stats.Força,0,5), district=Number(character.district);
  const districtBonus=Object.prototype.hasOwnProperty.call(DISTRICT_HP,district)?DISTRICT_HP[district]:null;
  return {hpBase:16+vigor*2,hpDistrictBonus:districtBonus,hpMax:districtBonus===null?null:16+vigor*2+districtBonus,carry:6+strength*2,skills:effectiveSkills(character)};
}
export function rollD20({attribute=0,skill=0,dc=12,mode='normal'}={}) {
  const a=1+Math.floor(Math.random()*20), b=mode==='normal'?null:1+Math.floor(Math.random()*20);
  const die=mode==='advantage'?Math.max(a,b):mode==='disadvantage'?Math.min(a,b):a;
  const total=die+Number(attribute||0)+Number(skill||0);
  return {a,b,die,total,dc:Number(dc),success:total>=Number(dc),critical:die===20,naturalFail:die===1};
}
export function survivalPenalty(value){const n=clamp(value,0,10);if(n>=10)return 'Condição crítica';if(n>=9)return 'Desvantagem';if(n>=7)return -3;if(n>=5)return -2;if(n>=3)return -1;return 0;}
