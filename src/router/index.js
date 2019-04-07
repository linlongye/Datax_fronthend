import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main_page',
      component: Main,
      children: [
        {
          path: "/",
          component: () => import('@/components/view/RepeatTask')
        }, {
          path: '/manage',
          component: () => import('@/components/view/UserManager')
        }, {
          path: "/temptask",
          component: () => import('@/components/view/TempTask')
        },
        {
          path: "/setting",
          component: () => import('@/components/view/SystemSetting')
        }]
    },
    {
      path: "/login", name: "login", component: () => import("@/components/login/index"),
    }
  ]
})
