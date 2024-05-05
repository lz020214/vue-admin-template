import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

// 导航守卫
// 这里有3个参数
// 你要去哪里
// 从哪里来
// 是否要放行
router.beforeEach(async(to, from, next) => {
  // start progress bar
  // 显示进度条
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  // token 判断
  const hasToken = getToken()

  if (hasToken) {
    // 如果有token 你还想要登录那就没有必要进行登录了
    if (to.path === '/login') {  
      // if is logged in, redirect to the home page
      // 就进去首页
      next({ path: '/' })
      // 进度条关闭
      NProgress.done()
    } else {
      // 取出你的用户名称
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        // 如果有用户名称，就进行放行
        next()
      } else {
        try {
          // get user info
          // 如果没有用户名称则请求用户信息 注意这里是调用action 中的方法
          await store.dispatch('user/getInfo')
          // 拿到用户信息则再去放行
          next()
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    // 如果没有token ，查看白名单，这里的白名单
    // 只有登录页面，如果你没有白名单就只能去登录界面
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      // 这里记录你没有token ， 但是你想要去哪一个页面
      // 登录完成之后再跳转到他想要去的页面
      next(`/login?redirect=${to.path}`) 
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
