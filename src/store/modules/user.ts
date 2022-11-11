import { Commit, Module } from 'vuex'
import { StateModel, UserStateModel } from '@/store/model'
import { getToken, setToken } from '@/utils/auth'
import { getEnv } from '@/utils/env'
import { EnvType } from '@/model/envType'
import BaseApi from '@/api/base'
import { getQueryString, isNotEmpty } from '@/utils/tool'
import { ResponseCode } from '@/model/httpType'
import cache, { OpenIdKey } from '@/utils/cache'
import { UserInfoByOpenIdResponseModel } from '@/api/base/model'

// 根据接口返回值 设置用户信息
function setUserInfoFromRes (commit: Commit, res: UserInfoByOpenIdResponseModel | null) {
  if (res?.code === ResponseCode.success) {
    commit('setUserInfo', res.data)
    return Promise.resolve(res)
  }
  return Promise.resolve(null)
}

export const userStore: Module<UserStateModel, StateModel> = {
  namespaced: true,
  state: {
    // 人员序号
    userSerial: undefined,
    // 工号
    userNo: '',
    // 姓名
    userLname: '',
    // openid
    openId: '',
    // 企业ID，用于获取组织架构等
    orgId: '',
    // 企业名称
    orgName: '',
    // 密钥，用于登录之后的其他接口
    token: getToken(),
    // 部门序号
    userDep: undefined,
    // 部门名称
    userDepname: '',
    // 是否有档案照片：0无；1有；
    userPhoto: undefined,
    // 档案照片
    userPhotoImg: undefined
  },
  mutations: {
    setUserSerial: (state: UserStateModel, userSerial?: number) => {
      state.userSerial = userSerial
    },
    setUserNo: (state: UserStateModel, userNo?: string) => {
      state.userNo = userNo
    },
    setUserLname: (state: UserStateModel, userLname?: string) => {
      state.userLname = userLname
    },
    setOpenId: (state: UserStateModel, openId?: string) => {
      state.openId = openId
    },
    setToken: (state: UserStateModel, token?: string) => {
      state.token = token
    },
    setUserInfo: (state: UserStateModel, userInfo: UserStateModel) => {
      if (isNotEmpty(userInfo.userSerial)) {
        state.userSerial = userInfo.userSerial
      }
      if (userInfo.userNo) {
        state.userNo = userInfo.userNo
      }
      if (userInfo.userLname) {
        state.userLname = userInfo.userLname
      }
      if (userInfo.openId) {
        state.openId = userInfo.openId
      }
      if (userInfo.orgId) {
        state.orgId = userInfo.orgId
      }
      if (userInfo.orgName) {
        state.orgName = userInfo.orgName
      }
      if (userInfo.token) {
        state.token = userInfo.token
        setToken(userInfo.token)
      }
      if (userInfo.userDep) {
        state.userDep = userInfo.userDep
      }
      if (userInfo.userDepname) {
        state.userDepname = userInfo.userDepname
      }
      if (isNotEmpty(userInfo.userPhoto)) {
        state.userPhotoImg = userInfo.userPhotoImg
      }
      if (userInfo.userPhotoImg) {
        state.userPhotoImg = userInfo.userPhotoImg
      }
    }
  },
  actions: {
    // 重新获取用户信息 用于token失效等场景 (非H5)
    reGetUserInfo ({ commit }) {
      const env = getEnv()
      const openId = cache.session.get(OpenIdKey)
      if (openId) {
        // 根据openId获取用户信息
        return BaseApi.getUserInfoByOpenId(openId).then(res => {
          return setUserInfoFromRes(commit, res)
        })
      } else {
        if (env === EnvType.wx) {
          // 微信端根据code获取openid以及用户信息
          const code = getQueryString('code')
          if (code) {
            // 根据code获取openid以及用户信息
            return BaseApi.getOpenId(code).then(res => {
              if (res?.code === ResponseCode.success) {
                cache.session.set(OpenIdKey, res.data.openId)
                // 根据用户id获取用户
                return BaseApi.getUserInfoByOpenId(res.data.openId)
              } else {
                return Promise.reject()
              }
            }).then(res => {
              return setUserInfoFromRes(commit, res)
            })
          }
        } else if (env === EnvType.wxApp) {
          // 小程序端通过unionId获取openid以及用户信息
        } else if (env === EnvType.h5) {
          return BaseApi.getUserInfoByToken().then(res => {
            if (res?.code === ResponseCode.success) {
              return setUserInfoFromRes(commit, res)
            } else {
              return Promise.reject()
            }
          })
        }
      }
      return Promise.resolve(null)
    }
  }
}
