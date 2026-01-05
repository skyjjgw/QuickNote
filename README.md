# QuickNote

一款基于 Electron 开发的轻量级、跨平台桌面便签应用。支持 Markdown 语法，提供极简的浮窗模式和高效的快捷键操作。

## 功能特性

*   **双模式切换**：
    *   **展开模式**：完整的笔记编辑和管理界面。
    *   **浮窗模式**：小巧的桌面悬浮窗，置顶显示，方便对照查看。
*   **Markdown 支持**：支持标题、列表、粗体、代码块等常用 Markdown 格式。
*   **自动保存**：所有修改实时自动保存。
*   **多笔记管理**：支持创建、删除、切换多条笔记。
*   **回收站**：误删笔记保护机制。
*   **系统集成**：托盘图标、开机自启。

## 快捷键

| 功能 | 快捷键 |
| :--- | :--- |
| **切换模式** | `Ctrl + Space` |
| **显示/隐藏** | `Ctrl + Alt + M` (全局) |
| **另存为** | `Ctrl + Alt + S` |
| **删除笔记** | `Backspace` |
| **新建笔记** | `Ctrl + N` |
| **缩放** | `Ctrl + +` / `Ctrl + -` |

## 开发构建

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm start
```

### 打包构建

```bash
# Windows
npm run build -- --win

# Mac
npm run build -- --mac

# Linux
npm run build -- --linux
```


