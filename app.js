import { supabase } from './lib/supabaseClient'
// app.js
App({
 async onLaunch() {
    //获取用户信息
    try {
      const { data: { user }, error } = await supabase
        .auth.getUser()
      if (error) {
        throw error
      } else {
        this.globalData.userInfo = user.data;
        wx.switchTab({
          url: '/pages/index/index',
        })
      }
    } catch (error) {
      throw error.message || error.error_description
    }
  },

  globalData: {
    userInfo: null
  }
})
