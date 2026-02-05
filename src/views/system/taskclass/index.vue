<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="78px"
    >
      <el-row :gutter="16">
        <el-col :span="6">
          <el-form-item label="部门" prop="deptId">
            <el-select
              v-model="queryParams.deptId"
              placeholder="请选择部门"
              clearable
              class="!w-240px"
            >
              <el-option v-for="dict in deptList" :key="dict.id" :label="dict.name" :value="dict.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="分类类型" prop="classType">
            <el-select
              v-model="queryParams.classType"
              placeholder="请选择分类类型"
              clearable
              class="!w-240px"
            >
              <el-option label="工作范畴" :value="1" />
              <el-option label="工作内容类型" :value="2" />
              <el-option label="任务目的" :value="3" />
              <el-option label="项目名称" :value="4" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" style="display: flex; justify-content: flex-end">
          <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
          <el-button type="primary" plain @click="openForm('create')">
            <Icon icon="ep:plus" class="mr-5px" /> 新增分类
          </el-button>
        </el-col>
      </el-row>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      row-key="id"
    >
      <el-table-column type="index" width="68" label="序号" align="center" />
      <el-table-column label="分类类型" width="140" align="center" prop="classType">
        <template #default="scope">
          <span>{{ getClassTypeName(scope.row.classType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类名称" min-width="150" align="center" prop="name" />
      <el-table-column label="部门" width="120" align="center">
        <template #default="scope">
          <span>{{ getDeptName(scope.row.deptId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="负责人" min-width="120" align="center" prop="userNames" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'danger' : 'success'">
            {{ scope.row.status === 1 ? '停用' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" width="100" align="center" prop="sort" />
      <el-table-column label="操作" align="left" width="180px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row)"> 编辑 </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"> 删除 </el-button>
          <el-button link type="warning" @click="handleDisable(scope.row.id)" v-if="scope.row.classType == 4 && scope.row.status == 0">关闭</el-button>
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
  <TaskClassForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { TaskClassApi, TaskClass } from '@/api/system/taskclass'
import TaskClassForm from './TaskClassForm.vue'
import * as DeptApi from '@/api/system/dept'

/** 任务分类 列表 */
defineOptions({ name: 'TaskClass' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<TaskClass[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  deptId: undefined,
  classType: undefined
})
const queryFormRef = ref() // 搜索的表单

// 部门列表
const deptList = ref<any[]>([])

/** 获取分类类型名称 */
const getClassTypeName = (classType: number) => {
  const typeMap: Record<number, string> = {
    1: '工作范畴',
    2: '工作内容类型',
    3: '任务目的',
    4: '项目名称'
  }
  return typeMap[classType] || '-'
}

/** 获取部门名称 */
const getDeptName = (deptId?: number) => {
  if (!deptId) return '-'
  const dept = deptList.value.find((item) => item.id === deptId)
  return dept?.name || '-'
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNo: queryParams.pageNo,
      pageSize: queryParams.pageSize
    }
    if (queryParams.deptId) {
      params.deptId = queryParams.deptId
    }
    if (queryParams.classType) {
      params.classType = queryParams.classType
    }
    const data = await TaskClassApi.getTaskClassList(params)
    // 如果返回的是分页数据，使用 data.list 和 data.total
    if (data && typeof data === 'object' && 'list' in data) {
      list.value = data.list || []
      total.value = data.total || 0
    } else {
      // 兼容旧格式，直接返回数组
      list.value = Array.isArray(data) ? data : []
    total.value = list.value.length
    }
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, row?: TaskClass) => {
  formRef.value.open(type, row)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await TaskClassApi.deleteTaskClass(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 关闭/禁用分类操作 */
const handleDisable = async (id: number) => {
  try {
    await message.confirm('确定要关闭该分类吗？')
    await TaskClassApi.disableTaskClass(id)
    message.success('关闭成功')
    await getList()
  } catch {}
}

/** 初始化部门列表 */
const initDeptList = async () => {
  try {
    const data = await DeptApi.getDeptPage({ pageNo: 1, pageSize: 999 })
    deptList.value = data || []
  } catch (error) {
    console.error('获取部门列表失败', error)
    deptList.value = []
  }
}

/** 初始化 **/
onMounted(() => {
  initDeptList()
  getList()
})
</script>

