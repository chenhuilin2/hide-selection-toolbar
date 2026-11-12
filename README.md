# Hide Selection Toolbar

**划词之后，别再弹东西。** 一个轻量油猴脚本，隐藏网页里「选中文本就冒出来」的浮动工具条——AI 对话页的「引用 / 复制 / 朗读」菜单、在线文档的「评论 / AI 写作 / 加粗」工具条，统统不出现，划词、复制、阅读都不再被挡。

[![version](https://img.shields.io/badge/version-2.9-blue)](./hide-ai-selection-menu.js)
[![license](https://img.shields.io/badge/license-MIT-green)](./README.md)
[![sites](https://img.shields.io/badge/sites-9-brightgreen)](./README.md)
[![ScriptCat](https://img.shields.io/badge/ScriptCat-Install-orange)](https://scriptcat.org/zh-CN/script-show-page/7900)

## 为什么需要它

ChatGPT、豆包、语雀、腾讯文档这些页面，只要你选中一段字，就会在光标旁弹出一条悬浮菜单。想安静地读一段、复制一句话，它总是恰好盖在正文上；点多几次还会误触「引用到对话」「AI 改写」之类的按钮。

这个脚本在菜单出现的瞬间把它隐藏掉，**页面其它功能一概不动**——不是屏蔽脚本，也不改页面逻辑，只是让那条工具条不显示。

## 能解决什么

- **不挡正文**：划词后不再弹出菜单，选中、复制、阅读都照常。
- **不闪一帧**：高精度规则在 `document-start` 阶段就以 CSS 注入，首帧渲染前已生效。
- **不乱误伤**：每个站点单独匹配域名 + 精确选择器，顶部菜单栏、块级工具栏、其它 tooltip 都保留。
- **一处配置**：所有规则集中在脚本的 `RULES` 数组，加一个站点只需加一条。

## 支持的站点

| 站点 | 覆盖域名 | 隐藏的对象 |
| --- | --- | --- |
| ChatGPT | `chatgpt.com`、`chat.openai.com` | 划词浮层 |
| 豆包 | `*.doubao.com` | 划词工具条 |
| 通义千问 | `*.qianwen.com`、`*.tongyi.com`、`tongyi.aliyun.com` | 划词工具条 |
| 智谱清言 | `*.chatglm.cn` | 划词工具条 |
| 文心一言 / 文心助手 | `yiyan.baidu.com`、`wenxin.baidu.com` | 划词工具栏 |
| 讯飞星火 | `xinghuo.xfyun.cn` | 引用工具条 |
| 语雀 | `*.yuque.com` | 阅读态「评论 / 笔记」、编辑态「AI 写作 / 评论」 |
| 腾讯文档 | `docs.qq.com` | 编辑态浮动格式工具栏 |
| 金山文档 | `kdocs.cn` | 阅读态「问问 AI / 收藏 / 评论」浮动菜单 |

不在表内的域名**一律不注入**，不会影响你其它网页。

## 安装

1. 浏览器安装 [ScriptCat](https://www.scriptcat.org/)（或任意支持 UserScript 的扩展）。
2. 打开 [ScriptCat 脚本页](https://scriptcat.org/zh-CN/script-show-page/7900) 点安装；也可以下载 [hide-ai-selection-menu.js](./hide-ai-selection-menu.js) 手动导入。
3. 刷新目标页面，划一段字验证。

> 脚本使用 `@run-at document-start`，在页面脚本执行前注入，避免菜单闪现。
> 脚本更新后需在扩展里重新拉取（`@version` 已到 **2.9**）。

## 工作原理

脚本启动后：

1. 按 `location.hostname` 匹配当前站点的规则；
2. **CSS 层**——把**不带 `keywords` 的高精度选择器**立刻写进一个 `<style>`（每条单独成块）。首帧前生效，不闪现；页面重写浮层行内 `style` 也冲不掉它；
3. **JS 层**——`querySelectorAll` 定位容器，对带 `keywords` 的兜底选择器做文本二次校验，命中后写 `display: none !important`；
4. **监听层**——`MutationObserver` 监听 `childList` 与 `class` / `style`（菜单被"重新 show"时通常只改属性），用 `requestAnimationFrame` 合并回调；另有前 30 秒 250ms、之后 3 秒的兜底轮询，兜住定时器插入的菜单。

规则都在 `RULES` 里，每个站点一条：

```js
{
    // ChatGPT
    host: /(^|\.)(chatgpt\.com|chat\.openai\.com)$/,
    targets: [
        // 旧版浮层：语义后缀稳定 → 走 CSS 层
        { selector: '[class*="selectionPopover"]' },
        // 新版浮层：只剩 Tailwind 工具类，结构特征不唯一 → 必须配 keywords
        { selector: 'div.pointer-events-none.fixed.z-50', keywords: ['ChatGPT'] }
    ]
}
```

- `host`：仅在该域名下生效的正则；
- `targets`：容器候选选择器数组，命中任一即可；
- `keywords`（可选）：容器文本必须**同时**包含的关键词，用于防止选择器过宽时误伤。

**精度约定**：没有 `keywords` 的 target 视为高精度选择器，直接进 CSS 层；带 `keywords` 的只能走 JS 层（会有一帧闪现）。所以宽泛选择器一律要配 `keywords`。

### 三条踩过的坑

**没有稳定标识时怎么办**——ChatGPT 2026-11 改版后整棵树都是 Tailwind 工具类，既无 `data-*` 也无语义类名。这时不要硬凑一个"看起来高精度"的选择器塞进 CSS 层，那是在赌这些工具类不会出现在别处。取结构特征（`fixed` + `pointer-events-none` + `z-50` 这类穿透式浮层写法）+ `keywords` 走 JS 层，且 `keywords` 只放**品牌名**这种不会改的词。

**工具条里一个文字都没有时**——语雀的划词条整条只有两个 `<svg>`，`textContent` 恒为空，`keywords` 天然失效，配了等于让规则自杀。这种情况只能把误伤面压在**选择器精度**上：锚到「模块名 + 语义名」全段（`[class*="wording-tooltip-module_toolTipContent"]`），而不是 `[class*="toolTipContent"]`。

**一个元素常同时挂多个类名**——语雀编辑态是 `class="ne-card-toolbar ne-select-helper-toolbar"`。`ne-card-toolbar` 是通用类，块级工具栏（段落的拖拽 / 复制 / 删除）也在用；拿它当锚点会静默干掉编辑器的正常功能，症状只是"某个按钮忽然点了没反应"。只有修饰类 `ne-select-helper-toolbar` 是这个条独有的。

> ⚠️ `keywords` 里的文案会随改版变化，这是本脚本最容易静默失效的地方。ChatGPT 的菜单项曾含「开始写作」，改版后只剩「询问 ChatGPT / 分享所选内容」，`keywords.every()` 于是永远判定失败、菜单不再被隐藏。所以 `keywords` 只放一个最稳定的词，能不放就不放。

## 适配新站点

1. **先看地址栏的真实域名**，别照产品名猜。同一产品常有多入口（文心一言就有 `yiyan` 和 `wenxin` 两个域名、共用同一套 DOM），域名猜错时脚本压根不注入——现象是「完全没生效」，而不是「偶尔漏一个」。
2. 开发者工具里找到弹出菜单的最外层容器。
3. 优先选稳定标识：`id` > `data-*` > 语义类名后缀（`<hash>_selectionPopover`、`selection-menu-<hash>`）> 完整类名。CSS Module 的哈希随构建变化，别写死；金山文档那个浮层是少见的带 `id` 的例子（`#floatMenu`）。
   > 取语义段要**连模块名前缀一起带**：`[class*="CodeWin_quote"]` 可以，`[class*="quote"]` 会把输入框里的引用气泡一起误伤。
4. 加进 `RULES`：先放高精度选择器（不写 `keywords`，走 CSS 层），需要时再加一条带 `keywords` 的兜底。
5. 把真实 DOM 片段存进 `dom/`，在 `test/userscript.test.js` 里照抄一份 fixture、补断言。**别忘反例**：同语义名但模块前缀不同的元素必须保持可见。
6. 刷新验证：菜单不出现，且页面其它元素没被误隐藏。

## 回归测试

```bash
node test/userscript.test.js
```

用最小 DOM 桩真实执行脚本源码，断言元素状态与注入的 CSS，无需浏览器。重点覆盖肉眼看不见的回归：`keywords` 改版后静默失效、行内 `style` 被页面重写后隐藏没补回、CSS Module 哈希变化、选择器放宽导致的误伤，以及 host 域名边界（多入口要命中、非目标子域不得注入）。

改完规则请做一次**反向验证**——故意把选择器改坏或把域名改窄，确认测试确实报错。绿灯本身不算证据。

## 常见问题

**装了但没生效？** 先在页面控制台跑这一行——`false` 说明脚本没在该页运行（查域名和版本），`true` 才是选择器要调：

```js
!!document.getElementById('hide-ai-selection-menu-style')
```

**会不会误伤其它元素？** 每条规则只对表内的域名生效，且选择器都锚在站点独有的标识上。测试里为每个站点留了反例（顶部菜单栏、块级工具栏、同名词的其它 tooltip），一旦选择器被放宽就会报错。

**为什么个别站点会闪一下？** 只有带 `keywords` 的兜底规则需要 JS 逐帧校验，会有极短的一帧。高精度规则走 CSS 层，不闪。

## 目录结构

```
.
├── hide-ai-selection-menu.js   # 油猴脚本本体
├── test/
│   └── userscript.test.js      # DOM 桩回归测试（node test/userscript.test.js）
├── dom/                        # 各站点工具条的真实 DOM 片段，写选择器时以它为准
│   ├── gpt.html
│   ├── 豆包.html
│   ├── 千问.html
│   ├── 质谱清言.html
│   ├── 文心一言.html
│   ├── 讯飞星火.html
│   ├── 语雀.html
│   ├── 语雀-编辑态.html
│   ├── 腾讯文档-编辑态.html
│   └── 金山文档-阅读态.html
└── README.md
```

## License

MIT
