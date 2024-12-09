<template>
  <el-dialog 
    v-model="state.dialog" 
    title="Mikan 订阅" 
    fullscreen 
    destroy-on-close 
    :close-on-click-modal="false"
    class="mikan-dialog"
  >
    <div class="mikan-container">
      <Search 
        ref="searchRef"
        :loading="state.loading"
        v-model="state.text"
        @search="handlers.search"
        @clear="handlers.clearSearch"
        @filter="handlers.handleFilter"
        @season-change="handlers.handleSeasonChange"
      />
      <AnimeList
        :items="state.data.items"
        :loading="state.loading"
        @select="handlers.loadGroupInfo"
        class="anime-list-container"
      />
    </div>
  </el-dialog>

  <GroupDrawer
    v-model="state.drawer"
    :title="state.selectedAnime?.title"
    :groups="state.currentGroups"
    :loading="state.loadingStates.subscribe"
    :size="drawerSize"
    @subscribe="handlers.handleSubscribe"
  />

  <Ani_mikan2 
    v-if="state.showAni"
    :ani="addAni"
    @ok="handlers.handleAniOk"
    @close="state.showAni = false"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import api from "../api.js"
import { ElMessage } from 'element-plus'
import Ani_mikan2 from './Ani_mikan2.vue'
import Search from './components/Search.vue'
import AnimeList from './components/AnimeList.vue'
import GroupDrawer from './components/GroupDrawer.vue'

// 添加初始状态常量
const INITIAL_STATE = {
  dialog: false,
  loading: false,
  drawer: false,
  showAni: false,
  text: '',
  data: {
    seasons: [],
    items: []
  },
  selectedAnime: null,
  currentGroups: null,
  loadingStates: {
    search: false,
    refresh: false,
    subscribe: false,
    group: false
  }
}

// 使用常量初始化状态
const state = ref({...INITIAL_STATE})

// 添加初始订阅数据常量
const INITIAL_ANI_STATE = {
  url: '',
  match: [],
  showDownlaod: false,
  title: '',
  group: '',
  season: 1,
  offset: 0,
  exclude: [],
  enable: true,
  ova: false,
  totalEpisodeNumber: 0,
  customDownloadPath: false,
  downloadPath: '',
  year: 1970,
  month: 1,
  day: 1,
  week: 1,
  subgroup: '',
  backRssList: [],
  bgmUrl: '',
  customEpisode: false,
  customEpisodeStr: '',
  customEpisodeGroupIndex: 0,
  themoviedbName: '',
  globalExclude: false,
  omit: false,
  downloadNew: false,
  notDownload: []
}

// 使用常量初始化
const addAni = ref({...INITIAL_ANI_STATE})

// API调用
const apiCalls = {
  // 获取列表
  async getList(body = {}, searchText = '') {
    state.value.loading = true
    try {
      const res = await api.post('api/mikan?text=' + searchText, body)
      state.value.data = res.data
    } finally {
      state.value.loading = false
    }
  },

  // 获取字幕组信息
  async getGroupInfo(anime) {
    if (!anime.url) return

    state.value.loadingStates.group = true
    try {
      const res = await api.get('api/mikan/group?url=' + anime.url)
      state.value.currentGroups = res.data
    } catch (error) {
      ElMessage.error('加载字幕组信息失败')
    } finally {
      state.value.loadingStates.group = false
    }
  },

  // 获取RSS信息
  async getRssInfo(basicInfo) {
    try {
      const res = await api.post('api/rss', basicInfo)
      return res.data
    } catch (error) {
      ElMessage.error('获取订阅信息失败')
      throw error
    }
  },

  // 添加订阅
  async addSubscription(data) {
    try {
      await api.post('api/ani', data)
      ElMessage.success('订阅成功')
    } catch (error) {
      ElMessage.error('订阅失败')
      throw error
    }
  }
}

// 事件处理
const handlers = {
  // 显示对话框
  show(name) {
    resetState()
    state.value.dialog = true
    if (name?.length > 2) {
      state.value.text = name
      handlers.search()
    } else {
      list()
    }
  },

  // 搜索
  search() {
    state.value.loadingStates.search = true
    apiCalls.getList({}, state.value.text).finally(() => {
      state.value.loadingStates.search = false
    })
  },

  // 清除搜索
  clearSearch() {
    state.value.text = ''
    list()
  },

  // 加载字幕组信息
  async loadGroupInfo(anime) {
    state.value.selectedAnime = anime
    state.value.drawer = true
    await apiCalls.getGroupInfo(anime)
  },

  // 处理订阅
  async handleSubscribe(group) {
    if (!state.value.selectedAnime || !group) return

    state.value.loadingStates.subscribe = true
    try {
      // 构造基本数据
      const basicInfo = {
        url: group.rss,
        match: [],
        title: state.value.selectedAnime.title,
        group: group.label,
        subgroup: group.label
      }

      // 获取完整信息
      const fullInfo = await apiCalls.getRssInfo(basicInfo)
      addAni.value = {
        ...fullInfo,
        match: basicInfo.match,
        showDownlaod: false
      }

      // 显示设置界面
      state.value.showAni = true
      state.value.drawer = false
      state.value.dialog = false
    } catch (error) {
      console.error(error)
    } finally {
      state.value.loadingStates.subscribe = false
    }
  },

  // 确认订阅
  async handleAniOk(callback) {
    state.value.loadingStates.subscribe = true
    try {
      await apiCalls.addSubscription(addAni.value)
      await emit('load')
      state.value.showAni = false
      state.value.drawer = false
      state.value.dialog = false
      resetState()
      if (callback) await callback()
    } finally {
      state.value.loadingStates.subscribe = false
    }
  },

  // 添加过滤器处理方法
  handleFilter({ day, type }) {
    // 如果没有数据，直接返回
    if (!state.value.data.items?.length) return

    // 过滤数据
    if (day) {
      // 滚动到对应的星期区域
      const element = document.querySelector(`[data-day="${day}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    if (type) {
      // 滚动到对应的类型区域
      const element = document.querySelector(`[data-type="${type}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  },

  // 添加处理季节变化的方法
  async handleSeasonChange(season) {
    if (!season) return
    await list(season, state.value.text)
  },
}

// 重置状态
const resetState = () => {
  Object.assign(state.value, {...INITIAL_STATE})
  addAni.value = {...INITIAL_ANI_STATE}
}

// 修改 list 方法
const list = async (params = {}, searchText = '') => {
  state.value.loading = true
  try {
    const res = await api.post('api/mikan', { 
      ...params,
      text: searchText 
    })
    
    if (res.data) {
      state.value.data = res.data
      // 更新季度选择器的选项
      if (res.data.seasons?.length) {
        searchRef.value?.updateSeasons(res.data.seasons)
      }
    }
  } catch (error) {
    console.error('获取列表失败:', error)
    ElMessage.error('获取列表失败')
    state.value.data = { seasons: [], items: [] }
  } finally {
    state.value.loading = false
  }
}

// 导出
defineExpose({show: handlers.show})
const emit = defineEmits(['add', 'load'])

// 添加计算属性
const BREAKPOINTS = {
  mobile: 768,
  tablet: 992,
  desktop: 1200
}

const drawerSize = computed(() => {
  return window.innerWidth <= BREAKPOINTS.mobile ? '100%' : '800px'
})

// 添加 ref 以访问 Search 组件的方法
const searchRef = ref()
</script>

<style scoped>
.mikan-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 16px;
  position: relative;
  overflow-y: auto;
}

.anime-list-container {
  flex: 1;
  margin-top: 8px;
  overflow: auto;
}

/* Dialog 相关样式调整 */
:deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  max-height: 100%;
  height: 100%;
}

:deep(.el-dialog__body) {
  flex: 1;
  overflow: hidden;
  padding: 0;
  position: relative;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-dialog__headerbtn) {
  top: 16px;
}
</style>
  