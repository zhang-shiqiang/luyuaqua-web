<template>
  <Dialog v-model="dialogVisible" title="上传附件">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="uploadUrl"
      :auto-upload="false"
      :data="data"
      :disabled="formLoading"
      :limit="1"
      :on-change="handleFileChange"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      :http-request="httpRequest"
      accept=".jpg,.png,.gif,.word,.excel,.ppt,.zip,.doc,.docx,.xls,.xlsx,.pptx"
      drag
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip" style="color: red">
          提示：允许上传单个附件，格式为jpg\png\gif\word\excel\ppt格式文件！
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitFileForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as FileApi from '@/api/infra/file'
import type { UploadRequestOptions } from 'element-plus/es/components/upload/src/upload'

defineOptions({ name: 'UploadAttachmentForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const fileList = ref([]) // 文件列表
const data = ref({ path: '' })
const uploadRef = ref()

// 上传URL（用于el-upload的action属性，实际不会使用，因为我们使用httpRequest）
const uploadUrl = ref('')

// 自定义上传请求，调用 /infra/file/uploadFile 接口
const httpRequest = async (options: UploadRequestOptions) => {
  formLoading.value = true
  try {
    const res = await FileApi.updateFile({ file: options.file })
    if (res.code === 0) {
      return res
    } else {
      throw new Error(res.msg || '上传失败')
    }
  } catch (error: any) {
    message.error(error.message || '上传失败')
    throw error
  } finally {
    formLoading.value = false
  }
}

/** 打开弹窗 */
const open = async (taskId?: number) => {
  dialogVisible.value = true
  resetForm()
  if (taskId) {
    // 可以在这里保存任务ID，用于后续关联
    data.value.taskId = taskId
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 处理上传的文件发生变化 */
const handleFileChange = (file: any) => {
  data.value.path = file.name
}

/** 提交表单 */
const submitFileForm = () => {
  if (fileList.value.length == 0) {
    message.error('请上传文件')
    return
  }
  unref(uploadRef)?.submit()
}

/** 文件上传成功处理 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitFormSuccess = () => {
  // 清理
  dialogVisible.value = false
  formLoading.value = false
  unref(uploadRef)?.clearFiles()
  fileList.value = []
  // 提示成功，并刷新
  message.success(t('common.createSuccess'))
  emit('success')
}

/** 上传错误提示 */
const submitFormError = (): void => {
  message.error('上传失败，请您重新上传！')
  formLoading.value = false
}

/** 重置表单 */
const resetForm = () => {
  // 重置上传状态和文件
  formLoading.value = false
  fileList.value = []
  data.value = { path: '' }
  uploadRef.value?.clearFiles()
}

/** 文件数超出提示 */
const handleExceed = (): void => {
  message.error('最多只能上传一个文件！')
}
</script>
