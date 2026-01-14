<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="分类类型" prop="classType">
        <el-select v-model="formData.classType" placeholder="请选择分类类型" :disabled="formType === 'update'">
          <el-option label="工作范畴" :value="1" />
          <el-option label="工作内容类型" :value="2" />
          <el-option label="任务目的" :value="3" />
          <el-option label="项目名称" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="部门" prop="deptId">
        <el-select v-model="formData.deptId" placeholder="请选择部门" clearable>
          <el-option v-for="dict in deptList" :key="dict.id" :label="dict.name" :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" placeholder="请输入排序" />
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
import { TaskClassApi, TaskClass } from '@/api/system/taskclass'

/** 任务分类 表单 */
defineOptions({ name: 'TaskClassForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref<TaskClass>({
  id: undefined,
  deptId: undefined,
  classType: 1,
  name: undefined,
  sort: 1
})
const formRules = reactive({
  classType: [{ required: true, message: '分类类型不能为空', trigger: 'change' }],
  name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, row?: TaskClass) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '新增分类' : '编辑分类'
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (type === 'update' && row) {
    formData.value = { ...row }
  }
  await getDeptList()
}

onMounted(() => {
  getDeptList()
})

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 查询部门列表 */
const deptList = ref<any[]>([])
const getDeptList = async () => {
  try {
    const data = await DeptApi.getDeptPage({ pageNo: 1, pageSize: 999 })
    deptList.value = data || []
  } catch (error) {
    console.error('获取部门列表失败', error)
    deptList.value = []
  }
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = { ...formData.value }
    if (formType.value === 'create') {
      // 新增时不传 id
      delete data.id
      await TaskClassApi.createTaskClass(data)
      message.success(t('common.createSuccess'))
    } else {
      // 修改时调用更新接口
      await TaskClassApi.updateTaskClass(data)
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
    deptId: undefined,
    classType: 1,
    name: undefined,
    sort: 1
  }
  formRef.value?.resetFields()
}
</script>

