<template>
  <Dialog v-model="dialogVisible" title="附件列表" width="1200px">
    <el-table v-loading="loading" :data="list" style="width: 100%">
      <el-table-column type="selection" width="55" />
      <el-table-column label="文件名" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="文件路径" align="center" prop="path" :show-overflow-tooltip="true" />
      <el-table-column label="URL" align="center" prop="url" :show-overflow-tooltip="true" />
      <el-table-column
        label="文件大小"
        align="center"
        prop="size"
        width="120"
        :formatter="fileSizeFormatter"
      />
      <el-table-column label="文件类型" align="center" prop="type" width="180px" />
      <el-table-column label="文件内容" align="center" prop="url" width="110px">
        <template #default="{ row }">
          <el-image
            v-if="row.type && row.type.includes('image')"
            class="h-80px w-80px"
            lazy
            :src="row.url"
            :preview-src-list="[row.url]"
            preview-teleported
            fit="cover"
          />
          <el-link
            v-else-if="row.type && row.type.includes('pdf')"
            type="primary"
            :href="row.url"
            :underline="false"
            target="_blank"
            >预览</el-link
          >
          <el-link v-else type="primary" download :href="row.url" :underline="false" target="_blank"
            >下载</el-link
          >
        </template>
      </el-table-column>
      <el-table-column
        label="上传时间"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="操作" align="center" width="100">
        <template #default="scope">
          <el-button link type="primary" @click="handleDownload(scope.row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
  </Dialog>
</template>
<script lang="ts" setup>
import { fileSizeFormatter } from '@/utils'
import { dateFormatter } from '@/utils/formatTime'
import { UserTaskApi } from '@/api/system/usertask'
import request from '@/config/axios'

defineOptions({ name: 'TaskAttachmentList' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const loading = ref(false) // 列表的加载中
const list = ref<any[]>([]) // 列表的数据
const currentTaskId = ref<number>()

/** 打开弹窗 */
const open = async (taskId: number) => {
  dialogVisible.value = true
  currentTaskId.value = taskId
  await getList()
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 查询列表 */
const getList = async () => {
  if (!currentTaskId.value) return
  loading.value = true
  try {
    const data = await UserTaskApi.getTaskFileList(currentTaskId.value)
    list.value = data || []
  } catch (error) {
    console.error('获取文件列表失败', error)
    list.value = []
  } finally {
    loading.value = false
  }
}

/** 下载文件 */
const handleDownload = async (row: any) => {
  try {
    // 调用 /infra/file/29/get/ + 文件路径
    const downloadUrl = `/infra/file/29/get/${encodeURIComponent(row.path)}`

    // 使用 request.download 下载文件
    const blob = await request.download({ url: downloadUrl })

    // 使用 downloadByData 处理下载
    const { downloadByData } = await import('@/utils/filt')
    downloadByData(blob, row.name)

    message.success('下载成功')
  } catch (error: any) {
    console.error('下载失败', error)
    message.error(error.message || '下载失败')
  }
}
</script>
