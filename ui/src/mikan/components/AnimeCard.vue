<template>
  <v-card
    class="mx-auto anime-card"
    max-width="100%"
    height="100%"
  >
    <v-img
      :src="anime.img"
      :aspect-ratio="16/9"
      cover
      class="align-end"
    >
      <template #placeholder>
        <el-space
          :size="8"
          class="image-placeholder el-w-full el-h-full el-flex-center"
        >
          <el-icon :size="24"><Picture /></el-icon>
          <span>加载中...</span>
        </el-space>
      </template>
      <template #error>
        <el-space
          :size="8"
          class="image-placeholder el-w-full el-h-full el-flex-center"
        >
          <el-icon :size="24"><Picture /></el-icon>
          <span>加载失败</span>
        </el-space>
      </template>
    </v-img>

    <el-tooltip
      :content="anime.title"
      placement="top"
      :show-after="500"
      :enterable="false"
    >
      <el-text class="el-text-truncated-2">
        {{ anime.title }}
      </el-text>
    </el-tooltip>

    <div class="card-footer">
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
    </div>
  </v-card>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'

defineProps({
  anime: {
    type: Object,
    required: true
  },
  loading: Boolean
})

defineEmits(['select'])

const getImgUrl = (it) => `api/file?img=${btoa(it.cover)}&s=${window.authorization}`
const openUrl = (url) => window.open(url)
</script>

<style scoped>
.anime-card {
  display: flex;
  flex-direction: column;
}

.v-img {
  flex: 1;
  width: 100%;
  height: auto;
}

.card-footer {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.card-footer .el-button {
  width: 100%;
}

.image-placeholder {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 14px;
}

.el-text-truncated-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  height: 2.8em;
  margin: 0;
}
</style> 