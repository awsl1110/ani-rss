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
    <div class="ani-wrapper">
      <Items ref="items" :ani="ani"/>
      <BackRss ref="backRss" :ani="ani"/>
      <Mikan ref="mikanRef" @add="args => {
        ani.subgroup = args.group
        ani.match = args.match
        ani.url = args.url
      }"/>
      <div style="height: 500px">
        <el-scrollbar style="padding: 0 12px" height="500px" ref="scrollbar">
          <el-form label-width="auto"
                   @submit="(event)=>{
                    event.preventDefault()
                 }"
          >
            <el-form-item label="标题">
              <div style="width: 100%;">
                <div>
                  <el-input v-model:model-value="ani.title"/>
                </div>
                <div style="width: 100%;justify-content: end;display: flex;margin-top: 12px;">
                  <el-button @click="ani.title = ani.themoviedbName"
                             icon="DocumentAdd"
                             :disabled="ani.title === ani.themoviedbName || !ani.themoviedbName.length" bg text>
                    使用TMDB
                  </el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="TMDB">
              <div style="display: flex;width: 100%;justify-content: space-between;">
                <el-input v-model:model-value="ani.themoviedbName" disabled/>
                <div style="width: 4px;"></div>
                <el-button icon="Refresh" bg text @click="getThemoviedbName" :loading="getThemoviedbNameLoading"/>
              </div>
            </el-form-item>
            <el-form-item label="BgmUrl">
              <el-input v-model:model-value="ani.bgmUrl" placeholder="https://xxx.xxx"/>
            </el-form-item>
            <el-form-item label="字幕组">
              <el-input v-model:model-value="ani.subgroup" disabled/>
            </el-form-item>
            <el-form-item label="RSS">
              <div style="width: 100%;display: flex;">
                <el-input v-model:model-value="ani.subgroup" style="width: 140px" placeholder="字幕组" disabled/>
                <div style="width: 6px;"></div>
                <el-input v-model:model-value="ani.url" placeholder="https://xxx.xxx" disabled/>
                <div style="width: 6px;"></div>
                <el-button bg text @click="mikanRef?.show(ani.title)" icon="VideoCamera"/>
              </div>
            </el-form-item>
            <el-form-item label="备用 RSS">
              <div style="display: flex;justify-content: end;width: 100%;">
                <el-button text bg @click="backRss?.show" icon="EditPen">管理</el-button>
              </div>
            </el-form-item>
            <el-form-item label="日期">
              <div style="display: flex;width: 100%;justify-content: end;">
                <el-date-picker
                    style="max-width: 150px;"
                    v-model="date"
                    @change="dateChange"
                />
              </div>
            </el-form-item>
            <el-form-item label="季">
              <div style="display: flex;justify-content: end;width: 100%;">
                <el-input-number style="max-width: 200px" :min="0" v-model:model-value="ani.season"
                                 :disabled="ani.ova"/>
              </div>
            </el-form-item>
            <el-form-item label="集数偏移">
              <div style="display: flex;justify-content: end;width: 100%;">
                <el-input-number v-model:model-value="ani.offset" :disabled="ani.ova"/>
              </div>
            </el-form-item>
            <el-form-item label="总集数">
              <div style="display: flex;justify-content: end;width: 100%;">
                <el-input-number v-model:model-value="ani.totalEpisodeNumber"/>
              </div>
            </el-form-item>
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
            <el-form-item label="剧场版">
              <el-switch v-model:model-value="ani.ova"/>
            </el-form-item>
            <el-form-item label="自定义集数规则">
              <div style="width: 100%;">
                <div>
                  <el-switch v-model:model-value="ani.customEpisode"/>
                </div>
                <div style="display: flex;width: 100%;">
                  <el-input style="width: 100%"
                            :disabled="!ani.customEpisode"
                            v-model:model-value="ani.customEpisodeStr"/>
                  <div style="width: 4px;"></div>
                  <el-input-number v-model:model-value="ani.customEpisodeGroupIndex"
                                   :disabled="!ani.customEpisode"/>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="自定义下载">
              <div style="width: 100%;">
                <div>
                  <el-switch v-model:model-value="ani.customDownloadPath"/>
                </div>
                <div>
                  <el-input type="textarea" style="width: 100%" :disabled="!ani.customDownloadPath"
                            :autosize="{ minRows: 2}"
                            v-model:model-value="ani.downloadPath"/>
                </div>
                <div style="display: flex;justify-content: space-between;margin-top: 6px;">
                  <el-button :disabled="!ani.customDownloadPath" :loading="downloadPathLoading" bg icon="Refresh"
                             text
                             @click="downloadPath"/>
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
            <el-form-item label="启用">
              <el-switch v-model:model-value="ani.enable"/>
            </el-form-item>
          </el-form>
        </el-scrollbar>
      </div>
    </div>
    <template #footer>
      <div style="display: flex;justify-content: space-between;width: 100%;">
        <div>
          <popconfirm title="立即刷新订阅?" @confirm="download" v-if="ani.showDownlaod">
            <template #reference>
              <el-button bg text :loading="downloadLoading" icon="Refresh">刷新</el-button>
            </template>
          </popconfirm>
        </div>
        <div>
          <el-button @click="items.show()" bg text icon="Grid">预览</el-button>
          <el-button icon="Check" type="primary" :loading="okLoading" @click="handleOk" text bg>确定</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import Items from './Items.vue'
import BackRss from './BackRss.vue'
import Exclude from '../config/Exclude.vue'
import api from '../api.js'
import Mikan from './Mikan.vue'
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

<style>
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
</style>