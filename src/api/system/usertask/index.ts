import request from '@/config/axios'
import type { Dayjs } from 'dayjs'

/** 任务进程信息 */
export interface TaskProgressInfo {
  id: number // 进程明细id
  taskId?: number // 任务id
  content: string // 进程描述
}

/** 任务信息 */
export interface UserTask {
  id: number // 任务id
  title?: string // 任务标题
  taskTypeId: number // 任务类型id
  content: string // 任务描述
  deptId: number // 部门id
  userId: number // 用户id
  level: number // 优先级（0无1高 2中 3低）
  startDate: string | Dayjs // 任务开始日期
  planEndDate: string | Dayjs // 预计完成日期
  status?: number // 任务状态（0未处理 1处理中2已处理3已延期4已取消5已延期处理）
  progress?: number // 进度
  assistant?: string // 配合人员/部门
  endDate: string | Dayjs // 实际完成时间
  createCycle: number // 生成周期（0无 1每天2每周3每月）
}

/** 保存任务附件关系请求 VO */
export interface UserTaskFileSaveReqVO {
  taskId: number // 任务ID
  fileId: number // 文件ID
}

// 任务 API
export const UserTaskApi = {
  // 查询任务分页
  getUserTaskPage: async (params: any) => {
    return await request.get({ url: `/system/user-task/page`, params })
  },

  // 查询任务详情
  getUserTask: async (id: number) => {
    return await request.get({ url: `/system/user-task/get?id=` + id })
  },

  // 新增任务
  createUserTask: async (data: UserTask) => {
    return await request.post({ url: `/system/user-task/create`, data })
  },

  // 修改任务
  updateUserTask: async (data: UserTask) => {
    return await request.put({ url: `/system/user-task/update`, data })
  },

  // 删除任务
  deleteUserTask: async (id: number) => {
    return await request.delete({ url: `/system/user-task/delete?id=` + id })
  },

  /** 批量删除任务 */
  deleteUserTaskList: async (ids: number[]) => {
    return await request.delete({ url: `/system/user-task/delete-list?ids=${ids.join(',')}` })
  },

  // 导出任务 Excel (使用 GET 请求，携带 Authorization)
  exportUserTask: async (params: any) => {
    // 处理参数，保留所有参数（包括分页参数）
    const exportParams: any = { ...params }

    // 处理日期范围参数，将数组转换为逗号分隔的字符串
    const dateFields = ['createTime', 'startDate', 'actualStartDate', 'planEndDate', 'endDate']
    dateFields.forEach((field) => {
      if (
        exportParams[field] &&
        Array.isArray(exportParams[field]) &&
        exportParams[field].length === 2
      ) {
        exportParams[field] = exportParams[field].join(',')
      }
    })

    // 使用 request.download 确保携带 Authorization 头
    return await request.download({ url: `/system/user-task/export-excel`, params: exportParams })
  },

  downloadTemplate: async (params) => {
    return await request.download({ url: `/system/user-task/get-import-template`, params })
  },

  handleImport: async (formData) => {
    return await request.upload({ url: `/system/user-task/import`, data: formData })
  },

  // ==================== 子表（任务进程） ====================

  // 获得任务进程分页
  getTaskProgressInfoPage: async (params) => {
    return await request.get({ url: `/system/user-task/task-progress-info/page`, params })
  },
  // 新增任务进程
  createTaskProgressInfo: async (data: TaskProgressInfo) => {
    return await request.post({ url: `/system/user-task/task-progress-info/create`, data })
  },

  // 修改任务进程
  updateTaskProgressInfo: async (data: TaskProgressInfo) => {
    return await request.put({ url: `/system/user-task/task-progress-info/update`, data })
  },

  // 删除任务进程
  deleteTaskProgressInfo: async (id: number) => {
    return await request.delete({ url: `/system/user-task/task-progress-info/delete?id=` + id })
  },

  /** 批量删除任务进程 */
  deleteTaskProgressInfoList: async (ids: number[]) => {
    return await request.delete({
      url: `/system/user-task/task-progress-info/delete-list?ids=${ids.join(',')}`
    })
  },

  // 获得任务进程
  getTaskProgressInfo: async (id: number) => {
    return await request.get({ url: `/system/user-task/task-progress-info/get?id=` + id })
  },

  getTaskFileList: async (id: number) => {
    return await request.get({ url: `/system/user-task/getTaskFileList?id=` + id })
  },

  // 保存文件关联关系
  saveRelFile: async (data: UserTaskFileSaveReqVO) => {
    return await request.post({ url: `/system/user-task/saveRelFile`, data })
  }
}
