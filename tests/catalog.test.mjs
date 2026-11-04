import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const bundle = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8');
// Expose the private component in the test VM only; shipped exports stay unchanged.
const instrumented = bundle.replace('exports.apply = apply;', 'exports.CatalogRows = CatalogRows; exports.apply = apply;');
let api;
const jsx = (type, props) => ({type, props});
vm.runInNewContext(instrumented, {
  window: {__ModuleLoader__: {load({id, factory}) {
    assert.equal(id, 'dsh-subagent-model-label');
    api = factory(name => name === 'react/jsx-runtime' ? {jsx,jsxs:jsx,Fragment:'fragment'} : name === 'react' ? {useState: f => [typeof f === 'function' ? f() : f,()=>{}],useEffect:()=>{}} : {});
  }}},
});
const all = value => {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap(all);
  return [value, ...all(value.props?.children)];
};
function render(projectionValues) {
  const opened=[];
  const tree=api.CatalogRows({parentSessionId:'parent',currentSessionId:'parent',catalog:{state:'ready',entries:[{id:'child',label:'Review safety',mode:'continuable',activity:'inactive'}]},catalogs:{child:{state:'ready',entries:[]}},summaries:{child:{title:'Session title',projectionValues}},expanded:new Set(),level:1,openChild:x=>opened.push(x),openChildAside:()=>{},refreshProjection:()=>{},toggleBranch:()=>{},closeCatalog:()=>{},t:key=>key});
  return {nodes:all(tree),opened};
}
const used={provider:'route-a',model:'gpt-6.1-terra',reasoningEffort:'high'};
const pending={provider:'route-b',model:'hy4-preview'};
for (const [name,selection,expected,title] of [
  ['actual request wins over pending', {lastUsed:used,next:pending},used.model,'route-a / gpt-6.1-terra / high'],
  ['selection before first request', {lastUsed:null,next:pending},pending.model,'route-b / hy4-preview'],
  ['no selection', {lastUsed:null,next:null},undefined,undefined],
  ['old summary without model data', undefined,undefined,undefined],
]) test(name,()=>{
  const {nodes,opened}=render(selection === undefined ? {} : {modelSelection:selection});
  const labels=nodes.filter(x=>x.props?.className==='rezYhW_modelLabel');
  assert.equal(labels.length,expected===undefined?0:1);
  if (expected) {assert.equal(labels[0].props.children,[selection.lastUsed?.provider ?? selection.next.provider,expected].join(' / '));assert.equal(labels[0].props.title,title);}
  const row=nodes.find(x=>x.props?.role==='treeitem');
  assert.ok(row.props['aria-label'].includes('Review safety'));
  if(title) assert.ok(row.props['aria-label'].includes(title));
  assert.ok(!row.props['aria-label'].includes('undefined'));
  row.props.onClick();
  assert.equal(opened[0].childSessionId,'child');
});
test('full model identifiers wrap and use theme tokens',()=>{
 assert.match(bundle,/\.rezYhW_modelLabel\{color:var\(--dsw-alias-label-secondary\);font-size:11px;line-height:16px;white-space:normal;overflow-wrap:anywhere\}/);
});
test('persisted sidebar tab identity stays compatible',()=>{
 assert.ok(bundle.includes('const SUBAGENT_CHAT_ID = "@deepseek-ai/dsh-client-ui-subagent";'));
});
test('fork retains only normal Cordis exports',()=>{
 assert.ok(!bundle.includes('exports.CatalogRows'));
 assert.ok(bundle.includes('exports.apply = apply;'));
});
