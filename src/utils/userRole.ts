/**
 * 获取用户身份
 * 根据用户角色列表，从上到下按优先级获取最高身份
 * @returns 'admin' | 'leader' | 'user'
 */
export function getUserIdentity(): 'admin' | 'leader' | 'user' | 'pm' {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userInfo = JSON.parse(user.v || '{}')
    const roles: string[] = userInfo?.roles || []
    // 角色到身份的映射
    const roleMap: Record<string, 'admin' | 'leader' | 'user' | 'pm'> = {
      super_admin: 'admin',
      company_leader: 'admin',
      system_admin: 'admin',
      dept_leader: 'leader',
      leader: 'leader',
      staff: 'user',
      pm: 'pm'
    }

    // 身份优先级
    const priority = { admin: 3, leader: 2, pm: 2, user: 1 }

    // 遍历角色列表，找到最高优先级的身份
    let highestIdentity: 'admin' | 'leader' | 'user' | 'pm' = 'user'
    let highestPriority = 1

    for (const role of roles) {
      const identity = roleMap[role]
      if (identity && priority[identity] > highestPriority) {
        highestPriority = priority[identity]
        highestIdentity = identity
      }
    }

    return highestIdentity
  } catch (error) {
    console.error('获取用户身份失败:', error)
    return 'user'
  }
}

export const getUserDeptId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userInfo = JSON.parse(user.v || '{}')
    return userInfo?.shiftType || 0
  } catch (error) {
    console.error('获取用户部门ID失败:', error)
    return 0
  }
}
