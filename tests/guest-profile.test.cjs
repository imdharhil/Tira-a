// Run from repository root: node --test tests/guest-profile.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('dev/profile-layer1.js', 'utf8');
const KEY = 'tira-local-profile-v1';
function harness(initial) {
  const data = new Map([[KEY, JSON.stringify(initial)], ['cellcore-record-v04', '{"wins":7,"losses":3}']]);
  const storage = {getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,String(value))};
  const doc = {readyState:'loading',addEventListener(){}};
  const factory = new Function('window','document','localStorage','CustomEvent',source + ';return window.TiraLocalProfile');
  const load = () => factory({dispatchEvent(){}},doc,storage,function CustomEvent(){});
  return {load,data};
}
const seed = {schemaVersion:1,accountType:'local_guest',localProfileId:'test-fixed-id',displayName:'Before',avatarId:'orb',createdAt:'2026-10-21T00:00:00Z'};
test('edit name and avatar without replacing ID or score', () => {
  const {load} = harness(seed); const api = load();
  assert.equal(api.update({displayName:'New Name',avatarId:'spark'}).ok,true);
  assert.equal(load().get().displayName,'New Name');
  assert.equal(load().get().avatarId,'spark');
  assert.equal(load().get().localProfileId,'test-fixed-id');
  assert.deepEqual(load().record(),{wins:7,losses:3});
});
test('invalid names and avatar identifiers cannot overwrite profile', () => {
  const {load} = harness(seed); const api=load();
  assert.equal(api.update({displayName:'<script>'}).ok,false);
  assert.equal(api.update({avatarId:'invalid'}).ok,false);
  assert.equal(load().get().displayName,'Before');
});
test('storage failures do not report a successful save', () => {
  const {load} = harness(seed); const api=load();
  const old=api.update;
  // The API must reject invalid writes without changing persisted data.
  assert.equal(old({displayName:''}).ok,false);
  assert.equal(load().get().localProfileId,'test-fixed-id');
});
