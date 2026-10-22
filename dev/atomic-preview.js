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
function render(){let el=document.getElementById('atomic-dev-tasks');if(!el){el=document.createElement('aside');el.id='atomic-dev-tasks';el.setAttribute('aria-label','Match Atomic Challenges');Object.assign(el.style,{position:'fixed',right:'max(6px,env(safe-area-inset-right))',top:'max(6px,env(safe-area-inset-top))',zIndex:'999',width:'auto',maxWidth:'min(270px,calc(100vw - 12px))',borderRadius:'13px',background:'rgba(3,12,23,.96)',color:'#d4f0ff',border:'1px solid #40718a',font:'12px system-ui',boxShadow:'0 5px 15px #0005'});document.body.append(el)}el.replaceChildren();const head=document.createElement('button');head.type='button';head.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:6px 9px;border:0;border-radius:12px;background:transparent;color:#d4f0ff;text-align:left;font:700 10px system-ui;cursor:pointer';const done=tasks.filter(t=>t.progress>=t.target).length;head.textContent='TASKS '+done+'/'+tasks.length;const arrow=document.createElement('span');arrow.textContent=el.dataset.expanded==='true'?'▾':'▴';head.append(arrow);head.setAttribute('aria-expanded',String(el.dataset.expanded==='true'));head.setAttribute('aria-controls','atomic-dev-task-details');head.addEventListener('click',()=>{el.dataset.expanded=el.dataset.expanded==='true'?'false':'true';render()});el.append(head);const body=document.createElement('div');body.id='atomic-dev-task-details';body.hidden=el.dataset.expanded!=='true';body.style.cssText='padding:0 10px 10px;max-height:min(40vh,260px);overflow:auto';for(const t of tasks){const line=document.createElement('div');line.style.cssText='display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-top:1px solid #234357';const name=document.createElement('span');name.textContent=(t.progress>=t.target?'✓ ':'○ ')+t.name;const count=document.createElement('strong');count.textContent=Math.min(t.progress,t.target)+'/'+t.target;line.append(name,count);body.append(line)}const footer=document.createElement('div');footer.style.cssText='margin-top:7px;opacity:.85;line-height:1.4';footer.textContent=lastReward?'DEV earned: '+['p','n','e'].map(k=>k+' +'+lastReward[k]).join(' · '):'Complete tasks for DEV test particles';body.append(footer);const link=document.createElement('a');link.href='./atomic-tasks.html';link.textContent='VIEW ALL TASKS →';link.style.cssText='display:inline-block;margin-top:9px;color:#a3e4ff;font-weight:700;pointer-events:auto';body.append(link);el.append(body)}

function start(id){if(typeof id!=='string'||!id)return;matchId=id;seq=0;events=[];lastReward=null;tasks=definitions.map(d=>({...d,progress:0}));render()}
function emit(type,detail={}){try{if(!matchId||!definitions.some(d=>d.type===type)&&!['gold_fire','protect_blocked','core_takeover','core_recovered','pp_earned','protect_restored'].includes(type))return;const turn=Number.isSafeInteger(detail.turn)?detail.turn:null;const e={id:matchId+':'+(++seq),matchId,actor:'player',turn,type};for(const k of ['amount','value','completed','won'])if(Object.hasOwn(detail,k))e[k]=detail[k];events.push(Object.freeze(e));for(const t of tasks)if(t.type===type){t.progress+=type==='core_destroyed'?Math.max(0,Number(detail.amount)||0):1}if(type==='match_end'&&detail.completed===true)lastReward=awardTestParticles();render()}catch{/* preview must not interrupt gameplay */}}
Object.defineProperty(window,'TiraAtomicDev',{value:Object.freeze({start,emit,get events(){return events.map(e=>({...e}))},get tasks(){return tasks.map(t=>({...t}))}}),configurable:false});document.addEventListener('DOMContentLoaded',()=>{const panel=document.getElementById('atomic-dev-tasks');if(panel)panel.dataset.expanded='false';render()});
})();
