import { supabase } from '../../lib/supabaseClient'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: 0,
    phone: '',
    code: '',
    codebtn: '发送验证码',
    disabled: false,

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 获取输入账号 
  phone: function (e) {
    let phone = e.detail.value;
    let reg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (!reg.test(phone)) {
      wx.showToast({
        title: '手机号码格式不正确',
        icon: "none",
        duration: 2000
      })
      return false;
    }
    this.setData({
      phone: e.detail.value
    })
  },
  // 获取输入验证码
  code: function (e) {
    let code = e.detail.value;
    this.setData({
      code: code
    })
  },
  //发送验证码
  async sendcode(res) {
    var phone = this.data.phone;
    var time = 60;
    var that = this;
    that.setData({ disabled: true })
    let { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
    })
    if (error) {
      wx.showToast({
        title: error.message || error.error_description,
        duration: 1500,
        icon: "none",
      });
      that.setData({ disabled: false })
    } else {
      setTimeout(() => {
        that.setData({ disabled: false })
      }, 60000);
    }
  },
  // 登录处理
  async login(e) {
    var phone = this.data.phone
    var code = this.data.code
    let { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: code,
      type: 'sms',
    })
    if(error){
      wx.showToast({
        title: error.message || error.error_description,
        duration: 1500,
        icon:'none'
      });
    }else{
      app.globalData.userInfo = data.session.user;
      if(JSON.stringify(data.session.user.user_metadata) === '{}'){
        wx.showToast({
          title: '登录成功,前往修改个人信息页面',
          duration: 1500
        });
        wx.switchTab({
          url: '/pages/userinfo/index',
        })
      }else{
        wx.showToast({
          title: '登录成功',
          duration: 1500
        });
        wx.switchTab({
          url: '/pages/index/index',
        })
      }

    }
  },


})