/* Public prototype: local-only, per-guest KO reward ledger. No cloud sync. */
(()=>{'use strict';
const KEY='tira-ko-ledger-v1',PROFILE='tira-local-profile-v1';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const whole=n=>Number.isSafeInteger(n)&&n>=0?n:null;
function current(){const p=read(PROFILE);return p?.accountType==='local_guest'&&typeof p.localProfileId==='string'?p.localProfileId:null}
function balances(){const id=current(),store=read(KEY);if(!id||!store||store.profileId!==id)return null;return {ppKO:whole(store.ppKO),ttKO:whole(store.ttKO),tiraKO:null}}
function history(){const id=current(),store=read(KEY);return id&&store?.profileId===id&&Array.isArray(store.matches)?store.matches.filter(m=>m&&typeof m.matchId==='string').slice().reverse():[]}
function award(matchId,earnedPP,won,details={}){const id=current(),earned=whole(earnedPP),spent=whole(details.spentPP),pp=whole(details.remainingPP);if(!id||typeof matchId!=='string'||matchId.length<8||earned===null||spent===null||pp===null||earned-spent!==pp||typeof won!=='boolean')return {ok:false,reason:'Invalid match or guest profile'};try{
const previous=read(KEY),store=previous?.profileId===id?previous:{schema:1,profileId:id,ppKO:0,ttKO:0,processed:[]};
if(!Array.isArray(store.processed)||whole(store.ppKO)===null||whole(store.ttKO)===null)return {ok:false,reason:'Invalid existing ledger'};
if(store.processed.includes(matchId))return {ok:true,duplicate:true};
if(!Number.isSafeInteger(store.ppKO+pp)||!Number.isSafeInteger(store.ttKO+(won?1:0)))return {ok:false,reason:'Counter overflow'};
const next={...store,ppKO:store.ppKO+pp,ttKO:store.ttKO+(won?1:0),processed:[...store.processed,matchId],matches:[...(Array.isArray(store.matches)?store.matches:[]),{matchId,playedAt:new Date().toISOString(),won,opponent:typeof details.opponent==='string'?details.opponent.slice(0,48):'Computer',mode:typeof details.mode==='string'?details.mode.slice(0,32):'Practice',earnedPP:earned,spentPP:spent,remainingPP:pp,ppAwarded:pp,ttAwarded:won?1:0}].slice(-200)};
localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new Event('tira-ko-ledger-updated'));return {ok:true,duplicate:false}
}catch{return {ok:false,reason:'Browser storage unavailable'}}}
window.TiraKOLedger=Object.freeze({balances,award,history});
})();