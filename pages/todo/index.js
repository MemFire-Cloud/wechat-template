import {
  supabase
} from '../../lib/supabaseClient'
const app = getApp();
Page({
  data: {
    todoList: [],
    inputValue: '',
    completeCheck: false,
    user_id: null,
    todo_id: null,
  },

  onLoad() {
    this.setData({
      user_id: app.globalData.userInfo.id
    })
  },
  onShow(){
    this.fetchTodo()
  },
  search(e) {
    this.setData({
      inputValue: e.detail
    });
  },
  async radioChange(e) {
    const itemId = e.currentTarget.dataset.id;
    const {
      error
    } = await supabase
      .from('todo_list')
      .update({
        completed: true
      })
      .eq('id', itemId)
      this.fetchTodo()
  },
  async radioChangeUp(e) {
    const itemId = e.currentTarget.dataset.id;
    const {
      error
    } = await supabase
      .from('todo_list')
      .update({
        completed: false
      })
      .eq('id', itemId)
      this.fetchTodo()
  },
  async handerSearch() {
    const {
      data,
      error
    } = await supabase
      .from('todo_list')
      .select('*').order('created_at', {
        ascending: false
      }).filter('todo', 'ilike', `%${this.data.inputValue ? this.data.inputValue : ''}%`)
    if (error) {
      wx.showToast({
        title: error.message || error.error_description,
        icon: "none",
        duration: 2000
      })
    } else {
      this.setData({
        todoList: data.data
      })
    }
  },
  addItem() {
    wx.navigateTo({
      url: '/pages/addTodo/index',
    })
  },
  async fetchTodo() {
    const that = this;
    const {
      data,
      error
    } = await supabase
      .from('todo_list')
      .select('*')
    if (error) {
      wx.showToast({
        title: error.message || error.error_description,
        icon: "none",
        duration: 2000
      })
    } else {
      that.setData({
        todoList: data
      })
    }
  },
 async deleteItem(e) {
    const itemId = e.currentTarget.dataset.id;
    const {
      error
    } = await supabase
      .from('todo_list')
      .delete()
      .eq('id', itemId);
    if (error) {
      wx.showToast({
        title: error.message || error.error_description,
        icon: "none",
        duration: 2000
      })
    } else {
      wx.showToast({
        title: '删除成功！',
        icon: "none",
        duration: 2000
      })
      this.fetchTodo()
    }
  },
  onOpenTodo(e){
    const itemId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/addTodo/index?id='+itemId,
    })
  },
  nofunction(){}
});