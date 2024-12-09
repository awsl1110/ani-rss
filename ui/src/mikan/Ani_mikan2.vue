<template>
  <el-dialog
      v-model="visible"
      title="订阅设置"
      width="800px"
      :close-on-click-modal="false"
      :show-close="true"
      @close="handleClose"
      class="ani-dialog"
      :fullscreen="true"
      destroy-on-close
  >
    <el-container>
      <Items ref="items" :ani="ani"/>
      <BackRss ref="backRss" :ani="ani"/>
      <Mikan ref="mikanRef" @add="args => {
        ani.subgroup = args.group
        ani.match = args.match
        ani.url = args.url
      }"/>
      
      <el-main class="form-main">
        <el-scrollbar ref="scrollbar">
          <el-form 
            label-width="auto" 
            @submit.prevent
            size="default"
            class="form-content"
            :style="{ '--el-form-item-margin-bottom': '16px' }"
            :label-position="'right'"
            :label-suffix="':'"
          >
            <el-row :gutter="16">
              <el-col :span="12">
                <!-- 基本信息 -->
                <el-card class="mb-4" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <el-icon class="mr-2"><Document /></el-icon>
                      <span>基本信息</span>
                    </div>
                  </template>
                  <el-form-item label="标题">
                    <div class="form-item-content">
                      <el-input v-model:model-value="ani.title"/>
                      <div class="form-item-action">
                        <el-button 
                          @click="ani.title = ani.themoviedbName"
                          icon="DocumentAdd"
                          :disabled="ani.title === ani.themoviedbName || !ani.themoviedbName.length" 
                          text
                        >使用TMDB</el-button>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="TMDB">
                    <div class="flex items-center gap-2">
                      <el-input v-model:model-value="ani.themoviedbName" disabled/>
                      <el-button icon="Refresh" text @click="getThemoviedbName" :loading="getThemoviedbNameLoading"/>
                    </div>
                  </el-form-item>
                  <el-form-item label="BgmUrl">
                    <el-input v-model:model-value="ani.bgmUrl" placeholder="https://xxx.xxx"/>
                  </el-form-item>
                </el-card>

                <!-- RSS设置 -->
                <el-card class="mb-4" shadow="hover">
                  <template #header>
                    <div class="flex items-center">
                      <el-icon class="mr-2"><Link /></el-icon>
                      <span>RSS设置</span>
                    </div>
                  </template>
                  <el-form-item label="字幕组">
                    <el-input v-model:model-value="ani.subgroup" disabled/>
                  </el-form-item>
                  <el-form-item label="RSS">
                    <div class="flex justify-between gap-2">
                      <el-input v-model:model-value="ani.subgroup" style="width: 140px" placeholder="字幕组" disabled/>
                      <el-input v-model:model-value="ani.url" placeholder="https://xxx.xxx" disabled/>
                      <el-button text @click="mikanRef?.show(ani.title)" icon="VideoCamera"/>
                    </div>
                  </el-form-item>
                  <el-form-item label="备用RSS">
                    <div class="text-right">
                      <el-button text @click="backRss?.show" icon="EditPen">管理</el-button>
                    </div>
                  </el-form-item>
                </el-card>

                <!-- 时间设置 -->
                <el-card class="mb-4" shadow="hover">
                  <template #header>
                    <div class="flex items-center">
                      <el-icon class="mr-2"><Calendar /></el-icon>
                      <span>时间设置</span>
                    </div>
                  </template>
                  <el-form-item label="日期">
                    <div class="text-right">
                      <el-date-picker
                          style="max-width: 150px;"
                          v-model="date"
                          @change="dateChange"
                      />
                    </div>
                  </el-form-item>
                  <el-form-item label="季">
                    <div class="text-right">
                      <el-input-number 
                        style="max-width: 200px" 
                        :min="0" 
                        v-model:model-value="ani.season"
                        :disabled="ani.ova"
                      />
                    </div>
                  </el-form-item>
                </el-card>
              </el-col>

              <!-- 右侧栏 -->
              <el-col :span="12" class="form-col">
                <!-- 集数设置 -->
                <el-card class="mb-4" shadow="hover">
                  <template #header>
                    <div class="flex items-center">
                      <el-icon class="mr-2"><List /></el-icon>
                      <span>集数设置</span>
                    </div>
                  </template>
                  <el-form-item label="集数偏移">
                    <div class="flex justify-end">
                      <el-input-number 
                        v-model:model-value="ani.offset" 
                        :disabled="ani.ova"
                        controls-position="right"
                        class="w-32"
                      />
                    </div>
                  </el-form-item>
                  <el-form-item label="总集数">
                    <div class="flex justify-end">
                      <el-input-number 
                        v-model:model-value="ani.totalEpisodeNumber"
                        controls-position="right"
                        class="w-32"
                      />
                    </div>
                  </el-form-item>
                  <el-form-item label="自定义集数规则">
                    <div class="flex flex-col gap-2">
                      <el-switch v-model:model-value="ani.customEpisode"/>
                      <div class="flex items-center gap-2" v-if="ani.customEpisode">
                        <el-input v-model:model-value="ani.customEpisodeStr"/>
                        <el-input-number 
                          v-model:model-value="ani.customEpisodeGroupIndex"
                          controls-position="right"
                          class="w-24"
                        />
                      </div>
                    </div>
                  </el-form-item>
                </el-card>

                <!-- 过滤设置 -->
                <el-card class="mb-4" shadow="hover">
                  <template #header>
                    <div class="flex items-center">
                      <el-icon class="mr-2"><Filter /></el-icon>
                      <span>过滤设置</span>
                    </div>
                  </template>
                  <el-form-item label="匹配">
                    <Exclude
                        ref="match"
                        :exclude="ani.match"
                        @update:exclude="val => ani.match = val"
                        :import-exclude="false"
                    />
                  </el-form-item>
                  <el-form-item label="排除">
                    <Exclude
                        ref="exclude"
                        :exclude="ani.exclude"
                        @update:exclude="val => ani.exclude = val"
                        :import-exclude="true"
                    />
                  </el-form-item>
                  <el-form-item label="全局排除">
                    <el-switch v-model:model-value="ani.globalExclude"/>
                  </el-form-item>
                </el-card>

                <!-- 下载设置 -->
                <el-card class="mb-4" shadow="hover">
                  <template #header>
                    <div class="flex items-center">
                      <el-icon class="mr-2"><Download /></el-icon>
                      <span>下载设置</span>
                    </div>
                  </template>
                  <el-form-item label="自定义下载">
                    <el-switch v-model:model-value="ani.customDownloadPath"/>
                    <div v-if="ani.customDownloadPath" class="mt-2">
                      <el-input
                          type="textarea"
                          :autosize="{ minRows: 2}"
                          v-model:model-value="ani.downloadPath"
                      />
                      <div class="mt-2 flex justify-between gap-2">
                        <el-button 
                          :loading="downloadPathLoading" 
                          text
                          icon="Refresh"
                          @click="downloadPath"
                        >刷新</el-button>
                        <el-text class="mx-1" size="small">
                          最终下载位置以 <strong>预览</strong> 为准
                        </el-text>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="遗漏检测">
                    <el-switch v-model:model-value="ani.omit"/>
                  </el-form-item>
                  <el-form-item label="只下载最新集">
                    <el-switch v-model:model-value="ani.downloadNew"/>
                  </el-form-item>
                </el-card>

                <!-- 其他设置 -->
                <el-card class="mb-4" shadow="hover">
                  <template #header>
                    <div class="flex items-center">
                      <el-icon class="mr-2"><Setting /></el-icon>
                      <span>其他设置</span>
                    </div>
                  </template>
                  <el-form-item label="剧场版">
                    <el-switch v-model:model-value="ani.ova"/>
                  </el-form-item>
                  <el-form-item label="启用">
                    <el-switch v-model:model-value="ani.enable"/>
                  </el-form-item>
                </el-card>
              </el-col>
            </el-row>
          </el-form>
        </el-scrollbar>
      </el-main>
    </el-container>

    <template #footer>
      <div class="flex justify-between">
        <div>
          <popconfirm title="立即刷新订阅?" @confirm="download" v-if="ani.showDownlaod">
            <template #reference>
              <el-button text :loading="downloadLoading" icon="Refresh">刷新</el-button>
            </template>
          </popconfirm>
        </div>
        <div>
          <el-button @click="items.show()" text icon="Grid">预览</el-button>
          <el-button icon="Check" type="primary" :loading="okLoading" @click="handleOk" text>确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Link, Calendar, List, Filter, Download, Setting } from '@element-plus/icons-vue'
import Items from '../home/Items.vue'
import BackRss from '../home/BackRss.vue'
import Exclude from '../config/Exclude.vue'
import api from '../api.js'
import Mikan from '../home/Mikan.vue'
import Popconfirm from '../other/Popconfirm.vue'

const props = defineProps({
  ani: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['ok', 'close'])

// 控制dialog显示
const visible = ref(true)

// 所有ref声明
const mikanRef = ref()
const backRss = ref()
const date = ref()
const items = ref()
const okLoading = ref(false)
const getThemoviedbNameLoading = ref(false)
const downloadLoading = ref(false)
const downloadPathLoading = ref(false)
const exclude = ref()
const match = ref()
const scrollbar = ref()

// 本地数据 - 直接使用props.ani的副本
const ani = ref({})

onMounted(() => {
  init()
})

// 初始化方法 - 简化为直接复制props.ani
const init = () => {
  ani.value = JSON.parse(JSON.stringify(props.ani))

  if (ani.value.year && ani.value.month) {
    date.value = new Date(ani.value.year, ani.value.month - 1, ani.value.date || 1)
  }

  nextTick(() => {
    scrollbar.value?.setScrollTop(0)
  })
}

// 监听props变化
watch(() => props.ani, (newVal) => {
  if (newVal) {
    init()
  }
}, { immediate: true, deep: true })

// 日期变更处理
const dateChange = () => {
  if (!date.value) return
  ani.value.year = date.value.getFullYear()
  ani.value.month = date.value.getMonth() + 1
  ani.value.date = date.value.getDate()
  let minYear = 1970
  if (ani.value.year < minYear) {
    ani.value.year = minYear
    init()
    ElMessage.error(`最小年份为 ${minYear}`)
  }
}

// TMDB名称获取
const getThemoviedbName = () => {
  if (!ani.value.title) return

  getThemoviedbNameLoading.value = true
  api.get("api/tmdb?method=getThemoviedbName&name=" + ani.value.title)
      .then(res => {
        ElMessage.success(res.message)
        ani.value.themoviedbName = res.data
      })
      .finally(() => {
        getThemoviedbNameLoading.value = false
      })
}

// 下载路径处理
const downloadPath = () => {
  downloadPathLoading.value = true
  let newAni = JSON.parse(JSON.stringify(ani.value))
  newAni.customDownloadPath = false
  api.post('api/downloadPath', newAni)
      .then(res => {
        ani.value.downloadPath = res.data.downloadPath
      })
      .finally(() => {
        downloadPathLoading.value = false
      })
}

// 刷新订阅
const download = () => {
  downloadLoading.value = true
  api.post('api/ani?download=true', ani.value)
      .then(res => {
        ElMessage.success(res.message)
      })
      .finally(() => {
        downloadLoading.value = false
      })
}

// 确定按钮处理
const handleOk = async () => {
  okLoading.value = true
  try {
    // 直接将本地数据同步回props
    Object.assign(props.ani, ani.value)
    await emit('ok', () => okLoading.value = false)
  } catch (error) {
    okLoading.value = false
  }
}

// 关闭处理
const handleClose = () => {
  // 直接清空本地数据
  ani.value = {}
  emit('close')
}
</script>
<style scoped>
.form-main {
  flex: 1;
  overflow: hidden;
}

.form-content {
  padding: var(--el-main-padding);
}

.mb-4 {
  margin-bottom: 16px;
}

.mr-2 {
  margin-right: 8px;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.text-right {
  text-align: right;
}

.mt-2 {
  margin-top: 8px;
}

.ani-dialog {
  --el-dialog-padding-primary: 20px;
}

.ani-dialog .el-dialog__body {
  padding-top: 0;
  height: calc(90vh - 120px);
  overflow: hidden;
}

.ani-dialog .el-dialog__footer {
  border-top: 1px solid var(--el-border-color-lighter);
  padding: var(--el-dialog-padding-primary);
}

@media screen and (max-width: 768px) {
  .form-content {
    padding: 8px;
  }
}

.gap-2 {
  gap: 8px;
}

.w-full {
  width: 100%;
}

.w-32 {
  width: 8rem;
}

.w-24 {
  width: 6rem;
}

.flex-col {
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  height: 32px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.form-item-content {
  width: 100%;
}

.form-item-action {
  margin-top: 8px;
  text-align: right;
}

:deep(.el-form-item__content) {
  flex-wrap: wrap;
}

:deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-switch) {
  margin-right: 8px;
}
</style>
