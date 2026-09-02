# Application Data Directory

The per-user application data directory is located in the following directory:

- `%APPDATA%\videodown` on Windows
- `$XDG_CONFIG_HOME/videodown` or `~/.config/videodown` on Linux
- `~/Library/Application Support/videodown` on macOS

When [portable mode](PORTABLE.md) is enabled, the directory location is either the `--user-data-dir` parameter or `videodown-user-data` directory.
