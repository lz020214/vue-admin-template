import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    // 名字
    name: '',
    // 头像
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    // 将后端返回的token 记录到state 里面去了
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login，dispatch 触发的是这里的方法
  login({ commit }, userInfo) {
    // 从userInfo 里面取出了帐号和密码
    const { username, password } = userInfo
    // 通过Promise 方式发送了网络请求
    return new Promise((resolve, reject) => {
      // 另外一个login 方法接受了这两个参数，并传递了过去，这个方法点击进去看
      // 即可
      login({ username: username.trim(), password: password }).then(response => {
        // 将响应信息中的data 取了出来
        const { data } = response
        // 从data 里面取出了token，这个token 是比较重要的
        // 这个是用来做登录验证的
        // 这个commit 是会触发mutaion SET_TOKEN
        commit('SET_TOKEN', data.token)
        // 还将token 存储到了浏览器本地cookie
        setToken(data.token) 
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

