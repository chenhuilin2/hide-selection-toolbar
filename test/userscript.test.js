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
            // 支持 [attr] / [attr="v"] / [attr*="v"] / ^= / $=。
            // 只实现 *= 会漏掉 [data-testid="x"] 这类精确匹配，静默判为不匹配。
            const m = rest.slice(i).match(/^\[([\w-]+)(?:([~^$*|]?=)"([^"]*)")?\]/);
            if (!m) return false;

            const [, name, op, want] = m;
            if (op === undefined) {
                if (el.attrs[name] === undefined) return false;   // 存在性选择器
            } else {
                const have = String(el.attrs[name] === undefined ? '' : el.attrs[name]);
                const ok = op === '=' ? have === want
                    : op === '*=' ? have.includes(want)
                        : op === '^=' ? have.startsWith(want)
                            : op === '$=' ? have.endsWith(want)
                                : false;
                if (!ok) return false;
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
// 结构照抄 dom/*.html —— 加站点时在这里补一个 xxxFixture()，再补一段断言

// dom/gpt.html（2026-11 改版后的新结构：纯 Tailwind 工具类，没有任何稳定标识）
function fixture() {
    const bar = mkEl({
        cls: 'pointer-events-none w-max fixed z-50',
        // 页面按选区实时算的行内定位，滚动 / 重新划词都会被重写
        style: { left: { v: '471.932px' }, top: { v: '182.824px' } },
        children: [
            mkEl({
                attrs: { role: 'presentation' },
                cls: 'pointer-events-auto flex w-fit max-w-full overflow-hidden rounded-lg border border-border/70 bg-surface-elevated-secondary shadow-lg',
                children: [
                    mkEl({
                        tag: 'button',
                        attrs: { type: 'button' },
                        cls: 'no-drag cursor-interaction whitespace-nowrap flex border gap-1 rounded-full',
                        text: '向 ChatGPT 提问',
                    }),
                    mkEl({ attrs: { 'aria-hidden': 'true' }, cls: 'w-px shrink-0 self-stretch bg-border last:hidden' }),
                ],
            }),
        ],
    });

    // 反例：同一套浮动层工具类，但文本不含品牌名 —— 悬浮提示之类的正常元素。
    // 这条守着「结构选择器必须配 keywords」这个前提：
    // 一旦有人觉得"选择器够具体了"把 keywords 去掉，它会被悄悄隐藏，这里立刻报错。
    const tooltip = mkEl({
        cls: 'pointer-events-none w-max fixed z-50',
        children: [mkEl({ tag: 'span', text: '复制' })],
    });

    // 关键回归：按钮文案已经改过一轮（「询问 ChatGPT / 分享所选内容」→「向 ChatGPT 提问」），
    // 以后还会改。keywords 只认品牌名，就是为了不随文案改版失效。
    const barReworded = mkEl({
        cls: 'pointer-events-none w-max fixed z-50',
        children: [mkEl({ tag: 'button', text: 'Ask ChatGPT' })],
    });

    return { bar, tooltip, barReworded };
}

// dom/文心一言.html（取样自 wenxin.baidu.com，同一套页面也挂在 yiyan.baidu.com）
function yiyanFixture() {
    const bar = mkEl({
        attrs: { 'data-testid': 'selection-bar' },
        cls: '_chat-selection-bar_17n4z_23 _fit-content_17n4z_28',
        // 页面自己写的定位，改版/滚动时会被重写
        style: { inset: { v: '2139.67px auto auto 181px' } },
        children: [
            mkEl({
                cls: '_chat-selection-bar-button-group_17n4z_34',
                children: [
                    mkEl({ tag: 'button', text: '引用' }),
                    mkEl({ tag: 'button', text: '复制' }),
                    mkEl({ tag: 'button', text: '翻译' }),
                ],
            }),
        ],
    });

    // 反例：命中兜底类名，但没有 data-testid、文本也不含关键词
    const decoy = mkEl({
        cls: '_chat-selection-bar_17n4z_23 _fit-content_17n4z_28',
        children: [mkEl({ tag: 'span', text: '一段普通正文' })],
    });

    // 关键回归：菜单项改版、文案不再含「引用 / 复制」，只有主选择器能覆盖它。
    // 这条决定了 keywords 永远不该长在主力选择器上。
    const barCopyChanged = mkEl({
        attrs: { 'data-testid': 'selection-bar' },
        cls: '_chat-selection-bar_17n4z_23 _fit-content_17n4z_28',
        children: [
            mkEl({
                cls: '_chat-selection-bar-button-group_17n4z_34',
                children: [
                    mkEl({ tag: 'button', text: '翻译' }),
                    mkEl({ tag: 'button', text: '解释' }),
                ],
            }),
        ],
    });

    return { bar, decoy, barCopyChanged };
}

// dom/讯飞星火.html
function xinghuoFixture() {
    const quoteImg = () => mkEl({
        tag: 'img',
        attrs: { src: '/vulcan/static/media/quote_svg.27e5741d60acee4c2886833665441ff1.svg', alt: '' },
    });

    const bar = mkEl({
        cls: 'CodeWin_quote__02wVL',
        // 页面自己算的锚点定位，关掉菜单/滚动时会被重写
        style: { top: { v: '118.667px' }, left: { v: '191.604px' } },
        text: '引用',
        children: [quoteImg()],
    });

    // 关键回归：CSS Module 的哈希会随构建变，只要语义段不变就该照样命中。
    // 这条拦住「把哈希写死进选择器」的写法。
    const barNewHash = mkEl({
        cls: 'CodeWin_quote__9xK2p',
        text: '引用',
        children: [quoteImg()],
    });

    // 反例：输入框里的引用气泡。同样含 quote、同样写着「引用」，
    // 但模块名前缀不是 CodeWin —— 属于正常功能元素，绝不能误伤。
    const decoyQuoteBox = mkEl({
        cls: 'InputArea_quoteBox__3ab21',
        text: '引用',
        children: [mkEl({ tag: 'span', text: '被引用的上文' })],
    });

    return { bar, barNewHash, decoyQuoteBox };
}

// dom/语雀.html（划词后弹出的「评论 / 笔记」工具条）
// 关键特征：整条只有两个 <svg> 图标，**没有任何文字** —— keywords 在这里必然失效，
// 所以误伤面只能靠选择器精度控制，下面的反例就是在守这条底线。
function yuqueFixture() {
    const icon = (name) => mkEl({
        cls: 'ne-icon ne-icon-' + name,
        attrs: { 'data-name': name },
        style: { 'font-size': { v: '16px' } },
        children: [mkEl({ tag: 'svg', cls: 'ne-icon-symbol', attrs: { 'aria-hidden': 'true' } })],
    });

    const itemWrapper = (name) => mkEl({
        tag: 'span',
        cls: 'wording-tooltip-module_itemWrapper__1BQ9b',
        children: [icon(name)],
    });

    const bar = mkEl({
        cls: 'wording-tooltip-module_toolTipContent__NHFlD',
        children: [itemWrapper('card-tb-comment'), itemWrapper('Note')],
    });

    // 关键回归：哈希随构建变（__NHFlD → __Xy8Qz），模块名 + 语义名不变就该照样命中。
    const barNewHash = mkEl({
        cls: 'wording-tooltip-module_toolTipContent__Xy8Qz',
        children: [itemWrapper('card-tb-comment')],
    });

    // 模块级兜底：结构残缺、只剩一个 itemWrapper 时也要能隐藏
    const bareItem = mkEl({
        tag: 'span',
        cls: 'wording-tooltip-module_itemWrapper__1BQ9b',
        children: [icon('Note')],
    });

    // 反例：语义名相同（toolTipContent）但模块前缀不同 —— 页面别处的 tooltip，正常功能。
    // 这条拦住「放宽成 [class*="toolTipContent"]」这种"看着更稳"的改法。
    const decoyTooltip = mkEl({
        cls: 'editor-tooltip-module_toolTipContent__k2P9a',
        children: [mkEl({ tag: 'span', text: '提示文字' })],
    });

    // ---- 编辑态工具条（dom/语雀-编辑态.html）：ne-card-toolbar + ne-select-helper-toolbar ----
    const tbItem = (name, lark) => mkEl({
        cls: 'ne-card-toolbar-item ne-card-toolbar-item-has-title',
        children: [
            mkEl({
                cls: lark ? 'ne-icon ne-lark-icon' : 'ne-icon ne-icon-' + name,
                attrs: { 'data-name': name },
                children: [mkEl({ tag: 'svg', cls: 'larkui-icon' })],
            }),
        ],
    });

    const editBar = mkEl({
        cls: 'ne-card-toolbar ne-select-helper-toolbar',
        children: [tbItem('IconAiTagNew', true), tbItem('card-tb-comment', false)],
    });

    // NE 设计系统的类名不是 CSS Module、没有哈希，但类名顺序和追加的修饰类会变，
    // 所以选择器不能依赖「两个类名紧挨着、顺序固定」。
    const editBarReordered = mkEl({
        cls: 'ne-select-helper-toolbar ne-card-toolbar is-visible',
        children: [tbItem('IconAiTagNew', true)],
    });

    // 反例：块级工具栏（段落左侧那套），只挂通用类 ne-card-toolbar。
    // 这条守住「不能拿 ne-card-toolbar 当锚点」：一旦那么写，编辑器的正常功能会被静默干掉。
    const blockToolbar = mkEl({
        cls: 'ne-card-toolbar ne-card-toolbar-hover',
        children: [tbItem('drag', false), tbItem('duplicate', false)],
    });

    return { bar, barNewHash, bareItem, decoyTooltip, editBar, editBarReordered, blockToolbar };
}

// dom/腾讯文档-编辑态.html（选中文字后弹出的浮动格式工具栏）
function tencentFixture() {
    const btn = (id, label) => mkEl({
        attrs: { id, role: 'button', 'aria-label': label },
        cls: 'buttons_actual__2bXuf',
        children: [mkEl({
            cls: 'buttons_icon__nRCff',
            attrs: { role: 'button', 'aria-label': label },
            children: [mkEl({ tag: 'svg' })],
        })],
    });

    // 量宽度用的隐藏副本：多一个 toolbar_hidden 类 + aria-hidden
    const measureCopy = mkEl({
        cls: 'toolbar-container toolbar_container__3r-Et toolbar_hidden__2I957',
        attrs: { 'aria-hidden': 'true' },
        children: [btn('toolbar-button-ai-optimize', 'AI编辑'), btn('toolbar-button-bold', '加粗')],
    });

    const visibleBar = mkEl({
        cls: 'toolbar-container toolbar_container__3r-Et',
        children: [btn('toolbar-button-ai-optimize', 'AI编辑'), btn('toolbar-button-bold', '加粗')],
    });

    const floatBar = mkEl({
        cls: 'float-toolbar_container__zdDax',
        // 页面按选区算的定位，滚动 / 重新选词会被重写
        style: { top: { v: '159.655px' } },
        children: [
            mkEl({
                attrs: { role: 'toolbar', tabindex: '0' },
                children: [measureCopy, visibleBar],
            }),
        ],
    });

    // 关键回归：构建哈希变化（__zdDax → __Q7xZ）仍须命中
    const floatBarNewHash = mkEl({
        cls: 'float-toolbar_container__Q7xZ',
        children: [mkEl({
            attrs: { role: 'toolbar' },
            children: [mkEl({
                cls: 'toolbar-container toolbar_container__3r-Et',
                children: [btn('toolbar-button-bold', '加粗')],
            })],
        })],
    });

    // 反例：顶部固定菜单栏。同样挂 toolbar-container / toolbar_container__3r-Et，
    // 但没有 float-toolbar 这一层 —— 拿通用类当锚点会把整个顶部菜单干掉，
    // 那是编辑器的核心入口。这条守住选择器不被放宽。
    const topToolbar = mkEl({
        cls: 'toolbar-container toolbar_container__3r-Et',
        children: [btn('toolbar-button-bold', '加粗')],
    });

    return { floatBar, floatBarNewHash, visibleBar, topToolbar };
}

function run(hostname, fx) {
    const all = Object.values(fx);
    let tick = null;
    let styleEl = null;

    const define = (k, v) => Object.defineProperty(global, k, { value: v, configurable: true, writable: true });

    define('location', { hostname });
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

    // 规则没匹配到本站点时脚本会提前 return，tick 就是 null。
    // 这里给个空函数兜底：否则手动驱动时会 TypeError 崩掉整个套件，
    // 后面的断言全部丢失 —— 而"规则失效"恰恰是最需要看完整失败清单的时候。
    // 是否真正跑起来用 started 断言。
    return { css: styleEl ? styleEl.textContent : '', tick: tick || (() => {}), started: !!tick };
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
const { css, tick } = run('chatgpt.com', fx);

console.log('===== ChatGPT (chatgpt.com) =====');
console.log('\n[1] 注入的 CSS');
a(css.includes('[class*="selectionPopover"]'), '旧版浮层的语义类名仍进 CSS 层（A/B 兜底）');
a(!css.includes('pointer-events-none'), '新结构是宽泛工具类 → 不进 CSS 层，只走 JS 校验');
a(!css.includes('data-word-selection-toolbar'), '只注入当前站点（chatgpt.com）的规则，未串站点');
a(/\[class\*="selectionPopover"\]\s*\{\s*display: none !important;\s*\}/.test(css),
    '规则块内容为 display:none !important');
a((css.match(/\{/g) || []).length === 1, '每条选择器单独成块，不是逗号合并的列表');

console.log('\n[2] 首轮清理（新结构 + 文案回归）');
tick();
a(hidden(fx.bar), '新浮层已隐藏（改版后只剩「向 ChatGPT 提问」一项）');
a(hidden(fx.barReworded), '按钮文案再改（Ask ChatGPT）也不失效：keywords 只认品牌名');
a(!hidden(fx.tooltip), '同一套浮动层工具类但文本不含品牌名的悬浮提示未被误伤');

console.log('\n[3] style 被页面重写后的自愈（关键回归）');
fx.bar.style = mkStyle({ left: { v: '600px' }, top: { v: '900px' } });
a(!hidden(fx.bar), '已模拟页面按新选区重写行内定位、冲掉 display:none');
tick();
a(hidden(fx.bar), '下一轮清理自动补回隐藏');
a(fx.bar.style.getPropertyValue('left') === '600px', '页面自身的定位未被破坏');

console.log('\n[4] 幂等性');
tick(); tick(); tick();
a(hidden(fx.bar), '重复清理状态稳定');
a(!hidden(fx.tooltip), '重复清理不会误伤面扩大');

/* ==================== 文心一言 / 文心助手（百度） ==================== */

const yi = yiyanFixture();
const y = run('yiyan.baidu.com', yi);

console.log('\n===== 文心一言 (yiyan.baidu.com) =====');
console.log('\n[5] 注入的 CSS');
a(y.css.includes('[data-testid="selection-bar"]'), 'data-testid 锚点已进 CSS 层');
a(!y.css.includes('selectionPopover'), '站点隔离：没有串入 ChatGPT 的规则');
a((y.css.match(/\{/g) || []).length === 1, '每条选择器单独成块，不是逗号合并的列表');

console.log('\n[6] 首轮清理');
y.tick();
a(hidden(yi.bar), '引用工具栏已隐藏');
a(hidden(yi.barCopyChanged), '菜单项文案改版后（不含「引用 / 复制」）仍被主干选择器隐藏');
a(!hidden(yi.decoy), '同类名但无 data-testid、文本也不含关键词的元素未被误伤');

console.log('\n[7] style 被页面重写后的自愈');
yi.bar.style = mkStyle({ inset: { v: '3000px auto auto 20px' } });
a(!hidden(yi.bar), '已模拟页面重写 inset 定位、冲掉 display:none');
y.tick();
a(hidden(yi.bar), '下一轮清理自动补回隐藏');
a(yi.bar.style.getPropertyValue('inset') === '3000px auto auto 20px', '页面自身的 inset 未被破坏');

/* 同一套页面的第二个入口域名。用户实际用的是 wenxin.baidu.com，
   最初 host 只写了 yiyan.baidu.com，脚本压根不注入（现象：完全没生效）。
   这条断言专治「按产品名猜域名」这种失误。 */
const wx = yiyanFixture();
const w = run('wenxin.baidu.com', wx);

console.log('\n===== 文心 (wenxin.baidu.com) =====');
console.log('\n[8] 同一产品的第二个入口域名');
a(w.css.includes('[data-testid="selection-bar"]'), 'wenxin.baidu.com 同样注入规则');
a(w.started, 'wenxin.baidu.com 上脚本已运行（注册了清理循环）');
w.tick();
a(hidden(wx.bar), 'wenxin.baidu.com 上引用工具栏已隐藏');
a(hidden(wx.barCopyChanged), '文案改版后仍被主干选择器隐藏');

console.log('\n[9] host 不能过宽');
const tb = yiyanFixture();
const t = run('tieba.baidu.com', tb);
a(t.css === '', '非目标 baidu 子域不注入任何规则');
a(!t.started, '非目标子域上脚本提前退出，未注册任何监听');
a(!hidden(tb.bar), '非目标子域上的同名元素未被误伤');

/* ============================ 讯飞星火 ============================ */

const xh = xinghuoFixture();
const x = run('xinghuo.xfyun.cn', xh);

console.log('\n===== 讯飞星火 (xinghuo.xfyun.cn) =====');
console.log('\n[10] 注入的 CSS');
a(x.css.includes('[class*="CodeWin_quote"]'), '语义段锚点已进 CSS 层');
a(!x.css.includes('selectionPopover'), '站点隔离：没有串入其它站点的规则');
a((x.css.match(/\{/g) || []).length === 1, '每条选择器单独成块，不是逗号合并的列表');

console.log('\n[11] 首轮清理');
x.tick();
a(hidden(xh.bar), '引用工具栏已隐藏');
a(hidden(xh.barNewHash), 'CSS Module 哈希变化后（__02wVL → __9xK2p）仍命中：未把哈希写死');
a(!hidden(xh.decoyQuoteBox), '输入框里的引用气泡（模块前缀不同）未被误伤');

console.log('\n[12] style 被页面重写后的自愈');
xh.bar.style = mkStyle({ top: { v: '900px' }, left: { v: '40px' } });
a(!hidden(xh.bar), '已模拟页面重写 top/left 定位、冲掉 display:none');
x.tick();
a(hidden(xh.bar), '下一轮清理自动补回隐藏');
a(xh.bar.style.getPropertyValue('top') === '900px', '页面自身的定位未被破坏');

/* ============================ 语雀文档 ============================ */

const yq = yuqueFixture();
const q = run('www.yuque.com', yq);

console.log('\n===== 语雀文档 (www.yuque.com) =====');
console.log('\n[13] 注入的 CSS');
a(q.css.includes('[class*="wording-tooltip-module_toolTipContent"]'), '阅读态：模块名 + 语义名的锚点已进 CSS 层');
a(q.css.includes('[class*="ne-select-helper-toolbar"]'), '编辑态：限定名锚点已进 CSS 层');
a((q.css.match(/\{/g) || []).length === 3, '三条选择器各自成块（工具条无文字，全部走 CSS 层）');
a(!q.css.includes('selectionPopover') && !q.css.includes('CodeWin_quote'), '站点隔离：没有串入其它站点的规则');

console.log('\n[14] 首轮清理');
q.tick();
a(hidden(yq.bar), '阅读态划词工具条已隐藏');
a(hidden(yq.barNewHash), 'CSS Module 哈希变化后（__NHFlD → __Xy8Qz）仍命中：未把哈希写死');
a(hidden(yq.bareItem), '模块级兜底选择器生效：只剩 itemWrapper 的残缺结构也能隐藏');
a(!hidden(yq.decoyTooltip), '同语义名、不同模块前缀的其它 tooltip 未被误伤');

console.log('\n[15] 编辑态工具条');
a(hidden(yq.editBar), '编辑态划词工具条已隐藏');
a(hidden(yq.editBarReordered), '类名顺序变化 + 追加修饰类（is-visible）后仍命中');
a(!hidden(yq.blockToolbar), '块级工具栏（只挂通用类 ne-card-toolbar）未被误伤');

console.log('\n[16] 重新划词（工具条被页面重新显示）');
yq.bar.style = mkStyle({ display: { v: 'flex' } });
a(!hidden(yq.bar), '已模拟页面重新显示工具条、冲掉 display:none');
q.tick();
a(hidden(yq.bar), '下一轮清理自动补回隐藏');

console.log('\n[17] 域名边界');
const apx = yuqueFixture();
const ap = run('yuque.com', apx);
a(ap.started, '裸域 yuque.com 也生效（用户可能访问不带子域的地址）');
const fake = yuqueFixture();
const fk = run('notyuque.com', fake);
a(!fk.started && fk.css === '', 'notyuque.com 这类仿冒域名不注入任何规则');
a(!hidden(fake.bar), '非目标域名上的同名元素未被误伤');

/* ============================ 腾讯文档 ============================ */

const td = tencentFixture();
const tr = run('docs.qq.com', td);

console.log('\n===== 腾讯文档 (docs.qq.com) =====');
console.log('\n[18] 注入的 CSS');
a(tr.css.includes('[class*="float-toolbar_container"]'), '浮动格式工具栏锚点已进 CSS 层');
a((tr.css.match(/\{/g) || []).length === 1, '单条选择器单独成块');
a(!tr.css.includes('wording-tooltip-module') && !tr.css.includes('ne-select-helper-toolbar'),
    '站点隔离：没有串入语雀的规则');

console.log('\n[19] 首轮清理');
tr.tick();
a(hidden(td.floatBar), '浮动格式工具栏已隐藏');
a(hidden(td.floatBarNewHash), '构建哈希变化后（__zdDax → __Q7xZ）仍命中：未把哈希写死');
a(!hidden(td.topToolbar), '顶部菜单栏（同 toolbar_container 类、但没有 float-toolbar）未被误伤');

console.log('\n[20] 重新划词（工具栏被页面重新定位）');
td.floatBar.style = mkStyle({ top: { v: '800px' } });
a(!hidden(td.floatBar), '已模拟页面重写定位、冲掉 display:none');
tr.tick();
a(hidden(td.floatBar), '下一轮清理自动补回隐藏');

console.log('\n[21] 域名边界');
const tq1 = tencentFixture();
const tq2 = run('docs.qq.com.evil.com', tq1);
a(!tq2.started, '仿冒域 docs.qq.com.evil.com 不注入任何规则');
const mq1 = tencentFixture();
const mq2 = run('mail.qq.com', mq1);
a(!mq2.started && mq2.css === '', '同主域的其它站点（mail.qq.com）不注入');
a(!hidden(mq1.floatBar), '非目标域名上的同结构元素未被误伤');

console.log(`\n结果：${pass} 通过 / ${fail} 失败\n`);
process.exit(fail ? 1 : 0);
