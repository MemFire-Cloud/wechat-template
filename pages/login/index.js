// pages/main/index.ts
const app = getApp();
import { supabase } from '../../lib/supabaseClient'
Page({
  data: {

  },
  login(){
    wx.login({
      success: async res => {
        const { data, error } = await supabase.auth.signInWithWechat({code:res.code})
        if(error){
          wx.showToast({
            title: error?.error || error?.msg,
            icon: "none",
            duration: 2000
          })
        }else if(data){
          if(JSON.stringify(data.user.data.user.user_metadata) === "{}"){
            setTimeout(() => {
              wx.showModal({
                title: '提示',
                content: '登录成功！去填充个人资料吧！',
                success (res) {
                  if (res.confirm) {
                    wx.redirectTo({
                      url:'/pages/userinfo/index'
                    })
                  } else if (res.cancel) {
                  }
                }
              })
            }, 1000);
          }else {
            app.globalData.userInfo = data.user.data.user;
            wx.switchTab({
              url:'/pages/index/index'
            })
          }

        }
      },
      fail(err){
        wx.showToast({
          title: err.errMsg,
          icon: "none",
          duration: 2000
        })
      }
    })
  },
  phoneLogin(){
    wx.navigateTo({
      url: '/pages/phone-login/index',
    })
  }

})