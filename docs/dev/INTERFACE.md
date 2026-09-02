# Interface

## Main interface

### Titlebar

The titlebar is located at the top of the window and shows the current opened file path and the menu on Linux and Windows. On macOS we're using client-side decorations (CSD). On Linux and Windows there are two types of titlebar: a custom CSD and the native one.

### Sidebar

The sidebar is an optional feature of videodown that contains three panels and has a variable width. The first panel is a tree view of the opened root directory; it also hosts a collapsible _Opened Files_ subsection (toggle via the `openedFilesInSidebar` preference). The latter two panels are a folder searcher (find in files) that is powered by ripgrep and a table of contents of the currently opened document.

### Editor

The editor is the core element that hosts the realtime preview editor called Muya and consists of three parts. Tabs are located at the top and at the bottom the per-tab notification bar is located for events like file changed or deleted. The main part is the editor that is either provided by Muya or CodeMirror for the source-code editor. There are multiple overlays available like inline toolbar, emoji picker, quick insert or image tools.
