<template>
  <Ani_mikan2 ref="aniRef" :ani="addAni" @ok="handlers.handleAniOk" @close="state.showAni = false" v-if="state.showAni"/>

  <el-dialog v-model="state.dialog" title="Mikan 订阅" fullscreen destroy-on-close :close-on-click-modal="false">
    <el-container>
      <el-header>
        <el-row :gutter="16" justify="center" align="middle">
          <el-col :span="16">
            <el-input
                v-model="state.text"
                placeholder="请输入搜索标题"
                @keyup="debounceSearch"
                clearable
                @clear="handlers.clearSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #append>
                <el-button @click="handlers.search" :loading="state.loadingStates.search" type="primary">
                  搜索
                </el-button>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select
                v-model="state.season"
                @change="handlers.change"
                :disabled="state.loading"
                placeholder="选择季度"
            >
              <el-option
                  v-for="item in state.data.seasons"
                  :key="item.year + ' ' + item.season"
                  :label="item.year + ' ' + item.season"
                  :value="item.year + ' ' + item.season"
              />
            </el-select>
          </el-col>
        </el-row>
      </el-header>

      <el-main v-loading="state.loading">
        <el-scrollbar>
          <el-space direction="vertical" :size="24" style="width: 100%">
            <template v-if="state.data.items.length">
              <div v-for="item in state.data.items" :key="item.label">
                <el-divider content-position="left">
                  <h3>{{ item.label }}</h3>
                </el-divider>

                <el-row :gutter="24">
                  <el-col
                      v-for="it in item.items"
                      :key="it.url"
                      :xs="12"
                      :sm="8"
                      :md="6"
                      :lg="4"
                      :xl="4"
                      class="mb-4"
                  >
                    <el-card shadow="hover" class="anime-card" :body-style="{ padding: '10px' }">
                      <el-image
                          :src="utils.img(it)"
                          fit="cover"
                          style="height: 260px; width: 100%"
                          class="anime-cover"
                          @click="utils.open(it.url)"
                      >
                        <template #placeholder>
                          <div class="el-image__placeholder">
                            <el-icon><Picture /></el-icon>
                          </div>
                        </template>
                      </el-image>

                      <div class="mt-2">
                        <el-tooltip :content="it.title" placement="top">
                          <el-text
                              class="text-truncate mb-2 d-block anime-title"
                              style="height: 40px"
                          >
                            {{ it.title }}
                          </el-text>
                        </el-tooltip>

                        <div class="d-flex justify-content-between align-items-center anime-actions">
                          <el-button
                              :type="it.exists ? 'success' : 'primary'"
                              size="small"
                              :loading="state.loadingStates.group"
                              @click="handlers.loadGroupInfo(it)"
                              :disabled="it.exists"
                          >
                            {{ it.exists ? '已订阅' : '订阅' }}
                          </el-button>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </template>
            <el-empty v-else description="暂无数据" />
          </el-space>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-dialog>

  <el-drawer
      v-model="state.drawer"
      :title="state.selectedAnime?.title || ''"
      :size="drawerSize"
      direction="rtl"
      :close-on-click-modal="false"
  >
    <div class="group-list">
      <template v-if="state.currentGroups?.length">
        <div v-for="group in state.currentGroups" :key="group.label">
          <div class="group-item">
            <div class="group-header">
              <div class="group-info">
                <div class="group-title">{{ group.label }}</div>
                <el-text type="info" size="small">{{ group.updateDay }}</el-text>
              </div>
              <el-button
                  type="primary"
                  :loading="state.loadingStates.subscribe"
                  @click="handlers.handleSubscribe(group)"
                  size="small"
              >
                订阅
              </el-button>
            </div>

            <div v-if="group.tags.length" class="group-tags">
              <el-space wrap>
                <el-tag
                    v-for="tag in group.tags"
                    :key="tag"
                    size="small"
                >
                  {{ tag }}
                </el-tag>
              </el-space>
            </div>

            <div v-if="group.items.length" class="group-episodes">
              <el-collapse>
                <el-collapse-item>
                  <template #title>
                    <el-text>最近更新 ({{ group.items.length }})</el-text>
                  </template>
                  <el-table
                      :data="group.items"
                      size="small"
                      style="width: 100%"
                  >
                    <el-table-column
                        v-for="col in TABLE_COLUMNS"
                        :key="col.prop || 'name'"
                        v-bind="col"
                    >
                      <template #default="{ row }" v-if="col.slot">
                        <el-link
                            type="primary"
                            :href="row.magnet"
                            target="_blank"
                            :underline="false"
                        >
                          {{ row.name }}
                        </el-link>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </template>
      <el-empty v-else description="暂无字幕组信息" />
    </div>
  </el-drawer>
</template>




<script setup>
import {ref, computed, onUnmounted} from 'vue'
import {Search, Picture} from '@element-plus/icons-vue'
import api from "../api.js"
import {ElMessage} from 'element-plus'
import Ani_mikan2 from './Ani_mikan2.vue'

// 添加初始状态常量
const INITIAL_STATE = {
  dialog: false,
  loading: false,
  drawer: false,
  showAni: false,
  text: '',
  season: '',
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
      list({}).then(() => {
        const defaultSeason = state.value.data.seasons?.find(s => s.select)
        if (defaultSeason) {
          state.value.season = defaultSeason.year + ' ' + defaultSeason.season
        }
      })
    }
  },

  // 搜索
  search() {
    if (state.value.text.length === 1) {
      ElMessage.error("搜索最少需要两个字符")
      return
    }
    state.value.loadingStates.search = true
    list({}, state.value.text).finally(() => {
      state.value.loadingStates.search = false
    })
  },

  // 季度切换
  change(v) {
    if (!v) return

    // 直接使用选中的季度数据
    for (let item of state.value.data.seasons) {
      if (item.year + ' ' + item.season === v) {
        list(item)
        return
      }
    }
  },

  // 清除搜索
  clearSearch() {
    state.value.text = ''
    // 如果当前有选中的季度，使用季度数据
    if (state.value.season) {
      handlers.change(state.value.season)
    } else {
      list()
    }
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
  }
}

// 工具函数
const utils = {
  img: (it) => `api/file?img=${btoa(it.cover)}&s=${window.authorization}`,
  open: (url) => window.open(url)
}

// 重置状态
const resetState = () => {
  Object.assign(state.value, {...INITIAL_STATE})
  addAni.value = {...INITIAL_ANI_STATE}
}

// 修改list方法
const list = async (body = {}, searchText = '') => {
  state.value.loading = true
  try {
    const res = await api.post('api/mikan?text=' + searchText, body)
    if (res.data) {
      state.value.data = res.data
    }
  } catch (error) {
    console.error('获取列表失败:', error)
    ElMessage.error('获取列表失败')
    state.value.data = { seasons: [], items: [] }
  } finally {
    state.value.loading = false
  }
}

// 解构需要的方法
const { handleSubscribe } = handlers

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

// 添加防抖函数
let searchTimer = null

const debounceSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handlers.search()
  }, 300)
}

// 清理定时器
onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})

const TABLE_COLUMNS = [
  {
    label: '文件名',
    minWidth: 380,
    slot: true
  },
  {
    prop: 'sizeStr',
    label: '大小',
    width: 120,
    align: 'right'
  },
  {
    prop: 'dateStr',
    label: '时间',
    width: 180,
    align: 'right'
  }
]

const handleError = (error, message = '操作失败') => {
  console.error(error)
  ElMessage.error(message)
}
</script>

<style scoped>
.group-item {
  padding: 16px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-info {
  flex: 1;
}

.group-title {
  font-size: 16px;
  font-weight: 500;
}

.group-tags {
  margin-top: 12px;
}

.group-episodes {
  margin-top: 16px;
}

/* 调整一些布局、间距等 */
@media screen and (max-width: 768px) {
  .group-item {
    padding: 12px;
    margin-bottom: 12px;
  }

  .group-header {
    gap: 12px;
  }

  .group-title {
    font-size: 14px;
  }

  .el-table .cell {
    padding: 8px;
  }
}
</style>
