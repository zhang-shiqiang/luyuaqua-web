<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      v-loading="formLoading"
    >
      <el-form-item label="部门" prop="deptId">
        <el-select v-model="formData.deptId" placeholder="请选择部门" @change="handleSelectDept">
          <el-option v-for="dict in deptList" :key="dict.id" :label="dict.name" :value="dict.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="班次" prop="shiftTypeValue" v-if="deptName == '养殖部'">
        <el-select v-model="formData.shiftTypeValue" placeholder="请选择班次">
          <el-option
            v-for="dict in timeOptions"
            :key="dict.value"
            :label="dict.text"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="taskTypeId">
        <el-select
          v-model="formData.taskTypeId"
          placeholder="请选择任务类型"
          @change="handleSelectType"
        >
          <el-option v-for="dict in typeList" :key="dict.id" :label="dict.name" :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="formData.title"
          v-if="typeList?.length == 0"
          placeholder="请输入任务标题"
        />
        <el-select v-else v-model="formData.title" placeholder="请选择任务">
          <el-option
            v-for="dict in titleList"
            :key="dict.name"
            :label="dict.name"
            :value="dict.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="content">
        <el-input v-model="formData.content" type="textarea" placeholder="请输入任务描述" />
      </el-form-item>
      <el-form-item label="用户" prop="userId">
        <el-select v-model="formData.userId" placeholder="请选择用户">
          <el-option
            v-for="dict in userList"
            :key="dict.id"
            :label="dict.nickname"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="配合人员" prop="assistant">
        <el-input v-model="formData.assistant" placeholder="请输入配合人员/部门" />
      </el-form-item>
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="formData.startDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择任务开始日期"
        />
      </el-form-item>
      <el-form-item label="完成日期" prop="planEndDate">
        <el-date-picker
          v-model="formData.planEndDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="预计完成日期"
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
import { UserTaskApi, UserTask } from '@/api/system/usertask'
import { TaskTypeApi } from '@/api/system/tasktype'
import { ref } from 'vue'

/** 任务 表单 */
defineOptions({ name: 'UserTaskForm' })

const timeOptions = ref([
  { text: '早班（8:00-12:00）', value: 1 },
  { text: '中班（12:00-22:00）', value: 2 },
  { text: '晚班（22:00-8:00）', value: 3 }
])

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const userList = ref<any>([])
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
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
  shiftTypeValue: 1
})

const deptName = ref('')

const formRules = reactive({
  title: [{ required: true, message: '任务标题不能为空', trigger: 'blur' }],
  taskTypeId: [{ required: true, message: '任务类型不能为空', trigger: 'blur' }],
  deptId: [{ required: true, message: '部门不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '用户不能为空', trigger: 'blur' }],
  startDate: [{ required: true, message: '任务开始日期不能为空', trigger: 'blur' }],
  planEndDate: [{ required: true, message: '预计完成日期不能为空', trigger: 'blur' }],
  status: [
    {
      required: true,
      message: '任务状态（0未处理 1处理中2已处理3已延期4已取消5已延期处理）不能为空',
      trigger: 'blur'
    }
  ],
  progress: [{ required: true, message: '进度不能为空', trigger: 'blur' }]
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

const deptList = ref<any>([])

onMounted(() => {
  getList()
})

/** 查询任务类型列表 */
const typeList = ref<any>()
const getTypeList = async (id) => {
  const data = await TaskTypeApi.getTaskTypeList({ parentId: 0, deptId: id })
  typeList.value = data
}

const handleSelectDept = async (val) => {
  const data = await UserApi.getDeptUsers({ id: val } as any)
  deptName.value = deptList.value.find((x) => x.id == val).name
  userList.value = data
  getTypeList(val)
}

const titleList = ref()
const handleSelectType = async (val) => {
  const data = await TaskTypeApi.getTaskTypeList({ parentId: val, deptId: formData.value.deptId })
  titleList.value = data
}

/** 查询部门列表 */
const getList = async () => {
  const data = await DeptApi.getDeptPage({ pageNo: 1, pageSize: 999 })
  deptList.value = data
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as UserTask
    if (formType.value === 'create') {
      await UserTaskApi.createUserTask({ ...data, status: 0, progress: 0 })
      message.success(t('common.createSuccess'))
    } else {
      await UserTaskApi.updateUserTask(data)
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
    shiftTypeValue: 1
  }
  formRef.value?.resetFields()
}
</script>
