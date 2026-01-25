<template>
  <ContentWrap>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="98px"
    >
      <el-row :gutter="16" class="mb-16px">
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
          <el-form-item label="部门" prop="deptId">
            <el-select
              v-model="queryParams.deptId"
              placeholder="请选择部门"
              clearable
              filterable
              class="!w-100%"
            >
              <el-option
                v-for="dept in deptList"
                :key="dept.id"
                :label="dept.name"
                :value="dept.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="责任人" prop="userId">
            <el-select
              v-model="queryParams.userId"
              placeholder="请选择责任人"
              clearable
              filterable
              class="!w-100%"
            >
              <el-option
                v-for="user in userList"
                :key="user.id"
                :label="user.nickname"
                :value="user.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择任务状态"
              clearable
              class="!w-100%"
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
        <el-col :span="6">
          <el-form-item label="重要程度" prop="importantFlag">
            <el-select
              v-model="queryParams.importantFlag"
              placeholder="请选择重要程度"
              clearable
              class="!w-100%"
            >
              <el-option label="普通" :value="1" />
              <el-option label="一般重要" :value="2" />
              <el-option label="重要" :value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="工作范畴" prop="taskClass">
            <el-select
              v-model="queryParams.taskClass"
              placeholder="请选择工作范畴"
              clearable
              filterable
              class="!w-100%"
            >
              <el-option
                v-for="item in workScopeOptions"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="项目" prop="projectId">
            <el-select
              v-model="queryParams.projectId"
              placeholder="请选择项目"
              clearable
              filterable
              class="!w-100%"
            >
              <el-option
                v-for="item in projectList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="工作目的" prop="taskTargetId">
            <el-select
              v-model="queryParams.taskTargetId"
              placeholder="请选择工作目的"
              clearable
              filterable
              class="!w-100%"
            >
              <el-option
                v-for="item in taskTargetOptions"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="工作内容" prop="workContentId">
            <el-select
              v-model="queryParams.workContentId"
              placeholder="请选择工作内容"
              clearable
              filterable
              class="!w-100%"
            >
              <el-option
                v-for="item in workContentOptions"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="计划开始日期" prop="startDate">
            <el-date-picker
              v-model="queryParams.startDate"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="实际开始日期" prop="actualStartDate">
            <el-date-picker
              v-model="queryParams.actualStartDate"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="计划完成日期" prop="planEndDate">
            <el-date-picker
              v-model="queryParams.planEndDate"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="实际完成日期" prop="endDate">
            <el-date-picker
              v-model="queryParams.endDate"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="!w-100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="专注任务" prop="focusFlag">
            <el-select
              v-model="queryParams.focusFlag"
              placeholder="请选择是否专注"
              clearable
              class="!w-100%"
            >
              <el-option label="否" :value="0" />
              <el-option label="是" :value="1" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" style="display: flex; justify-content: flex-start">
          <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
          <el-button type="primary" plain @click="openForm('create')">
            <Icon icon="ep:plus" class="mr-5px" /> 新增
          </el-button>
          <!-- <el-button
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
          </el-button> -->

          <el-button type="primary" plain @click="handleExportExcel" :loading="exportLoading">
            <Icon icon="ep:download" class="mr-5px" /> 导出
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
      <el-table-column type="index" width="68" label="序号" align="center" fixed />
      <el-table-column
        label="任务名称"
        min-width="180"
        show-overflow-tooltip
        align="center"
        fixed
        prop="title"
      >
        <template #default="scope">
          <el-link type="primary" @click="handleViewDetail(scope.row.id)">
            {{ scope.row.title }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="部门" width="120" align="center" prop="deptName" />
      <el-table-column label="责任人" width="120" align="center" prop="userName" />
      <el-table-column label="任务状态" align="center" width="120" prop="status">
        <template #default="scope">
          <span>{{
            SYSTEM_TASK_STATUS.find((x) => x.value == scope.row.status)?.label || '-'
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="重要程度" align="center" width="100" prop="importantFlag">
        <template #default="{ row }">
          <span>{{ importantFlagEnums[row.importantFlag] || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工作范畴" width="120" align="center" prop="taskClassName" />
      <el-table-column label="工作内容" width="120" align="center" prop="workContentName" />
      <el-table-column label="工作目的" width="120" align="center" prop="taskTargetName" />
      <el-table-column label="项目" width="120" align="center" prop="taskProjectName" />
      <el-table-column label="专注任务" align="center" width="100" prop="focusFlag">
        <template #default="{ row }">
          <span>{{ focusFlagEnums[row.focusFlag] || '-' }}</span>
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
      <el-table-column label="专注任务" align="center" width="120" prop="focusFlag">
        <template #default="{ row }">
          <span>{{ focusFlagEnums[row.focusFlag] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="专注次数" width="120" align="center" prop="focusCount" />
      <el-table-column
        label="专注时间"
        show-overflow-tooltip
        width="180"
        align="center"
        :formatter="dateFormatter"
        prop="focusTime"
      />
      <el-table-column label="班次" align="center" width="120" prop="shiftTypeValue">
        <template #default="{ row }">
          <span>{{ banciEnum[row.shiftTypeValue] }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="计划开始日期"
        align="center"
        prop="startDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="实际开始时间"
        align="center"
        prop="actualStartDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="计划完成日期"
        align="center"
        prop="planEndDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="实际完成时间"
        align="center"
        prop="endDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="协同人员" align="center" width="160" prop="userTaskAssistantDOS">
        <template #default="{ row }">
          <span>{{ row.userTaskAssistantDOS?.map((x) => x.userName).join(',') || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="描述"
        width="200"
        align="center"
        prop="content"
        show-overflow-tooltip
      />
      <el-table-column label="操作" fixed="right" align="center" min-width="240px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="handleViewDetail(scope.row.id)"
            v-hasPermi="['system:user-task:query']"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleUploadAttachment(scope.row.id)"
            v-hasPermi="['system:user-task:update']"
          >
            上传附件
          </el-button>
          <el-button
            link
            type="primary"
            @click="handleViewAttachment(scope.row.id)"
            v-hasPermi="['system:user-task:query']"
          >
            附件
          </el-button>
          <!-- <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['system:user-task:update']"
          >
            编辑
          </el-button> -->
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
  <!-- 任务详情弹窗 -->
  <TaskDetailDialog
    v-model="showTaskDetail"
    :task-id="currentTaskId"
    @refresh="getList"
  />
  <!-- 上传附件弹窗 -->
  <UploadAttachmentForm ref="uploadAttachmentFormRef" @success="handleUploadSuccess" />
  <!-- 附件列表弹窗 -->
  <TaskAttachmentList ref="taskAttachmentListRef" />
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
import TaskDetailDialog from '../board/TaskDetailDialog.vue'
import TaskProgressInfoList from './components/TaskProgressInfoList.vue'
import UploadAttachmentForm from './components/UploadAttachmentForm.vue'
import TaskAttachmentList from './components/TaskAttachmentList.vue'
import { getUserIdentity } from '@/utils/userRole'
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import request from '@/config/axios'
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

const importantFlagEnums: any = {
  '1': '普通',
  '2': '一般重要',
  '3': '重要'
}

const SYSTEM_CREATE_CYCLE = [
  { label: '每天', value: 1 },
  { label: '每周', value: 2 },
  { label: '每月', value: 3 }
]

const banciEnum = {
  '1': '早班',
  '2': '中班',
  '3': '晚班'
}

const focusFlagEnums: any = {
  '1': '是',
  '0': '否'
}

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserTask[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  title: undefined,
  deptId: undefined,
  userId: undefined,
  status: undefined,
  importantFlag: undefined,
  taskClass: undefined,
  projectId: undefined,
  taskTargetId: undefined,
  workContentId: undefined,
  createTime: [],
  startDate: [],
  actualStartDate: [],
  planEndDate: [],
  endDate: [],
  focusFlag: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// 选项数据
const deptList = ref<any[]>([])
const userList = ref<any[]>([])
const workScopeOptions = ref<any[]>([]) // 工作范畴选项
const workContentOptions = ref<any[]>([]) // 工作内容类型选项
const taskTargetOptions = ref<any[]>([]) // 任务目的选项
const projectList = ref<any[]>([]) // 项目列表

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    // 处理日期范围参数
    const params: any = { ...queryParams }
    // 将日期范围数组转换为字符串格式
    if (params.createTime && Array.isArray(params.createTime) && params.createTime.length === 2) {
      params.createTime = params.createTime.join(',')
    }
    if (params.startDate && Array.isArray(params.startDate) && params.startDate.length === 2) {
      params.startDate = params.startDate.join(',')
    }
    if (
      params.actualStartDate &&
      Array.isArray(params.actualStartDate) &&
      params.actualStartDate.length === 2
    ) {
      params.actualStartDate = params.actualStartDate.join(',')
    }
    if (
      params.planEndDate &&
      Array.isArray(params.planEndDate) &&
      params.planEndDate.length === 2
    ) {
      params.planEndDate = params.planEndDate.join(',')
    }
    if (params.endDate && Array.isArray(params.endDate) && params.endDate.length === 2) {
      params.endDate = params.endDate.join(',')
    }
    const data = await UserTaskApi.getUserTaskPage(params)
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

/** 查看详情操作 */
const showTaskDetail = ref(false)
const currentTaskId = ref(0)
const handleViewDetail = (taskId: number) => {
  currentTaskId.value = taskId
  showTaskDetail.value = true
}

/** 上传附件操作 */
const uploadAttachmentFormRef = ref()
const handleUploadAttachment = (taskId: number) => {
  uploadAttachmentFormRef.value?.open(taskId)
}

/** 查看附件操作 */
const taskAttachmentListRef = ref()
const handleViewAttachment = (taskId: number) => {
  taskAttachmentListRef.value?.open(taskId)
}

/** 上传附件成功回调 */
const handleUploadSuccess = () => {
  // 上传成功后可以刷新列表或执行其他操作
  // getList()
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

/** 导出 Excel 按钮操作 */
const handleExportExcel = async () => {
  try {
    exportLoading.value = true
    // 使用 request.download 确保携带 Authorization 头
    const blob = await UserTaskApi.exportUserTask(queryParams)
    // 使用 downloadByData 触发浏览器下载
    const { downloadByData } = await import('@/utils/filt')
    downloadByData(blob, '任务数据.xlsx')
    message.success('导出成功')
  } catch (error: any) {
    console.error('导出失败', error)
    message.error(error.message || '导出失败')
  } finally {
    exportLoading.value = false
  }
}

/** 导出模版按钮操作 */
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

/**
 * 初始化选项数据
 */
const initOptions = async () => {
  try {
    // 获取部门列表
    deptList.value = await DeptApi.getSimpleDeptList()
    // 获取用户列表
    userList.value = await UserApi.getSimpleUserList()
    // 获取工作范畴列表
    const workScopeData = await request.get({
      url: '/system/task-class/list',
      params: { classType: 1 }
    })
    if (workScopeData) {
      workScopeOptions.value = (workScopeData || []).map((item: any) => ({
        text: item.name,
        value: item.id
      }))
    }
    // 获取工作内容类型列表
    const workContentData = await request.get({
      url: '/system/task-class/list',
      params: { classType: 2 }
    })
    if (workContentData) {
      workContentOptions.value = (workContentData || []).map((item: any) => ({
        text: item.name,
        value: item.id
      }))
    }
    // 获取任务目的列表
    const taskTargetData = await request.get({
      url: '/system/task-class/list',
      params: { classType: 3 }
    })
    if (taskTargetData) {
      taskTargetOptions.value = (taskTargetData || []).map((item: any) => ({
        text: item.name,
        value: item.id
      }))
    }
    // 获取项目列表
    const projectData = await request.get({
      url: '/system/task-class/list',
      params: { classType: 4 }
    })
    if (projectData) {
      projectList.value = projectData || []
    }
  } catch (error) {
    console.error('初始化选项数据失败', error)
  }
}

/** 初始化 **/
onMounted(() => {
  initOptions()
  getList()
})
</script>

<style scoped>
.el-form-item {
  width: 100%;
  margin-bottom: 8px !important;
}

.el-form-item__content .el-input,
.el-form-item__content .el-select {
  width: 100% !important;
}
</style>
