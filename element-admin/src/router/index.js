import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '../views/main.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'main',
    component: Main,
    redirect: '/order',
    children: [
      {
        path: '/order',
        component: () => import('../views/order.vue')
      },
      //档案
      {
        path: '/data/goods',
        component: () => import('../views/data/goods.vue')
      },
      {
        path: '/data/category',
        component: () => import('../views/data/category.vue')
      },
      {
        path: '/data/price',
        component: () => import('../views/data/price.vue')
      },
      {
        path: '/data/wx_user',
        component: () => import('../views/data/wx_user.vue')
      },
      //营销
      {
        path: '/promotion/banner',
        component: () => import('../views/promotion/banner.vue')
      },
      {
        path: '/promotion/seckilling',
        component: () => import('../views/promotion/seckilling.vue')
      },
      {
        path: '/promotion/recommend',
        component: () => import('../views/promotion/recommend.vue')
      },
      {
        path: '/promotion/hot',
        component: () => import('../views/promotion/hot.vue')
      },
      {
        path: '/promotion/coupon',
        component: () => import('../views/promotion/coupon.vue')
      },
      //设置
      {
        path: '/setting/store',
        component: () => import('../views/setting/store.vue')
      },
      {
        path: '/setting/freight',
        component: () => import('../views/setting/freight.vue')
      },
      {
        path: '/setting/pay',
        component: () => import('../views/setting/pay.vue')
      },
      {
        path: '/setting/printer',
        component: () => import('../views/setting/printer.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    meta: {
      requireNoAuth: true,  // 该路由项无需校验
    },
    component: () => import('../views/login/login.vue')
  },
  {
    path: '/reg',
    name: 'reg',
    meta: {
      requireNoAuth: true,  // 该路由项无需校验
    },
    component: () => import('../views/login/reg.vue')
  }
]

const router = new VueRouter({
  routes
})

// 全局前置守卫（回调函数）
router.beforeEach((to, from, next) => {
  if (to.meta.requireNoAuth == true) {
    window.console.log(`路由${to.path}不验证token`)
    next()
  } else {
    window.console.log(`路由${to.path}需要验证token`)
    if (window.localStorage.getItem('token') != undefined) {
      window.console.log('token存在')
      // let tokenTimetoInt = window.localStorage.getItem('tokenExpire')
      // tokenTimetoInt = +tokenTimetoInt + 1800000//毫秒
      // // window.console.log('555:'+tokenTimetoInt)
      // // window.console.log('666:'+new Date().getTime())
      // if (tokenTimetoInt < new Date().getTime()) {
      //   window.console.log('token过期时间小于当前时间')
      //   new Vue().$message.error('登录已过期 请重新登录')
      //   window.localStorage.clear()
      //   next({
      //     path: '/login',
      //     query: { redirect: to.fullPath }  // 将跳转的路由path作为参数，登录成功后跳转到该路由
      //   })
      // }
      // else {
      //   window.console.log('token过期时间大于当前时间，刷新token过期时间')
      //   window.localStorage.setItem("tokenExpire", new Date().getTime());
      // }
      next()
    } else {
      window.console.log('token不存在')
      new Vue().$message.error('无法打开界面 请先登录')
      window.localStorage.clear()
      next({
        path: '/login',
        query: { redirect: to.fullPath }  // 将跳转的路由path作为参数，登录成功后跳转到该路由
      })
    }
  }
})

//此VueRouter是自己自定义引入暴露出来的，即是自定义的，以下的VueRouter同样是这样
//解决两次访问相同路由地址报错
const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  window.console.log('不用跳转')
  return routerPush.call(this, location).catch(error => error)
}

//界面刷新或界面关闭
window.onunload = function () {
  window.localStorage.clear()
}

export default router
