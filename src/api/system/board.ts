import request from '@/config/axios'

// ==================== 类型定义 ====================

/** 任务分类统计 */
export interface TaskClassCountVO {
  taskClassId: number
  taskClassName: string
  taskClassCount: number
  countPercent?: number // 百分比
}

/** 部门详情 VO */
export interface DepartmentDetailVO {
  name: string
  deptId?: number
  businessId?: number // 实际的部门ID字段
  id?: number
  total: number
  pending: number
  processing: number
  completed: number
  delay: number
}

/** 部门总结 VO */
export interface DepartmentSummaryVO {
  deptId?: number
  businessId?: number // 实际的部门ID字段
  id?: number
  deptName: string
  name?: string
  total: number
  completeRate: number // 及时完成率
  delayRate: number // 延期率
  delayTimeString: string // 累计延期时长
  avgTimeString: string // 任务平均时长
  taskClassCountList: TaskClassCountVO[] // 任务分类统计
}

/** 任务 VO */
export interface TaskVO {
  id: number
  title: string
  content: string
  status: number // 0未处理 1处理中 2已处理 3已延期 4已取消 5已延期处理
  progress: number // 进度
  userName: string
  userId: number
  deptName: string
  deptId: number
  startDate: string
  planEndDate: string
  actualStartDate?: string
  endDate?: string
  taskTypeName?: string
  taskTypeId?: number
  taskClassName?: string
  taskClassId?: number
  taskProjectName?: string
  taskProjectId?: number
  workContentName?: string
  workContentId?: number
  taskTargetName?: string
  taskTargetId?: number
  assistant?: string // 配合部门/人员
  delayReason?: string // 延期原因
  focusFlag?: number // 是否专注任务 0否 1是
  focusTime?: string // 专注时间
  focusCount?: number // 专注次数
  spendTimeValue?: string // 任务时长
  shiftTypeValue?: number // 班次
  userTaskAssistantDOS?: AssistantUserVO[] // 协同人员列表
  progressInfoList?: ProgressInfoVO[] // 进度列表
}

/** 协同人员 VO */
export interface AssistantUserVO {
  id: number
  userId: number
  nickName: string
  deptName: string
  content?: string
  status?: number // 0未确认 1已确认
  contrRate?: number // 贡献率
}

/** 进度信息 VO */
export interface ProgressInfoVO {
  id: number
  updateTime: string
  content?: string
  progressType: number // 0创建 1处理 2完成 3延期 4终止 5延期完成 6返工
}

/** 员工总结 VO */
export interface EmployeeSummaryVO {
  userId: number
  userName: string
  total: number
  completeRate: number
  delayRate: number
  delayTimeString: string
  avgTimeString: string
  taskClassCountList: TaskClassCountVO[]
  completeRatePercent?: number
  delayRatePercent?: number
  avgTimePercent?: number
}

/** 专注时长 VO */
export interface FocusTimeVO {
  userId: number
  userName: string
  focusTimeString: string
}

/** 看板信息 VO */
export interface BoardInfoVO {
  total: number
  delay: number
  pending: number
  processing: number
  completed: number
  deptName?: string // 部门名称
  detailRespVOList?: DepartmentDetailVO[] // 部门详情列表
  deptSummaryRespVOList?: DepartmentSummaryVO[] // 部门总结列表
  focusTaskList?: TaskVO[] // 正在执行的任务列表
  taskAchievementRate?: number // 任务完成率
}

/** 任务分页请求 VO */
export interface TaskPageReqVO {
  pageNo: number
  pageSize: number
  status?: number // -1全部 0待处理 1进行中 2已完成 3延期 4延期(导航专用)
  taskTypeId?: number | string // 任务类型ID 项目性质
  taskClassId?: number | string // 任务分类ID
  dataCycle?: number // 数据周期 0全部 1日 2周 3月
  userId?: number | string // 用户ID
  deptId?: number | string // 部门ID
  taskProjectId?: number | string // 项目ID
}

/** 员工排名请求 VO */
export interface EmployeeRankReqVO {
  orgCycle?: number // 组织周期: 对应boardType
  dataCycle?: number // 0全部 1月度 2本周 3当天
  orderType?: number // 0任务数量 1及时完成率 2延期率 3任务平均时长
  deptId?: number | string // 部门ID（可选）
}

/** 员工总结请求 VO */
export interface EmployeeSummaryReqVO {
  orgCycle?: number // 组织周期: 对应boardType
  dataCycle?: number // 0全部 1月度 2本周 3当天
  orderType?: number // 排序类型: 0任务数量 1及时完成率 2延期率 3任务平均时长
  deptId?: number | string // 部门ID（可选）
}

/** 专注时长请求 VO */
export interface FocusTimeReqVO {
  orgCycle?: number // 组织周期: 对应boardType
  dataCycle?: number // 0全部 1本月 2本周 3今天
  deptId?: number | string // 部门ID（可选）
}

/** 项目看板请求 VO */
export interface BoardProjectReqVO {
  projectId?: number | string // 项目ID
  dataCycle: number // 数据维度（0-全部 1-本月 2-本周 3-今日）
  startDate?: string // 开始日期
  endDate?: string // 结束日期
  status?: number // 状态
}

/** 项目成员评价数据 VO */
export interface ProjectUserEvaVO {
  projectId: number // 项目id
  projectName: string // 项目名称
  userId: number // 用户id
  userName: string // 用户名称
  deptId: number // 部门ID
  deptName: string // 部门名称
  taskAchievementRate: number // 任务达成率(前端在后面加个%号就行)
  completeRate: number // 及时完成率（按时完成/按时完成+延期完成）
  delayRate: number // 延期率（延期/进行中+延期）
  totalDelayRate: number // 累计延期比例（累计延期比率=累计延期时长/（有效工作时长+累计延期时长））
  workTimeString: string // 有效工作时长（天+小时）-前端展现
  delayTimeString: string // 累计延期工作时长（天+小时）-前端展现
  onceCompleteRate: number // 一次性通过率（延期数量/任务总量）
  reworkCount: number // 返工次数
}

/** 项目成员得分 VO */
export interface ProjectUserScoreVO {
  projectId: number // 项目id
  projectName: string // 项目名称
  userId: number // 用户id
  userName: string // 用户名称
  deptId: number // 部门ID
  deptName: string // 部门名称
  score: number // 得分
}

/** 部门筛选请求 VO */
export interface DeptFilterReqVO {
  orgCycle?: number // 组织周期: 0全部 1仅本部门
  dataCycle?: number // 数据周期: 0全部 1月度 2本周 3当天
  orderType?: number // 排序类型: 0任务数量 1及时完成率 2延期率 3任务平均时长
  deptId?: number | string // 部门ID（可选）
}

/** 更新任务请求 VO */
export interface UpdateTaskReqVO {
  id: number
  progress?: number
  status?: number
  progressContent?: string
  delayReason?: string
  [key: string]: any
}

/** 协同任务更新请求 VO */
export interface UpdateAssistantTaskReqVO {
  taskId: number
  assistantUserId: number
  content: string
  status: number
}

// ==================== API 接口 ====================

export const BoardApi = {
  // 获取看板统计数据
  getBoardInfo: async (params?: DeptFilterReqVO): Promise<BoardInfoVO> => {
    return await request.get({ url: '/system/user-task/board', params })
  },

  // 获取任务分页列表
  getTaskPage: async (params: TaskPageReqVO) => {
    return await request.get({ url: '/system/user-task/page', params })
  },

  // 获取项目视图任务列表（看板详情页）
  getBoardDetailPage: async (params: TaskPageReqVO) => {
    return await request.get({ url: '/system/user-task/boardDetailPage', params })
  },

  // 获取任务详情
  getTaskDetail: async (id: number): Promise<TaskVO> => {
    return await request.get({ url: `/system/user-task/get`, params: { id } })
  },

  // 更新任务
  updateTask: async (data: UpdateTaskReqVO) => {
    return await request.put({ url: '/system/user-task/update', data })
  },

  // 专注任务
  focusTask: async (id: number) => {
    return await request.post({ url: `/system/user-task/focus`, params: { id } })
  },

  // 取消专注任务
  cancelFocusTask: async (id: number) => {
    return await request.post({ url: `/system/user-task/cancelFocus`, params: { id } })
  },

  // 更新协同任务
  updateAssistantTask: async (data: UpdateAssistantTaskReqVO) => {
    return await request.put({ url: '/system/user-task/updateUserAssistantTask', data })
  },

  // 创建任务进度信息
  createTaskProgressInfo: async (data: any) => {
    return await request.post({ url: '/system/user-task/task-progress-info/create', data })
  },

  // 获取员工排名列表
  getEmployeeRankList: async (params: EmployeeRankReqVO): Promise<EmployeeSummaryVO[]> => {
    return await request.get({ url: '/system/user-task/employeeRankList', params })
  },

  // 获取员工总结列表
  getEmployeeSummaryList: async (params: EmployeeSummaryReqVO): Promise<any> => {
    return await request.get({ url: '/system/user-task/employeeSummaryList', params })
  },

  // 获取专注时长排名
  getFocusTimeRankList: async (params: FocusTimeReqVO): Promise<FocusTimeVO[]> => {
    return await request.get({ url: '/system/user-task/simpleFocusTimeList', params })
  },

  // 获取部门总结列表
  getDeptSummaryList: async (params: DeptFilterReqVO): Promise<DepartmentSummaryVO[]> => {
    return await request.get({ url: '/system/user-task/dept-summary', params })
  },

  // 获取项目成员评价数据报告
  getProjectUserEvaList: async (params: { boardProjectReqVO: string }): Promise<any> => {
    return await request.get({ url: '/system/board/listProjectUserEva', params })
  },

  // 获取项目成员得分总结
  getProjectUserScoreList: async (params: { boardProjectReqVO: string }): Promise<any> => {
    return await request.get({ url: '/system/board/listProjectUserScore', params })
  }
}
