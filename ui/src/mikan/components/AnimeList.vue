<template>
  <div class="anime-list" v-loading="loading">
    <el-scrollbar>
      <el-space direction="vertical" :size="16" fill class="el-p-4">
        <template v-if="items.length">
          <div
            v-for="item in items"
            :key="item.label"
            :data-day="getDayValue(item.label)"
            :data-type="getTypeValue(item.label)"
          >
            <el-divider content-position="left">
              <el-text size="large" class="el-font-bold">
                {{ item.label }}
              </el-text>
            </el-divider>

            <el-row :gutter="16">
              <el-col
                v-for="anime in item.items"
                :key="anime.url"
                :xs="12"
                :sm="8"
                :md="6"
                :lg="4"
                :xl="3"
                class="el-mb-4"
              >
                <el-card
                  shadow="hover"
                  :body-style="{ padding: '10px', height: '100%' }"
                  class="anime-card"
                >
                  <el-space direction="vertical" :size="8" fill>
                    <div class="cover-wrapper">
                      <el-image
                        :src="getImgUrl(anime)"
                        fit="cover"
                        class="cover-image"
                        loading="lazy"
                        @click="openUrl(anime.url)"
                      >
                        <template #placeholder>
                          <el-space
                            :size="8"
                            class="el-w-full el-h-full el-flex-center el-bg-fill-color-light el-text-color-secondary"
                          >
                            <el-icon :size="24"><Picture /></el-icon>
                            <span>加载中...</span>
                          </el-space>
                        </template>
                        <template #error>
                          <el-space
                            :size="8"
                            class="el-w-full el-h-full el-flex-center el-bg-fill-color-light el-text-color-secondary"
                          >
                            <el-icon :size="24"><Picture /></el-icon>
                            <span>加载失败</span>
                          </el-space>
                        </template>
                      </el-image>
                    </div>

                    <el-space direction="vertical" :size="8" fill>
                      <el-tooltip
                        :content="anime.title"
                        placement="top"
                        :show-after="500"
                        :enterable="false"
                      >
                        <el-text class="anime-title" truncated>
                          {{ anime.title }}
                        </el-text>
                      </el-tooltip>

                      <el-button
                        :type="anime.exists ? 'success' : 'primary'"
                        size="small"
                        :loading="loading"
                        @click="$emit('select', anime)"
                        :disabled="anime.exists"
                        class="el-w-full"
                      >
                        {{ anime.exists ? '已订阅' : '订阅' }}
                      </el-button>
                    </el-space>
                  </el-space>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </template>
        <el-empty v-else description="暂无数据" />
      </el-space>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: Boolean
})

defineEmits(['select'])

const getImgUrl = (it) => `api/file?img=${btoa(it.cover)}&s=${window.authorization}`
const openUrl = (url) => window.open(url)

const getDayValue = (label) => {
  const dayMap = {
    '星期一': 'monday',
    '星期二': 'tuesday',
    '星期三': 'wednesday',
    '星期四': 'thursday',
    '星期五': 'friday',
    '星期六': 'saturday',
    '星期日': 'sunday'
  }
  return dayMap[label] || null
}

const getTypeValue = (label) => {
  const typeMap = {
    '剧场版': 'movie',
    'OVA': 'ova'
  }
  return typeMap[label] || null
}
</script>

<style scoped>
.anime-list {
  height: 100%;
  max-width: 100%;
}

.cover-wrapper {
  width: 100%;
  aspect-ratio: 3/4;
  height: auto;
  overflow: hidden;
  border-radius: var(--el-border-radius-base);
  background: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.anime-title {
  font-size: 13px;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

:deep(.el-text) {
  white-space: normal !important;
  width: 100%;
}

.anime-title:hover {
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .el-p-4 {
    padding: 8px;
  }

  .el-mb-4 {
    margin-bottom: 8px;
  }
}

@media (min-width: 1600px) {
  .el-p-4 {
    padding: 24px;
  }
}
</style>
