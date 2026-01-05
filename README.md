# QuickNote

A lightweight, cross-platform desktop sticky note application built with Electron. It supports Markdown syntax and provides a minimalist floating window mode for efficiency.

## Features

*   **Dual Mode**:
    *   **Expanded Mode**: Full note editing and management interface.
    *   **Floating Mode**: Compact desktop overlay for quick reference.
*   **Markdown Support**: Headers, lists, bold text, code blocks, etc.
*   **Auto-Save**: Changes are saved automatically in real-time.
*   **Multi-Note Management**: Create, delete, and switch between multiple notes.
*   **Recycle Bin**: Protects against accidental deletion.
*   **System Integration**: Tray icon and auto-start support.

## Installation

### From Source

To run the application from the source code, please follow these steps:

1.  **Prerequisites**:
    *   Ensure [Node.js](https://nodejs.org/) (v16 or higher) is installed.
    *   Ensure [Git](https://git-scm.com/) is installed.

2.  **Clone the Repository**:
    ```bash
    git clone https://github.com/skyjjgw/QuickNote.git
    cd QuickNote
    ```
    *(Note: If you have the source code locally at `d:\note\src\`, simply navigate to the root directory `d:\note` in your terminal.)*

3.  **Install Dependencies**:
    ```bash
    npm install
    # OR if you use yarn
    yarn install
    ```

4.  **Run the Application**:
    ```bash
    npm start
    ```

### Build from Source

To create a distributable installer (e.g., .exe for Windows):

```bash
npm run build
```

The output files will be located in the `release` (or configured output) directory.

## Shortcuts

| Action | Shortcut |
| :--- | :--- |
| **Toggle Mode** | `Ctrl + Space` |
| **Show/Hide** | `Ctrl + Alt + M` (Global) |
| **Save As** | `Ctrl + Alt + S` |
| **Delete Note** | `Backspace` |
| **New Note** | `Ctrl + N` |
| **Zoom** | `Ctrl + +` / `Ctrl + -` |

