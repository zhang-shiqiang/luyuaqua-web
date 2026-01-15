import request from '@/config/axios'

/** 任务分类信息 */
export interface TaskClass {
  id?: number // 编号，新增时不填，更新时填
  deptId?: number // 部门ID，非必填
  classType: number // 分类类型必填，1工作范畴2工作内容类型高 3任务目的4、项目名称
  name: string // 分类名称
  sort: number // 排序
}

// 任务分类 API
export const TaskClassApi = {
  // 查询任务分类列表
  getTaskClassList: async (params?: {
    pageNo?: number
    pageSize?: number
    deptId?: number
    classType?: number
  }) => {
    return await request.get({ url: `/system/task-class/page`, params })
  },

  // 新增任务分类
  createTaskClass: async (data: TaskClass) => {
    return await request.post({ url: `/system/task-class/create`, data })
  },

  // 修改任务分类
  updateTaskClass: async (data: TaskClass) => {
    return await request.put({ url: `/system/task-class/update`, data })
  },

  // 删除任务分类
  deleteTaskClass: async (id: number) => {
    return await request.delete({ url: `/system/task-class/delete?id=` + id })
  }
}
