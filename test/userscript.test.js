/**
 * hide-ai-selection-menu 回归测试
 * ---------------------------------------------------------------
 * 用法：node test/userscript.test.js
 *
 * 用最小 DOM 桩真实执行用户脚本源码，再断言元素状态与注入的 CSS。
 * 无需浏览器、无需 jsdom，改完脚本立刻可验证。
 * 专门拦住两类肉眼不可见的回归：
 *   1. keywords 文案改版后判定永远失败，规则静默失效（本次 ChatGPT 的事故）；
 *   2. 浮层行内 style 被页面重写后，display:none 被冲掉且没有补回。
 *
 * 夹具取自 dom/gpt.html —— 想加站点就在 fixture() 里照抄一份真实 DOM。
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SCRIPT = path.join(__dirname, '..', 'hide-ai-selection-menu.js');
const src = fs.readFileSync(SCRIPT, 'utf8');

/* ============================ 最小 DOM 桩 ============================ */

function mkStyle(map = {}) {
    return {
        _m: map,
        getPropertyValue(k) { return this._m[k] ? this._m[k].v : ''; },
        getPropertyPriority(k) { return this._m[k] ? (this._m[k].p || '') : ''; },
        setProperty(k, v, p) { this._m[k] = { v, p }; },
    };
}

// 支持：tag / .cls / #id / tag.a.b.c / [attr] / [attr*="v"] / tag[attr*="v"]（可叠加）/ 逗号分组
function matchOne(el, s) {
    let rest = s.trim();
    let tag = null;

    const tm = rest.match(/^([a-zA-Z][\w-]*)/);
    if (tm) {
        tag = tm[1];
        rest = rest.slice(tag.length);
    }
    if (tag && tag.toUpperCase() !== el.tagName) return false;

    const classes = el.className ? el.className.split(/\s+/).filter(Boolean) : [];

    let i = 0;
    while (i < rest.length) {
        const ch = rest[i];

        if (ch === '.') {
            const m = rest.slice(i + 1).match(/^([\w-]+)/);
            if (!m || !classes.includes(m[1])) return false;
            i += 1 + m[1].length;
        } else if (ch === '#') {
            const m = rest.slice(i + 1).match(/^([\w-]+)/);
            if (!m || el.id !== m[1]) return false;
            i += 1 + m[1].length;
        } else if (ch === '[') {
            const m = rest.slice(i).match(/^\[([\w-]+)(?:\*="([^"]*)")?\]/);
            if (!m) return false;
            const [, name, val] = m;
            if (val === undefined) {
                if (el.attrs[name] === undefined) return false;   // 存在性选择器
            } else if (!String(el.attrs[name] || '').includes(val)) {
                return false;
            }
            i += m[0].length;
        } else {
            return false;
        }
    }
    return true;
}

// 必须支持逗号分组，否则 `.a, .b` 这类规则在桩里全部失配，产生假阴性
function matchesAll(el, sel) {
    return sel.split(',').some((s) => s.trim() && matchOne(el, s));
}

function mkEl({ tag = 'div', cls = '', id = '', attrs = {}, style = {}, text = '', children = [] } = {}) {
    const el = {
        tagName: tag.toUpperCase(),
        className: cls,
        id,
        // 让 [class*="..."] 也能在桩里命中
        attrs: Object.assign({ class: cls }, attrs),
        removed: false,
        isConnected: true,
        dataset: {},
        style: mkStyle(style),
        parentElement: null,
        remove() { this.removed = true; this.isConnected = false; },
        matches(sel) { return matchesAll(this, sel); },
        querySelector(sel) { return children.find((c) => matchesAll(c, sel)) || null; },
    };

    Object.defineProperty(el, 'textContent', {
        get() { return text + children.map((c) => c.textContent).join(''); },
        configurable: true,
    });

    for (const c of children) c.parentElement = el;
    return el;
}

/* ============================ 测试夹具 ============================ */
// 结构照抄 dom/gpt.html

function fixture() {
    const inner = mkEl({
        cls: 'shadow-long flex overflow-hidden rounded-xl',
        children: [
            mkEl({ tag: 'button', children: [mkEl({ tag: 'span', text: '询问 ChatGPT' })] }),
            mkEl({ tag: 'button', children: [mkEl({ tag: 'span', text: '分享所选内容' })] }),
        ],
    });

    const popover = mkEl({
        attrs: { popover: 'manual', 'aria-live': 'polite' },
        cls: 'fixed top-auto bottom-0 h-fit z-50 m-0 overflow-visible border-0 bg-transparent p-0 select-none PDq2pG_selectionPopover',
        // 页面自己维护的锚点样式，改版后会被重写
        style: { 'position-anchor': { v: '--targeted-action-selection' } },
        children: [inner],
    });

    // 反例：命中选择器但文本不含关键词，属正常元素，不能被误伤
    const decoy = mkEl({
        cls: 'shadow-long flex overflow-hidden rounded-xl',
        children: [mkEl({ tag: 'span', text: '这是一段正文，不是菜单' })],
    });

    return { popover, inner, decoy };
}

function run(fx) {
    const all = Object.values(fx);
    let tick = null;
    let styleEl = null;

    const define = (k, v) => Object.defineProperty(global, k, { value: v, configurable: true, writable: true });

    define('location', { hostname: 'chatgpt.com' });
    define('document', {
        readyState: 'complete',
        documentElement: { appendChild() {}, style: {} },
        body: {},
        head: { appendChild(el) { styleEl = el; } },
        createElement(tag) { return { tagName: tag.toUpperCase(), id: '', textContent: '' }; },
        querySelectorAll(sel) { return all.filter((e) => e.isConnected && matchesAll(e, sel)); },
        addEventListener() {},
    });
    define('MutationObserver', class { constructor(cb) { this.cb = cb; } observe() {} });
    define('requestAnimationFrame', (fn) => { fn(); return 1; });
    define('setInterval', (fn) => { if (!tick) tick = fn; return 1; });   // 抓住回调手动驱动
    define('clearInterval', () => {});

    eval(src);   // 执行被测脚本

    return { css: styleEl ? styleEl.textContent : '', tick };
}

/* ============================ 断言 ============================ */

let pass = 0, fail = 0;
function a(ok, msg) {
    if (ok) { pass++; console.log('  \u2713 ' + msg); }
    else { fail++; console.log('  \u2717 ' + msg); }
}
const hidden = (el) =>
    el.style.getPropertyValue('display') === 'none'
    && el.style.getPropertyPriority('display') === 'important';

/* ============================ 执行 ============================ */

const fx = fixture();
const { css, tick } = run(fx);

console.log('\n[1] 注入的 CSS');
a(css.includes('[class*="selectionPopover"]'), '高精度选择器已进 CSS 层（抢在首帧前隐藏）');
a(!css.includes('data-word-selection-toolbar'), '只注入当前站点（chatgpt.com）的规则，未串站点');
a(/\[class\*="selectionPopover"\]\s*\{\s*display: none !important;\s*\}/.test(css),
    '规则块内容为 display:none !important');
a((css.match(/\{/g) || []).length === 1, '每条选择器单独成块，不是逗号合并的列表');

console.log('\n[2] 首轮清理（keywords 回归）');
tick();
a(hidden(fx.popover), '选区浮层已隐藏（菜单项已改成「询问 ChatGPT / 分享所选内容」，不再要求「开始写作」）');
a(hidden(fx.inner), '兜底选择器 + 单个关键词校验同样命中');
a(!hidden(fx.decoy), '同名容器但文本不含关键词的正常元素未被误伤');

console.log('\n[3] style 被页面重写后的自愈（关键回归）');
fx.popover.style = mkStyle({ 'position-anchor': { v: '--other-anchor' } });
a(!hidden(fx.popover), '已模拟页面重写 style、冲掉 display:none');
tick();
a(hidden(fx.popover), '下一轮清理自动补回隐藏');
a(fx.popover.style.getPropertyValue('position-anchor') === '--other-anchor', '页面自身的锚点样式未被破坏');

console.log('\n[4] 幂等性');
tick(); tick(); tick();
a(hidden(fx.popover), '重复清理状态稳定');
a(!hidden(fx.decoy), '重复清理不会误伤面扩大');

console.log(`\n结果：${pass} 通过 / ${fail} 失败\n`);
process.exit(fail ? 1 : 0);
