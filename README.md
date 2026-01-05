# Packaging Guide for QuickNote

This guide details the steps to package the QuickNote source code into a standalone desktop installer (e.g., `.exe` for Windows).

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

1.  **Node.js**: v16.0.0 or higher.
    *   Download: [https://nodejs.org/](https://nodejs.org/)
2.  **Git**: For version control (optional but recommended).
    *   Download: [https://git-scm.com/](https://git-scm.com/)

## Packaging Steps

### 1. Open Terminal

Open your preferred terminal (Command Prompt, PowerShell, or VS Code Terminal) and navigate to the project root directory.

```powershell
cd d:\note
```

### 2. Install Dependencies

Ensure all project dependencies are installed. This includes `electron` and `electron-builder`.

Using **npm**:
```bash
npm install
```

Or using **yarn** (recommended if you encounter errors with npm):
```bash
yarn install
```

### 3. Build the Installer

Run the build script defined in `package.json`. This command will compile the code and generate the installer.

```bash
npm run build
```

*Note: The first time you run this, it may take a few minutes to download necessary Electron binaries.*

### 4. Locate the Installer

Once the build process completes successfully, the installer file will be generated in the **`release_v2`** directory (as configured in `package.json`).

*   **Path**: `d:\note\release_v2\`
*   **File Name**: `QuickNote Setup 1.0.0.exe`

## Troubleshooting

### Common Errors

*   **EPERM / File Locked**: If you see "operation not permitted" errors, it usually means a file is in use.
    *   **Solution**: Close any running instances of QuickNote, close other terminals, and try again. You can also try clearing the cache:
        ```bash
        npm cache clean --force
        ```
*   **Download Failed**: If Electron binaries fail to download due to network issues.
    *   **Solution**: Check your internet connection or try using a mirror.

## Customization

To change the output directory or build settings, modify the `package.json` file:

```json
"build": {
  "directories": {
    "output": "release_v2" // Change this folder name
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```
