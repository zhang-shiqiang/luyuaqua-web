<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="98px"
    >
      <el-row :gutter="16">
        <el-col :span="6">
          <el-form-item label="标题" prop="title">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入任务标题"
              clearable
              @keyup.enter="handleQuery"
              class="!w-100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择任务状态"
              clearable
              @change="handleQuery"
              class="!w-240px"
            >
              <el-option
                v-for="dict in SYSTEM_TASK_STATUS"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="display: flex; justify-content: flex-end">
          <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
          <el-button
            type="primary"
            plain
            @click="openForm('create')"
            v-hasPermi="['system:user-task:create']"
          >
            <Icon icon="ep:plus" class="mr-5px" /> 新增
          </el-button>
          <el-button
            type="primary"
            plain
            @click="handleExport"
            :loading="exportLoading"
            v-hasPermi="['system:user-task:export']"
          >
            <Icon icon="ep:download" class="mr-5px" /> 模版下载
          </el-button>

          <el-button type="primary" plain style="position: relative">
            <input
              type="file"
              style="position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0"
              @input="handleImport"
            />
            <Icon icon="ep:plus" class="mr-5px" /> 批量导入
          </el-button>

          <!-- <el-button
            type="danger"
            plain
            :disabled="isEmpty(checkedIds)"
            @click="handleDeleteBatch"
            v-hasPermi="['system:user-task:delete']"
          >
            <Icon icon="ep:delete" class="mr-5px" /> 删除
          </el-button> -->
        </el-col>
      </el-row>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      highlight-current-row
      @current-change="handleCurrentChange"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" fixed />
      <!-- <el-table-column label="任务" align="center" fixed prop="id" /> -->
      <el-table-column
        label="任务名称"
        min-width="140"
        show-overflow-tooltip
        align="center"
        fixed
        prop="title"
      />
      <el-table-column label="任务类型" width="120" align="center" prop="taskTypeName" />
      <el-table-column label="任务状态" align="center" width="120" prop="status">
        <template #default="scope">
          <!-- <dict-tag :type="SYSTEM_TASK_STATUS" :value="scope.row.status" /> -->
          <span>{{
            SYSTEM_TASK_STATUS.find((x) => x.value == scope.row.status)?.label || '-'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务进度" width="160" align="center" prop="progress">
        <template #default="scope">
          <el-progress
            v-if="scope.row.progress"
            :text-inside="true"
            :stroke-width="18"
            :percentage="Number(scope.row.progress)"
            status="success"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="任务描述"
        min-width="240"
        show-overflow-tooltip
        align="center"
        prop="content"
      />
      <el-table-column label="生成周期" align="center" width="90" prop="createCycle">
        <template #default="scope">
          <span>{{
            SYSTEM_CREATE_CYCLE.find((x) => x.value == scope.row.createCycle)?.label || '-'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配合人员/部门" width="120" align="center" prop="assistant" />
      <el-table-column
        label="部门"
        show-overflow-tooltip
        width="100"
        align="center"
        prop="deptName"
      />
      <el-table-column
        label="用户"
        show-overflow-tooltip
        width="100"
        align="center"
        prop="userName"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="开始日期" width="180" align="center">
        <template #default="{ row }">
          {{
            Array.isArray(row.startDate)
              ? `${row.startDate[0]}-${String(row.startDate[1]).padStart(2, '0')}-${String(row.startDate[2]).padStart(2, '0')}`
              : row.startDate
          }}
        </template>
      </el-table-column>

      <el-table-column
        label="完成时间"
        align="center"
        prop="endDate"
        :formatter="dateFormatter"
        width="180px"
      />

      <el-table-column label="操作" align="center" min-width="120px">
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
  <UserTaskForm ref="formRef" @success="getList" />
  <!-- 子表的列表 -->
  <!-- <ContentWrap>
    <el-tabs model-value="taskProgressInfo">
      <el-tab-pane label="任务进程" name="taskProgressInfo">
        <TaskProgressInfoList :task-id="currentRow.id" />
      </el-tab-pane>
    </el-tabs>
  </ContentWrap> -->
</template>

<script setup lang="ts">
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { isEmpty } from '@/utils/is'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { UserTaskApi, UserTask } from '@/api/system/usertask'
import UserTaskForm from './UserTaskForm.vue'
import TaskProgressInfoList from './components/TaskProgressInfoList.vue'
const fileList = ref<any[]>([]) // 文件列表
/** 任务 列表 */
defineOptions({ name: 'UserTask' })
const formLoading = ref(false)
const SYSTEM_TASK_STATUS = [
  { label: '待处理', value: 0 },
  { label: '处理中', value: 1 },
  { label: '已处理', value: 2 },
  { label: '已延期', value: 3 },
  { label: '已取消', value: 4 },
  { label: '已延期处理', value: 5 }
]

const SYSTEM_CREATE_CYCLE = [
  { label: '每天', value: 1 },
  { label: '每周', value: 2 },
  { label: '每月', value: 3 }
]

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserTask[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  title: undefined,
  taskTypeId: undefined,
  deptId: undefined,
  userId: undefined,
  level: undefined,
  startDate: [],
  planEndDate: [],
  status: undefined,
  progress: undefined,
  endDate: [],
  createCycle: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserTaskApi.getUserTaskPage(queryParams)
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

/** 文件数超出提示 */
const handleExceed = (): void => {
  message.error('最多只能上传一个文件！')
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await UserTaskApi.deleteUserTask(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除任务 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await UserTaskApi.deleteUserTaskList(checkedIds.value)
    checkedIds.value = []
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: UserTask[]) => {
  checkedIds.value = records.map((item) => item.id)
}

const handleImport = async (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) {
    return
  }
  const file = input.files[0]
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await UserTaskApi.handleImport(formData)
    console.log(res, 'res')
    if (res.code === 0) {
      ElMessage.success('导入成功')
      getList()
    } else {
      ElMessage.error(res.msg || '导入失败')
    }
  } catch (err) {
    ElMessage.error('上传失败')
    console.error(err)
  } finally {
    // 清空 input，否则同一文件无法重复上传
    input.value = ''
  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    // await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await UserTaskApi.downloadTemplate(queryParams)
    download.excel(data, '任务模版.xlsx')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 选中行操作 */
const currentRow = ref({}) // 选中行
const handleCurrentChange = (row) => {
  currentRow.value = row
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>

<style scoped>
.el-form-item {
  width: 100%;
}

.el-form-item__content .el-input,
.el-form-item__content .el-select {
  width: 100% !important;
}
</style>
