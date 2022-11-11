import { Module } from 'vuex'
import { StateModel, SystemStateModel } from '@/store/model'
import { RouteRecordNormalized } from 'vue-router'

export const systemStore: Module<SystemStateModel, StateModel> = {
  namespaced: true,
  state: {
    cachedViews: []
  },
  mutations: {
    setCacheView: (state: SystemStateModel, routeList: Array<RouteRecordNormalized>) => {
      state.cachedViews = []
      routeList.forEach(route => {
        if (!route.meta.noCache && route.name) {
          state.cachedViews.push(route.name.toString())
        }
      })
    }
  }
}
