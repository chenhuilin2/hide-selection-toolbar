# Hide AI Selection Menu

一个轻量油猴（UserScript）脚本，用于隐藏 AI 对话网页中**选中文本后弹出的浮动操作菜单**（如「引用 / 复制 / 朗读 / 追问」等）。

## 背景

ChatGPT、豆包、通义千问、智谱清言等 AI 对话页面，在选中回答文本时都会弹出一个悬浮操作条。当你只想安静地划词、复制或阅读时，这个菜单经常会挡住正文，造成干扰。本脚本会在菜单出现的瞬间把它隐藏掉，不影响页面其它功能。

## 支持的站点

| 站点 | 匹配域名 |
| --- | --- |
| ChatGPT | `chatgpt.com`、`chat.openai.com` |
| 豆包 | `*.doubao.com` |
| 通义千问 | `*.qianwen.com`、`*.tongyi.com`、`tongyi.aliyun.com` |
| 智谱清言 | `*.chatglm.cn` |

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
        // 高精度选择器：无 keywords → 走 CSS 层
        { selector: '[class*="selectionPopover"]' },
        // 兜底选择器：带 keywords → 只能由 JS 逐帧校验后隐藏
        { selector: 'div.shadow-long.flex.overflow-hidden.rounded-xl', keywords: ['询问 ChatGPT'] }
    ]
}
```

- `host`：仅在该域名下生效的正则；
- `targets`：菜单容器的候选选择器数组，命中任一即可；
- `keywords`（可选）：容器文本必须**同时**包含的关键词，用于防止选择器过宽时误伤。

**精度约定**：没有 `keywords` 的 target 会被当成高精度选择器直接进 CSS 层；带 `keywords` 的只能由 JS 兜底（会有一帧闪现）。所以宽泛选择器（如 `[class*="menu"]`）务必配上 `keywords`。

> ⚠️ `keywords` 里的文案会随站点改版变化，这是本脚本最容易静默失效的地方。ChatGPT 的菜单项曾含「开始写作」，某次改版后只剩「询问 ChatGPT / 分享所选内容」，`keywords.every()` 于是一直判定失败、菜单不再被隐藏。主力选择器请认准稳定的语义标识（`data-*` 属性、`xxx_selectionPopover` 这类语义后缀），`keywords` 只留给兜底选择器加保险。

## 适配新站点

1. 在目标页面选中文本，用开发者工具找到弹出菜单的最外层容器。
2. 优先选择稳定的标识：`data-*` 自定义属性 > 语义类名后缀（如 `<hash>_selectionPopover`、`selection-menu-<hash>`）> 完整类名。CSS Module 的哈希会随版本变化，避免写死。
3. 在 `RULES` 中新增一条规则；先放高精度选择器（不写 `keywords`，走 CSS 层），有需要再加一条带 `keywords` 的兜底。
4. 把真实 DOM 片段存进 `dom/`，然后在 `test/userscript.test.js` 的 `fixture()` 里照抄一份、跑一遍测试。
5. 刷新页面验证菜单不再出现，且页面其它元素未被误隐藏。

## 回归测试

```bash
node test/userscript.test.js
```

用最小 DOM 桩真实执行脚本源码，断言元素状态与注入的 CSS，无需浏览器。重点覆盖两类肉眼不可见的回归：`keywords` 改版后静默失效（本次 ChatGPT 的事故），以及浮层行内 `style` 被页面重写后隐藏没有补回。

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
│   └── 质谱清言.html
└── README.md
```

## License

MIT
