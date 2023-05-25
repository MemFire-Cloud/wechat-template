const app = getApp();
Page({
  data: {

  },
  goTodo(){
    if(app.globalData.userInfo){
      wx.navigateTo({
        url: '/pages/todo/index',
      })
    }else{
      wx.showToast({
        title: '请先去登录认证',
        icon: 'none',
        duration: 2000
      })
    }
  },
  goRoom(){
    if(app.globalData.userInfo){
      wx.navigateTo({
        url: '/pages/messages/index',
      })
    }else{
      wx.showToast({
        title: '请先去登录认证',
        icon: 'none',
        duration: 2000
      })
    }
  },
  goFile(){
    if(app.globalData.userInfo){
      wx.navigateTo({
        url: '/pages/filestorage/index',
      })
    }else{
      wx.showToast({
        title: '请先去登录认证',
        icon: 'none',
        duration: 2000
      })
    }
  }
})