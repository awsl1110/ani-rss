<template>
  <div class="anime-list" v-loading="loading">
    <el-scrollbar>
      <div class="anime-list-content">
        <template v-if="items.length">
          <div v-for="item in items" :key="item.label" class="anime-section">
            <el-divider content-position="left">
              <h3 class="section-title">{{ item.label }}</h3>
            </el-divider>

            <el-row :gutter="16">
              <el-col
                  v-for="it in item.items"
                  :key="it.url"
                  :xs="12"
                  :sm="8"
                  :md="6"
                  :lg="4"
                  :xl="4"
                  class="anime-item"
              >
                <el-card 
                  shadow="hover" 
                  class="anime-card"
                  :body-style="{ padding: '10px', height: '100%' }"
                >
                  <div class="anime-cover-wrapper">
                    <el-image
                        :src="getImgUrl(it)"
                        fit="cover"
                        class="anime-cover"
                        @click="openUrl(it.url)"
                        loading="lazy"
                    >
                      <template #placeholder>
                        <div class="image-placeholder">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>

                  <div class="anime-info">
                    <el-tooltip :content="it.title" placement="top" :show-after="500">
                      <div class="anime-title">{{ it.title }}</div>
                    </el-tooltip>

                    <div class="anime-actions">
                      <el-button
                          :type="it.exists ? 'success' : 'primary'"
                          size="small"
                          :loading="loading"
                          @click="$emit('select', it)"
                          :disabled="it.exists"
                          class="subscribe-btn"
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
      </div>
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
</script>

<style scoped>
.anime-list {
  height: 100%;
  overflow: hidden;
}

.anime-list-content {
  padding: 16px;
}

.anime-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.anime-item {
  margin-bottom: 16px;
}

.anime-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.anime-cover-wrapper {
  position: relative;
  padding-top: 140%;
  overflow: hidden;
  border-radius: 4px;
}

.anime-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.image-placeholder,
.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 24px;
}

.image-error {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
}

.anime-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 12px;
}

.anime-title {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.anime-actions {
  display: flex;
  justify-content: center;
}

.subscribe-btn {
  width: 100%;
}

@media (max-width: 768px) {
  .anime-list-content {
    padding: 8px;
  }

  .anime-item {
    margin-bottom: 8px;
  }

  .section-title {
    font-size: 16px;
  }
}
</style> 