// TIRA! /dev Atomic Challenges with browser-local TEST particle rewards. Not official or trusted.
(()=>{'use strict';
const definitions=[
{id:'convert_once',name:'Convert a Cell Card',type:'card_convert',target:1},
{id:'fire_twice',name:'Fire twice',type:'fire_numeric',target:2},
{id:'arm_protect',name:'Arm Protect',type:'protect_armed',target:1},
{id:'destroy_one',name:'Destroy Core progress',type:'core_destroyed',target:1},
{id:'finish_game',name:'Finish the match',type:'match_end',target:1}
];
let matchId=null,seq=0,events=[],tasks=definitions.map(d=>({...d,progress:0}));
const KEY='tira-dev-atomic-profile-v1',RECEIPTS='tira-dev-atomic-match-receipts-v1';
const particleByTask={convert_once:'p',fire_twice:'e',arm_protect:'n',destroy_one:'p',finish_game:'e'};
function awardTestParticles(){
 try{
  const old=JSON.parse(localStorage.getItem(KEY)||'null');
  const state=old&&old.version===1&&old.stock&&old.deposit&&Array.isArray(old.completed)?old:{version:1,name:'Guest Explorer',stock:{p:0,n:0,e:0},deposit:{p:0,n:0,e:0},completed:[],combines:0};
  const receipts=JSON.parse(localStorage.getItem(RECEIPTS)||'[]');
  if(!Array.isArray(receipts)||receipts.includes(matchId))return null;
  const reward={p:0,n:0,e:0};for(const task of tasks)if(task.progress>=task.target)reward[particleByTask[task.id]]++;
  if(!['p','n','e'].every(k=>Number.isSafeInteger(state.stock[k])&&state.stock[k]>=0&&state.stock[k]+reward[k]<=1000000))return null;
  for(const k of ['p','n','e'])state.stock[k]+=reward[k];
  // Local DEV preview only. Save the receipt first to prevent double awards on retry.
  localStorage.setItem(RECEIPTS,JSON.stringify([...receipts.slice(-199),matchId]));
  localStorage.setItem(KEY,JSON.stringify(state));return reward;
 }catch{return null}
}
let lastReward=null;
function render(){let el=document.getElementById('atomic-dev-tasks');if(!el){el=document.createElement('aside');el.id='atomic-dev-tasks';el.setAttribute('aria-label','Atomic Challenges development preview');Object.assign(el.style,{position:'fixed',right:'10px',bottom:'10px',zIndex:'999',maxWidth:'245px',padding:'10px 12px',borderRadius:'12px',background:'rgba(3,12,23,.94)',color:'#d4f0ff',border:'1px solid #40718a',font:'12px system-ui',pointerEvents:'none'});document.body.append(el)}el.replaceChildren();const title=document.createElement('strong');title.textContent='ATOMIC CHALLENGES · DEV';el.append(title);for(const t of tasks){const line=document.createElement('div');line.style.marginTop='5px';line.textContent=(t.progress>=t.target?'✓ ':'○ ')+t.name+' '+Math.min(t.progress,t.target)+'/'+t.target;el.append(line)}const footer=document.createElement('div');footer.style.cssText='margin-top:7px;opacity:.7';footer.textContent=lastReward?'DEV TEST earned: '+['p','n','e'].map(k=>k+' +'+lastReward[k]).join(' · ')+' · Open Profile → Atomic Lab':'Local TEST particles awarded when the match ends';el.append(footer)}
function start(id){if(typeof id!=='string'||!id)return;matchId=id;seq=0;events=[];lastReward=null;tasks=definitions.map(d=>({...d,progress:0}));render()}
function emit(type,detail={}){try{if(!matchId||!definitions.some(d=>d.type===type)&&!['gold_fire','protect_blocked','core_takeover','core_recovered','pp_earned','protect_restored'].includes(type))return;const turn=Number.isSafeInteger(detail.turn)?detail.turn:null;const e={id:matchId+':'+(++seq),matchId,actor:'player',turn,type};for(const k of ['amount','value','completed','won'])if(Object.hasOwn(detail,k))e[k]=detail[k];events.push(Object.freeze(e));for(const t of tasks)if(t.type===type){t.progress+=type==='core_destroyed'?Math.max(0,Number(detail.amount)||0):1}if(type==='match_end'&&detail.completed===true)lastReward=awardTestParticles();render()}catch{/* preview must not interrupt gameplay */}}
Object.defineProperty(window,'TiraAtomicDev',{value:Object.freeze({start,emit,get events(){return events.map(e=>({...e}))},get tasks(){return tasks.map(t=>({...t}))}}),configurable:false});document.addEventListener('DOMContentLoaded',render);
})();
