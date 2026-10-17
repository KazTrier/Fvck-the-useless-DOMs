import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const contentPath = path.resolve('主版本v2/content.js');
const code = fs.readFileSync(contentPath, 'utf8');

test('content.js 包含 ensureExtensionsHydrated 水合同步函数', () => {
  assert.match(code, /function ensureExtensionsHydrated\s*\(/);
});

test('ensureExtensionsHydrated 能安全识别 __TAURITAVERN_PANEL_RUNTIME__ 并调用 setVisible/reconcile', () => {
  assert.match(code, /__TAURITAVERN_PANEL_RUNTIME__/);
  assert.match(code, /tt:gate:rm_extensions_block:extension_containers/);
});

test('openPopup 与 scanGroup 在执行时触发了面板水合', () => {
  // v1017 起 openPopup 一次性水合全部面板，scanGroup/scanCurated 按 PANEL_SLOTS 分派
  assert.match(code, /function openPopup\s*\(\)\s*\{[^}]*hydrateAllPanels\(\)/);
  assert.match(code, /function scanGroup\s*\(group\)\s*\{[\s\S]*?PANEL_SLOTS\[group\.id\][\s\S]*?ensureSlotHydrated/);
  assert.match(code, /function scanCurated\s*\(group\)\s*\{[\s\S]*?PANEL_SLOTS\[group\.id\][\s\S]*?ensureSlotHydrated/);
});

test('ensureExtensionsHydrated 运行时行为测试（挂载与未挂载 PanelRuntime）', () => {
  // 提取 SLOT_PROBES + missingSlots(负缓存) + ensureSlotHydrated + ensureExtensionsHydrated 在沙箱环境中验证
  const probesMatch = code.match(/const SLOT_PROBES = \{[\s\S]*?\n  \};/);
  const missingMatch = code.match(/const missingSlots = new Set\(\);/);
  const slotsMatch = code.match(/const PANEL_SLOTS = \{[\s\S]*?\n  \};/);
  const slotFnMatch = code.match(/function ensureSlotHydrated\s*\(slotId\)\s*\{[\s\S]*?\n  \}/);
  const fnMatch = code.match(/function ensureExtensionsHydrated\s*\(\)\s*\{[\s\S]*?\n  \}/);
  assert.ok(probesMatch, '应能匹配到 SLOT_PROBES 定义');
  assert.ok(missingMatch, '应能匹配到 missingSlots 负缓存定义');
  assert.ok(slotsMatch, '应能匹配到 PANEL_SLOTS 定义');
  assert.ok(slotFnMatch, '应能匹配到 ensureSlotHydrated 函数定义');
  assert.ok(fnMatch, '应能匹配到 ensureExtensionsHydrated 函数定义');

  const fnSource = [probesMatch[0], missingMatch[0], slotsMatch[0], slotFnMatch[0], fnMatch[0]].join('\n');
  // 探针查询用的 doc：一律返回 null 表示「尚未接回文档」，逼出真正的 setVisible/reconcile 分支
  const emptyDoc = { querySelector: () => null };

  // 1. 未挂载 __TAURITAVERN_PANEL_RUNTIME__（如纯网页版 SillyTavern）
  {
    const sandbox = {
      win: {},
      doc: emptyDoc,
      console: { warn: () => {} }
    };
    vm.createContext(sandbox);
    vm.runInContext(`${fnSource}; result = ensureExtensionsHydrated();`, sandbox);
    assert.strictEqual(sandbox.result, false, '未挂载 PanelRuntime 时应返回 false 且不报错');
  }

  // 2. 正常挂载 TauriTavern 2.3.0 SubtreeGate
  {
    const calls = [];
    const sandbox = {
      win: {
        __TAURITAVERN_PANEL_RUNTIME__: {
          setVisible: (id, visible) => { calls.push(['setVisible', id, visible]); },
          reconcile: () => { calls.push(['reconcile']); }
        }
      },
      doc: emptyDoc,
      console: { warn: () => {} }
    };
    vm.createContext(sandbox);
    vm.runInContext(`${fnSource}; result = ensureExtensionsHydrated();`, sandbox);
    assert.strictEqual(sandbox.result, true, '正常水合应返回 true');
    assert.deepStrictEqual(calls, [
      ['setVisible', 'tt:gate:rm_extensions_block:extension_containers', true],
      ['reconcile']
    ], '应按顺序调用 setVisible 与 reconcile');
  }

  // 3. 异常防御性测试（如 reconcile 抛出异常）
  {
    let warned = false;
    const sandbox = {
      win: {
        __TAURITAVERN_PANEL_RUNTIME__: {
          setVisible: () => {},
          reconcile: () => { throw new Error('reconcile failed'); }
        }
      },
      doc: emptyDoc,
      console: { warn: () => { warned = true; } }
    };
    vm.createContext(sandbox);
    vm.runInContext(`${fnSource}; result = ensureExtensionsHydrated();`, sandbox);
    assert.strictEqual(sandbox.result, false, '抛出异常时应被捕获并返回 false');
    assert.strictEqual(warned, true, '应打印 warning 日志');
  }
});
