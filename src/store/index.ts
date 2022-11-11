import { createStore } from 'vuex'
import { userStore } from '@/store/modules/user'
import { systemStore } from '@/store/modules/system'

export default createStore({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    user: userStore,
    system: systemStore
  }
})
