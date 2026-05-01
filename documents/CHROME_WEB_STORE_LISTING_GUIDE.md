# Chrome Web Store Listing Guide for Custom New Tab Dashboard

## Store Listing Form Fields

### Basic Information

#### **Extension Name**

```
Custom New Tab Dashboard & AI Search
```

#### **Summary** (132 characters max)

```
A premium, minimal dashboard for your new tab. Organize links, manage AI skills, and search multiple engines simultaneously.
```

#### **Description** (16,000 characters max)

```
Custom New Tab Dashboard is a high-performance, private start page that centralizes your digital workflow. Replace the generic new tab with a sleek, customizable interface designed for speed and productivity.

## Key Features

🚀 **Unified AI Search**
- Search multiple AI tools (ChatGPT, Claude, Gemini) and traditional engines simultaneously.
- Use Command/Cmd + Enter to open all selected tools in separate tabs instantly.
- Toggle between search engines with ease using a keyboard-first interface.

🧠 **AI Skills Management**
- Create and manage "AI Skills" — custom system prompts that provide context to your queries.
- Multi-select skills to combine context and prepend them automatically to your AI searches.
- Fine-grained control: skills are only injected into AI-capable tools, keeping standard searches clean.

🔗 **Visual Bookmark Grid**
- Organize your favorite links on a customizable grid.
- Drag-and-drop reordering with a snap-to-grid system for a perfect layout.
- Edit titles, URLs, and logos for a personalized visual experience.

⌨️ **Keyboard-Centric Navigation**
- Optimized for power users with full keyboard support (Tab, Arrows, Cmd+Enter).
- Section-based navigation ensures you can move between search, tools, and skills without a mouse.
- Quick-clear search button for a fresh start.

🔒 **Privacy & Data Control**
- All data is stored locally in your browser's bookmarks and localStorage.
- Your "AI Skills" and layout settings stay on your machine.
- No external trackers, no accounts required, and no data collection.

## How It Works

1. **New Tab Experience**: Every new tab opens your custom dashboard.
2. **Organize**: Enter "Edit Mode" to drag bookmarks or add new links and AI skills.
3. **Search**: Type your query, select your preferred engines/skills, and hit Enter.
4. **Skills**: Select one or more "Skills" (like "Code Expert" or "Creative Writer") to automatically enhance your AI prompts.

## Perfect For

- Developers and researchers who frequently switch between multiple AI models.
- Power users who want a clean, aesthetic, and functional start page.
- Anyone valuing privacy and local data ownership over cloud-synced extensions.
```

#### **Category**

```
Productivity
```

#### **Language**

```
English (United States)
```

### Store Listing Assets

#### **Icon** (128x128px)

Create and use: `extension/images/icon128.png`

#### **Screenshots** (1280x800px or 640x400px)

Suggested screenshots to create:

1. **Main Dashboard**: Show the sleek search bar, engines, and the bookmark grid.
2. **AI Skills Manager**: Show the side-by-side skill editor with prompt content.
3. **Multi-Select Search**: Demonstrate selecting multiple AI tools for a single query.

### Additional Information

#### **Website**

```
https://github.com/stopsopa/chrome-homepage
```

#### **Support URL**

```
https://github.com/stopsopa/chrome-homepage/issues
```

#### **Version**

```
0.1
```

### Privacy & Permissions

#### **Single Purpose Description**

```
A premium new tab dashboard that combines visual bookmark management with a unified AI search interface and local prompt management.
```

#### **Permission Justifications**

**bookmarks**
```
Required to store and retrieve your dashboard links and AI skills locally in a specialized folder, ensuring your data is always accessible and private.
```

**tabs**
```
Required to open multiple search engines simultaneously in new tabs when performing a multi-select search.
```

**scripting**
```
Used to enhance interactions with specific AI search tools for a seamless transition from the dashboard.
```

**host permissions** (`gemini.google.com`, `chatgpt.com`, `claude.ai`, `t3.chat`)
```
Required to facilitate a seamless search experience across these AI platforms. These permissions allow the extension to ensure that search queries and prepended "Skills" are correctly handled when opened via the unified dashboard interface. Access is strictly limited to these specific domains.
```

#### **Data Usage**

**What data does your extension collect?**

```
No user data is collected or transmitted. All configurations (links, skills, search history) are stored entirely within your browser's local storage and bookmarks.
```

**How is user data used?**

```
Not applicable - no user data is collected.
```

### Distribution

#### **Visibility**

```
Public
```

#### **Region Availability**

```
Available in all regions
```

### Pricing & Distribution

#### **Pricing**

```
Free
```

#### **Distribution Method**

```
Chrome Web Store only
```
