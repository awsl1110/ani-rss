<template>
  <div class="search-container">
    <el-row :gutter="16" justify="center" align="middle">
      <el-col :xs="24" :sm="16" :md="16">
        <el-input
            v-model="text"
            placeholder="请输入搜索标题"
            @keyup.enter="handleSearch"
            clearable
            @clear="handleClear"
            :disabled="loading"
            class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleSearch" :loading="loading" type="primary">
              搜索
            </el-button>
          </template>
        </el-input>
      </el-col>
      <el-col :xs="24" :sm="8" :md="6">
        <el-select
            v-model="season"
            @change="handleSeasonChange"
            :disabled="loading || disabled"
            placeholder="选择季度"
            size="small"
            clearable
            class="season-select"
        >
          <el-option
              v-for="item in seasons"
              :key="item.year + ' ' + item.season"
              :label="item.year + ' ' + item.season"
              :value="item.year + ' ' + item.season"
          />
        </el-select>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDebounce } from '../composables/useDebounce'

const props = defineProps({
  loading: Boolean,
  seasons: {
    type: Array,
    default: () => []
  },
  modelValue: String,
  seasonValue: String,
  disabled: Boolean,
  minLength: {
    type: Number,
    default: 2
  }
})

const emit = defineEmits(['search', 'change', 'clear', 'update:modelValue', 'update:seasonValue'])

const text = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const season = computed({
  get: () => props.seasonValue,
  set: (val) => emit('update:seasonValue', val)
})

// 使用防抖的搜索函数
const { debounce } = useDebounce()
const debouncedSearch = debounce(() => {
  handleSearch()
}, 300)

// 处理搜索
const handleSearch = () => {
  if (!text.value?.length) {
    handleClear()
    return
  }

  if (text.value.length < props.minLength) {
    ElMessage.warning(`搜索关键词至少需要 ${props.minLength} 个字符`)
    return
  }

  emit('search')
}

// 处理清除
const handleClear = () => {
  text.value = ''
  emit('clear')
}

// 处理季度变更
const handleSeasonChange = (value) => {
  if (value) {
    emit('change', value)
  } else {
    handleClear()
  }
}
</script>

<style scoped>
.search-container {
  padding: 16px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.search-input {
  width: 100%;
  margin-bottom: 8px;
}

.season-select {
  width: 100%;
}

@media (min-width: 768px) {
  .search-input {
    margin-bottom: 0;
  }
}
</style> 