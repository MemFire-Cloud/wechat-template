// pages/addTodo/index.js
import {
  supabase
} from '../../lib/supabaseClient'
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    todoInfo: {},
    user_id:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    this.setData({
      user_id: app.globalData.userInfo.id
    })
    if (options && options.id) {
      this.setData({ id: options.id });
      const { data, error } = await supabase
        .from("todo_list")
        .select("*")
        .eq("id", options.id);
        if (error) {
          wx.showToast({
            title: error.message || error.error_description,
            icon: "none",
            duration: 2000
          })
        } else {
          this.setData({
            todoInfo: data.data[0]
          })
        }
    }
  },
  async addItem(){
    if (!this.data.id) {
      var {
        error
      } = await supabase
        .from('todo_list')
        .insert({
          todo: this.data.todoInfo.todo,
          completed: false,
          user_id: this.data.user_id
        })
    } else {
      var {
        error
      } = await supabase
        .from('todo_list')
        .update({
          todo: this.data.todoInfo.todo,
          completed: this.data.todoInfo.completeCheck
        })
        .eq('id', this.data.id)
    }
    if (error) {
      wx.showToast({
        title: error.message || error.error_description,
        icon: "none",
        duration: 2000
      })
    } else {
      wx.showToast({
        title: this.data.todo_id ? '修改成功' : '添加成功',
        icon: "none",
        duration: 2000
      });
      wx.navigateTo({
        url: '/pages/todo/index',
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  todoinput(e) {
    this.setData({ 'todoInfo.todo': e.detail.value });
  },
});
