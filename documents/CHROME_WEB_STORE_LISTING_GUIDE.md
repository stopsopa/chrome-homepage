# Chrome Web Store Listing Guide for Custom New Tab Dashboard

## Store Listing Form Fields

### Basic Information

#### **Extension Name**

```
Custom New Tab Dashboard
```

#### **Summary** (132 characters max)

```
Private new tab page with custom visual links, daily wallpapers, and zero tracking. Stored purely in your native Chrome bookmarks.
```

#### **Description** (16,000 characters max)

```
Custom New Tab Management replaces your default new tab with a fast, clean, and private dashboard tailored to your workflow.

See how to use: https://youtu.be/1M98DR0YXp8

## Key Features

🔗 **Custom Visual Bookmarks**
- Add and arrange your favorite websites on an open visual grid.
- Set custom icons using any direct image link (http:// or https://), base64 data:image/... URIs, or a built-in default icon.
- Built-in helper directory for quick icon discovery across popular repositories.
- Drag-and-drop reordering with a snap-to-grid system for a neat layout.

🖼️ **Daily Rotating Wallpapers**
- Enjoy a fresh, high-resolution background every calendar day.
- On-demand reload button to fetch and rotate a new background anytime.
- Built-in controls to adjust brightness, saturation, and contrast.
- Optional subtle ambient wallpaper zoom animation with adjustable speed.
- Smart offline caching using IndexedDB to keep page loads instant.

🔒 **Powered 100% by Chrome Bookmarks**
- All bookmark links, icons, and layout coordinates are stored directly inside your browser's native bookmarks bar.
- Synced automatically across your devices via your Google Chrome profile with zero proprietary lock-in.
- Wallpaper preferences and visual filter settings stay strictly on your local machine.

🛡️ **Absolute Privacy — Zero Telemetry**
- No analytics, no telemetry, no third-party tracking, and no external databases.
- No account or login required — everything runs strictly on your device.

## How It Works

1. **New Tab Experience**: Every new tab opens your custom dashboard.
2. **Organize**: Enter "Edit Mode" to drag bookmarks, adjust positions, edit details, or add new links.
3. **Customize Wallpaper**: Open the settings panel to tune visual filters and animation settings to your liking.

## Perfect For

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

1. **Main Dashboard**: Show the clean bookmark grid over a scenic dynamic wallpaper background.
2. **Edit Mode**: Show bookmark organization, drag-and-drop positioning, and the add/edit bookmark modal.
3. **Wallpaper Settings**: Show the wallpaper adjustment panel with brightness, contrast, saturation, and animation controls.

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
0.2
```

### Privacy & Permissions

#### **Single Purpose Description**

```
A clean, private new tab dashboard for organizing bookmarks on a visual grid with customizable daily dynamic wallpapers.
```

#### **Permission Justifications**

**bookmarks**

```
Required to store and retrieve your dashboard links locally in a dedicated bookmark folder, ensuring your data remains private and synchronized with your browser bookmarks.
```

**host permissions** (`https://picsum.photos/*`, `https://fastly.picsum.photos/*`)

```
Required to fetch dynamic daily wallpaper images for the dashboard background.
```

#### **Data Usage**

**What data does your extension collect?**

```
No user data is collected or transmitted. All configurations (links, layout, and wallpaper settings) are stored entirely within your browser's local storage, IndexedDB, and bookmarks.
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

