<template>
  <el-dialog
    v-model="dialogVisible"
    title="任务详情"
    width="800px"
    :before-close="handleClose"
  >
    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-skeleton-item variant="h1" style="width: 50%" />
        <el-skeleton-item variant="text" style="margin-top: 16px" />
        <el-skeleton-item variant="text" />
      </template>

      <template #default>
        <div v-if="taskDetail" class="task-detail">
          <h3>{{ taskDetail.title }}</h3>
          <el-progress
            v-if="taskDetail.progress !== undefined"
            :percentage="taskDetail.progress"
            :stroke-width="10"
            style="margin: 16px 0"
          />
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任务描述" :span="2">
              {{ taskDetail.content }}
            </el-descriptions-item>
            <el-descriptions-item label="处理人">
              {{ taskDetail.userName }}
            </el-descriptions-item>
            <el-descriptions-item label="部门">
              {{ taskDetail.deptName }}
            </el-descriptions-item>
            <el-descriptions-item label="计划开始日期">
              {{ taskDetail.startDate }}
            </el-descriptions-item>
            <el-descriptions-item label="实际开始时间">
              {{ taskDetail.actualStartDate || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="计划完成日期">
              {{ taskDetail.planEndDate }}
            </el-descriptions-item>
            <el-descriptions-item label="实际完成时间">
              {{ taskDetail.endDate || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="任务时长">
              {{ taskDetail.spendTimeValue || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="任务类型">
              {{ taskDetail.taskTypeName }}
            </el-descriptions-item>
            <el-descriptions-item label="工作范畴">
              {{ taskDetail.taskClassName || '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="任务状态">
              <el-tag :type="getStatusType(taskDetail.status)">
                {{ getStatusText(taskDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="进度">
              {{ taskDetail.progress }}%
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
    </el-skeleton>

    <template #footer>
      <el-space>
        <el-button @click="handleClose">关闭</el-button>
        <el-button
          v-if="canUpdate"
          type="primary"
          @click="showUpdateDialog = true"
        >
          更新进度
        </el-button>
        <el-button
          v-if="canComplete"
          type="success"
          @click="handleComplete"
        >
          完成任务
        </el-button>
      </el-space>
    </template>
  </el-dialog>

  <!-- 更新进度对话框 -->
  <el-dialog
    v-model="showUpdateDialog"
    title="更新任务进度"
    width="500px"
  >
    <el-form :model="updateForm" label-width="100px">
      <el-form-item label="进度">
        <el-input-number
          v-model="updateForm.progress"
          :min="taskDetail?.progress || 0"
          :max="100"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          v-model="updateForm.progressContent"
          type="textarea"
          :rows="4"
          placeholder="请输入进度描述"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showUpdateDialog = false">取消</el-button>
      <el-button type="primary" @click="handleUpdate">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BoardApi, type TaskVO } from '@/api/system/board'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const props = defineProps<{
  modelValue: boolean
  taskId: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  refresh: []
}>()

const userStore = useUserStore()
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const taskDetail = ref<TaskVO>()
const showUpdateDialog = ref(false)
const updateForm = ref({
  progress: 0,
  progressContent: ''
})

const canUpdate = computed(() => {
  if (!taskDetail.value) return false
  const userId = userStore.getUser?.id
  return (
    taskDetail.value.userId === userId &&
    [0, 1, 3].includes(taskDetail.value.status)
  )
})

const canComplete = computed(() => {
  if (!taskDetail.value) return false
  const userId = userStore.getUser?.id
  return (
    taskDetail.value.userId === userId &&
    [0, 1, 3].includes(taskDetail.value.status)
  )
})

const loadTaskDetail = async () => {
  if (!props.taskId) return
  loading.value = true
  try {
    taskDetail.value = await BoardApi.getTaskDetail(props.taskId)
    updateForm.value.progress = taskDetail.value.progress || 0
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  try {
    await BoardApi.updateTask({
      id: props.taskId,
      progress: updateForm.value.progress,
     status: updateForm.value.progress === 100 ? 2 : 1,
      progressContent: updateForm.value.progressContent
    })
    ElMessage.success('任务更新成功')
    showUpdateDialog.value = false
    emit('refresh')
    loadTaskDetail()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const handleComplete = async () => {
  try {
    await BoardApi.updateTask({
      id: props.taskId,
      progress: 100,
      status: 2
    })
    ElMessage.success('任务完成')
    emit('refresh')
    handleClose()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

const getStatusText = (status: number) => {
  const map = { 0: '待处理', 1: '进行中', 2: '已完成', 3: '已延期', 4: '已取消', 5: '延期完成' }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger', 4: 'info', 5: 'warning' }
  return map[status] || 'info'
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      loadTaskDetail()
    }
  }
)
</script>

<style scoped lang="scss">
.task-detail {
  h3 {
    margin-bottom: 16px;
    font-size: 18px;
  }
}
</style>
