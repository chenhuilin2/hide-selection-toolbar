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
2. 访问 [AI 对话网页隐藏选中文本菜单](https://scriptcat.org/zh-CN/script-show-page/7900)，安装脚本。  

> 脚本使用 `@run-at document-start`，在页面脚本执行前注入，避免菜单闪现。

## 工作原理

脚本在 `document-start` 阶段启动，随后：

1. 根据 `location.hostname` 匹配当前站点对应的规则；
2. 用 CSS 选择器定位菜单容器，并通过 `keywords` 校验容器文本，避免选择器过宽时误伤其它元素；
3. 命中后设置 `display: none !important` 隐藏菜单；
4. 使用 `MutationObserver` 监听 DOM 变化，并通过 `requestAnimationFrame` 合并回调（AI 页面流式输出时 DOM 变动极频繁，逐次回调会严重掉帧），保证新增菜单被及时处理。

核心规则集中在脚本的 `RULES` 数组中，每个站点一条：

```js
{
    host: /(^|\.)doubao\.com$/,
    targets: [
        // 官方留的标记属性，最稳定
        { selector: '[data-word-selection-toolbar]' },
        // 兜底：CSS Module 类名哈希会变，但前缀一般保留
        { selector: '[class*="toolContainer-"]', keywords: ['复制', '朗读'] }
    ]
}
```

- `host`：仅在该域名下生效的正则；
- `targets`：菜单容器的候选选择器数组，命中任一即可；
- `keywords`（可选）：容器文本必须同时包含的关键词，用于防止选择器过宽时误伤。

## 适配新站点

1. 在目标页面选中文本，用开发者工具找到弹出菜单的最外层容器。
2. 优先选择稳定的标识：`data-*` 自定义属性 > 类名前缀（如 `[class*="selection-menu"]`）> 完整类名。CSS Module 的类名哈希会随版本变化，避免写死。
3. 在 `RULES` 中新增一条规则，补上 `keywords` 作为二次校验。
4. 刷新页面验证菜单不再出现，且页面其它元素未被误隐藏。

## 目录结构

```
.
├── hide-ai-selection-menu.js   # 油猴脚本本体
├── dom/                        # 各站点菜单的真实 DOM 片段，用于编写选择器时参考
│   ├── 豆包.html
│   ├── 千问.html
│   └── 质谱清言.html
└── README.md
```

## License

MIT
