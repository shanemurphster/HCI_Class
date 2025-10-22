# Homerun Prototype — Local Run Guide

This is a static HTML/CSS/JS prototype. You can open the files directly in a browser or serve them from a lightweight local web server.

### Quick start (no server)
- Locate this folder and double‑click any page to open it in your default browser, e.g.:
  - `index.html`
  - `events.html`
  - `reels.html`
  - `messages.html`
  - `locker.html`
  - `cupid.html`

If any features don’t work when opened via `file://` (common with fetch/XHR), use a local server (below).

### Recommended: run a local server
Running a tiny server avoids CORS and path issues and matches how browsers load assets in production.

#### Option A: Python 3 (built‑in simple server)
PowerShell (Windows):

```powershell
cd "C:\Users\shane\OneDrive\Code\HCI-class\Hi-Fidelity prototype\homerun-prototype"
python -m http.server 5500
```

Then open `http://localhost:5500/` in your browser (e.g., `http://localhost:5500/index.html`).

Tip: If `python` isn’t found, try `py -m http.server 5500`.

#### Option B: Node.js (http-server)
Requires Node.js (and npm). No install needed with npx:

```powershell
cd "C:\Users\shane\OneDrive\Code\HCI-class\Hi-Fidelity prototype\homerun-prototype"
npx --yes http-server -p 5500 --silent
```

Open `http://localhost:5500/`.

#### Option C: VS Code Live Server
- Open this folder in VS Code
- Install the "Live Server" extension (by Ritwick Dey)
- Right‑click `index.html` → "Open with Live Server"

### Project structure
- `index.html`, `events.html`, `reels.html`, `messages.html`, `locker.html`, `cupid.html`
- `css/styles.css`
- `js/app.js`, `js/mock-data.js`

No build step is required. Edit files and refresh the browser.

### Troubleshooting
- **Port already in use**: change the port (e.g., `5501`) and open `http://localhost:5501/`.
- **Blank or partially working pages when double‑clicking**: use a local server (above) instead of `file://`.
- **OneDrive paths with spaces**: always wrap paths in quotes in your terminal (as shown).
- **Cache issues**: hard‑reload the page (Windows: `Ctrl+F5`).

### Notes
- Tested with modern browsers (Chrome/Edge/Firefox). If something looks off, try a different browser.
