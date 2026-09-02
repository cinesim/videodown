# videodown

videodown is a cross-platform desktop Markdown editor built with Electron and Vue. It supports realtime WYSIWYG editing, CommonMark and GitHub Flavored Markdown, math, diagrams, multiple editing modes, and HTML/PDF export.

## Development

Requirements:

- Bun 1.3 or newer
- Node.js 20.19 or newer

Install dependencies and start the development build:

```bash
bun install
bun run dev
```

Useful checks:

```bash
bun run check
bun run test
```

Platform build commands are `bun run build:mac`, `bun run build:win`, and `bun run build:linux`. More detail is available in the [developer documentation](docs/dev/README.md).

## License

videodown is distributed under the [MIT License](LICENSE). Copyright and upstream attribution are preserved in [NOTICE](NOTICE), and bundled dependency licenses are listed in [Third-Party Notices](packages/desktop/build/THIRD-PARTY-LICENSES.txt).
