<template>
  <ContentWrap>
    <!-- Leader 看板 (boardType=2) -->
    <div v-if="boardType === 2" class="leader-board">
      <!-- 返回按钮和当前部门标题 -->
      <div v-if="canGoBack && currentDeptName" class="board-header">
        <el-button link type="primary" @click="handleGoBack" class="back-btn">
          <Icon icon="ep:arrow-left" /> 返回上一级
        </el-button>
        <div class="current-dept-title">{{ currentDeptName }}</div>
      </div>
      
      <!-- 顶部统计卡片 - 已隐藏 -->
      <!-- <el-row :gutter="16" class="stats-cards">
        <el-col :xs="24" :sm="12" :md="8" :lg="4">
          <el-card shadow="hover" class="stat-card total" @click="handleJumpToTask(-1, '总任务')">
            <div class="stat-content">
              <div class="stat-value">{{ boardInfo?.total || 0 }}</div>
              <div class="stat-label">总任务</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="4">
          <el-card shadow="hover" class="stat-card delay" @click="handleJumpToTask(3, '延期')">
            <div class="stat-content">
              <div class="stat-value">{{ boardInfo?.delay || 0 }}</div>
              <div class="stat-label">延期</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="4">
          <el-card shadow="hover" class="stat-card pending" @click="handleJumpToTask(0, '待处理')">
            <div class="stat-content">
              <div class="stat-value">{{ boardInfo?.pending || 0 }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="4">
          <el-card shadow="hover" class="stat-card processing" @click="handleJumpToTask(1, '进行中')">
            <div class="stat-content">
              <div class="stat-value">{{ boardInfo?.processing || 0 }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="4">
          <el-card shadow="hover" class="stat-card completed" @click="handleJumpToTask(2, '已完成')">
            <div class="stat-content">
              <div class="stat-value">{{ boardInfo?.completed || 0 }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="4">
          <el-card shadow="hover" class="chart-card">
            <div ref="chartRef" style="height: 100px"></div>
          </el-card>
        </el-col>
      </el-row> -->

      <!-- Tab 切换 -->
      <el-card class="tab-card" style="position: relative;" v-loading="boardLoading">
        <!-- 筛选条件 - 绝对定位到 Tab 右侧 -->


        <el-tabs v-model="activeDeptTab" @tab-change="handleDeptTabChange">
          <el-tab-pane label="部门总览" name="summary" />
          <el-tab-pane label="部门总结" name="ranking" />
          <el-tab-pane label="项目视图" name="navigation" />
        </el-tabs>





        <!-- 部门总览内容 -->
        <div v-show="activeDeptTab === 'summary'" class="dept-summary">


          <!-- 筛选条件 - 上方右侧 -->
          <div class="content-filter">
             <el-radio-group v-model="deptFilterIndex" @change="handleDeptFilterChange">
               <el-radio-button :label="0">全部</el-radio-button>
               <el-radio-button :label="1">月度</el-radio-button>
               <el-radio-button :label="2">本周</el-radio-button>
               <el-radio-button :label="3">当天</el-radio-button>
             </el-radio-group>
          </div>
          <el-row :gutter="16">
            <el-col
              v-for="dept in boardInfo?.detailRespVOList"
              :key="dept.businessId || dept.deptId || dept.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-card shadow="hover" class="dept-card" @click="handleDeptClick(dept)">
                <div class="dept-header">
                  <div class="dept-name">{{ dept.name }}</div>
                  <div class="dept-total">{{ dept.total || 0 }}</div>
                </div>
                <div class="dept-stats">
                  <div class="stat-item">
                    <div class="stat-label">待处理</div>
                    <div class="stat-value">{{ dept.pending || 0 }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">进行中</div>
                    <div class="stat-value">{{ dept.processing || 0 }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">已完成</div>
                    <div class="stat-value">{{ dept.completed || 0 }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">延期</div>
                    <div class="stat-value danger">{{ dept.delay || 0 }}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 部门总结内容 - 紧凑列表样式 -->
        <div v-show="activeDeptTab === 'ranking'" class="dept-ranking">


          <!-- 筛选条件 - 上方右侧 -->
          <div class="content-filter">
             <el-radio-group v-model="deptFilterIndex" @change="handleDeptFilterChange">
               <el-radio-button :label="0">全部</el-radio-button>
               <el-radio-button :label="1">月度</el-radio-button>
               <el-radio-button :label="2">本周</el-radio-button>
               <el-radio-button :label="3">当天</el-radio-button>
             </el-radio-group>
          </div>
          <div
            v-for="(dept, index) in boardInfo?.deptSummaryRespVOList"
            :key="dept.businessId || dept.deptId || dept.id"
            class="ranking-card"
            @click="handleRankingItemClick(dept)"
          >
            <!-- 左侧排名 -->
            <div class="ranking-left" :class="{ 'top-ranking': index < 3 }">
              <img v-if="index === 0" src="@/assets/gold.svg" alt="1" class="rank-icon" />
              <img v-else-if="index === 1" src="@/assets/silver.svg" alt="2" class="rank-icon" />
              <img v-else-if="index === 2" src="@/assets/copper.svg" alt="3" class="rank-icon" />
              <span v-else>{{ index + 1 }}</span>
            </div>
            
            <!-- 右侧内容 -->
            <div class="ranking-content">
              <!-- 部门信息 -->
              <div class="ranking-info">
                <span class="dept-title">{{ dept.deptName }}</span>
                <div class="dept-meta">
                   <span>总任务 <strong>{{ dept.total || 0 }}</strong></span>
                   <span v-if="dept.delayTimeString">延期 {{ dept.delayTimeString }}</span>
                </div>
              </div>
              
              <!-- 统计指标 -->
              <div class="ranking-stats">
                <div class="stat-item">
                  <span class="stat-label">完成率</span>
                  <span class="stat-val highlight">{{ dept.completeRate || 0 }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">延期率</span>
                  <span class="stat-val danger">{{ dept.delayRate || 0 }}%</span>
                </div>
                <div class="stat-item" style="min-width: 80px;">
                  <span class="stat-label">平均时长</span>
                  <span class="stat-val">{{ dept.avgTimeString || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 项目视图内容 -->
        <div v-show="activeDeptTab === 'navigation'" class="navigation-view">
           <!-- 筛选条件 - 同一行 -->
           <div class="navigation-filter">
              <el-space wrap>
                <!-- 任务状态筛选 -->
                <el-radio-group v-model="navigationForm.statusIndex" @change="handleNavigationStatusChange">
                  <el-radio-button :label="0">总任务</el-radio-button>
                  <el-radio-button :label="4">延期</el-radio-button>
                  <el-radio-button :label="1">待处理</el-radio-button>
                  <el-radio-button :label="2">进行中</el-radio-button>
                  <el-radio-button :label="3">已完成</el-radio-button>
                </el-radio-group>
                
                <!-- 项目名称选择 -->
                <el-select
                  v-model="navigationForm.projectIndex"
                  placeholder="全部项目"
                  style="width: 140px"
                  @change="handleNavigationProjectChange(navigationProjectOptions[navigationForm.projectIndex]?.id || '')"
                >
                  <el-option
                    v-for="(project, index) in navigationProjectOptions"
                    :key="index"
                    :label="project.name"
                    :value="index"
                  />
                </el-select>

                <!-- 项目性质 -->
                <el-select
                  v-model="navigationForm.taskTypeIndex"
                  placeholder="全部性质"
                  style="width: 120px"
                  @change="handleNavigationTaskTypeChange(taskTypeOptions[navigationForm.taskTypeIndex]?.value || '')"
                >
                  <el-option
                    v-for="(type, index) in taskTypeOptions"
                    :key="index"
                    :label="type.label"
                    :value="index"
                  />
                </el-select>

                <!-- 部门选择 -->
                <el-select
                  v-model="navigationForm.deptIndex"
                  placeholder="全部部门"
                  style="width: 140px"
                  @change="handleNavigationDeptChange(navigationDeptOptions[navigationForm.deptIndex]?.id || '')"
                >
                  <el-option
                    v-for="(dept, index) in navigationDeptOptions"
                    :key="index"
                    :label="dept.name"
                    :value="index"
                  />
                </el-select>

                <!-- 员工选择 -->
                <el-select
                  v-model="navigationForm.userIndex"
                  placeholder="全部员工"
                  style="width: 140px"
                  @change="handleNavigationUserChange(navigationUserOptionsWithAll[navigationForm.userIndex]?.id || '')"
                >
                  <el-option
                    v-for="(user, index) in navigationUserOptionsWithAll"
                    :key="index"
                    :label="user.nickname"
                    :value="index"
                  />
                </el-select>

                <!-- 项目时间 -->
                <el-select
                  v-model="navigationForm.dataCycleIndex"
                  placeholder="全部时间"
                  style="width: 120px"
                  @change="handleNavigationDataCycleChange(dataCycleOptions[navigationForm.dataCycleIndex]?.value || 0)"
                >
                  <el-option
                    v-for="(cycle, index) in dataCycleOptions"
                    :key="index"
                    :label="cycle.label"
                    :value="index"
                  />
                </el-select>

                <!-- 重置按钮 -->
                <el-button @click="handleNavigationReset">重置</el-button>
              </el-space>
            </div>
          <!-- 任务列表 - 卡片式展示 -->
          <div class="navigation-task-list-wrapper">
            <div class="navigation-task-list" @scroll="handleNavigationScroll">
              <div v-if="navigationLoading && navigationTaskList.length === 0" class="loading-state">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>加载中...</span>
              </div>
              
              <div v-else-if="navigationTaskList.length > 0" class="task-list-container">
                <div
                  v-for="task in navigationTaskList"
                  :key="task.id"
                  class="task-item"
                  @click="handleTaskClick(task)"
                >
                  <!-- 任务头部：标题 + 状态 -->
                  <div class="task-item-header">
                    <span class="task-item-title">{{ task.title }}</span>
                    <span
                      class="task-item-status"
                      :style="{
                        background: getStatusColor(task.status).bg,
                        color: getStatusColor(task.status).color
                      }"
                    >
                      {{ getStatusText(task.status) }}
                    </span>
                  </div>
                  
                  <!-- 进度条 -->
                  <div v-if="task.progress !== undefined && task.progress !== null" class="progress-wrap">
                    <el-progress :percentage="task.progress || 0" :stroke-width="8" />
                  </div>
                  
                  <!-- 任务内容 -->
                  <div v-if="task.content" class="task-item-content">{{ task.content }}</div>
                  
                  <!-- 任务底部：处理人 + 进度 -->
                  <div class="task-item-footer">
                    <span class="task-item-user">处理人：{{ task.userName }}</span>
                    <span class="task-item-progress">进度：{{ task.progress || 0 }}%</span>
                  </div>
                </div>
                
                <!-- 加载更多 -->
                <div v-if="navigationLoading && navigationTaskList.length > 0" class="loading-more">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
                <div v-else-if="navigationNoMore && navigationTaskList.length > 0" class="no-more">
                  没有更多了
                </div>
              </div>
              
              <!-- 空状态 -->
              <div v-else class="empty-state">
                <span>暂无任务数据</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 任务详情对话框 -->
    <TaskDetailDialog
      v-model="showTaskDetail"
      :task-id="currentTaskId"
      @refresh="handleRefresh"
    />

    <!-- 部门看板 (boardType=3) - 从部门卡片钻取而来 -->
    <div v-if="boardType === 3" class="dept-board">
      <div class="board-header">
        <el-button v-if="canGoBack" link type="primary" @click="handleGoBack" class="back-btn">
          <Icon icon="ep:arrow-left" /> 返回部门总览
        </el-button>
        <div class="current-dept-title">{{ boardInfo?.deptName || currentDeptName || '部门详情' }}</div>
      </div>

      <!-- Tab 切换 -->
      <el-card class="dept-tab-card">
        <el-tabs v-model="activeDetailTab" @tab-change="handleDetailTabChange">
          <el-tab-pane label="任务列表" name="task" />
          <el-tab-pane label="员工总结" name="employee" />
          <el-tab-pane label="员工排名" name="rank" />
          <el-tab-pane label="专注时长排名" name="focus" />
        </el-tabs>

        <!-- 任务列表内容 -->
        <div v-show="activeDetailTab === 'task'" class="dept-tab-content">
          <!-- 任务列表筛选条件 -->
          <div class="task-filter-section">
            <el-space wrap>
              <!-- 任务状态 -->
              <el-select
                v-model="deptTaskForm.status"
                placeholder="任务状态"
                style="width: 120px"
                @change="handleDeptTaskFilterChange"
              >
                <el-option label="全部状态" :value="-1" />
                <el-option label="待处理" :value="0" />
                <el-option label="进行中" :value="1" />
                <el-option label="已完成" :value="2" />
                <el-option label="已延期" :value="3" />
              </el-select>
              
              <!-- 时间维度 -->
              <el-select
                v-model="deptTaskForm.dataCycle"
                placeholder="时间维度"
                style="width: 120px"
                @change="handleDeptTaskFilterChange"
              >
                <el-option label="全部时间" :value="0" />
                <el-option label="今日" :value="3" />
                <el-option label="本周" :value="2" />
                <el-option label="本月" :value="1" />
              </el-select>
              
              <!-- 员工选择 -->
              <el-select
                v-model="deptTaskForm.userId"
                placeholder="员工"
                style="width: 140px"
                clearable
                filterable
                @change="handleDeptTaskFilterChange"
              >
                <el-option label="全部员工" value="" />
                <el-option
                  v-for="user in deptUserOptions"
                  :key="user.id"
                  :label="user.nickname"
                  :value="user.id"
                />
              </el-select>
              
              <!-- 重置按钮 -->
              <el-button @click="handleDeptTaskReset">重置</el-button>
            </el-space>
          </div>
          
          <el-table v-loading="navigationLoading" :data="navigationTaskList" :stripe="true" style="width: 100%" height="400">
            <el-table-column type="index" width="68" label="序号" align="center" />
            <el-table-column prop="title" label="任务标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="userName" label="负责人" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="180">
              <template #default="{ row }">
                <el-progress :percentage="row.progress || 0" :stroke-width="20" :text-inside="true" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleTaskClick(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="navigationPagination.pageNo"
            v-model:page-size="navigationPagination.pageSize"
            :total="navigationTotal"
            @current-change="loadNavigationTasks"
            layout="total, prev, pager, next"
            style="margin-top: 16px; justify-content: center"
          />
        </div>

        <!-- 员工总结内容 -->
        <div v-show="activeDetailTab === 'employee'" class="dept-tab-content">
          <!-- 筛选条件 -->
          <div class="content-filter">
            <el-radio-group v-model="employeeSummaryFilterIndex" @change="handleEmployeeSummaryFilterChange">
              <el-radio-button :label="0">全部</el-radio-button>
              <el-radio-button :label="1">月度</el-radio-button>
              <el-radio-button :label="2">本周</el-radio-button>
              <el-radio-button :label="3">当天</el-radio-button>
            </el-radio-group>
          </div>
          <div class="employee-summary-list">
            <div v-for="(employee, index) in employeeSummaryList" :key="index" class="employee-summary-item">
              <div class="employee-header">
                <span class="employee-name">{{ employee.userName }}</span>
                <span class="employee-task-count">总任务 <strong>{{ employee.total || 0 }}</strong></span>
              </div>
              <div class="employee-stats">
                <div class="stat-item">
                  <span class="stat-label">完成率</span>
                  <span class="stat-val highlight">{{ employee.completeRate || 0 }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">延期率</span>
                  <span class="stat-val danger">{{ employee.delayRate || 0 }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">平均时长</span>
                  <span class="stat-val">{{ employee.avgTimeString || '-' }}</span>
                </div>
              </div>
            </div>
            <div v-if="!employeeSummaryList.length" class="empty-text">暂无员工总结数据</div>
          </div>
        </div>

        <!-- 员工排名内容 -->
        <div v-show="activeDetailTab === 'rank'" class="dept-tab-content">
          <!-- 筛选和排序条件 -->
          <div class="content-filter">
            <el-space wrap>
              <el-radio-group v-model="employeeRankFilterIndex" @change="handleEmployeeRankFilterChange">
                <el-radio-button :label="0">全部</el-radio-button>
                <el-radio-button :label="1">月度</el-radio-button>
                <el-radio-button :label="2">本周</el-radio-button>
                <el-radio-button :label="3">当天</el-radio-button>
              </el-radio-group>
              <el-radio-group v-model="employeeRankOrderType" @change="handleEmployeeRankOrderChange">
                <el-radio-button :label="0">任务数量</el-radio-button>
                <el-radio-button :label="1">及时完成率</el-radio-button>
                <el-radio-button :label="2">延期率</el-radio-button>
                <el-radio-button :label="3">平均时长</el-radio-button>
              </el-radio-group>
            </el-space>
          </div>
          
          <!-- 表格形式展示员工排名 -->
          <el-table :data="userRankList" :stripe="true" style="width: 100%" height="500">
            <el-table-column label="排名" width="100" align="center">
              <template #default="{ $index }">
                <img v-if="$index === 0" src="@/assets/gold.svg" alt="1" class="rank-medal" />
                <img v-else-if="$index === 1" src="@/assets/silver.svg" alt="2" class="rank-medal" />
                <img v-else-if="$index === 2" src="@/assets/copper.svg" alt="3" class="rank-medal" />
                <span v-else class="rank-number">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="姓名" width="150" />
            <el-table-column label="任务数量" align="center">
              <template #default="{ row }">
                <span class="rank-value">{{ row.total || 0 }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="!userRankList.length" class="empty-text">暂无数据</div>
        </div>

        <!-- 专注时长排名内容 -->
        <div v-show="activeDetailTab === 'focus'" class="dept-tab-content">
          <!-- 筛选条件 -->
          <div class="content-filter">
            <el-radio-group v-model="focusTimeFilterIndex" @change="handleFocusTimeFilterChange">
              <el-radio-button :label="0">全部</el-radio-button>
              <el-radio-button :label="1">月度</el-radio-button>
              <el-radio-button :label="2">本周</el-radio-button>
              <el-radio-button :label="3">当天</el-radio-button>
            </el-radio-group>
          </div>
          
          <!-- 表格形式展示专注时长排名 -->
          <el-table :data="focusRankList" :stripe="true" style="width: 100%" height="500">
            <el-table-column label="排名" width="100" align="center">
              <template #default="{ $index }">
                <img v-if="$index === 0" src="@/assets/gold.svg" alt="1" class="rank-medal" />
                <img v-else-if="$index === 1" src="@/assets/silver.svg" alt="2" class="rank-medal" />
                <img v-else-if="$index === 2" src="@/assets/copper.svg" alt="3" class="rank-medal" />
                <span v-else class="rank-number">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="姓名" width="150" />
            <el-table-column prop="focusTimeString" label="专注时长" align="center" />
          </el-table>
        </div>
      </el-card>
    </div>

  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { BoardApi, type BoardInfoVO, type TaskVO, type EmployeeSummaryVO, type FocusTimeVO } from '@/api/system/board'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus' // Added ElMessage
import { useUserStore } from '@/store/modules/user' // Added UserStore
import TaskDetailDialog from './TaskDetailDialog.vue'
import { getSimpleDeptList } from '@/api/system/dept'
import { getSimpleUserList } from '@/api/system/user'
import { TaskClassApi } from '@/api/system/taskclass'
import { Loading } from '@element-plus/icons-vue'

defineOptions({ name: 'SystemBoard' })

const userStore = useUserStore()
// 判断是否是管理员（超级管理员或系统管理员）
const isAdmin = computed(() => {
  const roles = userStore.getRoles
  return roles && (roles.includes('super_admin') || roles.includes('system_admin'))
})

const boardType = ref(2) // 默认部门leader看板
const canGoBack = ref(false) // 是否可以返回（从boardType=2切换到3时设置为true）
const deptLevelStack = ref<Array<{ deptId: number; deptName: string }>>([]) // 部门层级栈，用于多级返回
const boardInfo = ref<BoardInfoVO>()
const currentDeptId = ref<number>(0) // 当前选中的部门ID
const currentDeptName = ref<string>('') // 当前选中的部门名称
const userRankList = ref<EmployeeSummaryVO[]>([]) // 员工排名
const focusRankList = ref<FocusTimeVO[]>([]) // 专注排名
const activeDeptTab = ref('summary')
const deptFilterIndex = ref(0)
const chartRef = ref()
const boardLoading = ref(false) // 看板加载状态

// 部门看板详情 Tab
const activeDetailTab = ref('task') // task-任务列表，employee-员工总结，rank-员工排名，focus-专注时长排名
const employeeSummaryList = ref<EmployeeSummaryVO[]>([]) // 员工总结列表
const employeeSummaryFilterIndex = ref(0) // 员工总结筛选：0-全部，1-月度，2-本周，3-当天
const employeeRankFilterIndex = ref(0) // 员工排名筛选：0-全部，1-月度，2-本周，3-当天
const employeeRankOrderType = ref(0) // 员工排名排序：0-任务数量，1-及时完成率，2-延期率，3-平均时长
const focusTimeFilterIndex = ref(0) // 专注时长筛选：0-全部，1-月度，2-本周，3-当天
const rankingOrderType = ref(0) // 部门总结排序：0-任务数量，1-及时完成率，2-延期率，3-平均时长

// 部门任务列表筛选
const deptUserOptions = ref<Array<{ nickname: string; id: number | string }>>([]) // 部门员工列表
const deptTaskForm = reactive({
  status: -1, // 任务状态
  dataCycle: 0, // 时间维度
  userId: '' // 员工ID
})

// 项目视图相关
const navigationTaskList = ref<TaskVO[]>([])
const navigationLoading = ref(false)
const navigationTotal = ref(0)
const navigationNoMore = ref(false) // 是否没有更多数据
const navigationPagination = reactive({
  pageNo: 1,
  pageSize: 20 // 改为20，参考文件中是99，但这里用20更合理
})
const navigationDeptOptions = ref<Array<{ name: string; id: number | string }>>([{ name: '全部部门', id: '' }])
const navigationUserOptions = ref<Array<{ nickname: string; id: number | string }>>([])
const navigationProjectOptions = ref<Array<{ name: string; id: number | string }>>([{ name: '全部项目', id: '' }])
const taskTypeOptions = ref([
  { label: '全部性质', value: '' },
  { label: '短期', value: 1 },
  { label: '中期', value: 2 },
  { label: '长期', value: 3 },
  { label: '超长期', value: 4 }
])
const dataCycleOptions = ref([
  { label: '全部时间', value: 0 },
  { label: '今日', value: 3 },
  { label: '本周', value: 2 },
  { label: '本月', value: 1 }
])
const navigationForm = reactive({
  statusIndex: 0,
  status: -1,
  deptId: '',
  deptIndex: 0,
  userId: '',
  userIndex: 0,
  taskTypeId: '',
  taskTypeIndex: 0,
  dataCycle: 0,
  dataCycleIndex: 0,
  taskProjectId: null as number | string | null,
  projectIndex: 0
})
// 带"全部员工"选项的员工列表
const navigationUserOptionsWithAll = computed(() => {
  return [{ nickname: '全部员工', id: '' }, ...navigationUserOptions.value]
})

// 任务详情
const showTaskDetail = ref(false)
const currentTaskId = ref(0)

// 获取看板数据
const loadBoardInfo = async (deptId?: number) => {
  boardLoading.value = true
  try {
    const params: any = {
      dataCycle: deptFilterIndex.value, // 数据周期
      orderType: rankingOrderType.value // 排序类型
    }
    
    // 如果指定了部门ID，则查询该部门的下级部门
    if (deptId) {
      params.deptId = deptId
      params.orgCycle = 2 // 2=查询下级部门
    } else {
      params.orgCycle = 1 // 1=查询一级部门
    }
    
    // 后端返回什么就显示什么，不做特殊处理
    boardInfo.value = await BoardApi.getBoardInfo(params)
    
    nextTick(() => {
      renderChart()
    })
  } finally {
    boardLoading.value = false
  }
}

// 渲染图表
const renderChart = () => {
  if (!chartRef.value || !boardInfo.value) return
  const chart = echarts.init(chartRef.value)
  const option = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: boardInfo.value.pending, name: '待处理' },
          { value: boardInfo.value.processing, name: '进行中' },
          { value: boardInfo.value.completed, name: '已完成' },
          { value: boardInfo.value.delay, name: '延期' }
        ]
      }
    ]
  }
  chart.setOption(option)
}

// 加载项目视图任务
const loadNavigationTasks = async () => {
  navigationLoading.value = true
  try {
    const params: any = {
      pageNo: navigationPagination.pageNo,
      pageSize: navigationPagination.pageSize
    }
    
    // 如果是部门看板（boardType=3），使用部门任务筛选条件
    if (boardType.value === 3) {
      params.deptId = currentDeptId.value
      params.status = deptTaskForm.status === -1 ? undefined : deptTaskForm.status
      params.dataCycle = deptTaskForm.dataCycle === 0 ? undefined : deptTaskForm.dataCycle
      if (deptTaskForm.userId) {
        params.userId = deptTaskForm.userId
      }
    } else if (boardType.value === 2) {
      // 如果是部门总览页面（boardType=2），项目视图也需要传递当前部门ID
      // 这样在查看二级部门时，项目视图只显示该部门及其下级的任务
      if (currentDeptId.value) {
        params.deptId = currentDeptId.value
      }
      // 项目视图使用原有筛选条件
      params.status = navigationForm.status === -1 ? undefined : navigationForm.status
      params.dataCycle = navigationForm.dataCycle === 0 ? undefined : navigationForm.dataCycle
      
      // navigationForm.deptId 用于用户手动选择的部门筛选，优先级更高
      if (navigationForm.deptId) {
        params.deptId = navigationForm.deptId
      }
      if (navigationForm.userId) {
        params.userId = navigationForm.userId
      }
      if (navigationForm.taskTypeId) {
        params.taskTypeId = navigationForm.taskTypeId
      }
      if (navigationForm.taskProjectId) {
        params.taskProjectId = navigationForm.taskProjectId
      }
    } else {
      // 其他情况（理论上不会进入）
      params.status = navigationForm.status === -1 ? undefined : navigationForm.status
      params.dataCycle = navigationForm.dataCycle === 0 ? undefined : navigationForm.dataCycle
      
      if (navigationForm.deptId) {
        params.deptId = navigationForm.deptId
      }
      if (navigationForm.userId) {
        params.userId = navigationForm.userId
      }
      if (navigationForm.taskTypeId) {
        params.taskTypeId = navigationForm.taskTypeId
      }
      if (navigationForm.taskProjectId) {
        params.taskProjectId = navigationForm.taskProjectId
      }
    }
    
    // 移除 undefined 的参数
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })
    
    // 项目视图使用 boardDetailPage 接口
    let res: any
    if (activeDeptTab.value === 'navigation') {
      res = await BoardApi.getBoardDetailPage(params)
      
      // 处理任务列表数据（支持加载更多）
      // 数据在 userTaskPage.list 中
      const taskPage = res.userTaskPage || {}
      const isLoadMore = navigationPagination.pageNo > 1
      
      if (isLoadMore) {
        // 加载更多，追加数据
        navigationTaskList.value.push(...(taskPage.list || []))
      } else {
        // 首次加载或刷新，替换数据
        navigationTaskList.value = taskPage.list || []
        navigationNoMore.value = false
      }
      navigationTotal.value = taskPage.total || 0
      
      // 判断是否还有更多数据
      if (navigationTaskList.value.length >= navigationTotal.value) {
        navigationNoMore.value = true
      }
    } else {
      // 其他视图使用普通分页接口
      res = await BoardApi.getTaskPage(params)
      navigationTaskList.value = res.list || []
      navigationTotal.value = res.total || 0
    }
  } catch (err) {
    console.error('加载任务列表失败', err)
    ElMessage.error('加载任务列表失败')
    navigationTaskList.value = []
    navigationTotal.value = 0
  } finally {
    navigationLoading.value = false
  }
}

// 部门任务筛选条件变化
const handleDeptTaskFilterChange = () => {
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 部门任务筛选重置
const handleDeptTaskReset = () => {
  deptTaskForm.status = -1
  deptTaskForm.dataCycle = 0
  deptTaskForm.userId = ''
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

const handleDeptTabChange = () => {
  if (activeDeptTab.value === 'navigation') {
    handleNavigationTabClick()
  }
}

// 点击项目视图tab
const handleNavigationTabClick = async () => {
  activeDeptTab.value = 'navigation'
  // 如果还没有加载过部门列表，则加载
  if (navigationDeptOptions.value.length === 1) {
    await getAllDeptListForNavigation()
  }
  // 如果还没有加载过项目列表，则加载
  if (navigationProjectOptions.value.length === 1) {
    await getProjectListForNavigation()
  }
  // 加载员工列表
  await getNavigationDeptUsers()
  // 查询任务列表
  loadNavigationTasks()
}

// 获取所有部门列表（用于项目视图）
const getAllDeptListForNavigation = async () => {
  try {
    const deptList = await getSimpleDeptList()
    navigationDeptOptions.value = [
      { name: '全部部门', id: '' },
      ...deptList.map(item => ({
        name: item.name,
        id: item.id
      }))
    ]
  } catch (err) {
    console.error('获取部门列表失败', err)
    ElMessage.error('获取部门列表失败')
  }
}

// 获取项目列表（用于项目视图）
const getProjectListForNavigation = async () => {
  try {
    const res = await TaskClassApi.getTaskClassList({ classType: 4 })
    const projectList = res.list || res || []
    navigationProjectOptions.value = [
      { name: '全部项目', id: '' },
      ...projectList.map((item: any) => ({
        name: item.name,
        id: item.id
      }))
    ]
  } catch (err) {
    console.error('获取项目列表失败', err)
    ElMessage.error('获取项目列表失败')
  }
}

// 获取项目视图部门的员工列表
const getNavigationDeptUsers = async () => {
  try {
    const userList = await getSimpleUserList()
    navigationUserOptions.value = userList.map(item => ({
      nickname: item.nickname || item.username,
      id: item.id
    }))
  } catch (err) {
    console.error('获取员工列表失败', err)
    navigationUserOptions.value = []
  }
}

const handleDeptFilterChange = () => {
  // 筛选条件改变时，保持当前部门ID
  loadBoardInfo(currentDeptId.value || undefined)
}

const handleNavigationStatusChange = () => {
  // 索引映射：0-总任务, 4-延期, 1-待处理, 2-进行中, 3-已完成
  const statusMap: Record<number, number> = {
    0: -1,  // 总任务
    4: 4,   // 延期
    1: 0,   // 待处理
    2: 1,   // 进行中
    3: 2    // 已完成
  }
  navigationForm.status = statusMap[navigationForm.statusIndex] ?? -1
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 项目视图状态按钮点击
const handleNavigationStatusClick = (index: number) => {
  navigationForm.statusIndex = index
  handleNavigationStatusChange()
}

// 项目视图部门选择变化
const handleNavigationDeptChange = (deptId: number | string | '') => {
  navigationForm.deptId = deptId ? String(deptId) : ''
  // 重置分页并查询
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 项目视图员工选择变化
const handleNavigationUserChange = (userId: number | string | '') => {
  navigationForm.userId = userId ? String(userId) : ''
  // 重置分页并查询
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 项目视图项目性质改变
const handleNavigationTaskTypeChange = (taskTypeId: number | string | '') => {
  navigationForm.taskTypeId = taskTypeId ? String(taskTypeId) : ''
  // 重置分页并查询
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 项目视图项目选择变化
const handleNavigationProjectChange = (projectId: number | string | '' | null) => {
  navigationForm.taskProjectId = projectId || null
  // 重置分页并查询
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 项目视图时间周期改变
const handleNavigationDataCycleChange = (dataCycle: number) => {
  navigationForm.dataCycle = dataCycle
  // 重置分页并查询
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

const handleNavigationReset = () => {
  navigationForm.statusIndex = 0
  navigationForm.status = -1
  navigationForm.deptId = ''
  navigationForm.deptIndex = 0
  navigationForm.userId = ''
  navigationForm.userIndex = 0
  navigationForm.taskTypeId = ''
  navigationForm.taskTypeIndex = 0
  navigationForm.dataCycle = 0
  navigationForm.dataCycleIndex = 0
  navigationForm.taskProjectId = null
  navigationForm.projectIndex = 0
  navigationPagination.pageNo = 1
  navigationNoMore.value = false
  loadNavigationTasks()
}

// 项目视图滚动加载更多
const loadNavigationMore = () => {
  if (navigationLoading.value || navigationNoMore.value) return
  navigationPagination.pageNo++
  loadNavigationTasks()
}

// 处理滚动事件，实现滚动加载更多
const handleNavigationScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target
  // 距离底部100px时加载更多
  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadNavigationMore()
  }
}

const handleJumpToTask = (status: number, label: string) => {
  activeDeptTab.value = 'navigation'
  // 根据status设置statusIndex
  const statusIndexMap: Record<number, number> = {
    [-1]: 0,  // 总任务
    3: 4,     // 延期
    0: 1,     // 待处理
    1: 2,     // 进行中
    2: 3      // 已完成
  }
  navigationForm.statusIndex = statusIndexMap[status] ?? 0
  navigationForm.status = status === -1 ? -1 : status
  navigationPagination.pageNo = 1
  // 如果还没有加载过数据，先加载
  if (navigationDeptOptions.value.length === 1) {
    handleNavigationTabClick()
  } else {
    loadNavigationTasks()
  }
}

const handleDeptClick = async (dept: any) => {
  if (!isAdmin.value && boardType.value !== 2) return
  
  const deptId = dept.businessId || dept.deptId || dept.id || 0
  const deptName = dept.name || dept.deptName || ''
  
  console.log('点击部门:', dept, '部门ID:', deptId)
  
  if (boardType.value === 2) {
    // 保存当前状态到栈
    deptLevelStack.value.push({ deptId: currentDeptId.value, deptName: currentDeptName.value })
    canGoBack.value = true
    currentDeptId.value = deptId
    currentDeptName.value = deptName
    
    // 先查询该部门的下级部门
    await loadBoardInfo(deptId)
    
    // 判断是否有下级部门
    const hasSubDepts = boardInfo.value?.detailRespVOList && boardInfo.value.detailRespVOList.length > 0
    
    if (!hasSubDepts) {
      // 没有下级部门：切换到 boardType=3，显示任务列表和员工排名等
      console.log('该部门没有下级，切换到部门详情视图')
      boardType.value = 3
      await loadDeptDetail()
    }
    // 如果有下级部门，保持 boardType=2，继续显示下级部门列表
  }
}

// 返回上一级
const handleGoBack = () => {
  if (boardType.value === 3) {
    // 从任务列表返回：检查是否有部门层级栈
    if (deptLevelStack.value.length > 0) {
      // 有层级栈，返回到上一级部门视图
      const prevLevel = deptLevelStack.value.pop()!
      boardType.value = 2
      currentDeptId.value = prevLevel.deptId
      currentDeptName.value = prevLevel.deptName
      loadBoardInfo(currentDeptId.value || undefined)
      // 如果栈空了且返回到顶层，隐藏返回按钮
      if (deptLevelStack.value.length === 0 && currentDeptId.value === 0) {
        canGoBack.value = false
      }
    } else {
      // 没有层级栈，返回到最顶层
      boardType.value = 2
      currentDeptId.value = 0
      currentDeptName.value = ''
      loadBoardInfo()
      canGoBack.value = false
    }
  } else if (boardType.value === 2) {
    // 从部门列表返回：弹出层级栈
    if (deptLevelStack.value.length > 0) {
      const prevLevel = deptLevelStack.value.pop()!
      currentDeptId.value = prevLevel.deptId
      currentDeptName.value = prevLevel.deptName
      loadBoardInfo(currentDeptId.value || undefined)
      // 如果栈空了且返回到顶层，隐藏返回按钮
      if (deptLevelStack.value.length === 0 && currentDeptId.value === 0) {
        canGoBack.value = false
      }
    } else {
      // 已经是最顶层（理论上不应该走到这里）
      boardType.value = 2
      currentDeptId.value = 0
      currentDeptName.value = ''
      loadBoardInfo()
      canGoBack.value = false
    }
  }
}

// 加载部门详情数据
const loadDeptDetail = async () => {
    // 1. 获取该部门的BoardInfo (头部统计)
    const boardParams = {
        orgCycle: 1,
        deptId: currentDeptId.value,
        dataCycle: deptFilterIndex.value
    }
    boardInfo.value = await BoardApi.getBoardInfo(boardParams)
    
    // 如果接口返回了部门名称，更新 currentDeptName
    if (boardInfo.value?.deptName) {
      currentDeptName.value = boardInfo.value.deptName
    }

    // 2. 加载部门员工列表
    await loadDeptUsers()

    // 3. 根据当前 tab 加载对应数据
    handleDetailTabChange(activeDetailTab.value)
}

// 加载部门员工列表
const loadDeptUsers = async () => {
  try {
    const userList = await getSimpleUserList()
    // 可以根据 currentDeptId 过滤，这里暂时显示全部
    deptUserOptions.value = userList.map(item => ({
      nickname: item.nickname || item.username,
      id: item.id
    }))
  } catch (err) {
    console.error('获取部门员工列表失败', err)
    deptUserOptions.value = []
  }
}

// Tab 切换处理
const handleDetailTabChange = async (tabName: string) => {
  if (tabName === 'task') {
    await loadNavigationTasks()
  } else if (tabName === 'employee') {
    await loadEmployeeSummaryList()
  } else if (tabName === 'rank') {
    await loadEmployeeRankList()
  } else if (tabName === 'focus') {
    await loadFocusTimeRankList()
  }
}

// 加载员工总结列表
const loadEmployeeSummaryList = async () => {
  try {
    const params = {
      deptId: currentDeptId.value,
      dataCycle: employeeSummaryFilterIndex.value
    }
    const res = await BoardApi.getEmployeeSummaryList(params)
    // 处理返回数据格式
    employeeSummaryList.value = res.employeeSummaryRespVOList || res || []
  } catch (err) {
    console.error('获取员工总结失败', err)
    ElMessage.error('获取员工总结失败')
    employeeSummaryList.value = []
  }
}

// 加载员工排名列表
const loadEmployeeRankList = async () => {
  try {
    const params = {
      deptId: currentDeptId.value,
      dataCycle: employeeRankFilterIndex.value,
      orderType: employeeRankOrderType.value
    }
    userRankList.value = await BoardApi.getEmployeeRankList(params)
  } catch (err) {
    console.error('获取员工排名失败', err)
    ElMessage.error('获取员工排名失败')
    userRankList.value = []
  }
}

// 加载专注时长排名列表
const loadFocusTimeRankList = async () => {
  try {
    const params = {
      deptId: currentDeptId.value,
      dataCycle: focusTimeFilterIndex.value
    }
    focusRankList.value = await BoardApi.getFocusTimeRankList(params)
  } catch (err) {
    console.error('获取专注时长排名失败', err)
    ElMessage.error('获取专注时长排名失败')
    focusRankList.value = []
  }
}

// 员工总结筛选条件变化
const handleEmployeeSummaryFilterChange = () => {
  loadEmployeeSummaryList()
}

// 员工排名筛选条件变化
const handleEmployeeRankFilterChange = () => {
  loadEmployeeRankList()
}

// 员工排名排序类型变化
const handleEmployeeRankOrderChange = () => {
  loadEmployeeRankList()
}

// 专注时长筛选条件变化
const handleFocusTimeFilterChange = () => {
  loadFocusTimeRankList()
}

const handleRankingItemClick = async (dept: any) => {
  // 排行榜点击：保存当前状态，切换到任务详情
  if (!isAdmin.value && boardType.value !== 2) return
  
  const deptId = dept.businessId || dept.deptId || dept.id || 0
  const deptName = dept.deptName || dept.name || ''
  
  console.log('点击排名:', dept, '部门ID:', deptId)
  
  // 保存当前状态到栈
  deptLevelStack.value.push({ deptId: currentDeptId.value, deptName: currentDeptName.value })
  canGoBack.value = true
  boardType.value = 3
  currentDeptId.value = deptId
  currentDeptName.value = deptName
  await loadDeptDetail()
}

const handleTaskClick = (task: TaskVO) => {
  currentTaskId.value = task.id
  showTaskDetail.value = true
}

const handleRefresh = () => {
  // 刷新时保持当前部门ID
  if (boardType.value === 2) {
    loadBoardInfo(currentDeptId.value || undefined)
  } else if (boardType.value === 3) {
    loadDeptDetail()
  }
  if (activeDeptTab.value === 'navigation') {
    loadNavigationTasks()
  }
}

const getStatusText = (status: number) => {
  const map = { 0: '待处理', 1: '进行中', 2: '已完成', 3: '已延期', 4: '已取消', 5: '延期完成' }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger', 4: 'info', 5: 'warning' }
  return map[status] || 'info'
}

// 获取状态颜色（用于项目视图卡片）
const getStatusColor = (status: number) => {
  const colorMap: Record<number, { bg: string; color: string }> = {
    0: { bg: '#E6F1FF', color: '#1E5BB5' }, // 待处理
    1: { bg: '#FFE0B3', color: '#D87A00' }, // 进行中
    2: { bg: '#B3F2B8', color: '#2A9D3F' }, // 已完成
    3: { bg: '#FFB3B3', color: '#B32424' }, // 已延期
    4: { bg: '#D9D9D9', color: '#5F5F5F' }, // 已取消
    5: { bg: '#FFCCCC', color: '#D35C5C' }  // 延期完成
  }
  return colorMap[status] || { bg: '#E6F1FF', color: '#1E5BB5' }
}

onMounted(() => {
  // 清空部门层级栈
  deptLevelStack.value = []
  canGoBack.value = false
  
  // 如果不是管理员（即是 leader），直接进入部门详情视图
  if (!isAdmin.value) {
    const user = userStore.getUser
    if (user && user.deptId) {
      boardType.value = 3
      currentDeptId.value = user.deptId
      loadDeptDetail()
    }
  } else {
    loadBoardInfo()
  }
})
</script>

<style scoped lang="scss">
// 变量定义
$primary-color: #409eff;
$text-main: #303133;
$text-regular: #606266;
$text-secondary: #909399;
$border-color: #dcdfe6;
$bg-color: #f5f7fa;

// 外层容器 - 减少内边距
.leader-board {
  padding: 0;
  
  // 头部返回按钮和标题 - 两侧对齐
  .board-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    
    .back-btn {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
    
    .current-dept-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      line-height: 1.2;
    }
  }
  
  // 统一所有卡片的基础样式
  :deep(.el-card) {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 1px 4px rgba(0,21,41,0.05);
    transition: all 0.3s;
    
    // 移除默认内边距，我们自己控制
    .el-card__body {
      padding: 16px; 
    }

    &:hover {
      box-shadow: 0 4px 12px rgba(0,21,41,0.08);
    }
  }
}

// Tab 切换区 - 最外层包裹
.tab-card {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  
  :deep(.el-card__body) {
    padding: 0;
  }

  // 使得 Tabs 看起来像是一个整体容器的头部
  :deep(.el-tabs__header) {
    margin-bottom: 0; // 移除底部间距，直接连接下方内容
    background: #fff;
    padding: 8px 16px 0;
    border: 1px solid #e4e7ed;
    border-bottom: 1px solid #f0f2f5; // 分割线
    border-radius: 4px 4px 0 0; // 仅顶部圆角
    
    .el-tabs__nav-wrap::after {
      height: 0; // 移除默认下划线
    }

    .el-tabs__item {
      font-size: 14px;
      height: 40px;
      line-height: 40px;
      color: $text-regular;
      font-weight: 500;
      
      &.is-active {
        color: $primary-color;
        font-weight: 600;
      }
    }
    
    .el-tabs__active-bar {
      height: 2px;
      background-color: $primary-color;
    }
  }
}

// 内容区域容器 - 移除边框，只保留内边距
.leader-board {
  .dept-summary, .dept-ranking, .navigation-view {
    background: transparent;
    border: none;
    padding: 16px 0; // 上下内边距
  }
}

// 筛选区域 - 绝对定位 Header
// 筛选区域公共样式
.content-filter,
.navigation-filter {
  display: flex;
  align-items: center;

  :deep(.el-radio-group) {
    .el-radio-button__inner {
      border: 1px solid #dcdfe6;
      background: #fff;
      color: $text-regular;
      box-shadow: none !important;
      padding: 6px 16px; 
      font-size: 13px; 
      font-weight: normal;
      height: 32px;
      line-height: 18px;
    }
    
    .el-radio-button__original-radio:checked + .el-radio-button__inner {
      background-color: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }
    
    .el-radio-button:first-child .el-radio-button__inner {
      border-radius: 4px 0 0 4px;
    }
    .el-radio-button:last-child .el-radio-button__inner {
      border-radius: 0 4px 4px 0;
    }
  }
}

.content-filter {
  justify-content: flex-start;
  margin-bottom: 10px;
}

.navigation-filter {
  justify-content: flex-start;
  margin-bottom: 10px;
}

// 部门总览卡片 - 网格布局紧凑化
.dept-summary {
  .el-row {
    margin-left: -8px !important;
    margin-right: -8px !important;
  }
  .el-col {
    padding-left: 8px !important;
    padding-right: 8px !important;
    margin-bottom: 16px;
  }

  .dept-card {
    height: 100%;
    margin-bottom: 0;
    border: 1px solid #ebeef5 !important; 
    box-shadow: none !important; 
    background: #fcfcfc;
    cursor: pointer;
    transition: all 0.2s;

    :deep(.el-card__body) {
      padding: 12px 16px;
    }

    &:hover {
      background: #fff;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1) !important;
      z-index: 1;
    }

    .dept-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e8eaed;
      
      .dept-name {
        font-size: 15px; 
        font-weight: 600;
        color: $text-main;
        flex: 1;
      }
      
      .dept-total {
        font-size: 24px;
        font-weight: 600;
        color: $primary-color;
        margin-left: 8px;
      }
    }
    
    .dept-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      
      .stat-item {
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #e8eaed;
        background: #f8f9fa;
        text-align: center;
        
        .stat-label {
          font-size: 12px;
          color: $text-secondary;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: $text-main;
          
          &.danger {
            color: #f56c6c;
          }
        }
      }
    }
  }
}

// 部门总结排行榜 - 列表式紧凑布局
.dept-ranking {
  .ranking-card {
    border: 1px solid #ebeef5;
    margin-bottom: 12px; // 减小卡片间距
    border-radius: 4px;
    display: flex; // 直接应用 Flex 布局
    align-items: stretch; // 确保左侧高度占满

    // 移除无效的 :deep(.el-card__body) 样式 (如果以前是为了 el-card)

    // 左侧排名
    .ranking-left {
      width: 60px; // 稍微加宽以容纳图标
      background: #f5f7fa;
      border-right: 1px solid #ebeef5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      color: $text-secondary;
      
      &.top-ranking {
        background: #fff;
        color: #e6a23c;

      }
      
      .rank-icon {
        width: 32px;
        height: 32px;
        display: block;
      }
    }

    .ranking-content {
      flex: 1;
      padding: 12px 16px; // 紧凑内边距
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .ranking-info {
         display: flex;
         align-items: center;
         gap: 20px;
         
         .dept-title {
           font-size: 15px;
           font-weight: 600;
           color: $text-main;
           min-width: 100px;
         }
         
         .dept-meta {
            font-size: 12px;
            color: $text-secondary;
         }
      }

      .ranking-stats {
        display: flex;
        align-items: center;
        gap: 30px; // 间距控制

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: flex-end; // 右对齐，更整齐
          
          .stat-label {
            font-size: 12px;
            color: $text-secondary;
            margin-bottom: 2px;
          }
          
          .stat-val {
            font-size: 16px;
            font-weight: 500;
            color: $text-main;
            font-family: monospace; // 数字对齐更好
            
            &.highlight { color: $primary-color; }
            &.danger { color: #f56c6c; }
          }
        }
      }
    }
  }
}

// 项目视图 - 卡片式列表
.navigation-view {
  background: transparent;
  padding: 0; 
  border: none;
  box-shadow: none;
  
  .navigation-task-list-wrapper {
    height: 600px;
    overflow-y: auto;
    overflow-x: hidden;
    
    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f5f5f5;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c0c4cc;
      border-radius: 3px;
      
      &:hover {
        background: #a0a4ac;
      }
    }
  }
  
  .navigation-task-list {
    min-height: 400px;
    
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      color: $text-secondary;
      font-size: 14px;
      
      .el-icon {
        margin-right: 8px;
        font-size: 16px;
      }
    }
    
    .task-list-container {
      .task-item {
        margin-bottom: 12px;
        padding: 12px;
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #e8e8e8;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-color: $primary-color;
        }
        
        .task-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          
          .task-item-title {
            flex: 1;
            font-size: 15px;
            font-weight: 600;
            color: #111111;
            line-height: 1.4;
            margin-right: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          
          .task-item-status {
            flex-shrink: 0;
            padding: 2px 8px;
            font-size: 12px;
            border-radius: 4px;
            white-space: nowrap;
            font-weight: 500;
          }
        }
        
        .progress-wrap {
          margin-bottom: 8px;
          
          :deep(.el-progress-bar__outer) {
            border-radius: 8px;
          }
        }
        
        .task-item-content {
          font-size: 13px;
          color: #666666;
          line-height: 1.5;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .task-item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #999999;
          
          .task-item-user,
          .task-item-progress {
            flex: 1;
          }
          
          .task-item-progress {
            text-align: right;
          }
        }
      }
      
      .loading-more {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 0;
        color: $text-secondary;
        font-size: 14px;
        
        .el-icon {
          margin-right: 8px;
          font-size: 16px;
        }
      }
      
      .no-more {
        text-align: center;
        padding: 20px 0;
        color: $text-secondary;
        font-size: 13px;
      }
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 0;
      color: $text-secondary;
      font-size: 14px;
    }
  }
}

// 部门看板 (Drill-down) 样式
.dept-board {
  // 头部样式
  .board-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    margin-right: 12px;
    
    .back-btn {
      font-size: 14px;
      color: $text-secondary;
      
      &:hover { color: $primary-color; }
    }
    
    .current-dept-title {
      font-size: 18px;
      font-weight: 600;
      color: $text-main;
      line-height: 1.2;
    }
  }

  // 统计卡片 (复用部分 stats-cards 逻辑但更简洁)
  .stats-cards {
     margin-bottom: 0; 
     
     .stat-card {
        border: none;
        background: linear-gradient(135deg, #fff 0%, #f9fafe 100%);
        border: 1px solid #ebeef5;
        
        .stat-content {
           display: flex;
           flex-direction: column;
           align-items: center;
           padding: 16px 0;
           
           .stat-value {
              font-size: 28px;
              font-weight: 700;
              color: $primary-color;
              margin-bottom: 8px;
              font-family: 'Helvetica Neue', sans-serif;
           }
           
           .stat-label {
              font-size: 13px;
              color: $text-secondary;
           }
        }
     }
  }

  .list-card, .ranking-list-card {
     .card-header {
        font-size: 15px;
        font-weight: 600;
        color: $text-main;
        border-left: 3px solid $primary-color;
        padding-left: 10px;
        line-height: 1;
     }
  }

  // Tab 卡片样式
  .dept-tab-card {
    margin-top: 16px;
    
    :deep(.el-card__body) {
      padding: 0;
    }
    
    :deep(.el-tabs__header) {
      margin: 0;
      padding: 0 16px;
      background: #fff;
      border-bottom: 1px solid #e4e7ed;
    }
    
    :deep(.el-tabs__item) {
      font-size: 14px;
      height: 40px;
      line-height: 40px;
      color: $text-regular;
      font-weight: 500;
      
      &.is-active {
        color: $primary-color;
        font-weight: 600;
      }
    }
    
    :deep(.el-tabs__active-bar) {
      height: 2px;
      background-color: $primary-color;
    }
  }

  // Tab 内容区域
  .dept-tab-content {
    padding: 16px;
    min-height: 400px;
    
    // 任务筛选区域
    .task-filter-section {
      margin-bottom: 16px;
      padding: 12px;
      background: transparent;
      border-radius: 4px;
    }
    
    // 排名图标样式
    .rank-medal {
      width: 32px;
      height: 32px;
      display: inline-block;
    }
    
    .rank-number {
      font-size: 16px;
      font-weight: 600;
      color: $text-secondary;
    }
    
    .rank-value {
      font-size: 16px;
      font-weight: 600;
      color: $primary-color;
    }
    
    // 员工总结列表样式
    .employee-summary-list {
      height: 500px;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 4px;
      
      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;
        
        &:hover {
          background: #a0a4ac;
        }
      }
      
      .employee-summary-item {
        border: 1px solid var(--el-border-color-light);
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 12px;
        background: var(--el-bg-color);
        transition: all 0.2s;
        
        &:hover {
          background: var(--el-fill-color-lighter);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .employee-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--el-border-color-light);
          
          .employee-name {
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }
          
          .employee-task-count {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            
            strong {
              color: var(--el-color-primary);
              font-weight: 600;
              margin-left: 4px;
            }
          }
        }
        
        .employee-stats {
          display: flex;
          gap: 30px;
          
          .stat-item {
            display: flex;
            flex-direction: column;
            
            .stat-label {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              margin-bottom: 4px;
            }
            
            .stat-val {
              font-size: 16px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              
              &.highlight {
                color: var(--el-color-primary);
              }
              
              &.danger {
                color: var(--el-color-danger);
              }
            }
          }
        }
      }
      
      .empty-text {
        text-align: center;
        color: $text-secondary;
        padding: 40px 0;
        font-size: 14px;
      }
    }
  }

  // 排名列表样式 (复用并调整)
  .ranking-list-body {
     height: 300px; // 设置固定高度
     overflow-y: auto; // 启用垂直滚动
     overflow-x: hidden; // 隐藏横向滚动
     padding-right: 4px; // 为滚动条留出空间
     
     // 自定义滚动条样式
     &::-webkit-scrollbar {
        width: 6px;
     }
     
     &::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 3px;
     }
     
     &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;
        
        &:hover {
           background: #a0a4ac;
        }
     }
     
     .ranking-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding: 8px 10px; // 内边距
        border-radius: 4px;
        background-color: #fcfcfc;
        border: 1px solid #ebeef5;
        flex-shrink: 0; // 防止压缩
        
        .rank-idx {
           width: 24px;
           height: 24px;
           line-height: 24px;
           text-align: center;
           background: #e4e7ed;
           color: #606266;
           border-radius: 50%; // 圆形
           font-size: 12px;
           margin-right: 12px;
           font-weight: bold;
           
           &.top-3 {
              background: #fdf6ec;
              color: #e6a23c;
              border: 1px solid #faecd8;
           }
        }
        
        .rank-info {
           flex: 1;
           display: flex;
           justify-content: space-between;
           align-items: center;
           
           .rank-name {
              font-size: 14px;
              color: $text-regular;
              font-weight: 500;
           }
           
           .rank-score {
              font-weight: 600;
              color: $primary-color;
           }

           .rank-val {
              color: $text-secondary;
           }
        }
     }
     
     .empty-text {
        text-align: center;
        color: $text-secondary;
        padding: 20px 0;
        font-size: 13px;
     }
  }
}

// 暗色模式适配
.dark {
  // 调整整体文字颜色，让白色不那么刺眼
  --el-text-color-primary: rgba(255, 255, 255, 0.85);
  --el-text-color-regular: rgba(255, 255, 255, 0.75);
  --el-text-color-secondary: rgba(255, 255, 255, 0.6);
  --el-text-color-placeholder: rgba(255, 255, 255, 0.45);
  
  // tab-card 暗色模式
  .tab-card {
    :deep(.el-card__body) {
      background: var(--el-bg-color-overlay);
    }
    
    :deep(.el-tabs__header) {
      background: var(--el-bg-color-overlay);
      border-color: var(--el-fill-color-dark);
      border-bottom-color: var(--el-fill-color-darker);
    }
    
    :deep(.el-tabs__item) {
      color: var(--el-text-color-regular);
      
      &.is-active {
        color: var(--el-color-primary);
      }
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
    
    :deep(.el-tabs__nav-wrap::after) {
      background-color: transparent;
    }
  }
  
  // 内容区域容器背景适配
  .leader-board {
    .dept-summary, .dept-ranking, .navigation-view {
      background: transparent;
      border: none;
    }
  }
  
  // 筛选区域按钮暗色模式
  .content-filter,
  .navigation-filter {
    :deep(.el-radio-group) {
      .el-radio-button__inner {
        border-color: var(--el-border-color);
        background: var(--el-fill-color);
        color: var(--el-text-color-regular);
      }
      
      .el-radio-button__original-radio:checked + .el-radio-button__inner {
        background-color: var(--el-color-primary);
        border-color: var(--el-color-primary);
        color: rgba(255, 255, 255, 0.95);
      }
    }
  }
  
  // dept-summary 内部元素暗色适配
  .dept-summary {
    .dept-card {
      background: var(--el-bg-color-overlay);
      border-color: var(--el-fill-color-dark) !important;
      
      &:hover {
        background: var(--el-fill-color-light);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2) !important;
      }
      
      .dept-header {
        border-bottom-color: var(--el-fill-color-dark);
        
        .dept-name {
          color: var(--el-text-color-primary);
        }
        
        .dept-total {
          color: var(--el-color-primary);
        }
      }
      
      .dept-stats {
        .stat-item {
          background: var(--el-fill-color-darker);
          border-color: var(--el-fill-color-dark);
          
          .stat-label {
            color: var(--el-text-color-secondary);
          }
          
          .stat-value {
            color: var(--el-text-color-primary);
            
            &.danger {
              color: var(--el-color-danger);
            }
          }
        }
      }
    }
  }
  
  // dept-ranking 暗色适配
  .dept-ranking {
    .ranking-card {
      border-color: var(--el-fill-color-dark);
      
      .ranking-left {
        background: var(--el-fill-color);
        border-right-color: var(--el-fill-color-darker);
        color: var(--el-text-color-secondary);
        
        &.top-ranking {
          background: var(--el-bg-color-overlay);
        }
      }
      
      .ranking-content {
        .ranking-info {
          .dept-title {
            color: var(--el-text-color-primary);
          }
          
          .dept-meta {
            color: var(--el-text-color-secondary);
          }
        }
        
        .ranking-stats {
          .stat-item {
            .stat-label {
              color: var(--el-text-color-secondary);
            }
            
            .stat-val {
              color: var(--el-text-color-primary);
              
              &.highlight {
                color: var(--el-color-primary);
              }
              
              &.danger {
                color: var(--el-color-danger);
              }
            }
          }
        }
      }
    }
  }
  
  // Tab 卡片暗色模式
  .dept-tab-card {
      :deep(.el-tabs__header) {
        background: var(--el-bg-color-overlay);
        border-color: var(--el-fill-color-dark);
        border-bottom-color: var(--el-fill-color-darker);
      }
    
    :deep(.el-tabs__item) {
      color: var(--el-text-color-regular);
      
      &.is-active {
        color: var(--el-color-primary);
      }
    }
  }
  
  // 部门看板头部
  .board-header {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    
    .back-btn {
      color: var(--el-text-color-secondary);
      
      &:hover {
        color: var(--el-color-primary);
      }
    }
    
    .current-dept-title {
      color: var(--el-text-color-primary);
    }
  }
  
  // 统计卡片暗色模式
  .stats-cards {
        .stat-card {
          background: var(--el-bg-color-overlay);
          border-color: var(--el-fill-color-dark);
      
      .stat-content {
        .stat-value {
          color: var(--el-color-primary);
        }
        
        .stat-label {
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
  
  // 卡片头部暗色模式
  .list-card, .ranking-list-card {
    .card-header {
      color: var(--el-text-color-primary);
    }
  }
  
  // 项目视图任务列表暗色模式
  .navigation-view {
    .navigation-task-list-wrapper {
      // 滚动条暗色模式
      &::-webkit-scrollbar-track {
        background: var(--el-fill-color-darker);
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        
        &:hover {
          background: var(--el-border-color-hover);
        }
      }
    }
    
    .navigation-task-list {
      .loading-state,
      .loading-more {
        color: var(--el-text-color-secondary);
      }
      
      .task-list-container {
      .task-item {
        background: var(--el-bg-color-overlay);
        border-color: var(--el-fill-color-dark);
          
          &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            border-color: var(--el-color-primary);
          }
          
          .task-item-header {
            .task-item-title {
              color: var(--el-text-color-primary);
            }
          }
          
          .task-item-content {
            color: var(--el-text-color-secondary);
          }
          
          .task-item-footer {
            color: var(--el-text-color-placeholder);
          }
        }
      }
      
      .no-more,
      .empty-state {
        color: var(--el-text-color-secondary);
      }
    }
  }
  
  // 部门总结列表卡片暗色模式
  .dept-summary {
    .content-filter {
      // 筛选按钮组自动适配
    }
  }
  
  // 部门排名暗色模式
  .dept-ranking {
    .dept-summary-list {
      .summary-card {
        background-color: var(--el-bg-color-overlay);
        border-color: var(--el-fill-color-dark);
        
        &:hover {
          background-color: var(--el-fill-color-light);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .summary-header {
          border-bottom-color: var(--el-border-color);
          
          .dept-info {
            .dept-name {
              color: var(--el-text-color-primary);
            }
            
            .dept-meta {
              color: var(--el-text-color-secondary);
            }
          }
          
          .dept-detail-link {
            color: var(--el-color-primary);
          }
        }
        
        .ranking-stats {
          .stat-item {
            .stat-label {
              color: var(--el-text-color-secondary);
            }
            
            .stat-val {
              color: var(--el-text-color-primary);
              
              &.highlight {
                color: var(--el-color-primary);
              }
            }
          }
        }
      }
    }
  }
  
  .leader-board {
    // 部门卡片暗色模式
    .dept-card {
      background: var(--el-bg-color-overlay);
      border-color: var(--el-fill-color-dark);
      
      &:hover {
        background: var(--el-fill-color-light);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .dept-name {
        color: var(--el-text-color-primary);
      }
    }
    
    // Tab 内容区域暗色模式
    .dept-tab-content {
      // 任务筛选区域
      .task-filter-section {
        background: transparent;
        
        // 适配 el-select 组件
        :deep(.el-select) {
          .el-input__wrapper {
            background-color: var(--el-bg-color-overlay);
            box-shadow: 0 0 0 1px var(--el-border-color) inset;
            
            &:hover {
              box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
            }
          }
          
          .el-input__inner {
            color: var(--el-text-color-primary);
            
            &::placeholder {
              color: var(--el-text-color-placeholder);
            }
          }
          
          .el-input__suffix {
            .el-icon {
              color: var(--el-text-color-secondary);
            }
          }
        }
        
        // 适配 el-button 组件
        :deep(.el-button) {
          background-color: var(--el-fill-color);
          border-color: var(--el-border-color);
          color: var(--el-text-color-primary);
          
          &:hover {
            background-color: var(--el-fill-color-light);
            border-color: var(--el-border-color-hover);
          }
        }
      }
      
      .rank-number {
        color: var(--el-text-color-secondary);
      }
      
      .rank-value {
        color: var(--el-color-primary);
      }
      
      // 员工总结列表暗色模式
      .employee-summary-list {
        // 滚动条暗色模式
        &::-webkit-scrollbar-track {
          background: var(--el-fill-color-darker);
        }
        
        &::-webkit-scrollbar-thumb {
          background: var(--el-border-color);
          
          &:hover {
            background: var(--el-border-color-hover);
          }
        }
        
        .employee-summary-item {
          border-color: var(--el-fill-color-dark);
          background: var(--el-bg-color-overlay);
          
          &:hover {
            background: var(--el-fill-color-light);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
          
          .employee-header {
            border-bottom-color: var(--el-fill-color-dark);
            
            .employee-name {
              color: var(--el-text-color-primary);
            }
            
            .employee-task-count {
              color: var(--el-text-color-secondary);
              
              strong {
                color: var(--el-color-primary);
              }
            }
          }
          
          .employee-stats {
            .stat-item {
              .stat-label {
                color: var(--el-text-color-secondary);
              }
              
              .stat-val {
                color: var(--el-text-color-primary);
                
                &.highlight {
                  color: var(--el-color-primary);
                }
                
                &.danger {
                  color: var(--el-color-danger);
                }
              }
            }
          }
        }
        
        .empty-text {
          color: var(--el-text-color-secondary);
        }
      }
    }
    
    // 排名列表暗色模式
    .ranking-list-body {
      // 滚动条暗色模式
      &::-webkit-scrollbar-track {
        background: var(--el-fill-color-darker);
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        
        &:hover {
          background: var(--el-border-color-hover);
        }
      }
      
      .ranking-item {
        background-color: var(--el-bg-color-overlay);
        border-color: var(--el-fill-color-dark);
        
        .rank-idx {
          background: var(--el-fill-color);
          color: var(--el-text-color-regular);
          
          &.top-3 {
            background: rgba(230, 162, 60, 0.2);
            color: #e6a23c;
            border-color: rgba(230, 162, 60, 0.3);
          }
        }
        
        .rank-info {
          .rank-name {
            color: var(--el-text-color-regular);
          }
          
          .rank-score {
            color: var(--el-color-primary);
          }
          
          .rank-val {
            color: var(--el-text-color-secondary);
          }
        }
      }
      
      .empty-text {
        color: var(--el-text-color-secondary);
      }
    }
  }
  
  // 部门看板总结列表暗色模式
  .dept-summary-list {
    .summary-card {
      background-color: var(--el-bg-color-overlay);
      border-color: var(--el-border-color-darker);
      
      &:hover {
        background-color: var(--el-fill-color-light);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
      
      .summary-header {
        border-bottom-color: var(--el-border-color);
        
        .dept-name {
          color: var(--el-text-color-primary);
        }
        
        .dept-detail-link {
          color: var(--el-color-primary);
        }
      }
      
      .summary-content {
        .summary-row {
          .summary-label {
            color: var(--el-text-color-secondary);
          }
          
          .summary-value {
            color: var(--el-text-color-primary);
            
            &.highlight {
              color: var(--el-color-primary);
            }
            
            &.danger {
              color: var(--el-color-danger);
            }
          }
        }
      }
    }
  }
}
</style>
