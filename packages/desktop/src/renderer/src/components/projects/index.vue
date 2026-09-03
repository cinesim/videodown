<template>
  <div class="projects-home">
    <div class="projects-header">
      <h1 class="projects-title">{{ t('projects.title') }}</h1>
      <button type="button" class="new-project-button" @click="createProject">
        <span>{{ t('projects.new') }}</span>
        <span class="shortcut">{{ shortcutLabel }}</span>
      </button>
    </div>

    <div v-if="cards.length === 0" class="projects-empty">
      {{ t('projects.empty') }}
    </div>

    <div v-else class="projects-grid">
      <div
        v-for="card of cards"
        :key="card.pathname"
        class="project-card"
        :data-pathname="card.pathname"
        role="button"
        tabindex="0"
        @click="openProject(card.pathname)"
        @keydown.enter.prevent="openProject(card.pathname)"
        @keydown.space.prevent="openProject(card.pathname)"
      >
        <div class="project-card-preview">
          <el-icon :size="32">
            <Folder />
          </el-icon>
        </div>
        <div class="project-card-footer">
          <div class="project-card-name">{{ card.name }}</div>
          <div class="project-card-meta">
            {{ t('projects.lastModified', { time: formatModified(card.mtimeMs) }) }}
          </div>
          <button
            type="button"
            class="project-card-delete"
            :title="t('projects.deleteTitle')"
            @click.stop="askDelete(card)"
          >
            <el-icon :size="16">
              <Delete />
            </el-icon>
          </button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showDelete"
      :title="t('projects.deleteTitle')"
      width="420px"
      custom-class="ag-dialog-table"
      append-to-body
    >
      <p class="delete-message">
        {{ t('projects.deleteMessage', { name: pendingDelete?.name ?? '' }) }}
      </p>
      <template #footer>
        <el-button @click="showDelete = false">{{ t('projects.deleteCancel') }}</el-button>
        <el-button type="danger" @click="confirmDelete">
          {{ t('projects.deleteConfirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Delete, Folder } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '@/store/preferences'
import { isOsx } from '@/util'
import { acceleratorToTokens } from '@/util/accelerator'
import { relativeTime } from '@/util/relativeTime'
import notice from '@/services/notification'
import type { ProjectEntry } from 'common/projects'

interface ProjectCard {
  pathname: string
  name: string
  mtimeMs: number
}

const { t } = useI18n()
const preferencesStore = usePreferencesStore()
const { projects } = storeToRefs(preferencesStore)

const cards = ref<ProjectCard[]>([])
const showDelete = ref(false)
const pendingDelete = ref<ProjectCard | null>(null)

const shortcutLabel = computed(() => {
  const accelerator = isOsx ? 'Command+N' : 'Ctrl+N'
  return acceleratorToTokens(accelerator, isOsx).join(isOsx ? '' : '+')
})

const cardName = (pathname: string): string => {
  return window.path.basename(pathname) || pathname
}

const formatModified = (mtimeMs: number): string => {
  const { n, unit } = relativeTime(mtimeMs)
  return t(`projects.relative.${unit}`, { n })
}

const refreshCards = async (): Promise<void> => {
  const entries: ProjectEntry[] = Array.isArray(projects.value) ? projects.value : []
  const next: ProjectCard[] = []
  const missing: string[] = []

  for (const entry of entries) {
    const exists = await window.fileUtils.pathExists(entry.pathname)
    if (!exists) {
      missing.push(entry.pathname)
      continue
    }
    const isDir = await window.fileUtils.isDirectory(entry.pathname)
    if (!isDir) {
      missing.push(entry.pathname)
      continue
    }
    let mtimeMs = entry.lastOpenedAt
    try {
      const stat = await window.fileUtils.stat(entry.pathname)
      mtimeMs = stat.mtimeMs
    } catch {
      // Keep lastOpenedAt when stat fails (folder still exists).
    }
    next.push({
      pathname: entry.pathname,
      name: cardName(entry.pathname),
      mtimeMs
    })
  }

  cards.value = next
  for (const pathname of missing) {
    window.electron.ipcRenderer.send('mt::forget-project', pathname)
  }
}

const createProject = (): void => {
  window.electron.ipcRenderer.send('mt::cmd-new-project')
}

const openProject = (pathname: string): void => {
  window.electron.ipcRenderer.send('mt::open-project', pathname)
}

const askDelete = (card: ProjectCard): void => {
  pendingDelete.value = card
  showDelete.value = true
}

const confirmDelete = async (): Promise<void> => {
  const card = pendingDelete.value
  showDelete.value = false
  pendingDelete.value = null
  if (!card) return
  try {
    await window.electron.ipcRenderer.invoke('mt::fs-trash-item', card.pathname)
  } catch (err) {
    notice.notify({
      title: t('projects.deleteTitle'),
      type: 'error',
      message: err instanceof Error ? err.message : String(err)
    })
    return
  }
  window.electron.ipcRenderer.send('mt::forget-project', card.pathname)
  cards.value = cards.value.filter((item) => item.pathname !== card.pathname)
}

watch(projects, () => {
  refreshCards()
})

onMounted(() => {
  refreshCards()
})
</script>

<style scoped>
.projects-home {
  flex: 1;
  min-height: 0;
  background: var(--editorBgColor);
  color: var(--editorColor);
  overflow: auto;
  padding: 28px 32px 48px;
}

.projects-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.projects-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.new-project-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  cursor: pointer;
  background: var(--buttonPrimaryBgColor);
  color: var(--buttonPrimaryFontColor);
  font-size: 13px;
  font-weight: 600;
}

.new-project-button:hover {
  background: var(--buttonPrimaryBgColorHover);
  color: var(--buttonPrimaryFontColorHover);
}

.new-project-button .shortcut {
  opacity: 0.72;
  font-weight: 500;
  font-size: 12px;
}

.projects-empty {
  margin-top: 80px;
  text-align: center;
  color: var(--editorColor50);
  font-size: 15px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.project-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  background: var(--itemBgColor);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.project-card:hover,
.project-card:focus-visible {
  border-color: var(--editorColor30);
  transform: translateY(-1px);
}

.project-card-preview {
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sideBarBgColor);
  color: var(--iconColor);
}

.project-card-footer {
  position: relative;
  background: #111;
  color: #fff;
  padding: 12px 14px 14px;
  min-height: 58px;
  box-sizing: border-box;
}

.project-card-name {
  font-size: 13px;
  font-weight: 600;
  padding-right: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-card-meta {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.project-card-delete {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  opacity: 0;
  color: #e44f4f;
  cursor: pointer;
}

.project-card:hover .project-card-delete,
.project-card-delete:focus {
  opacity: 1;
}

.delete-message {
  margin: 0;
  color: var(--editorColor);
  line-height: 1.5;
}
</style>
