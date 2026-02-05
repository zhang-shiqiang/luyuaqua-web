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
      <el-card class="tab-card" style="position: relative" v-loading="boardLoading">
        <!-- 筛选条件 - 绝对定位到 Tab 右侧 -->

        <el-tabs v-model="activeDeptTab" @tab-change="handleDeptTabChange">
          <el-tab-pane label="部门总览" name="summary" />
          <el-tab-pane label="部门总结" name="ranking" />
          <el-tab-pane label="项目视图" name="navigation" />
          <el-tab-pane v-if="showAssessmentTab" label="项目考核" name="assessment" />
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
                  <span
                    >总任务 <strong>{{ dept.total || 0 }}</strong></span
                  >
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
                <div class="stat-item" style="min-width: 80px">
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
              <el-radio-group
                v-model="navigationForm.statusIndex"
                @change="handleNavigationStatusChange"
              >
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
                clearable
                @change="
                  handleNavigationProjectChange(
                    navigationProjectOptions[navigationForm.projectIndex]?.id || ''
                  )
                "
                @clear="handleNavigationProjectClear"
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
                clearable
                @change="
                  handleNavigationTaskTypeChange(
                    taskTypeOptions[navigationForm.taskTypeIndex]?.value || ''
                  )
                "
                @clear="handleNavigationTaskTypeClear"
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
                clearable
                @change="
                  handleNavigationDeptChange(
                    navigationDeptOptions[navigationForm.deptIndex]?.id || ''
                  )
                "
                @clear="handleNavigationDeptClear"
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
                clearable
                @change="
                  handleNavigationUserChange(
                    navigationUserOptionsWithAll[navigationForm.userIndex]?.id || ''
                  )
                "
                @clear="handleNavigationUserClear"
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
                clearable
                @change="
                  handleNavigationDataCycleChange(
                    dataCycleOptions[navigationForm.dataCycleIndex]?.value || 0
                  )
                "
                @clear="handleNavigationDataCycleClear"
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
              <div
                v-if="navigationLoading && navigationTaskList.length === 0"
                class="loading-state"
              >
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
                  <div
                    v-if="task.progress !== undefined && task.progress !== null"
                    class="progress-wrap"
                  >
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

        <!-- 项目考核内容 -->
        <div v-show="activeDeptTab === 'assessment'" class="assessment-view">
          <!-- 嵌套子Tab -->
          <el-tabs v-model="activeAssessmentTab" @tab-change="handleAssessmentTabChange">
            <el-tab-pane label="项目成员评价数据报告" name="evaluation" />
            <el-tab-pane label="项目成员得分总结" name="score" />
          </el-tabs>

          <!-- 评价数据报告内容 -->
          <div v-show="activeAssessmentTab === 'evaluation'" class="evaluation-content">
            <!-- 筛选条件 -->
            <div class="content-filter content-filter-with-rule">
              <el-space wrap>
                <!-- 项目选择 -->
                <el-select
                  v-model="selectedProjectId"
                  placeholder="选择项目"
                  style="width: 200px"
                  @change="handleAssessmentProjectChange"
                >
                  <el-option
                    v-for="project in assessmentProjectList"
                    :key="project.id"
                    :label="project.name"
                    :value="project.id"
                  />
                </el-select>

                <!-- 时间维度筛选 -->
                <el-radio-group
                  v-model="evaluationFilterIndex"
                  @change="handleEvaluationFilterChange"
                >
                  <el-radio-button :label="0">全部</el-radio-button>
                  <el-radio-button :label="1">当月</el-radio-button>
                  <el-radio-button :label="2">当周</el-radio-button>
                </el-radio-group>
              </el-space>
              <el-button
                link
                type="primary"
                @click="showEvaluationRuleDialog = true"
                class="rule-tip-btn"
              >
                <Icon icon="ep:question-filled" /> 评价规则说明
              </el-button>
            </div>

            <!-- 评价数据表格 -->
            <el-table
              v-if="evaluationList.length > 0 || evaluationLoading"
              v-loading="evaluationLoading"
              :data="evaluationList"
              :stripe="true"
              style="width: 100%"
              height="600"
              border
            >
              <el-table-column type="index" width="68" label="序号" align="center" />
              <el-table-column prop="userName" label="姓名" min-width="120" align="center" />
              <el-table-column prop="deptName" label="部门" min-width="150" align="center" />
              <el-table-column label="关键任务完成率" min-width="150" align="center">
                <template #default="{ row }">
                  <span>{{ row.taskAchievementRate }}%</span>
                </template>
              </el-table-column>
              <el-table-column label="交付及时性与计划管理" align="center">
                <el-table-column label="及时完成" min-width="120" align="center">
                  <template #default="{ row }">
                    <span>{{ row.completeRate }}%</span>
                  </template>
                </el-table-column>
                <el-table-column label="未完成延期率" min-width="130" align="center">
                  <template #default="{ row }">
                    <span>{{ row.delayRate }}%</span>
                  </template>
                </el-table-column>
              </el-table-column>
              <el-table-column label="工作负荷与投入有效性" align="center">
                <el-table-column label="累计延期比率" min-width="130" align="center">
                  <template #default="{ row }">
                    <span>{{ row.totalDelayRate }}%</span>
                  </template>
                </el-table-column>
                <el-table-column label="有效工作时长" min-width="150" align="center">
                  <template #default="{ row }">
                    <span>{{ row.workTimeString }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="累计延期时长" min-width="150" align="center">
                  <template #default="{ row }">
                    <span>{{ row.delayTimeString }}</span>
                  </template>
                </el-table-column>
              </el-table-column>
              <el-table-column label="质量与返工控制" align="center">
                <el-table-column label="一次通过率" width="120" align="center">
                  <template #default="{ row }">
                    <span>{{ row.onceCompleteRate }}%</span>
                  </template>
                </el-table-column>
                <el-table-column label="返工次数计算" width="130" align="center">
                  <template #default="{ row }">
                    <span>{{ row.reworkCount }}</span>
                  </template>
                </el-table-column>
              </el-table-column>
            </el-table>

            <!-- 空状态 -->
            <div v-else class="empty-text">暂无评价数据</div>

            <!-- 评价规则说明弹窗 -->
            <el-dialog
              v-model="showEvaluationRuleDialog"
              title="规则"
              width="720px"
              destroy-on-close
            >
              <div class="assessment-rule-content">
                <el-table :data="assessmentRuleTableData" border size="small" class="rule-table">
                  <el-table-column prop="desc" label="描述" width="140" />
                  <el-table-column prop="dimension" label="维度" width="100" />
                  <el-table-column
                    prop="formula"
                    label="核心指标及概念"
                    min-width="200"
                    show-overflow-tooltip
                  />
                  <el-table-column prop="purpose" label="目的" width="120" />
                  <el-table-column prop="weight" label="权重" width="80" align="center" />
                </el-table>
                <p class="rule-note"
                  ><strong>说明</strong>：重要：一般重要：普通=4:3:2来划分，例如：KTA
                  =（4+3+2）/（4+3+2）=100%</p
                >
              </div>
            </el-dialog>
          </div>

          <!-- 得分总结内容 -->
          <div v-show="activeAssessmentTab === 'score'" class="score-content">
            <!-- 筛选条件 -->
            <div class="content-filter content-filter-with-rule">
              <el-space wrap>
                <!-- 项目选择 -->
                <el-select
                  v-model="selectedProjectId"
                  placeholder="选择项目"
                  style="width: 200px"
                  @change="handleAssessmentProjectChange"
                >
                  <el-option
                    v-for="project in assessmentProjectList"
                    :key="project.id"
                    :label="project.name"
                    :value="project.id"
                  />
                </el-select>

                <!-- 时间维度筛选 -->
                <el-radio-group v-model="scoreFilterIndex" @change="handleScoreFilterChange">
                  <el-radio-button :label="0">全部</el-radio-button>
                  <el-radio-button :label="1">当月</el-radio-button>
                  <el-radio-button :label="2">当周</el-radio-button>
                </el-radio-group>
              </el-space>
              <el-button
                link
                type="primary"
                @click="showScoreRuleDialog = true"
                class="rule-tip-btn"
              >
                <Icon icon="ep:question-filled" /> 得分规则说明
              </el-button>
            </div>

            <!-- 得分表格 -->
            <el-table
              v-if="scoreList.length > 0 || scoreLoading"
              v-loading="scoreLoading"
              :data="scoreList"
              :stripe="true"
              style="width: 100%"
              border
            >
              <el-table-column type="index" width="68" label="序号" align="center" />
              <el-table-column prop="userName" label="姓名" align="center" />
              <el-table-column prop="deptName" label="部门" align="center" />
              <el-table-column label="得分" align="center">
                <template #default="{ row }">
                  <span class="score-value">{{ row.score }}</span>
                </template>
              </el-table-column>
            </el-table>

            <!-- 空状态 -->
            <div v-else class="empty-text">暂无得分数据</div>

            <!-- 得分规则说明弹窗 -->
            <el-dialog v-model="showScoreRuleDialog" title="规则" width="720px" destroy-on-close>
              <div class="assessment-rule-content">
                <p
                  ><strong>总分计算</strong>：维度1(分)×0.5 + 维度2及时(分)×0.15 +
                  维度2延期(分)×0.15 + 维度3(分)×0.15 + 维度4(分)×0.1</p
                >
                <p
                  ><strong>评分规则</strong>：5 分制，每个维度按关键指标映射到 1-5
                  分，再按权重加权汇总。</p
                >

                <h5>维度 1：目标与关键任务达成（50%）</h5>
                <el-table :data="dim1Rules" border size="small" class="rule-table">
                  <el-table-column prop="score" label="得分" width="80" align="center" />
                  <el-table-column prop="condition" label="条件" />
                </el-table>

                <h5>维度 2：交付及时性与计划管理（30%）</h5>
                <p class="sub-title">及时完成率（15%）</p>
                <el-table :data="dim2TimelyRules" border size="small" class="rule-table">
                  <el-table-column prop="score" label="得分" width="80" align="center" />
                  <el-table-column prop="condition" label="条件" />
                </el-table>
                <p class="sub-title">未完成延期率（15%）</p>
                <el-table :data="dim2DelayRules" border size="small" class="rule-table">
                  <el-table-column prop="score" label="得分" width="80" align="center" />
                  <el-table-column prop="condition" label="条件" />
                </el-table>

                <h5>维度 3：有效时间投入（10%）- 累计延期比率</h5>
                <el-table :data="dim3Rules" border size="small" class="rule-table">
                  <el-table-column prop="score" label="得分" width="80" align="center" />
                  <el-table-column prop="condition" label="条件" />
                </el-table>

                <h5>维度 4：质量与返工控制（10%）- 一次性通过率</h5>
                <el-table :data="dim4Rules" border size="small" class="rule-table">
                  <el-table-column prop="score" label="得分" width="80" align="center" />
                  <el-table-column prop="condition" label="条件" />
                </el-table>
              </div>
            </el-dialog>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 任务详情对话框 -->
    <TaskDetailDialog v-model="showTaskDetail" :task-id="currentTaskId" @refresh="handleRefresh" />

    <!-- 部门看板 (boardType=3) - 从部门卡片钻取而来 -->
    <div v-if="boardType === 3" class="dept-board">
      <div class="board-header">
        <el-button v-if="canGoBack" link type="primary" @click="handleGoBack" class="back-btn">
          <Icon icon="ep:arrow-left" /> 返回部门总览
        </el-button>
        <div class="current-dept-title">{{
          boardInfo?.deptName || currentDeptName || '部门详情'
        }}</div>
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
          <!-- 正在执行的任务 -->
          <div
            v-if="boardInfo?.focusTaskList && boardInfo.focusTaskList.length > 0"
            class="focus-task-section"
          >
            <div class="section-title">正在执行</div>
            <div class="focus-task-list">
              <el-card
                v-for="(task, index) in boardInfo.focusTaskList"
                :key="index"
                class="focus-task-card"
                shadow="hover"
                @click="handleTaskClick(task)"
              >
                <div class="focus-task-header">
                  <span class="focus-task-title">{{ task.title }}</span>
                  <el-tag :type="getStatusType(task.status)" size="small">{{
                    getStatusText(task.status)
                  }}</el-tag>
                </div>
                <div class="focus-task-user">处理人：{{ task.userName }}</div>
                <el-progress :percentage="task.progress || 0" :stroke-width="6" />
              </el-card>
            </div>
          </div>

          <!-- 任务列表筛选条件 -->
          <div class="task-filter-section">
            <el-space wrap>
              <!-- 任务状态 -->
              <el-select
                v-model="deptTaskForm.status"
                placeholder="任务状态"
                style="width: 120px"
                clearable
                @change="handleDeptTaskFilterChange"
                @clear="handleDeptTaskStatusClear"
              >
                <el-option label="全部状态" :value="-1" />
                <el-option label="待处理" :value="0" />
                <el-option label="进行中" :value="1" />
                <el-option label="已完成" :value="2" />
                <el-option label="已延期" :value="4" />
              </el-select>

              <!-- 项目性质 -->
              <el-select
                v-model="deptTaskForm.taskTypeId"
                placeholder="全部性质"
                style="width: 120px"
                clearable
                @change="handleDeptTaskFilterChange"
                @clear="handleDeptTaskTypeClear"
              >
                <el-option
                  v-for="type in taskTypeOptions"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>

              <!-- 任务分类 -->
              <el-select
                v-model="deptTaskForm.taskClass"
                placeholder="全部分类"
                style="width: 120px"
                clearable
                @change="handleDeptTaskFilterChange"
                @clear="handleDeptTaskClassClear"
              >
                <el-option
                  v-for="taskClass in taskClassOptions"
                  :key="taskClass.value"
                  :label="taskClass.text"
                  :value="taskClass.value"
                />
              </el-select>

              <!-- 时间维度 -->
              <el-select
                v-model="deptTaskForm.dataCycle"
                placeholder="时间维度"
                style="width: 120px"
                clearable
                @change="handleDeptTaskFilterChange"
                @clear="handleDeptTaskDataCycleClear"
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

          <el-table
            v-loading="navigationLoading"
            :data="navigationTaskList"
            :stripe="true"
            style="width: 100%"
            height="400"
          >
            <el-table-column type="index" width="68" label="序号" align="center" />
            <el-table-column prop="title" label="任务标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="userName" label="负责人" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="getStatusType(row.status)">{{
                  getStatusText(row.status)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="180">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.progress || 0"
                  :stroke-width="20"
                  :text-inside="true"
                />
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
            <el-radio-group
              v-model="employeeSummaryFilterIndex"
              @change="handleEmployeeSummaryFilterChange"
            >
              <el-radio-button :label="0">全部</el-radio-button>
              <el-radio-button :label="1">月度</el-radio-button>
              <el-radio-button :label="2">本周</el-radio-button>
              <el-radio-button :label="3">当天</el-radio-button>
            </el-radio-group>
          </div>
          <div class="employee-summary-list">
            <div
              v-for="(employee, index) in employeeSummaryList"
              :key="index"
              class="employee-summary-item"
            >
              <div class="employee-header">
                <span class="employee-name">{{ employee.userName }}</span>
                <span class="employee-task-count"
                  >总任务 <strong>{{ employee.total || 0 }}</strong></span
                >
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
              <el-radio-group
                v-model="employeeRankFilterIndex"
                @change="handleEmployeeRankFilterChange"
              >
                <el-radio-button :label="0">全部</el-radio-button>
                <el-radio-button :label="1">月度</el-radio-button>
                <el-radio-button :label="2">本周</el-radio-button>
                <el-radio-button :label="3">当天</el-radio-button>
              </el-radio-group>
              <el-radio-group
                v-model="employeeRankOrderType"
                @change="handleEmployeeRankOrderChange"
              >
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
                <img
                  v-else-if="$index === 1"
                  src="@/assets/silver.svg"
                  alt="2"
                  class="rank-medal"
                />
                <img
                  v-else-if="$index === 2"
                  src="@/assets/copper.svg"
                  alt="3"
                  class="rank-medal"
                />
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
                <img
                  v-else-if="$index === 1"
                  src="@/assets/silver.svg"
                  alt="2"
                  class="rank-medal"
                />
                <img
                  v-else-if="$index === 2"
                  src="@/assets/copper.svg"
                  alt="3"
                  class="rank-medal"
                />
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
import {
  BoardApi,
  type BoardInfoVO,
  type TaskVO,
  type EmployeeSummaryVO,
  type FocusTimeVO,
  type ProjectUserEvaVO,
  type ProjectUserScoreVO
} from '@/api/system/board'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus' // Added ElMessage
import { useUserStore } from '@/store/modules/user' // Added UserStore
import TaskDetailDialog from './TaskDetailDialog.vue'
import { getSimpleDeptList } from '@/api/system/dept'
import { getSimpleUserList } from '@/api/system/user'
import { TaskClassApi } from '@/api/system/taskclass'
import { Loading } from '@element-plus/icons-vue'
import { getUserIdentity } from '@/utils/userRole'

defineOptions({ name: 'SystemBoard' })

const userStore = useUserStore()
const isAdmin = computed(() => {
  const userRole = getUserIdentity()
  return userRole === 'admin'
})

const showAssessmentTab = computed(() => {
  const userRole = getUserIdentity()
  return userRole === 'admin' || userRole == 'loader'
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

// 项目考核相关
const activeAssessmentTab = ref('evaluation') // evaluation-评价数据报告，score-得分总结
const evaluationList = ref<ProjectUserEvaVO[]>([]) // 项目成员评价数据列表
const scoreList = ref<ProjectUserScoreVO[]>([]) // 项目成员得分列表
const evaluationFilterIndex = ref(0) // 评价数据筛选：0-全部，1-当月，2-当周
const scoreFilterIndex = ref(0) // 得分筛选：0-全部，1-当月，2-当周
const evaluationLoading = ref(false) // 评价数据加载状态
const scoreLoading = ref(false) // 得分加载状态
const assessmentProjectList = ref<Array<{ id: number | string; name: string }>>([]) // 项目列表
const selectedProjectId = ref<number | string>('') // 选中的项目ID
const showEvaluationRuleDialog = ref(false) // 评价规则说明弹窗
const showScoreRuleDialog = ref(false) // 得分规则说明弹窗

// 考核规则说明数据
const assessmentRuleTableData = [
  {
    desc: '目标及关键任务达成',
    dimension: '结果',
    formula: 'KTA = 计划已完成关键任务权重之和/计划关键任务权重之和×100%',
    purpose: '完成程度',
    weight: '50%'
  },
  {
    desc: '交付及时性与计划管理',
    dimension: '过程/效率',
    formula:
      '1.及时完成率=按时完成/（按时完成+延期完成）；2.未完成延期率=未完成延期/（未完成未延期+未完成延期项目）',
    purpose: '预测性及管控',
    weight: '30%'
  },
  {
    desc: '有效时间投入',
    dimension: '投入',
    formula:
      '1.累计延期比率=累计延期时长/（有效工作时长+累计延期时长）；2.有效工作时长（专注）；3.累计延期时长',
    purpose: '工作饱和及产出',
    weight: '10%'
  },
  {
    desc: '质量与返工控制',
    dimension: '返工',
    formula: '1.一次通过率：一次验收通过任务数/到验收任务数；2.返工次数',
    purpose: '减少堵塞',
    weight: '10%'
  }
]
const dim1Rules = [
  { score: '5 分', condition: 'KTA ≥ 95%' },
  { score: '4 分', condition: '90%–94%' },
  { score: '3 分', condition: '80%–89%' },
  { score: '2 分', condition: '60%–79%' },
  { score: '1 分', condition: '< 60%' }
]
const dim2TimelyRules = [
  { score: '5 分', condition: '及时完成率≥ 95%' },
  { score: '4 分', condition: '90%–94%' },
  { score: '3 分', condition: '80%–89%' },
  { score: '2 分', condition: '60%–79%' },
  { score: '1 分', condition: '< 60%' }
]
const dim2DelayRules = [
  { score: '5 分', condition: '未完成延期率 ≤ 5%' },
  { score: '4 分', condition: '>5%–10%' },
  { score: '3 分', condition: '>10%–20%' },
  { score: '2 分', condition: '>20%–35%' },
  { score: '1 分', condition: '>35%' }
]
const dim3Rules = [
  { score: '5 分', condition: '累计延期比率≤ 5%' },
  { score: '4 分', condition: '>5%–10%' },
  { score: '3 分', condition: '>10%–20%' },
  { score: '2 分', condition: '>20%–35%' },
  { score: '1 分', condition: '>35%' }
]
const dim4Rules = [
  { score: '5 分', condition: '一次性通过率≥ 95%' },
  { score: '4 分', condition: '90%–94%' },
  { score: '3 分', condition: '80%–89%' },
  { score: '2 分', condition: '60%–79%' },
  { score: '1 分', condition: '< 60%' }
]

// 部门任务列表筛选
const deptUserOptions = ref<Array<{ nickname: string; id: number | string }>>([]) // 部门员工列表
const deptTaskForm = reactive({
  status: -1, // 任务状态
  dataCycle: 0, // 时间维度
  userId: '', // 员工ID
  taskTypeId: '', // 项目性质
  taskClass: '' // 任务分类
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
const navigationDeptOptions = ref<Array<{ name: string; id: number | string }>>([
  { name: '全部部门', id: '' }
])
const navigationUserOptions = ref<Array<{ nickname: string; id: number | string }>>([])
const navigationProjectOptions = ref<Array<{ name: string; id: number | string }>>([
  { name: '全部项目', id: '' }
])
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
const taskClassOptions = ref<Array<{ text: string; value: number | string }>>([
  { text: '全部分类', value: '' }
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
  console.log(
    '🟠 loadBoardInfo 被调用, deptId:',
    deptId,
    ', boardType:',
    boardType.value,
    new Error().stack
  )

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

    console.log('🟠 loadBoardInfo 请求参数:', params)

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
      // 与移动端保持一致的参数
      params.orgCycle = boardType.value // 组织周期，对应boardType
      params.dataCycle = deptTaskForm.dataCycle // dataCycle 直接传递，包括0（全部时间）
      params.orderType = 0 // 排序类型，默认为0
      params.deptId = currentDeptId.value
      params.status = deptTaskForm.status === -1 ? undefined : deptTaskForm.status
      if (deptTaskForm.userId) {
        params.userId = deptTaskForm.userId
      }
      if (deptTaskForm.taskTypeId) {
        params.taskTypeId = deptTaskForm.taskTypeId
      }
      if (deptTaskForm.taskClass) {
        params.taskClass = deptTaskForm.taskClass
      }
    } else if (boardType.value === 2) {
      // 如果是部门总览页面（boardType=2），项目视图也需要传递当前部门ID
      // 这样在查看二级部门时，项目视图只显示该部门及其下级的任务
      if (currentDeptId.value) {
        params.deptId = currentDeptId.value
      }
      // 项目视图使用原有筛选条件
      params.status = navigationForm.status === -1 ? undefined : navigationForm.status
      params.dataCycle = navigationForm.dataCycle // dataCycle 直接传递，包括0（全部时间）

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
      params.dataCycle = navigationForm.dataCycle // dataCycle 直接传递，包括0（全部时间）

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
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })

    // 根据不同场景选择不同的接口
    let res: any

    // 项目视图（boardType=2的navigation tab）使用 boardDetailPage 接口
    if (boardType.value === 2 && activeDeptTab.value === 'navigation') {
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
    }
    // 部门看板（boardType=3）的任务列表也使用 boardDetailPage 接口
    else if (boardType.value === 3 && activeDetailTab.value === 'task') {
      res = await BoardApi.getBoardDetailPage(params)

      // 处理任务列表数据
      const taskPage = res.userTaskPage || {}
      navigationTaskList.value = taskPage.list || []
      navigationTotal.value = taskPage.total || 0
    }
    // 其他情况使用普通分页接口
    else {
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

// 部门任务状态清空
const handleDeptTaskStatusClear = () => {
  deptTaskForm.status = -1
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 部门任务时间维度清空
const handleDeptTaskDataCycleClear = () => {
  deptTaskForm.dataCycle = 0
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 部门任务项目性质清空
const handleDeptTaskTypeClear = () => {
  deptTaskForm.taskTypeId = ''
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 部门任务分类清空
const handleDeptTaskClassClear = () => {
  deptTaskForm.taskClass = ''
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 部门任务筛选重置
const handleDeptTaskReset = () => {
  deptTaskForm.status = -1
  deptTaskForm.dataCycle = 0
  deptTaskForm.userId = ''
  deptTaskForm.taskTypeId = ''
  deptTaskForm.taskClass = ''
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

const handleDeptTabChange = () => {
  // 切换tab时重置所有筛选条件
  // 1. 重置时间维度筛选器（部门总览和部门总结共用）
  deptFilterIndex.value = 0

  // 2. 重置部门总结的排序类型
  if (activeDeptTab.value === 'ranking') {
    rankingOrderType.value = 0
  }

  // 3. 如果切换到项目视图
  if (activeDeptTab.value === 'navigation') {
    // 重置项目视图的所有筛选条件
    navigationForm.statusIndex = 0
    navigationForm.status = -1
    navigationForm.projectIndex = 0
    navigationForm.taskProjectId = null
    navigationForm.taskTypeIndex = 0
    navigationForm.taskTypeId = ''
    navigationForm.deptIndex = 0
    navigationForm.deptId = ''
    navigationForm.userIndex = 0
    navigationForm.userId = ''
    navigationForm.dataCycleIndex = 0
    navigationForm.dataCycle = 0
    navigationPagination.pageNo = 1
    navigationNoMore.value = false

    // 加载项目视图数据
    handleNavigationTabClick()
  } else if (activeDeptTab.value === 'assessment') {
    // 4. 如果切换到项目考核
    activeAssessmentTab.value = 'evaluation'
    evaluationFilterIndex.value = 0
    scoreFilterIndex.value = 0
    // 加载项目列表（会自动加载第一个项目的数据）
    loadAssessmentProjectList()
  } else {
    // 切换到部门总览或部门总结时，重新加载数据
    if (boardType.value === 2) {
      loadBoardInfo(currentDeptId.value || undefined)
    } else if (boardType.value === 3) {
      loadDeptDetail()
    }
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
      ...deptList.map((item) => ({
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

// 获取任务分类列表
const getTaskClassList = async () => {
  try {
    const res = await TaskClassApi.getTaskClassList({ classType: 1 })
    const classList = res.list || res || []
    taskClassOptions.value = [
      { text: '全部分类', value: '' },
      ...classList.map((item: any) => ({
        text: item.name,
        value: item.id
      }))
    ]
  } catch (err) {
    console.error('获取任务分类失败', err)
    ElMessage.error('获取任务分类失败')
  }
}

// 获取项目视图部门的员工列表
const getNavigationDeptUsers = async () => {
  try {
    const userList = await getSimpleUserList()
    navigationUserOptions.value = userList.map((item) => ({
      nickname: item.nickname || item.username,
      id: item.id
    }))
  } catch (err) {
    console.error('获取员工列表失败', err)
    navigationUserOptions.value = []
  }
}

const handleDeptFilterChange = () => {
  console.log('🟢 handleDeptFilterChange 被调用, boardType:', boardType.value)

  // 筛选条件改变时，根据 boardType 调用不同的加载函数
  if (boardType.value === 3) {
    // 部门详情视图：重新加载部门详情
    loadDeptDetail()
  } else {
    // 部门总览视图：保持当前部门ID加载数据
    loadBoardInfo(currentDeptId.value || undefined)
  }
}

const handleNavigationStatusChange = () => {
  // 索引映射：0-总任务, 4-延期, 1-待处理, 2-进行中, 3-已完成
  const statusMap: Record<number, number> = {
    0: -1, // 总任务
    4: 4, // 延期
    1: 0, // 待处理
    2: 1, // 进行中
    3: 2 // 已完成
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

// 项目视图项目名称清空
const handleNavigationProjectClear = () => {
  navigationForm.projectIndex = 0
  navigationForm.taskProjectId = null
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 项目视图项目性质清空
const handleNavigationTaskTypeClear = () => {
  navigationForm.taskTypeIndex = 0
  navigationForm.taskTypeId = ''
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 项目视图部门清空
const handleNavigationDeptClear = () => {
  navigationForm.deptIndex = 0
  navigationForm.deptId = ''
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 项目视图员工清空
const handleNavigationUserClear = () => {
  navigationForm.userIndex = 0
  navigationForm.userId = ''
  navigationPagination.pageNo = 1
  loadNavigationTasks()
}

// 项目视图时间周期清空
const handleNavigationDataCycleClear = () => {
  navigationForm.dataCycleIndex = 0
  navigationForm.dataCycle = 0
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
    [-1]: 0, // 总任务
    3: 4, // 延期
    0: 1, // 待处理
    1: 2, // 进行中
    2: 3 // 已完成
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
    const hasSubDepts =
      boardInfo.value?.detailRespVOList && boardInfo.value.detailRespVOList.length > 0

    if (!hasSubDepts) {
      // 没有下级部门：切换到 boardType=3，显示任务列表和员工排名等
      console.log('该部门没有下级，切换到部门详情视图')
      boardType.value = 3
      // 已经获取了 boardInfo，传递 skipBoardInfo=true 避免重复请求
      await loadDeptDetail(true)
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
// skipBoardInfo: 是否跳过获取 BoardInfo（如果已经获取过了）
const loadDeptDetail = async (skipBoardInfo = false) => {
  console.log('🔵 loadDeptDetail 被调用, skipBoardInfo:', skipBoardInfo, new Error().stack)

  // 1. 获取该部门的BoardInfo (头部统计)
  let res: any
  if (!skipBoardInfo) {
    const boardParams = {
      orgCycle: boardType.value, // 使用 boardType 作为 orgCycle
      deptId: currentDeptId.value,
      dataCycle: deptFilterIndex.value
    }

    console.log('🔵 loadDeptDetail 请求参数:', boardParams)
    res = await BoardApi.getBoardInfo(boardParams)
  } else {
    // 使用已经获取的 boardInfo
    console.log('🔵 loadDeptDetail 跳过 getBoardInfo 请求，使用已有数据')
    res = boardInfo.value
  }

  console.log('getBoardInfo 原始返回数据:', res)
  console.log('focusTaskList 原始数据:', res.focusTaskList)
  console.log('focusTaskList 是否为数组:', Array.isArray(res.focusTaskList))

  // 处理返回数据
  boardInfo.value = res

  // 处理 focusTaskList 的数据格式
  // 如果后端返回的是嵌套结构，需要提取出来
  if (res.focusTaskList) {
    // 可能的格式1: 直接是数组
    if (Array.isArray(res.focusTaskList)) {
      boardInfo.value.focusTaskList = res.focusTaskList
    }
    // 可能的格式2: 是对象，包含 list 或其他字段
    else if (typeof res.focusTaskList === 'object') {
      boardInfo.value.focusTaskList =
        (res.focusTaskList as any).list || (res.focusTaskList as any).records || []
    }
    // 其他情况，设为空数组
    else {
      boardInfo.value.focusTaskList = []
    }
  } else {
    boardInfo.value.focusTaskList = []
  }

  console.log('处理后的 focusTaskList:', boardInfo.value.focusTaskList)

  // 如果接口返回了部门名称，更新 currentDeptName
  if (boardInfo.value?.deptName) {
    currentDeptName.value = boardInfo.value.deptName
  }

  // 2. 加载部门员工列表
  await loadDeptUsers()

  // 3. 使用 nextTick 确保 DOM 更新后再加载 tab 数据，避免与 el-tabs 的内部事件冲突
  await nextTick()

  // 设置标志位，然后延迟一帧加载数据
  isLoadingDetailTab = true
  setTimeout(async () => {
    try {
      // 根据当前 tab 加载对应数据
      if (activeDetailTab.value === 'task') {
        // 重置任务列表筛选条件
        deptTaskForm.status = -1
        deptTaskForm.dataCycle = 0
        deptTaskForm.userId = ''
        deptTaskForm.taskTypeId = ''
        deptTaskForm.taskClass = ''
        navigationPagination.pageNo = 1
        await loadNavigationTasks()
      } else if (activeDetailTab.value === 'employee') {
        employeeSummaryFilterIndex.value = 0
        await loadEmployeeSummaryList()
      } else if (activeDetailTab.value === 'rank') {
        employeeRankFilterIndex.value = 0
        employeeRankOrderType.value = 0
        await loadEmployeeRankList()
      } else if (activeDetailTab.value === 'focus') {
        focusTimeFilterIndex.value = 0
        await loadFocusTimeRankList()
      }
    } finally {
      isLoadingDetailTab = false
    }
  }, 0)
}

// 加载部门员工列表
const loadDeptUsers = async () => {
  try {
    const userList = await getSimpleUserList()
    // 可以根据 currentDeptId 过滤，这里暂时显示全部
    deptUserOptions.value = userList.map((item) => ({
      nickname: item.nickname || item.username,
      id: item.id
    }))
  } catch (err) {
    console.error('获取部门员工列表失败', err)
    deptUserOptions.value = []
  }
}

// Tab 切换处理（用于处理 tab 切换事件，避免重复加载）
let isLoadingDetailTab = false // 标志位：防止重复加载
const handleDetailTabChange = async (tabName: string) => {
  // 如果正在加载中，跳过
  if (isLoadingDetailTab) {
    return
  }

  isLoadingDetailTab = true
  try {
    // 切换tab时重置对应的筛选条件
    if (tabName === 'task') {
      // 重置任务列表筛选条件
      deptTaskForm.status = -1
      deptTaskForm.dataCycle = 0
      deptTaskForm.userId = ''
      deptTaskForm.taskTypeId = ''
      deptTaskForm.taskClass = ''
      navigationPagination.pageNo = 1
      await loadNavigationTasks()
    } else if (tabName === 'employee') {
      // 重置员工总结筛选条件
      employeeSummaryFilterIndex.value = 0
      await loadEmployeeSummaryList()
    } else if (tabName === 'rank') {
      // 重置员工排名筛选条件
      employeeRankFilterIndex.value = 0
      employeeRankOrderType.value = 0
      await loadEmployeeRankList()
    } else if (tabName === 'focus') {
      // 重置专注时长筛选条件
      focusTimeFilterIndex.value = 0
      await loadFocusTimeRankList()
    }
  } finally {
    isLoadingDetailTab = false
  }
}

// 加载员工总结列表
const loadEmployeeSummaryList = async () => {
  try {
    const params = {
      orgCycle: boardType.value, // 添加组织周期参数
      deptId: currentDeptId.value,
      dataCycle: employeeSummaryFilterIndex.value,
      orderType: 0 // 添加默认排序类型
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
      orgCycle: boardType.value, // 添加组织周期参数
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
      orgCycle: boardType.value, // 添加组织周期参数
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

// ==================== 项目考核相关方法 ====================

// 加载项目成员评价数据报告
const loadProjectUserEvaList = async () => {
  if (!selectedProjectId.value) {
    evaluationList.value = []
    return
  }
  evaluationLoading.value = true
  try {
    const params = {
      projectId: selectedProjectId.value,
      dataCycle: evaluationFilterIndex.value,
      status: 0
    }
    const res = await BoardApi.getProjectUserEvaList(params)
    // 处理返回数据格式
    if (res && typeof res === 'object' && 'data' in res) {
      evaluationList.value = (res as any).data || []
    } else if (Array.isArray(res)) {
      evaluationList.value = res
    } else {
      evaluationList.value = []
    }
  } catch (err) {
    console.error('获取项目成员评价数据失败', err)
    ElMessage.error('获取项目成员评价数据失败')
    evaluationList.value = []
  } finally {
    evaluationLoading.value = false
  }
}

// 加载项目成员得分总结
const loadProjectUserScoreList = async () => {
  if (!selectedProjectId.value) {
    scoreList.value = []
    return
  }
  scoreLoading.value = true
  try {
    const params = {
      projectId: selectedProjectId.value,
      dataCycle: scoreFilterIndex.value
    }
    const res = await BoardApi.getProjectUserScoreList(params)
    // 处理返回数据格式
    if (res && typeof res === 'object' && 'data' in res) {
      scoreList.value = (res as any).data || []
    } else if (Array.isArray(res)) {
      scoreList.value = res
    } else {
      scoreList.value = []
    }
  } catch (err) {
    console.error('获取项目成员得分数据失败', err)
    ElMessage.error('获取项目成员得分数据失败')
    scoreList.value = []
  } finally {
    scoreLoading.value = false
  }
}

// 评价数据筛选条件变化
const handleEvaluationFilterChange = () => {
  loadProjectUserEvaList()
}

// 得分筛选条件变化
const handleScoreFilterChange = () => {
  loadProjectUserScoreList()
}

// 项目考核子Tab切换
const handleAssessmentTabChange = (tabName: string) => {
  if (tabName === 'evaluation') {
    // 切换到评价数据报告
    evaluationFilterIndex.value = 0
    loadProjectUserEvaList()
  } else if (tabName === 'score') {
    // 切换到得分总结
    scoreFilterIndex.value = 0
    loadProjectUserScoreList()
  }
}

// 获取项目列表（根据权限返回，无需参数）
const loadAssessmentProjectList = async () => {
  try {
    const res = await TaskClassApi.listMyProject()
    const projectList = res.list || res || []
    assessmentProjectList.value = projectList.map((item: any) => ({
      id: item.id,
      name: item.name
    }))
    // 默认选中第一个项目
    if (assessmentProjectList.value.length > 0) {
      selectedProjectId.value = assessmentProjectList.value[0].id
      // 根据当前激活的 tab 加载对应数据
      if (activeAssessmentTab.value === 'evaluation') {
        loadProjectUserEvaList()
      } else if (activeAssessmentTab.value === 'score') {
        loadProjectUserScoreList()
      }
    }
  } catch (err) {
    console.error('获取项目列表失败', err)
    ElMessage.error('获取项目列表失败')
  }
}

// 项目选择变化
const handleAssessmentProjectChange = () => {
  // 根据当前激活的 tab 重新加载数据
  if (activeAssessmentTab.value === 'evaluation') {
    loadProjectUserEvaList()
  } else if (activeAssessmentTab.value === 'score') {
    loadProjectUserScoreList()
  }
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
    5: { bg: '#FFCCCC', color: '#D35C5C' } // 延期完成
  }
  return colorMap[status] || { bg: '#E6F1FF', color: '#1E5BB5' }
}

onMounted(() => {
  // 清空部门层级栈
  deptLevelStack.value = []
  canGoBack.value = false

  // 加载任务分类列表
  getTaskClassList()

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
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.05);
    transition: all 0.3s;

    // 移除默认内边距，我们自己控制
    .el-card__body {
      padding: 16px;
    }

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 21, 41, 0.08);
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
  .dept-summary,
  .dept-ranking,
  .navigation-view {
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

  &.content-filter-with-rule {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;

    .rule-tip-btn {
      margin-left: auto;
      flex-shrink: 0;
    }
  }
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
      border-right: 1px solid #ebeef5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      color: $text-secondary;

      &.top-ranking {
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

            &.highlight {
              color: $primary-color;
            }
            &.danger {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
}

// 项目考核视图
.assessment-view {
  background: transparent;
  padding: 16px 0;
  border: none;

  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  .evaluation-content,
  .score-content {
    .empty-text {
      text-align: center;
      color: $text-secondary;
      padding: 40px 0;
      font-size: 14px;
    }
  }

  // 得分值特殊样式
  .score-value {
    font-size: 18px;
    font-weight: 600;
    color: $primary-color;
  }

  // 表格样式优化
  :deep(.el-table) {
    th.el-table__cell {
      background-color: #f5f7fa;
      color: $text-main;
      font-weight: 600;
    }

    .el-table__body-wrapper {
      .el-table__cell {
        padding: 12px 0;
      }
    }
  }
}

// 考核规则说明弹窗
.assessment-rule-content {
  max-height: 70vh;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;

  h4 {
    margin: 20px 0 12px;
    font-size: 15px;
    color: $text-main;
    &:first-child {
      margin-top: 0;
    }
  }

  h5 {
    margin: 16px 0 8px;
    font-size: 14px;
    color: $text-regular;
  }

  .sub-title {
    margin: 8px 0 4px;
    font-size: 13px;
    color: $text-secondary;
  }

  .rule-note {
    margin: 12px 0;
    color: $text-secondary;
    font-size: 13px;
  }

  .rule-table {
    margin: 8px 0 16px;
  }

  p {
    margin: 8px 0;
    color: $text-regular;
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

      &:hover {
        color: $primary-color;
      }
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

  .list-card,
  .ranking-list-card {
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

    // 正在执行任务区域
    .focus-task-section {
      margin-bottom: 16px;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 12px;
        padding-left: 8px;
        border-left: 3px solid var(--el-color-primary);
      }

      .focus-task-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 12px;

        .focus-task-card {
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          :deep(.el-card__body) {
            padding: 12px;
          }

          .focus-task-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .focus-task-title {
              font-size: 14px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-right: 8px;
            }
          }

          .focus-task-user {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-bottom: 8px;
          }
        }
      }
    }

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
    .dept-summary,
    .dept-ranking,
    .navigation-view {
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
        border-right-color: var(--el-fill-color-darker);
        color: var(--el-text-color-secondary);
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
  .list-card,
  .ranking-list-card {
    .card-header {
      color: var(--el-text-color-primary);
    }
  }

  // 项目考核暗色模式
  .assessment-view {
    .evaluation-content,
    .score-content {
      .empty-text {
        color: var(--el-text-color-secondary);
      }
    }

    .score-value {
      color: var(--el-color-primary);
    }

    :deep(.el-table) {
      th.el-table__cell {
        background-color: var(--el-fill-color);
        color: var(--el-text-color-primary);
      }
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
