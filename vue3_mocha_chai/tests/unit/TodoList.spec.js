import { mount } from '@vue/test-utils'
import {expect} from 'chai'

import TodoList from '@/components/TodoList'



describe('TodoList.vue',()=>{
   it("初始化，数据mask为空",()=>{
       const wrapper = mount(TodoList)
       const maskData = wrapper.vm.mask;
       const maskVal = wrapper.find("input").text();
       expect(maskVal).to.be.equal("")
       expect(maskData).to.be.equal("")
   })
   it("数据框mask跟随输入框内容改变",()=>{
     const wrapper = mount(TodoList);
     const onInput = wrapper.find('input');
      onInput.setValue('我是谁');
      expect(wrapper.vm.mask).to.be.equal("我是谁")
   })
   it('添加任务', () => {
    const wrapper = mount(TodoList);
    const oBtn = wrapper.find('button');
    const length = wrapper.vm.maskList.length;
    oBtn.trigger('click');
    expect(wrapper.vm.maskList).lengthOf(length + 1);
    expect(wrapper.findAll('li')).lengthOf(length + 1);
    expect(wrapper.vm.mask).to.be.equal('');
  })
})