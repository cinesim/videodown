// Per-window flag for the projects home page. Cmd/Ctrl+N creates a project
// when this is set, instead of opening a new window.
const showingHomeByWindowId = new Map<number, boolean>()

export const setShowingHome = (windowId: number, showing: boolean): void => {
  if (showing) {
    showingHomeByWindowId.set(windowId, true)
    return
  }
  showingHomeByWindowId.delete(windowId)
}

export const isShowingHome = (windowId: number): boolean => {
  return showingHomeByWindowId.get(windowId) === true
}
