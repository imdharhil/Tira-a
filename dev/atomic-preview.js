// TIRA! /dev Atomic Challenges preview. Local match only; no official rewards.
(()=>{'use strict';
const definitions=[
{id:'convert_once',name:'Convert a Cell Card',type:'card_convert',target:1},
{id:'fire_twice',name:'Fire twice',type:'fire_numeric',target:2},
{id:'arm_protect',name:'Arm Protect',type:'protect_armed',target:1},
{id:'destroy_one',name:'Destroy Core progress',type:'core_destroyed',target:1},
{id:'finish_game',name:'Finish the match',type:'match_end',target:1}
];
let matchId=null,seq=0,events=[],tasks=definitions.map(d=>({...d,progress:0}));
function render(){let el=document.getElementById('atomic-dev-tasks');if(!el){el=document.createElement('aside');el.id='atomic-dev-tasks';el.setAttribute('aria-label','Atomic Challenges development preview');Object.assign(el.style,{position:'fixed',right:'10px',bottom:'10px',zIndex:'999',maxWidth:'245px',padding:'10px 12px',borderRadius:'12px',background:'rgba(3,12,23,.94)',color:'#d4f0ff',border:'1px solid #40718a',font:'12px system-ui',pointerEvents:'none'});document.body.append(el)}el.replaceChildren();const title=document.createElement('strong');title.textContent='ATOMIC CHALLENGES · DEV';el.append(title);for(const t of tasks){const line=document.createElement('div');line.style.marginTop='5px';line.textContent=(t.progress>=t.target?'✓ ':'○ ')+t.name+' '+Math.min(t.progress,t.target)+'/'+t.target;el.append(line)}const footer=document.createElement('div');footer.style.cssText='margin-top:7px;opacity:.7';footer.textContent='Practice preview · no particle rewards';el.append(footer)}
function start(id){if(typeof id!=='string'||!id)return;matchId=id;seq=0;events=[];tasks=definitions.map(d=>({...d,progress:0}));render()}
function emit(type,detail={}){try{if(!matchId||!definitions.some(d=>d.type===type)&&!['gold_fire','protect_blocked','core_takeover','core_recovered','pp_earned','protect_restored'].includes(type))return;const turn=Number.isSafeInteger(window.g?.turn)?window.g.turn:null;const e={id:matchId+':'+(++seq),matchId,actor:'player',turn,type};for(const k of ['amount','value','completed','won'])if(Object.hasOwn(detail,k))e[k]=detail[k];events.push(Object.freeze(e));for(const t of tasks)if(t.type===type){t.progress+=type==='core_destroyed'?Math.max(0,Number(detail.amount)||0):1}render()}catch{/* preview must not interrupt gameplay */}}
Object.defineProperty(window,'TiraAtomicDev',{value:Object.freeze({start,emit,get events(){return events.map(e=>({...e}))},get tasks(){return tasks.map(t=>({...t}))}}),configurable:false});document.addEventListener('DOMContentLoaded',render);
})();
