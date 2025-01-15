# IFC URL Viewer 🏗️

> Connect your BIM models to live data through simple URLs. Built with [That Open](https://thatopen.com/).

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.2.2-blue.svg" alt="TypeScript"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5.4.11-646CFF.svg" alt="Vite"></a>
  <a href="https://thatopen.com/"><img src="https://img.shields.io/badge/That%20Open-2.4.2-orange.svg" alt="That Open"></a>
</p>

## Why?

Traditional BIM viewers are disconnected from your data. This viewer lets you:

- **Link Any Element**: Connect BIM elements to live spreadsheet data using simple URLs
- **Real-time Updates**: Changes in your sheets instantly reflect in the viewer
- **No Backend Required**: Works entirely in the browser, just share URLs
- **Open Source**: Built on [That Open](https://thatopen.com/), fully customizable

## Quick Start

1. Load your IFC model (drag & drop or select)
2. Select any element
3. Add a Google Sheets URL in this format:

```
https://docs.google.com/spreadsheets/d/{sheet-id}/edit?range={cell}
```

> 💡 **Tip**: The easiest way to get the correct URL is to right-click any cell in Google Sheets and select "Get cell link"

## URL Structure

The viewer uses a simple URL format to connect elements to data:

```
spreadsheets/d/[SHEET_ID]/edit?range=[CELL]

Examples:
- .../d/1A2B3C4D5E6F7G8H9I0/edit?range=A1    # Single cell reference
```

## Development

```bash
# Install
npm install

# Development
npm run dev

# Build
npm run build
```

## Use Cases

- **Construction Progress**: Link elements to status updates in sheets
- **Cost Tracking**: Connect elements to real-time cost data
- **Asset Management**: Link maintenance schedules and status
- **Quality Control**: Track issues and resolutions
- **Collaboration**: Share models with live data connections

## License

MIT © [Louis Trümpler](https://github.com/louistrue)

---

<div align="center">
  Built with <a href="https://thatopen.com/">That Open</a> • Powered by the community
</div>
