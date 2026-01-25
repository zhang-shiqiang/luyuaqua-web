<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      v-loading="formLoading"
    >
      <!-- 子部门选择（仅在有子部门时显示） -->
      <el-form-item label="部门" prop="deptId" v-if="subDeptList.length > 0">
        <el-select
          v-model="formData.deptId"
          placeholder="请选择部门"
          @change="handleSelectDept"
          class="!w-100%"
        >
          <el-option
            v-for="dict in subDeptList"
            :key="dict.id"
            :label="dict.name"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>

      <!-- 类型选项已隐藏，所有部门默认选中"常规事项" -->
      <el-form-item label="任务内容" prop="title">
        <el-input
          v-model="formData.title"
          v-if="titleList?.length == 0"
          placeholder="请输入任务内容"
          class="!w-100%"
        />
        <el-select v-else v-model="formData.title" placeholder="请选择任务内容" class="!w-100%">
          <el-option
            v-for="dict in titleList"
            :key="dict.name"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>

      <!-- 分配给员工（仅领导可见） -->
      <el-form-item label="分配给员工" prop="userId" v-if="userRole === 'leader'">
        <el-select v-model="formData.userId" filterable placeholder="请选择员工" class="!w-100%">
          <el-option
            v-for="dict in userList"
            :key="dict.id"
            :label="dict.nickname"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>

      <!-- 计划开始日期 -->
      <el-form-item label="计划开始日期" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择计划开始日期"
          class="!w-100%"
        />
      </el-form-item>

      <!-- 计划完成日期 -->
      <el-form-item label="计划完成日期" prop="planEndDate">
        <el-date-picker
          v-model="formData.planEndDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择计划完成日期"
          :disabled-date="
            (time: Date) => time.getTime() < new Date(formData.startDate || '').getTime()
          "
          class="!w-100%"
        />
        <div style="margin-top: 4px; font-size: 12px; color: #f66">
          注：计划完成日期设置后不可更改
        </div>
      </el-form-item>

      <!-- 是否归属项目 -->
      <el-form-item label="是否归属项目" prop="isProjectTask">
        <el-select
          v-model="formData.isProjectTask"
          placeholder="请选择是否归属项目"
          @change="handleProjectTaskChange"
          class="!w-100%"
          filterable
        >
          <el-option
            v-for="item in isProjectTaskOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 项目名称（条件显示） -->
      <el-form-item label="项目名称" prop="taskProjectId" v-if="formData.isProjectTask === '是'">
        <el-select
          v-model="formData.taskProjectId"
          filterable
          placeholder="请选择项目"
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

      <!-- 工作范畴（非养殖部显示） -->
      <el-form-item label="工作范畴" prop="workScopeId" v-if="shiftType !== 2">
        <el-select
          v-model="formData.workScopeId"
          placeholder="请选择工作范畴"
          @change="handleWorkScopeChange"
          class="!w-100%"
          filterable
        >
          <el-option
            v-for="item in workScopeOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 工作内容类型（非养殖部显示） -->
      <el-form-item label="工作内容类型" prop="workContentId" v-if="shiftType !== 2">
        <el-select
          v-model="formData.workContentId"
          placeholder="请选择工作内容类型"
          @change="handleWorkContentChange"
          class="!w-100%"
          filterable
        >
          <el-option
            v-for="item in workContentOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 任务目的（非养殖部显示） -->
      <el-form-item label="任务目的" prop="taskTargetId" v-if="shiftType !== 2">
        <el-select
          v-model="formData.taskTargetId"
          placeholder="请选择任务目的"
          @change="handleTaskTargetChange"
          class="!w-100%"
          filterable
        >
          <el-option
            v-for="item in taskTargetOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 重要程度 -->
      <el-form-item label="重要程度" prop="importantFlag">
        <el-select
          v-model="formData.importantFlag"
          placeholder="请选择任务重要程度"
          @change="handleImportantFlagChange"
          class="!w-100%"
          filterable
        >
          <el-option
            v-for="item in importantFlagList"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 班次（养殖部显示） -->
      <el-form-item label="班次" prop="shiftTypeValue" v-if="shiftType === 2">
        <el-select
          v-model="formData.shiftTypeValue"
          filterable
          placeholder="请选择班次"
          class="!w-100%"
        >
          <el-option
            v-for="dict in timeOptions"
            :key="dict.value"
            :label="dict.text"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>

      <!-- 协同人员 -->
      <el-form-item label="协同人员">
        <el-select
          v-model="formData.assistantUserIds"
          multiple
          filterable
          placeholder="请选择协同人员"
          @change="handleAssistantUsersChange"
          class="!w-100%"
        >
          <el-option
            v-for="user in collaborativePersonnel"
            :key="user.id"
            :label="user.nickname"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          placeholder="请输入备注"
          :rows="4"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import * as DeptApi from '@/api/system/dept'
import * as UserApi from '@/api/system/user'
import { UserTaskApi } from '@/api/system/usertask'
import { TaskTypeApi } from '@/api/system/tasktype'
import { getUserIdentity, getUserDeptId } from '@/utils/userRole'
import { ref, computed, onMounted } from 'vue'
import request from '@/config/axios'

/** 任务 表单 */
defineOptions({ name: 'UserTaskForm' })

const timeOptions = ref([
  { text: '早班（8:00-12:00）', value: 1 },
  { text: '中班（12:00-22:00）', value: 2 },
  { text: '晚班（22:00-8:00）', value: 3 }
])

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

// 用户身份和部门信息
const userRole = getUserIdentity() // 获取用户身份
const shiftType = getUserDeptId() // 获取 shiftType

// 列表数据
const userList = ref<any>([])
const deptList = ref<any>([])
const subDeptList = ref<any>([]) // 子部门列表
const collaborativePersonnel = ref<any>([]) // 协同人员列表
const projectList = ref<any>([]) // 项目列表
const workScopeOptions = ref<any>([]) // 工作范畴选项
const workContentOptions = ref<any>([]) // 工作内容类型选项
const taskTargetOptions = ref<any>([]) // 任务目的选项

// 选项数据
const importantFlagList = ref([
  { text: '普通', value: 1 },
  { text: '一般重要', value: 2 },
  { text: '重要', value: 3 }
])

const isProjectTaskOptions = ref([
  { text: '是', value: '是' },
  { text: '否', value: '否' }
])

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const deptName = ref('')

const formData = ref({
  id: undefined,
  title: undefined,
  taskTypeId: undefined,
  content: undefined,
  deptId: undefined,
  userId: undefined,
  level: undefined,
  startDate: undefined,
  planEndDate: undefined,
  status: undefined,
  progress: undefined,
  assistant: undefined,
  endDate: undefined,
  createCycle: undefined,
  shiftTypeValue: 1,
  // 新增字段
  importantFlag: undefined as number | undefined,
  importantFlagName: undefined as string | undefined,
  assistantUserIds: [] as number[],
  assistantUserNames: '',
  workScopeId: undefined,
  workScopeName: undefined,
  workContentId: undefined,
  workContentName: undefined,
  taskTargetId: undefined,
  taskTargetName: undefined,
  isProjectTask: undefined,
  taskProjectId: undefined,
  projectName: undefined
})

// 计算属性：备注是否必填
const isRemarkRequired = computed(() => {
  return (
    formData.value.workScopeName === '其他' ||
    formData.value.workContentName === '其他' ||
    formData.value.taskTargetName === '其他'
  )
})

const formRules = reactive({
  title: [{ required: true, message: '任务内容不能为空', trigger: 'blur' }],
  deptId: [
    {
      required: true,
      validator: (_rule: any, value: any, callback: any) => {
        if (subDeptList.value.length > 0 && !value) {
          callback(new Error('请选择部门'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  userId: [
    {
      required: false,
      validator: (_rule: any, value: any, callback: any) => {
        if (userRole === 'leader' && !value) {
          callback(new Error('请选择分配给员工'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  startDate: [{ required: true, message: '计划开始日期不能为空', trigger: 'blur' }],
  planEndDate: [{ required: true, message: '计划完成日期不能为空', trigger: 'blur' }],
  importantFlag: [{ required: true, message: '请选择任务重要程度', trigger: 'change' }],
  shiftTypeValue: [
    {
      required: false,
      validator: (_rule: any, value: any, callback: any) => {
        if (shiftType === 2 && !value) {
          callback(new Error('请选择班次'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  workScopeId: [
    {
      required: false,
      validator: (_rule: any, value: any, callback: any) => {
        if (shiftType !== 2 && !value) {
          callback(new Error('请选择工作范畴'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  workContentId: [
    {
      required: false,
      validator: (_rule: any, value: any, callback: any) => {
        if (shiftType !== 2 && !value) {
          callback(new Error('请选择工作内容类型'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  taskTargetId: [
    {
      required: false,
      validator: (_rule: any, value: any, callback: any) => {
        if (shiftType !== 2 && !value) {
          callback(new Error('请选择任务目的'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  isProjectTask: [{ required: true, message: '请选择是否归属项目', trigger: 'change' }],
  taskProjectId: [
    {
      required: false,
      validator: (_rule: any, value: any, callback: any) => {
        if (formData.value.isProjectTask === '是' && !value) {
          callback(new Error('请选择项目'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  content: [
    {
      required: false,
      validator: (_rule: any, value: any, callback: any) => {
        if (isRemarkRequired.value && !value) {
          callback(new Error('选择了"其他"时，备注为必填项'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await UserTaskApi.getUserTask(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

onMounted(() => {
  getList()
  initData()
})

/**
 * 初始化数据
 */
const initData = async () => {
  await getSubDeptList()
  await getWorkScopeList()
  await getWorkContentList()
  await getTaskTargetList()
  await getProjectList()
  // 加载全部协同人员（不限制部门）
  await loadAllCollaborativePersonnel()
  // 获取当前用户部门信息
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
  const userInfoData = JSON.parse(userInfo.v || '{}')
  const currentDeptId = userInfoData?.user?.deptId
  if (currentDeptId) {
    await getDeptUsers(currentDeptId)
    // 自动获取"常规事项"并加载子类型
    await getTaskTypeList(currentDeptId)
  }
}

/**
 * 获取任务类型列表
 * 所有部门默认选中"常规事项"
 */
const titleList = ref<any[]>([])
const getTaskTypeList = async (deptId: number) => {
  try {
    const params = {
      parentId: 0,
      deptId: deptId || 0
    }
    const data = await TaskTypeApi.getTaskTypeList(params)
    // 所有部门都默认选中"常规事项"
    const list = data.filter((item: any) => item.name == '常规事项')
    if (list && list.length > 0) {
      formData.value.taskTypeId = list[0].id
      // 加载"常规事项"的子类型列表
      const childData = await TaskTypeApi.getTaskTypeList({
        parentId: list[0].id,
        deptId: deptId || 0
      })
      titleList.value = childData || []
    } else {
      titleList.value = []
    }
  } catch (error) {
    console.error('获取任务类型失败', error)
    titleList.value = []
  }
}

const handleSelectDept = async (val) => {
  const selectedDept = subDeptList.value.find((x) => x.id == val)
  if (selectedDept) {
    deptName.value = selectedDept.name
  }
  const data = await UserApi.getDeptUsers({ id: val } as any)
  userList.value = data
  // 更新任务类型列表
  await getTaskTypeList(val)
  // 协同人员列表不再根据部门更新，保持全部人员
}

/** 查询部门列表 */
const getList = async () => {
  const data = await DeptApi.getDeptPage({ pageNo: 1, pageSize: 999 })
  deptList.value = data.list || data
}

/**
 * 获取子部门列表
 */
const getSubDeptList = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
    const userInfoData = JSON.parse(userInfo.v || '{}')
    const deptId = userInfoData?.user?.deptId
    if (!deptId) {
      return
    }
    const data = await request.get({ url: '/system/dept/getSubDeptList', params: { deptId } })
    if (data) {
      subDeptList.value = data || []
    }
  } catch (error) {
    console.error('获取子部门列表失败', error)
  }
}

/**
 * 获取工作范畴列表
 */
const getWorkScopeList = async () => {
  try {
    const data = await request.get({ url: '/system/task-class/list', params: { classType: 1 } })
    if (data) {
      workScopeOptions.value = (data || []).map((item: any) => ({
        text: item.name,
        value: item.id
      }))
    }
  } catch (error) {
    console.error('获取工作范畴失败', error)
  }
}

/**
 * 获取工作内容类型列表
 */
const getWorkContentList = async () => {
  try {
    const data = await request.get({ url: '/system/task-class/list', params: { classType: 2 } })
    if (data) {
      workContentOptions.value = (data || []).map((item: any) => ({
        text: item.name,
        value: item.id
      }))
    }
  } catch (error) {
    console.error('获取工作内容类型失败', error)
  }
}

/**
 * 获取任务目的列表
 */
const getTaskTargetList = async () => {
  try {
    const data = await request.get({ url: '/system/task-class/list', params: { classType: 3 } })
    if (data) {
      taskTargetOptions.value = (data || []).map((item: any) => ({
        text: item.name,
        value: item.id
      }))
    }
  } catch (error) {
    console.error('获取任务目的失败', error)
  }
}

/**
 * 获取项目列表
 */
const getProjectList = async () => {
  try {
    const data = await request.get({ url: '/system/task-class/list', params: { classType: 4 } })
    if (data) {
      projectList.value = data || []
    }
  } catch (error) {
    console.error('获取项目列表失败', error)
  }
}

/**
 * 根据部门获取用户列表
 */
const getDeptUsers = async (deptId: number) => {
  try {
    const data = await UserApi.getDeptUsers({ id: deptId } as any)
    userList.value = data
  } catch (error) {
    console.error('获取部门员工失败', error)
  }
}

/**
 * 加载协同人员列表
 * @param deptId 部门ID
 */
const loadCollaborativePersonnel = async (deptId: number) => {
  try {
    if (!deptId) return
    const data = await UserApi.getDeptUsers({ id: deptId } as any)
    collaborativePersonnel.value = data || []
  } catch (error) {
    console.error('获取协同人员失败', error)
  }
}

/**
 * 加载全部协同人员列表
 */
const loadAllCollaborativePersonnel = async () => {
  try {
    const data = await UserApi.getSimpleUserList()
    collaborativePersonnel.value = data || []
  } catch (error) {
    console.error('获取协同人员失败', error)
  }
}

/**
 * 处理工作范畴变化
 */
const handleWorkScopeChange = (value: number) => {
  const selected = workScopeOptions.value.find((item) => item.value === value)
  if (selected) {
    formData.value.workScopeName = selected.text
  }
}

/**
 * 处理工作内容类型变化
 */
const handleWorkContentChange = (value: number) => {
  const selected = workContentOptions.value.find((item) => item.value === value)
  if (selected) {
    formData.value.workContentName = selected.text
  }
}

/**
 * 处理任务目的变化
 */
const handleTaskTargetChange = (value: number) => {
  const selected = taskTargetOptions.value.find((item) => item.value === value)
  if (selected) {
    formData.value.taskTargetName = selected.text
  }
}

/**
 * 处理重要程度变化
 */
const handleImportantFlagChange = (value: number) => {
  const selected = importantFlagList.value.find((item) => item.value === value)
  if (selected) {
    formData.value.importantFlagName = selected.text
  }
}

/**
 * 处理是否归属项目变化
 */
const handleProjectTaskChange = (value: string) => {
  if (value === '否') {
    formData.value.taskProjectId = undefined
    formData.value.projectName = undefined
  }
}

/**
 * 处理协同人员变化
 */
const handleAssistantUsersChange = (value: number[]) => {
  formData.value.assistantUserIds = value
  const names = collaborativePersonnel.value
    .filter((user) => value.includes(user.id))
    .map((user) => user.nickname)
    .join(', ')
  formData.value.assistantUserNames = names
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
    const userInfoData = JSON.parse(userInfo.v || '{}')
    const currentDeptId = userInfoData?.user?.deptId
    const currentUserId = userInfoData?.user?.id

    const submitData = {
      ...formData.value,
      deptId: formData.value.deptId || currentDeptId,
      userId: formData.value.userId || currentUserId,
      status: 0,
      progress: 0,
      taskClass: formData.value.workScopeId,
      workContentId: formData.value.workContentId,
      taskTargetId: formData.value.taskTargetId,
      taskProjectId: formData.value.taskProjectId,
      assistantUserIds: formData.value.assistantUserIds
    }

    if (formType.value === 'create') {
      await UserTaskApi.createUserTask(submitData as any)
      message.success(t('common.createSuccess'))
    } else {
      await UserTaskApi.updateUserTask(submitData as any)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    title: undefined,
    taskTypeId: undefined,
    content: undefined,
    deptId: undefined,
    userId: undefined,
    level: undefined,
    startDate: undefined,
    planEndDate: undefined,
    status: undefined,
    progress: undefined,
    assistant: undefined,
    endDate: undefined,
    createCycle: undefined,
    shiftTypeValue: 1,
    importantFlag: undefined,
    importantFlagName: undefined,
    assistantUserIds: [],
    assistantUserNames: '',
    workScopeId: undefined,
    workScopeName: undefined,
    workContentId: undefined,
    workContentName: undefined,
    taskTargetId: undefined,
    taskTargetName: undefined,
    isProjectTask: undefined,
    taskProjectId: undefined,
    projectName: undefined
  }
  formRef.value?.resetFields()
}
</script>
