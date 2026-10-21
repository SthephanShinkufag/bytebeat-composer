# bytebeat-composer

A web-based algorithmic music generator and player for real-time live-coding, packed with a rich library of bytebeat songs.

**Bytebeat Composer:** [https://dollchan.net/bytebeat/](https://dollchan.net/bytebeat/)<br>
**Discussion Threads:** [https://dollchan.net/btb/](https://dollchan.net/btb/)

<img width="1028" height="296" alt="Bytebeat composer" src="https://github.com/user-attachments/assets/1dbf635a-e1df-4eb4-a6d1-04eaad53650e" />

## ✨ Features & Functionality

### 🎹 Supported Playback modes

* **Bytebeat:** Outputs value as an *unsigned 8-bit integer (uint8)* (0 to 255). Values outside this range wrap around, decimals are truncated.
* **Signed Bytebeat:** Outputs as a *signed 8-bit integer (int8)* (-127 to 128). Required for classic demoscene music ports (e.g., *Longline Theory*).
* **Floatbeat:** Uses *floating-point values (float)* from -1.0 to 1.0. This mode provides clean sound without 8-bit distortion or noise on quiet songs.
* **Funcbeat:** *Statement-based tracking*. Runs a wrapper function once at startup and expects it to return a function evaluated in seconds.
* **Stereo sound:** Return a two-element array `[left, right]` to separate channels. For example, `[t*(t>>10&42), t*(t>>11&42)]`

### ♒ Visualizer Scope modes

* **Points:** Renders raw calculated values as separate coordinate dots on the grid.
* **Waveform:** Connects points with lines, keeping the wave clean and legible at high zoom.
* **Diagram:** Draws vertical lines where brightness changes based on the signal amplitude.
* **Combined:** Overlays the Waveform line on top of the Diagram background.
* **FFT (Fast Fourier Transform):** Renders a real-time frequency spectrum map. Uses a logarithmic grid marked in Hertz (10 Hz to 24 kHz) and Decibels (-20 dB to -120 dB).

### 📊 Visualizer Scope features

* **Interactive Timeline Cursor:** Renders a moving playback cursor that you can color-customize. At high zoom levels, it moves faster and stops being displayed.
* **Stereo Channel Splitting:** Renders left and right audio channels using distinct colors, with multiple color preset configurations available.
* **Visual Error Tracking:** Audio overflows, out of bounds, and invalid calculations (`NaN`) automatically colors in warning red.
* **Playback Toggling:** Click directly on the scope timeline to pause or to resume the playback.

### 🎛️ Playback & Control Panel

* **Time counter:** Click the `t` button to switch to measuring in seconds. Click the counter number field to pause. Type a number and press `Enter` to jump to that specific time.
* **Lag indicator:** Shows a slowdown coefficient if heavy or unoptimized code overloads the audio worker. Use this value to monitor lag and to fix audio crackling.
* **Stop and reset:** Click the ⏹️ button to stop playback and to reset the time to 0.
* **Reset:** Click the ⏮️ button to set time back to 0 without stopping playback.
* **Pause:** Click the ⏸️ button to pause playback.
* **Playback speed:** Click the fast-forward ⏩ or fast-reverse ⏪ buttons multiple times to speed up or slow down playback (2x, 4x, ... up to 64x).
* **Zoom controls:** Use the `+` and `-` buttons to scale the visual scope. Zooming in helps you see the wave details, while zooming out gives a broader view of the pattern.
* **Zoom indicator:** Click the `1/x` button to reset the zoom to 1.
* **Visual mode:** Switch between different view types like `Waveform` (classic wave line), `Diagram` (2D pixel pattern), or `FFT` (frequency spectrum) to see your code's visual footprint.
* **Playback mode:** Switch between different playback types like `Bytebeat`, `Signed Bytebeat`, `Floatbeat` or `Funcbeat`.
* **Sample rate:** Select standard frequencies from lo-fi 4000 Hz to 48000 Hz. Type your own numbers into the sample rate selector input to set custom frequencies.
* **Sample rate divisor:** Located next to the sample rate selector. If your song is too heavy or you are on a weak mobile device, increase this value. It skips calculation steps to reduce CPU load (note: this causes sound stepping and visual distortion).
* **Copy link:** Click the chain/link 🔗 button to copy the unique URL of your song. It saves your code, sample rate, and playback mode so you can easily share your creation with others.
* **Record audio:** Click the record button ⏺️ to capture the output directly from the playback. It renders the audio into a downloadable `.ogg` file.
* **Clean view:** Use the expand `⛶` button to hide the code editor and settings, leaving only the visual scope and basic playback controls on the screen. Available on mobile devices or small screens.
* **Byte counter:** Tracks your code size in real-time. This helps you fit into classic bytebeat limits like 256 bytes or 1 KB.

### 📝 Code Editor
* **Syntax Highlighting:** Includes 12 themes (`Atom`, `GitHub`, `VSCode`, etc.) in both Dark and Light variants.
* **Smart Shortcuts:** Global aliases let you type `Math.` functions directly (`sin`, `cos`, `abs`, `min`, etc) and use `int()` shorthand instead of `Math.floor()`.
* **Code Utilities:** Includes full-text search (`Ctrl+F`), line numbers, and collapsible code blocks (function folding).
* **Advanced Bracket Pairing:** Highlights matching brackets in yellow and highlights orphan brackets in red to instantly spot syntax mistakes.

### 🎼 Song Library & Discovery

The composer includes a structured song catalog compiled from communities like Battle of the Bits and Reddit:
* **Library filters:** Quickly filter songs by size limits (`all`, `<256`, `<1k`, `big`), by audio types (`all`, `Bytebeat`, `Signed Bytebeat`, `Floatbeat`, `Funcbeat`), by tags, and to sort songs by author or by date.
* **Library search:** Type in the search field to find songs by name, author or description.
* **Remix Tree Navigation:** If a song is a remix of another song, click the `▷` arrow button to load parent metadata right below it. This lets you browse nested remix histories without losing your place.
* **Code Format Toggles:** Each song entry can contain code execution buttons: `min` (minified), `orig` (original), and `format` (pretty-printed). Switch between them instantly to load necessary code.
* **Auto Zoom Syncing:** Clicking a song with `drawing` tag automatically syncs the visualizer's zoom level and mode to what the author intended.

### 🏷️ Song Tags

Some songs in the library have visible tags:
* **stereo** for stereo songs;
* **drawing** if the code does something in the visualiser;
* **c** for C-compatible songs;
* **console** for when a song uses throw to display arbitrary text;
* **port** for songs ported to bytebeat from other platform formats;
* **slow** for songs that are very demanding on performance;
* **sample** for songs that use encoded audio samples (by PCM, for example).

### 👨🏻‍💻 Administrative Features

* **Song Editor:** A dedicated interface for adding and managing songs. Administrators and moderators can paste code (minified, original, formatted), assign metadata (title, author, date, description, multiple URLs, multiple remix parent songs), specify the playback mode (Bytebeat, Signed Bytebeat, Floatbeat, Funcbeat), set sample rates, drawing mode ad zoom, and apply feature tags.
* **Role-Based Access Control ("Manage Users"):** The system supports multiple user accounts. Administrators can use the `Manage users` view to create or delete moderator profiles. Moderators are authorized to add new songs, tweak metadata and code, and edit or delete existing songs.
* **Secure Encrypted Passwords:** User credentials and login tokens are fully protected. All passwords are stored in the MySQL database as secure cryptographic hashes.
* **Automated JSON Export ("Make library files"):** Regenerates the songs from your database tables with one click. It processes row items sequentially, exports standalone long files, and compresses the final library down to `data/library/all.gz` using minimal server RAM.
* **Database Restoring ("Make database"):** A deployment utility used to quickly populate a new or empty server database. It reads your compressed `all.gz` library backup archive and restores all structural records, tracking links, and tags back into the MySQL tables.

### 📝 Management Panel Buttons

The management panel includes a set of tools for library curation, user access management, and automated maintenance:
* **"Add a Song":** A dedicated submission form to validate and push new songs to the database.
* **"Make Library Files":** Compiles all database tables into compressed public JSON files and standalone scripts.
* **"Make Database":** An architectural restore action that re-populates empty server environments directly from your latest library backup.
* **"Manage Users":** Permits administrators to grant or revoke moderator access keys for community curators.
* **"Change password":** Allows to change current account password.

### 💾 Storage & Caching

To reduce server load and skip unnecessary SQL queries during public accesses, song records are split into two layers:
* **Meta Index (`/data/library/all.gz`):** The primary index layout (containing songs metadata, and truncated code preview) is stored in a structured JSON file compressed with GZIP.
* **Lazy-Loaded Sources (`/data/songs/*/*.js`):** Code scripts exceeding **512 bytes** or **8 line breaks** are stripped into separate `.js` files. The player fetches them asynchronously only when a user hits code loading button, saving device bandwidth.

### 🎨 Themes & Custom Visuals
* **App Interface Themes:** Switch between different color palettes to match your mood (`Default Dark/Light`, `Blue Dark/Light`, `Cake Dark`, `Dusk Dark`, `Green Dark/Light`, `Orange Dark`, `Purple Dark` and `Teal Dark`).
* **Code Editor Highlights:** Pick from distinct syntax color themes to make coding more comfortable (`Atom Dark/Light`, `Github Dark/Light`, `Github v2 Dark/Light`, `Monokai`, `One Dark/Light`, `Retro Green`, `VSCode Dark/Light`).
* **Custom Visualizer Colors:** Beyond standard interface styles, you can pick a custom color code (Hex) for your visualizer diagram, waveform lines, and timeline cursor.

### 📱 Mobile Responsiveness & Adaptability
* **Responsive Layout:** The interface fully adapts to smartphones and tablets, repositioning the editor, visualizer, and track library for easy vertical scrolling.
* **Flexible UI Scaling:** All text inputs and panel elements automatically stretch and resize based on your device's screen size.

## 🛠️ Setup

### 📋 Compilation & Building

1. Ensure you have **Node.js** installed.
2. Clone the repository and navigate into the project directory:
```bash
git clone https://github.com
cd bytebeat-composer
```
3. Install dependencies and build the project scripts:
```bash
npm install
npm start
```
4. Compiled production files are written directly into the `/build` folder.
5. Launch the player interface via `index.html` in the root directory.

### 💻 Server Environment Setup

1. **Database:** Create an empty MySQL schema instance on your hosting server.
2. **Runtime Requirements:** PHP 8.x with the **MySQL PDO Driver extension** installed and enabled.
3. **Configuration file:** Copy the base configuration template to use it:
```bash
cp settings.default.php settings.php
```
4. Open `settings.php` and fill in your database access credentials.
5. Set directory write permissions for library export scripts:
```bash
chmod -R 755 data/
```

### 👤 Initial Administrative Setup
1. Write a temporary password string inside `BYTEBEAT_ADMINPASS` in your `settings.php` file.
2. Open the front-end player view in your web browser and click the **"Manage"** button.
3. Log in using your temporary pass (the username field can be anything).
4. Fill in the prompt fields to create your permanent, encrypted admin account in the database.
5. **Important Security Step:** Clear the temporary configuration password out of your `settings.php`:
```php
define('BYTEBEAT_ADMINPASS', '');
```

## 📜 Project History & Changelog

* **2018 (Pre-release):** The project started when SthephanShi decided to build a convenient environment for personal bytebeat experiments. He was passionate about both music and microcontroller programming, so bytebeat was the perfect intersection. Instead of coding from scratch, he heavily modified the classic *8-bit Generative Composer* by Paul Hayes.
* **2019-01-13:** **Official announcement and launch** of the repository fork.
* **2019-01-14:** Added a **Sample Rate Selector** that saves values directly into the URL `window.location.hash` for easy link sharing.
* **2019-01-14:** Introduced initial **library categories** (`[Classic 8k]`, `[JS 8k]`, `[High rate]`, and personal songs under `[SthephanShi]`).
* **2019-01-14:** Implemented a **song rating system** using white and yellow stars.
* **2019-01-23:** Moved song storage into an isolated, static `.json` data library file.
* **2021-09-02:** **Engine optimization:** Disabled background scope rendering by default to prevent heavy JavaScript from freezing the browser. The scope now renders strictly during active playback.
* **2021-10-05:** Added a **Volume Control** slider.
* **2021-10-05:** **Scope interactivity:** Instant playback play/pause controls by clicking on the visualizer waveform.
* **2021-10-05:** **AJAX library optimization:** Massive songs are now hidden behind **"► Click to load pretty code"** links. They load from the server via AJAX on demand, improving initial page load times.
* **2021-10-05:** **Catalog restructuring:** Created a dedicated `[Big code]` section for songs exceeding 1 KB.
* **2021-10-05:** The **Tab key behavior** in the text editor was overridden to insert proper indentation instead of shifting browser focus.
* **2021-10-05:** Introduced **global mathematical aliases** (like `sin`, `cos`, `tan`, `abs`, and `int` shorthand for `Math.floor`) to match Greggman's player syntax and minimize character counts.
* **2021-10-07:** Added the **Time Counter (`t = ...`)** text block.
* **2021-10-16:** Deployed a brand-new **indigo UI Color Scheme** alongside a responsive mobile layout.
* **2021-10-16:** Started **SArpnt developer collaboration:** Backported fast, synchronous visual scope rendering to eliminate visual artifacts and phase shifts.
* **2021-10-16:** Added evaluation support and interface selectors for **Floatbeat Mode** (outputs -1.0 to 1.0) and **Signed Bytebeat Mode** (signed 8-bit outputs from -127 to 128).
* **2021-10-16:** Added **Stop** and **Clear** buttons for rapid playback control.
* **2021-10-16:** Added a toggle button to **expand the code editor** vertically to the full height of the display.
* **2021-10-25:** Migrated core architecture to **AudioWorklet**. Calculations are handled entirely to isolated background threads, blocking user-entered scripts from hijacking the page DOM or document window.
* **2021-10-25:** Replaced all interface buttons with clean, scalable **SVG vector icons**.
* **2021-11-22:** **Interactive Time Counter:** It became an input field. Clicking it pauses audio, and users can input custom ticks or use a reset button to jump back to 0. Added a toggle to switch the time metric between **real-time seconds** and raw `t` variable ticks.
* **2021-11-22:** Created a new scope display engine mode - **Waveform Mode**. It draws a continuous, connected signal line instead of loose individual pixels of Point mode.
* **2021-11-22:** Active zoom and display configurations are now saved across sessions via **browser localStorage**.
* **2021-11-22:** Created the **`[Floatbeat]` library category** to group dedicated Floatbeat songs.
* **2022-01-12:** Cleaned up the `[Classic]` playlist category, limiting it strictly to pure, C-compatible code that successfully compiles without errors.
* **2022-01-12:** Placed dedicated **Orig** (original source) and **Min** (minified code) toggles next to library songs entries.
* **2022-04-12:** **Integrated CodeMirror Editor:** Added full JavaScript syntax highlighting, automatic bracket pairing, matching variable highlighting on double-click, full text search via `Ctrl+F` (with Regex), line numbers, and collapsible code blocks.
* **2022-04-12:** **Refactored error handling:** The debugging console now captures the exact line number and column index of syntax crashes, separating compilation syntax issues from runtime calculation faults.
* **2022-05-25:** Converted the **Sample Rate Selector into a fully editable text field**.
* **2022-05-25:** Added **Fast Play** acceleration button (click repeatedly to multiply speed up to 64x), a **Reverse Play** button, and a **Copy Link** button.
* **2022-05-25:** Integrated **semantic browser elements for keyboard navigation** (`Tab` / `Shift+Tab`).
* **2022-05-25:** Invalid calculations and overflow audio samples now draw in a **red warning color** on the scope.
* **2022-05-25:** Configured **mobile browsers** to utilize a performance-friendly, **half-width rendering canvas**.
* **2022-06-14:** Launched **Stereo Sound support:** Songs can now evaluate to a two-element array (`[left, right]`). The scope split its drawing colors to track stereo fields (Green for Left channel, Magenta for Right channel).
* **2022-06-14:** Added **Wide Mode** for displays 1440px or wider, stretching the editor to full height and moving the library to the right column.
* **2022-07-14:** **Combined play and fast-forward controls** into a single button interface, allowing speed boosts up to 64x.
* **2023-02-13:** Added a **Live Code Size Indicator** (counting total characters) on the main control panel.
* **2023-07-06:** Added a **Theme Personalizer Menu** with custom UI styling options (`Blue`, `Green`, `Purple`, `Teal`, `Orange`, `Cake`).
* **2023-07-16:** Rolled out two visualizer engines: **Diagram Mode** (vertical pixel brightness is scaled proportionally to signal amplitude) and **Combined Mode** (overlays the Waveform graph line on top of the Diagram).
* **2023-07-16:** Added customizable **Hex Color Selection for the Diagram mode**.
* **2023-07-16:** Added a **Zoom Scale Indicator** between the `+` and `-` scope zoom buttons.
* **2023-07-18:** Added customizable **stereo color presets:** (Left: Green, Right: Magenta), (Left: Red, Right: Cyan), or (Left: Blue, Right: Yellow).
* **2023-07-18:** Added an interactive **Color Picker for the Timeline Cursor**.
* **2023-12-25:** **Instant Zoom Syncing:** Loading songs flagged with the `#drawing` tag automatically adjusts the visualizer scope zoom and graphics engine mode to preserve the author's intended art style.
* **2024-09-02:** Introduced custom **Syntax Highlighting Styles** (`Atom Dark`, `One Dark`, `SArpnt`).
* **2024-09-02:** **Advanced syntax checks:** Validated code brackets to glow yellow when properly closed or show red when left orphaned.
* **2024-11-12:** **SQL database migration:** Moved the songs library out of massive static `.json` files into a MySQL database setup. The front-end player still consumes automatically compiled `.json` generated by the server, but indexing and song tagging are handled entirely via SQL queries.
* **2024-11-12:** **Recursive Remix Browsing:** Clicking the `>` arrow button next to a song loads the parent metadata, source code, and remix nodes inside the active playlist view.
* **2024-11-12:** Built an **`[All]` libarary section**, where all songs are collected and sorted by authors.
* ** 2024-11-12:** Standardized code weight calculations to use **bytes instead of character counts**.
* **2024-11-12:** Added **Code execution buttons** (`min`, `orig`, `format`) directly above the song code previews. Each button shows the size of the corresponding code in bytes.
* **2024-11-12:** **Added tags** in the `[All]` section: `#c` for C compilation, `#stereo` for dual channels, `#drawing` for visuals.
* **2024-11-12:** Removed the separate `[SthephanShi]` playlist block, moving personal entries into the primary index database.
* **2025-09-16:** Added the `#console` tag to index songs that output graphics or debugging strings through the code editor's throw log.
* **2025-09-29:** Introduced the **Sample Rate Divisor input control**, skipping heavy math calculations to let lower-end devices or mobile phones run intensive songs.
* **2025-10-31:** **Abolished the star-based rating system:** Due to an influx of simple, minor code remixes, manual star ratings lost their objective value. Users are encouraged to explore the catalog independently.
* **2025-11-04:** Built a real-time **Computing Lag Indicator**. This tracks evaluation times inside the audio worklet thread and calculates the exact percentage slow-down, helping songs developers fix audio crackling or stuttering issues.
* **2025-11-05:** Launched categorized colored tag labels for the song catalog: `#stereo`, `#drawing`, `#c`, `#console`, `#slow` (high CPU demand), and `#sample` (utilizes encoded PCM raw audio arrays).
* **2025-12-01:** Deployed a **FFT Frequency Spectrum Display Mode**, with a logarithmic grid mapped in Hertz (Hz) and Decibels (dB) to analyze sound output scientifically.
* **2025-12-23:** Introduced a package of **Light Themes** (`Default Light`, `Blue Light`, `Green Light`) and 12 **Syntax Highlighting Styles**, including `Atom Dark/Light`, `Github Dark/Light`, `Github v2 Dark/Light`, `Monokai`, `One Dark/Light`, `Retro Green`, `VSCode Dark/Light`.
* **2025-12-23:** **Improvement for code higlighting:** it now separately detects function calls, bolds keywords, and italicizes comments or parameters.
* **2026-10-18:** Introduced **Library Filters** system. All old library sections are removed. Use filter buttons to filter songs by their size limits (`all`, `<256`, `<1k`, `big`), audio types (`all`, `Bytebeat`, `Signed Bytebeat`, `Floatbeat`, `Funcbeat`) or tags.
* **2026-10-18:** Added **Library Text Search**. Type in the search field to find songs by Name, Author or Description.
* **2026-10-18:** A buttons to **sort songs by author or by date** has also been added to the filters. The order of songs has also been changed, **new songs now appear at the top of the list**.
* **2026-10-18:** **Smooth list scrolling (Sliced Rendering):** When opening massive songs lists with thousands of items, the app now loads elements using `requestAnimationFrame`. This keeps scrolling fluid and eliminates interface lag.
* **2026-10-18:** **Fast-Click Protection:** Rapidly switching filters terminates older, running compilation threads based on unique ID tokens, resolving race conditions and preventing list mixing. This prevents code glitches and keeps the song list in the correct order.
* **2026-10-18:** **Compact Code Previews:** All song entries now contain short previews of the code. It's automatically cut off at 512 bytes or 8 lines so giant code blocks don't stretch or break the page.
* **2026-10-18:** **SSD Disk Protection:** During database exports, file contents are audited via hashes. Unchanged data blocks bypass write filters, reducing wear on server SSD modules.
* **2026-10-18:** **Security Hardening:** Secured all administrative panel actions with native SQL prepared statements (PDO) to block injection exploits, combined with rigid CSRF validation to stop cross-site scripting attacks.
* **2026-10-18:** Added the **`#port` tag** for songs ported to bytebeat from other platform formats.
* **2026-10-20** The state of the **selected filters is now saved**.
* **2026-10-20** **The library now loads automatically** when the page loads.
* **2026-10-20** **Scroll-up and scroll-down buttons** have been added.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
Extended sub-modules include specific intellectual property licenses attributed within their respective folder roots.
