# Hide AI Selection Menu

一个轻量油猴（UserScript）脚本，用于隐藏网页中**选中文本后弹出的浮动工具条**——包括 AI 对话页的「引用 / 复制 / 朗读 / 追问」菜单，以及网页文档（语雀、腾讯文档）的「评论 / 笔记」「AI 写作 / 加粗 / 字号」工具条。

## 背景

ChatGPT、豆包、通义千问、智谱清言、文心一言、讯飞星火等 AI 对话页面，以及语雀、腾讯文档这类在线文档，在选中文本时都会弹出一个悬浮操作条。当你只想安静地划词、复制或阅读时，这个菜单经常会挡住正文，造成干扰。本脚本会在菜单出现的瞬间把它隐藏掉，不影响页面其它功能。

## 支持的站点

| 站点 | 匹配域名 |
| --- | --- |
| ChatGPT | `chatgpt.com`、`chat.openai.com` |
| 豆包 | `*.doubao.com` |
| 通义千问 | `*.qianwen.com`、`*.tongyi.com`、`tongyi.aliyun.com` |
| 智谱清言 | `*.chatglm.cn` |
| 文心一言 / 文心助手 | `yiyan.baidu.com`、`wenxin.baidu.com` |
| 讯飞星火 | `xinghuo.xfyun.cn` |
| 语雀（文档） | `*.yuque.com`（阅读态「评论 / 笔记」+ 编辑态「AI 写作 / 评论」两条工具条） |
| 腾讯文档 | `docs.qq.com`（编辑态选中文字后的浮动格式工具栏） |

## 安装

1. 浏览器安装 [ScriptCat](https://www.scriptcat.org/) 扩展。
2. 访问 [AI 对话网页隐藏选中文本菜单](https://scriptcat.org/zh-CN/script-show-page/7900) 在线安装；
   或下载 [hide-ai-selection-menu](./hide-ai-selection-menu.js) 手动导入。

> 脚本使用 `@run-at document-start`，在页面脚本执行前注入，避免菜单闪现。

## 工作原理

脚本在 `document-start` 阶段启动，随后：

1. 根据 `location.hostname` 匹配当前站点对应的规则；
2. **CSS 层**：把**不带 `keywords` 的高精度选择器**立刻写进一个 `<style>` 标签（每条选择器单独成块）。它在首帧渲染前就生效，菜单不会闪现，而且页面重写浮层行内 `style` 也冲不掉它；
3. **JS 层**：`querySelectorAll` 定位容器，对带 `keywords` 的兜底选择器做文本二次校验，命中后写行内 `display: none !important`；
4. **监听层**：`MutationObserver` 监听 `childList` 与 `class` / `style` 属性（菜单被页面"重新 show"时通常只改属性），用 `requestAnimationFrame` 合并回调，保证新增菜单被及时处理；另有前 30 秒 250ms、之后 3 秒的兜底轮询，兜住定时器插入的菜单。

核心规则集中在脚本的 `RULES` 数组中，每个站点一条：

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
- `targets`：菜单容器的候选选择器数组，命中任一即可；
- `keywords`（可选）：容器文本必须**同时**包含的关键词，用于防止选择器过宽时误伤。

**精度约定**：没有 `keywords` 的 target 会被当成高精度选择器直接进 CSS 层；带 `keywords` 的只能由 JS 兜底（会有一帧闪现）。所以宽泛选择器（如 `[class*="menu"]`）务必配上 `keywords`。

**没有稳定标识时怎么办**：像 ChatGPT 2026-11 改版后的划词菜单，整棵树都是 Tailwind 工具类，既没有 `data-*` 也没有语义类名。这时不要硬凑一个"看起来高精度"的选择器塞进 CSS 层——它只是在**赌**这些工具类不会出现在别处。正确做法是：取结构特征（如 `fixed` + `pointer-events-none` + `z-50` 这类穿透式浮层写法）+ `keywords` 走 JS 层，并且 `keywords` 要选**最不会改**的那个词（品牌名），而不是菜单项文案。

**工具条里一个文字都没有时**：语雀的划词工具条整条只有两个 `<svg>` 图标，`textContent` 恒为空——`keywords` 校验在这里天然失效，配了就等于让规则自杀。这种情况只能把误伤面压在**选择器精度**上：锚点取到「模块名 + 语义名」全段（`[class*="wording-tooltip-module_toolTipContent"]`），而不是 `[class*="toolTipContent"]`，因为页面别处还有别的 tooltip，模块名前缀是唯一的分界线。

**一个元素常同时挂多个类名，要挑那个限定名**：语雀编辑态工具条写的是 `class="ne-card-toolbar ne-select-helper-toolbar"`。`ne-card-toolbar` 是**通用**类，块级工具栏（段落左侧的拖拽 / 复制 / 删除）同样在用；只有 `ne-select-helper-toolbar` 是这个划词条独有的。拿通用类当锚点，等于把编辑器的正常功能一起干掉——而且不会报错，只是"某个按钮忽然点了没反应"。测试里的反例专门守这条。

> ⚠️ `keywords` 里的文案会随站点改版变化，这是本脚本最容易静默失效的地方。ChatGPT 的菜单项曾含「开始写作」，某次改版后只剩「询问 ChatGPT / 分享所选内容」，`keywords.every()` 于是一直判定失败、菜单不再被隐藏；后来菜单又改成了单项「向 ChatGPT 提问」。所以 `keywords` 只放一个最稳定的词，能不放就不放。

## 适配新站点

1. **先看地址栏的真实域名**，别照产品名猜。同一个产品常有多个入口域名（文心一言就有 `yiyan.baidu.com` 和 `wenxin.baidu.com`），域名猜错时脚本压根不会注入，选择器写得再准也无效——现象是「完全没生效」而不是「偶尔漏一个」。
2. 在目标页面选中文本，用开发者工具找到弹出菜单的最外层容器。
3. 优先选择稳定的标识：`data-*` 自定义属性 > 语义类名后缀（如 `<hash>_selectionPopover`、`selection-menu-<hash>`）> 完整类名。CSS Module 的哈希会随版本变化，避免写死。
   > 取语义段时要**连模块名前缀一起带上**：`[class*="CodeWin_quote"]` 可以，`[class*="quote"]` 会把输入框里的引用气泡之类同名功能的元素一起误伤。
4. 在 `RULES` 中新增一条规则；先放高精度选择器（不写 `keywords`，走 CSS 层），有需要再加一条带 `keywords` 的兜底。若工具条里**没有文字**（纯图标），`keywords` 不可用，必须把选择器收窄到「模块名 + 语义名」。
5. 把真实 DOM 片段存进 `dom/`，然后在 `test/userscript.test.js` 的 `fixture()` 里照抄一份、跑一遍测试。**别忘了一个反例**：同语义名但模块前缀不同的元素，必须保持可见。
6. 刷新页面验证菜单不再出现，且页面其它元素未被误隐藏。

## 回归测试

```bash
node test/userscript.test.js
```

用最小 DOM 桩真实执行脚本源码，断言元素状态与注入的 CSS，无需浏览器。重点覆盖肉眼不可见的回归：`keywords` 改版后静默失效（ChatGPT 的事故）、浮层行内 `style` 被页面重写后隐藏没有补回、CSS Module 哈希变化、选择器放宽导致的误伤（同语义名但模块前缀不同），以及 host 域名匹配（同产品多入口要命中、非目标子域不得注入）。

改完规则请做一次**反向验证**：故意把选择器改坏 / 把域名改窄，确认测试真的报错。绿灯本身不算证据。

## 目录结构

```
.
├── hide-ai-selection-menu.js   # 油猴脚本本体
├── test/
│   └── userscript.test.js      # DOM 桩回归测试（node test/userscript.test.js）
├── dom/                        # 各站点菜单的真实 DOM 片段，用于编写选择器时参考
│   ├── gpt.html
│   ├── 豆包.html
│   ├── 千问.html
│   ├── 质谱清言.html
│   ├── 文心一言.html
│   ├── 讯飞星火.html
│   ├── 语雀.html
│   ├── 语雀-编辑态.html
│   └── 腾讯文档-编辑态.html
└── README.md
```

## License

MIT
