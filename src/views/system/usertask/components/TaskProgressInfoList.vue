<template>
  <!-- 列表 -->
  <ContentWrap>
    <el-button
      type="primary"
      plain
      @click="openForm('create')"
      v-hasPermi="['system:user-task:create']"
    >
      <Icon icon="ep:plus" class="mr-5px" /> 新增
    </el-button>
      <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['system:user-task:delete']"
      >
        <Icon icon="ep:delete" class="mr-5px" /> 批量删除
      </el-button>
    <el-table
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        @selection-change="handleRowCheckboxChange"
    >
          <el-table-column type="selection" width="55" />
      <el-table-column label="进程明细id" align="center" prop="id" />
       <el-table-column label="进程描述" align="center" prop="content" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['system:user-task:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:user-task:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
    <!-- 表单弹窗：添加/修改 -->
    <TaskProgressInfoForm ref="formRef" @success="getList" />
</template>
<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'
import { UserTaskApi, TaskProgressInfo } from '@/api/system/usertask'
import TaskProgressInfoForm from './TaskProgressInfoForm.vue'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const props = defineProps<{
  taskId?: number // 任务id（主表的关联字段）
}>()
const loading = ref(false) // 列表的加载中
const list = ref([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  taskId: undefined as unknown
})

/** 监听主表的关联字段的变化，加载对应的子表数据 */
watch(
  () => props.taskId,
  (val: number) => {
    if (!val) {
      list.value = [] // 清空列表
      return
    }
    queryParams.taskId = val
    handleQuery()
  },
    { immediate: true, deep: true }
)

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserTaskApi.getTaskProgressInfoPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  if (!props.taskId) {
    message.error('请选择一个任务')
    return
  }
  formRef.value.open(type, id, props.taskId)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserTaskApi.deleteTaskProgressInfo(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除任务进程 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserTaskApi.deleteTaskProgressInfoList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'))
    await getList();
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: TaskProgressInfo[]) => {
  checkedIds.value = records.map((item) => item.id);
}
</script>