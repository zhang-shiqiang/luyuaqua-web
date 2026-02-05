<template>
  <el-dialog v-model="dialogVisible" title="任务详情" width="800px" :before-close="handleClose">
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
              {{
                taskDetail.startDate
                  ? dayjs(taskDetail.startDate).format('YYYY-MM-DD HH:mm:ss')
                  : '--'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="实际开始时间">
              {{
                taskDetail.actualStartDate
                  ? dayjs(taskDetail.actualStartDate).format('YYYY-MM-DD HH:mm:ss')
                  : '--'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="计划完成日期">
              {{
                taskDetail.planEndDate
                  ? dayjs(taskDetail.planEndDate).format('YYYY-MM-DD HH:mm:ss')
                  : '--'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="实际完成时间">
              {{
                taskDetail.endDate ? dayjs(taskDetail.endDate).format('YYYY-MM-DD HH:mm:ss') : '--'
              }}
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
            <el-descriptions-item label="进度"> {{ taskDetail.progress }}% </el-descriptions-item>
            <el-descriptions-item label="重要程度">
              {{ getImportantFlagText(taskDetail.importantFlag) }}
            </el-descriptions-item>
            <el-descriptions-item label="协同人员">
              {{ taskDetail.userTaskAssistantDOS?.map((x: any) => x.userName).join(', ') || '--' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </template>
    </el-skeleton>

    <template #footer>
      <div class="dialog-footer">
        <!-- 主要操作按钮 -->
        <div class="footer-actions">
          <!-- 返工 -->
          <el-button v-if="canReturnWork" type="danger" @click="showReturnWorkDialog = true">
            <Icon icon="ep:refresh-left" class="mr-5px" />
            返工
          </el-button>
          <!-- 专注 -->
          <el-button v-if="canFocus" type="warning" @click="handleSetFocus">
            <Icon icon="ep:star" class="mr-5px" />
            专注
          </el-button>
          <!-- 取消专注 -->
          <el-button v-if="canCancelFocus" type="warning" plain @click="handleCancelFocus">
            <Icon icon="ep:star" class="mr-5px" />
            取消专注
          </el-button>
          <!-- 更新 -->
          <el-button v-if="canUpdate" type="primary" @click="showUpdateDialog = true">
            <Icon icon="ep:edit" class="mr-5px" />
            更新
          </el-button>
          <!-- 完成 -->
          <el-button v-if="canComplete" type="success" @click="handleComplete">
            <Icon icon="ep:check" class="mr-5px" />
            完成
          </el-button>
          <!-- 取消任务（领导权限） -->
          <el-button v-if="canCancelTask" type="danger" plain @click="handleCancelTask">
            <Icon icon="ep:close" class="mr-5px" />
            取消
          </el-button>
        </div>
        <!-- 关闭按钮 -->
        <el-button @click="handleClose">
          <Icon icon="ep:close" class="mr-5px" />
          关闭
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 更新进度对话框 -->
  <el-dialog v-model="showUpdateDialog" title="更新任务" width="500px">
    <el-form :model="updateForm" label-width="100px">
      <el-form-item label="更新进度" required>
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
          placeholder="请输入描述信息"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showUpdateDialog = false">取消</el-button>
      <el-button type="primary" @click="handleUpdate">确定</el-button>
    </template>
  </el-dialog>

  <!-- 返工对话框 -->
  <el-dialog v-model="showReturnWorkDialog" title="返工更新" width="500px">
    <el-form :model="returnWorkForm" label-width="100px">
      <el-form-item label="描述" required>
        <el-input
          v-model="returnWorkForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入返工说明"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showReturnWorkDialog = false">取消</el-button>
      <el-button type="primary" @click="handleReturnWork">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, computed, watch } from 'vue'
import { BoardApi, type TaskVO } from '@/api/system/board'
import { ElMessage, ElMessageBox } from 'element-plus'
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
const showReturnWorkDialog = ref(false)
const updateForm = ref({
  progress: 0,
  progressContent: ''
})
const returnWorkForm = ref({
  content: ''
})

// 返工权限：已完成或延期完成状态，且是任务责任人
const canReturnWork = computed(() => {
  if (!taskDetail.value) return false
  const userId = userStore.getUser?.id
  return [2, 5].includes(taskDetail.value.status) && taskDetail.value.userId === userId
})

// 专注权限：非养殖部，待处理/进行中/延期状态，未专注，任务责任人
const canFocus = computed(() => {
  if (!taskDetail.value) return false
  const userId = userStore.getUser?.id
  return (
    taskDetail.value.deptName !== '养殖部' &&
    [0, 1, 3].includes(taskDetail.value.status) &&
    taskDetail.value.focusFlag === 0 &&
    taskDetail.value.userId === userId
  )
})

// 取消专注权限：非养殖部，待处理/进行中/延期状态，已专注，任务责任人
const canCancelFocus = computed(() => {
  if (!taskDetail.value) return false
  const userId = userStore.getUser?.id
  return (
    taskDetail.value.deptName !== '养殖部' &&
    [0, 1, 3].includes(taskDetail.value.status) &&
    taskDetail.value.focusFlag === 1 &&
    taskDetail.value.userId === userId
  )
})

// 更新权限
const canUpdate = computed(() => {
  if (!taskDetail.value) return false
  const userId = userStore.getUser?.id
  const isTaskOwner = taskDetail.value.userId === userId
  const validStatus = [0, 1, 3].includes(taskDetail.value.status)

  if (taskDetail.value.deptName === '养殖部') {
    // 养殖部：待处理/进行中/延期，任务责任人
    return isTaskOwner && validStatus
  } else {
    // 非养殖部：待处理/进行中/延期，任务责任人，已专注
    return isTaskOwner && validStatus && taskDetail.value.focusFlag !== 0
  }
})

// 完成权限
const canComplete = computed(() => {
  if (!taskDetail.value) return false
  const userId = userStore.getUser?.id
  const isTaskOwner = taskDetail.value.userId === userId
  const validStatus = [0, 1, 3].includes(taskDetail.value.status)

  if (taskDetail.value.deptName === '养殖部') {
    // 养殖部：待处理/进行中/延期，任务责任人
    return isTaskOwner && validStatus
  } else {
    // 非养殖部：待处理/进行中/延期，任务责任人，已专注
    return isTaskOwner && validStatus && taskDetail.value.focusFlag !== 0
  }
})

// 取消任务权限：领导角色，待处理/进行中/延期状态
const canCancelTask = computed(() => {
  if (!taskDetail.value) return false
  // 这里需要从用户信息中获取角色，暂时用简单判断
  // const userRole = userStore.getUser?.roles?.includes('leader')
  return [0, 1, 3].includes(taskDetail.value.status)
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

// 日期格式化工具函数 - 确保返回 YYYY-MM-DD 格式
const formatDate = (date: any): string | null => {
  if (!date) return null

  // 如果已经是 YYYY-MM-DD 格式，直接返回
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  // 如果是ISO格式日期字符串（如 2024-01-01T00:00:00），提取日期部分
  if (typeof date === 'string' && date.includes('T')) {
    return date.split('T')[0]
  }

  // 如果是时间戳或Date对象，转换为YYYY-MM-DD格式
  try {
    const dateObj = new Date(date)
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  } catch (e) {
    console.error('日期格式化失败:', e)
  }

  return date
}

const handleUpdate = async () => {
  try {
    // 按照移动端格式化参数，格式化日期字段
    const params = {
      ...taskDetail.value,
      progress: updateForm.value.progress,
      status: updateForm.value.progress === 100 ? 2 : 1,
      progressContent: updateForm.value.progressContent,
      startDate: formatDate(taskDetail.value?.startDate),
      actualStartDate: formatDate(taskDetail.value?.actualStartDate),
      planEndDate: formatDate(taskDetail.value?.planEndDate),
      endDate: formatDate(taskDetail.value?.endDate)
    }

    await BoardApi.updateTask(params)
    ElMessage.success('任务更新成功')
    showUpdateDialog.value = false
    emit('refresh')
    loadTaskDetail()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const handleComplete = async () => {
  // 验证计划完成日期
  if (!taskDetail.value?.planEndDate) {
    ElMessage.warning('计划完成日期不能为空')
    return
  }

  try {
    await ElMessageBox.confirm('确认完成该任务吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 按照移动端格式化参数，格式化日期字段
    const params = {
      ...taskDetail.value,
      progress: 100,
      status: 2,
      startDate: formatDate(taskDetail.value?.startDate),
      actualStartDate: formatDate(taskDetail.value?.actualStartDate),
      planEndDate: formatDate(taskDetail.value?.planEndDate)
    }

    await BoardApi.updateTask(params)
    ElMessage.success('任务完成')
    emit('refresh')
    loadTaskDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

// 返工
const handleReturnWork = async () => {
  if (!returnWorkForm.value.content) {
    ElMessage.warning('请输入返工说明')
    return
  }
  try {
    await BoardApi.createTaskProgressInfo({
      taskId: props.taskId,
      content: returnWorkForm.value.content,
      progressType: 6, // 返工类型
      progress: 100
    })
    ElMessage.success('返工更新成功')
    showReturnWorkDialog.value = false
    returnWorkForm.value.content = ''
    emit('refresh')
    loadTaskDetail()
  } catch (error) {
    ElMessage.error('返工更新失败')
  }
}

// 取消任务
const handleCancelTask = async () => {
  try {
    await ElMessageBox.confirm('确定取消该任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 按照移动端格式化参数，格式化日期字段
    const params = {
      ...taskDetail.value,
      status: 4,
      startDate: formatDate(taskDetail.value?.startDate),
      actualStartDate: formatDate(taskDetail.value?.actualStartDate),
      planEndDate: formatDate(taskDetail.value?.planEndDate)
    }

    await BoardApi.updateTask(params)
    ElMessage.success('任务取消成功')
    emit('refresh')
    loadTaskDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const getStatusText = (status: number) => {
  const map = { 0: '待处理', 1: '进行中', 2: '已完成', 3: '已延期', 4: '已取消', 5: '延期完成' }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger', 4: 'info', 5: 'warning' }
  return map[status] || 'info'
}

const getImportantFlagText = (flag: number) => {
  const map = { 1: '普通', 2: '一般重要', 3: '重要' }
  return map[flag] || '--'
}

// 设置专注任务
const handleSetFocus = async () => {
  try {
    await ElMessageBox.confirm('您确定开始专注该任务吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await BoardApi.focusTask(props.taskId)
    ElMessage.success('开启任务专注成功')
    emit('refresh')
    loadTaskDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 取消专注任务
const handleCancelFocus = async () => {
  try {
    await ElMessageBox.confirm('您确定取消专注该任务吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const response = await BoardApi.cancelFocusTask(props.taskId)
    // 返回值为 0 表示成功，否则为剩余分钟数
    const remainTime = typeof response === 'number' ? response : response?.data
    if (remainTime === 0) {
      ElMessage.success('取消任务专注成功')
      emit('refresh')
      loadTaskDetail()
    } else {
      ElMessage.warning(`专注该任务最少时间还剩余${remainTime}分钟，不允许取消`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
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

  // 适配 el-descriptions 组件
  :deep(.el-descriptions) {
    .el-descriptions__label,
    .el-descriptions__content {
      background-color: transparent;
      border-color: var(--el-border-color-light);
    }

    .el-descriptions__label {
      color: var(--el-text-color-secondary);
    }

    .el-descriptions__content {
      color: var(--el-text-color-primary);
    }
  }
}

// 对话框底部样式
.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;

  .footer-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
}

// 暗色模式适配
.dark {
  .task-detail {
    h3 {
      color: var(--el-text-color-primary);
    }

    :deep(.el-descriptions) {
      .el-descriptions__label,
      .el-descriptions__content {
        background-color: transparent;
        border-color: var(--el-fill-color-dark);
      }

      .el-descriptions__label {
        color: var(--el-text-color-secondary);
      }

      .el-descriptions__content {
        color: var(--el-text-color-primary);
      }
    }
  }
}
</style>
