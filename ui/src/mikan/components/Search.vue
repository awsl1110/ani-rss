<template>
  <div class="search-container">
    <div class="search-filter-row">
      <div class="filter-group">
        <el-tag 
          v-for="day in weekdays" 
          :key="day.value"
          :effect="selectedDay === day.value ? 'dark' : 'plain'"
          round
          @click="handleDaySelect(day.value)"
          :type="selectedDay === day.value ? 'primary' : undefined"
          class="filter-tag"
        >
          {{ day.label }}
        </el-tag>

        <el-tag 
          v-for="type in types" 
          :key="type.value"
          :effect="selectedType === type.value ? 'dark' : 'plain'"
          round
          @click="handleTypeSelect(type.value)"
          :type="selectedType === type.value ? 'primary' : undefined"
          class="filter-tag"
        >
          {{ type.label }}
        </el-tag>
      </div>
      <div class="search-controls">
        <el-input
          v-model="text"
          placeholder="搜索番组..."
          @keyup.enter="handleSearch"
          clearable
          @clear="handleClear"
          :disabled="loading"
          :prefix-icon="Search"
          class="search-input"
        />
        
        <el-select
          v-if="seasons.length"
          v-model="selectedSeason"
          class="season-select"
          :disabled="text?.length > 0 || loading"
        >
          <el-option
            v-for="item in seasons"
            :key="item.year + ' ' + item.season"
            :label="item.year + ' ' + item.season"
            :value="item.year + ' ' + item.season"
          />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Calendar, CaretTop } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDebounce } from '../composables/useDebounce'

const props = defineProps({
  loading: Boolean,
  modelValue: String,
  disabled: Boolean,
  minLength: {
    type: Number,
    default: 2
  }
})

const emit = defineEmits(['search', 'clear', 'update:modelValue', 'filter', 'season-change'])

const text = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
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
  selectedSeason.value = ''
  resetFilters()
  emit('clear')
}

// 修改星期数据
const weekdays = [
  { label: '周一', value: 'monday' },
  { label: '周二', value: 'tuesday' },
  { label: '周三', value: 'wednesday' },
  { label: '周四', value: 'thursday' },
  { label: '周五', value: 'friday' },
  { label: '周六', value: 'saturday' },
  { label: '周日', value: 'sunday' },
]

const types = [
  { label: '剧场版', value: 'movie' },
  { label: 'OVA', value: 'ova' },
]

const selectedDay = ref(null)
const selectedType = ref(null)

// 修改星期和类型的选择处理
const handleDaySelect = (day) => {
  selectedDay.value = selectedDay.value === day ? null : day
  emit('filter', {
    day: selectedDay.value,
    type: selectedType.value
  })
}

const handleTypeSelect = (type) => {
  selectedType.value = selectedType.value === type ? null : type
  emit('filter', {
    day: selectedDay.value,
    type: selectedType.value
  })
}

// 添加重置过滤器的方法
const resetFilters = () => {
  selectedDay.value = null
  selectedType.value = null
}

// 修改季度相关的数据结构
const seasons = ref([])
const selectedSeason = ref('')

// 修改 watch
watch(selectedSeason, (newValue) => {
  if (!newValue) return
  
  const [year, season] = newValue.split(' ')
  const matchedSeason = seasons.value.find(
    item => item.year + ' ' + item.season === newValue
  )
  
  if (matchedSeason) {
    emit('season-change', matchedSeason)
  }
})

// 添加方法来更新季度列表
const updateSeasons = (newSeasons) => {
  seasons.value = newSeasons
  // 如果有默认选中的季度，自动选中
  const defaultSeason = newSeasons.find(item => item.select)
  if (defaultSeason) {
    selectedSeason.value = defaultSeason.year + ' ' + defaultSeason.season
  }
}

defineExpose({
  updateSeasons
})
</script>

<style scoped>
.search-container {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  width: 100%;
  margin-bottom: 16px;
}

.search-filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.search-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
}

.filter-tag {
  cursor: pointer;
  user-select: none;
}

.search-input {
  width: 300px;
}

.season-select {
  width: 200px;
}

@media (max-width: 992px) {
  .search-filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-controls {
    flex-direction: column;
  }
  
  .search-input,
  .season-select {
    width: 100%;
  }
}
</style> 