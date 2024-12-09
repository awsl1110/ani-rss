<template>
  <el-drawer
      v-model="visible"
      :title="title"
      :size="size"
      direction="rtl"
      :close-on-click-modal="false"
  >
    <div class="group-list">
      <template v-if="groups?.length">
        <div v-for="group in groups" :key="group.label">
          <div class="group-item">
            <div class="group-header">
              <div class="group-info">
                <div class="group-title">{{ group.label }}</div>
                <el-text type="info" size="small">{{ group.updateDay }}</el-text>
              </div>
              <el-button
                  type="primary"
                  :loading="loading"
                  @click="$emit('subscribe', group)"
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
                        v-for="col in columns"
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
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  groups: Array,
  loading: Boolean,
  size: {
    type: String,
    default: '800px'
  }
})

const emit = defineEmits(['update:modelValue', 'subscribe'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const columns = [
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