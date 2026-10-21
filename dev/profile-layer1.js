/* TIRA! local guest onboarding. Public-safe: no authentication, no private AI logic. */
(()=>{'use strict';
const PROFILE='tira-local-profile-v1', LEGACY='cellcore-record-v04', ARCHIVE='tira-local-legacy-archive-v1';
const read=k=>{try{return localStorage.getItem(k)}catch{return null}};
const parse=s=>{try{return s===null?null:JSON.parse(s)}catch{return null}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const avatars={orb:'🔵',spark:'✨',shield:'🛡️',star:'⭐'};
const count=v=>({wins:Math.max(0,Math.floor(Number(v?.wins)||0)),losses:Math.max(0,Math.floor(Number(v?.losses)||0))});
const profile=()=>{const p=parse(read(PROFILE));return p?.accountType==='local_guest'&&p.localProfileId?p:null};
function open(){
 if(profile())return;
 const css=document.createElement('style');css.textContent='#tiraProfileGate{position:fixed;inset:0;z-index:99999;background:#020a13eF;display:grid;place-items:center;padding:16px;overflow:auto}#tiraProfileGate *{box-sizing:border-box}#tiraProfileGate .card{width:min(100%,450px);background:#10283b;border:1px solid #4c7b93;border-radius:22px;padding:24px;color:#e9f8ff;box-shadow:0 18px 65px #000b}#tiraProfileGate h2{margin:0 0 12px;font-size:25px}#tiraProfileGate p{line-height:1.5;color:#b9d6e6}#tiraProfileGate button{min-height:46px;padding:10px 14px;border:1px solid #53829b;border-radius:12px;background:#1a3d54;color:white;font:700 15px system-ui;cursor:pointer}#tiraProfileGate button.primary{background:#167fa5;border-color:#8be9ff}#tiraProfileGate button:focus-visible,#tiraProfileGate input:focus-visible{outline:3px solid #8be9ff;outline-offset:2px}#tiraProfileGate button[disabled]{opacity:.5;cursor:not-allowed}#tiraProfileGate .stack{display:grid;gap:10px}#tiraProfileGate .row{display:grid;grid-template-columns:1fr 1fr;gap:10px}#tiraProfileGate input{width:100%;padding:12px;background:#061a2a;color:white;border:1px solid #5a8ca4;border-radius:10px;font:16px system-ui}#tiraProfileGate .choice{text-align:left}#tiraProfileGate .choice[aria-pressed=true]{border:2px solid #9aebff;background:#19516d}#tiraProfileGate .warn{border:1px solid #d4a44b;background:#3b3025;padding:12px;border-radius:12px}#tiraProfileGate .warn p{color:#ffe6ae}#tiraProfileGate .error{color:#ffb4a9;min-height:20px}#tiraProfileGate .avatars{display:flex;gap:8px}#tiraProfileGate .avatars button{flex:1;font-size:23px}#tiraProfileGate .avatars button[aria-pressed=true]{border:2px solid #8be9ff}';
 document.head.append(css);
 const gate=document.createElement('div');gate.id='tiraProfileGate';gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');gate.setAttribute('aria-label','Create local guest profile');gate.innerHTML='<div class="card" id="tiraProfileContent"></div>';document.body.append(gate);
 const panel=document.getElementById('tiraProfileContent');let selection='keep',name='',avatar='orb';
 const legacyRaw=read(LEGACY),legacy=parse(legacyRaw),hasLegacy=legacy&&typeof legacy==='object'&&('wins'in legacy||'losses'in legacy);
 function set(html){panel.innerHTML=html;panel.querySelector('button:not([disabled])')?.focus()}
 function welcome(){set('<h2>WELCOME TO TIRA!</h2><p>Choose how you want to play.</p><div class="stack"><button class="primary" id="guest">PLAY AS GUEST</button><button disabled>CREATE ACCOUNT · COMING LATER</button></div><p>Guest progress is stored only in this browser. No account recovery or cloud sync is available.</p>');panel.querySelector('#guest').onclick=()=>hasLegacy?choose():setup()}
 function choose(){set('<h2>Existing Progress Found</h2><p>We found '+count(legacy).wins+' wins and '+count(legacy).losses+' losses saved on this browser.</p><div class="stack"><button class="choice" data-choice="keep" aria-pressed="'+(selection==='keep')+'">KEEP PROGRESS — Use existing record</button><button class="choice" data-choice="new" aria-pressed="'+(selection==='new')+'">START NEW — Archive previous record and begin at zero</button><button class="primary" id="next">Continue</button></div>');panel.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{selection=b.dataset.choice;choose()});panel.querySelector('#next').onclick=confirm}
 function confirm(){set('<h2>Confirm Choice</h2><div class="warn"><strong>'+(selection==='keep'?'KEEP PROGRESS':'START NEW')+'</strong><p>'+(selection==='keep'?'Your existing wins and losses will remain available in your guest profile.':'Your previous record will be backed up in this browser before the active win/loss counter starts at zero. This is not a cloud backup.')+'</p></div><div class="row"><button id="back">Back</button><button class="primary" id="ok">OK</button></div>');panel.querySelector('#back').onclick=choose;panel.querySelector('#ok').onclick=setup}
 function setup(){set('<h2>Your Guest Profile</h2><label for="tiraProfileName">Display name</label><input id="tiraProfileName" maxlength="24" autocomplete="off" value="'+esc(name)+'" placeholder="Player name"><p>2–24 characters. Letters, numbers, spaces, _ and -. Guest names are locked after creation.</p><p>Choose avatar</p><div class="avatars">'+Object.entries(avatars).map(([k,v])=>'<button data-avatar="'+k+'" aria-label="'+k+'" aria-pressed="'+(avatar===k)+'">'+v+'</button>').join('')+'</div><p class="error" role="alert" id="tiraProfileError"></p><div class="row"><button id="back">Back</button><button class="primary" id="create">Create</button></div>');panel.querySelectorAll('[data-avatar]').forEach(b=>b.onclick=()=>{avatar=b.dataset.avatar;panel.querySelectorAll('[data-avatar]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.avatar===avatar)))});panel.querySelector('#back').onclick=()=>{name=panel.querySelector('#tiraProfileName').value;hasLegacy?confirm():welcome()};panel.querySelector('#create').onclick=()=>{name=panel.querySelector('#tiraProfileName').value.trim().replace(/\s+/g,' ');if(!/^[\p{L}\p{N}_ -]{2,24}$/u.test(name)){panel.querySelector('#tiraProfileError').textContent='Enter a valid name (2–24 characters).';return}commit()}}
 function commit(){
 const error=panel.querySelector('#tiraProfileError');if(profile()){gate.remove();return}
 if(!crypto?.randomUUID){error.textContent='This browser cannot generate a secure local ID.';return}
 // Never reset the score while a resumable match exists, even if the legacy score is absent.
 if(selection==='new'){const snap=parse((()=>{try{return sessionStorage.getItem('corbit-dev-match')}catch{return null}})());if(snap?.g&&snap.g.ended===false){error.textContent='Finish or exit the current saved match before starting a new record. Keep Progress is available.';return}}
 const p={schemaVersion:1,accountType:'local_guest',localProfileId:crypto.randomUUID(),displayName:name,avatarId:avatar,globalPlayerId:null,createdAt:new Date().toISOString()};
 let archiveWritten=false;
 try{
  if(hasLegacy&&read(ARCHIVE)===null){localStorage.setItem(ARCHIVE,JSON.stringify({sourceKey:LEGACY,raw:legacyRaw,archivedAt:new Date().toISOString()}));archiveWritten=true}
  if(hasLegacy&&selection==='new')localStorage.setItem(LEGACY,JSON.stringify({wins:0,losses:0}));
  // Profile is the commit marker. It must be written last.
  localStorage.setItem(PROFILE,JSON.stringify(p));
  gate.remove();window.dispatchEvent(new CustomEvent('tira-local-profile-ready',{detail:{displayName:p.displayName}}));
 }catch{
  // Restore the original match record if profile persistence fails.
  if(hasLegacy&&selection==='new'){try{localStorage.setItem(LEGACY,legacyRaw)}catch{}}
  if(archiveWritten){/* preserve backup for safe retry */}
  error.textContent='Unable to save safely. Check browser storage and retry.';
 }
 }
 welcome();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',open,{once:true});else open();
window.TiraLocalProfile={get:profile,record:()=>count(parse(read(LEGACY)))};
})();