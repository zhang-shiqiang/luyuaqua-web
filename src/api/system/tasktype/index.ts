import request from '@/config/axios'
import type { Dayjs } from 'dayjs';

/** 任务类型信息 */
export interface TaskType {
          id: number; // 任务类型id
          name?: string; // 任务类型名称
          parentId?: number; // 父任务类型id
          sort?: number; // 显示顺序
          deptId?: number; // 部门ID
          level?: number; // 任务类型优先级（1高 2中 3低）
          status?: number; // 任务类型状态（0正常 1停用）
    children?: TaskType[];
  }

// 任务类型 API
export const TaskTypeApi = {
  // 查询任务类型列表
  getTaskTypeList: async (params) => {
    return await request.get({ url: `/system/task-type/list`, params })
  },

  // 查询任务类型详情
  getTaskType: async (id: number) => {
    return await request.get({ url: `/system/task-type/get?id=` + id })
  },

  // 新增任务类型
  createTaskType: async (data: TaskType) => {
    return await request.post({ url: `/system/task-type/create`, data })
  },

  // 修改任务类型
  updateTaskType: async (data: TaskType) => {
    return await request.put({ url: `/system/task-type/update`, data })
  },

  // 删除任务类型
  deleteTaskType: async (id: number) => {
    return await request.delete({ url: `/system/task-type/delete?id=` + id })
  },


  // 导出任务类型 Excel
  exportTaskType: async (params) => {
    return await request.download({ url: `/system/task-type/export-excel`, params })
  },
}