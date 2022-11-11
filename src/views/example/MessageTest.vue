<template>
  <div class="home">
    <nut-button type="primary" @click="readCode">扫描二维码</nut-button>
    <div></div>
    <WeSelectFile @change="handelFileChange">
      <nut-button type="primary">选择图片</nut-button>
    </WeSelectFile>
    <div></div>
    <WeSelectFile @change="handelFileChange" :is-camera="true">
      <nut-button type="primary">照相</nut-button>
    </WeSelectFile>
    <div></div>
    <nut-button type="primary" @click="getLocation">定位</nut-button>
    <div></div>
    <nut-button type="primary" @click="showSuccessMessageBoxFun">成功消息弹窗</nut-button>
    <div></div>
    <nut-button type="primary" @click="showWarningMessageBoxFun">警告消息弹窗</nut-button>
    <div></div>
    <nut-button type="primary" @click="showErrorMessageBoxFun">失败消息弹窗</nut-button>
    <div></div>
    <nut-button type="primary" @click="showSuccessMessageFun">成功消息弹</nut-button>
    <div></div>
    <nut-button type="primary" @click="showSuccessMessageNoIconFun">无图标成功消息弹</nut-button>
    <div></div>
    <nut-button type="primary" @click="isVisible=true">日历</nut-button>
    <div></div>
    <div>
      <WeSwitch v-model:value="checked" active-text="通过" inactive-text="不通过"></WeSwitch>
    </div>
    <div>{{ selectedDate }}</div>
    <div class="f1">威尔数据 Weds 2022</div>
    <div class="f2">威尔数据 Weds 2022</div>
    <div class="f3">威尔数据 Weds 2022</div>
    <div class="f4">威尔数据 Weds 2022</div>
    <div class="f5">威尔数据 Weds 2022</div>
    <nut-datepicker
      v-model="selectedDate"
      v-model:visible="isVisible"
      :is-show-chinese="true"
      :three-dimensional="false"
      @change="handleDateChange"
      @confirm="handleDateChoose"
    ></nut-datepicker>
  </div>
</template>

<script setup lang="ts" name="HomeView">
import { getLocation as location, scanQrCode } from '@/utils/native'
import WeSelectFile from '@/components/WeSelectFile/index.vue'
import { Toast } from '@nutui/nutui'
import { emitError } from '@/utils/error'
import { AMapHelper } from '@/utils/aMap'
import WeSwitch from '@/components/WeForm/WeSwitch.vue'
import {
  showErrorMessageBox,
  showSuccessMessage,
  showSuccessMessageBox,
  showWarningMessageBox
} from '@/utils/messageBox'
import { ref } from 'vue'

const checked = ref()
const isVisible = ref(false)
const selectedDate = ref(new Date())

function readCode () {
  scanQrCode().then(res => {
    Toast.text(res || '')
  }).catch(error => {
    emitError(error)
  })
}

function handelFileChange (files: Array<File> | null) {
  console.log(files)
}

function getLocation () {
  AMapHelper.load().then((AMap) => {
    location(AMap).then(res => {
      AMapHelper.reGeocoder(AMap, res).then((addressInfo) => {
        Toast.success(addressInfo.formattedAddress)
      })
    })
  })
}

function showSuccessMessageBoxFun () {
  showSuccessMessageBox('这是一个测试内容', {
    icon: '',
    title: '提示',
    confirmBtn: '知道了'
  }).then(res => {
    console.log(res)
  }).catch(() => {
    console.log('error')
  })
}

function showWarningMessageBoxFun () {
  showWarningMessageBox('请确认要删除此条数据吗？', {
    icon: '',
    title: '提示',
    confirmBtn: '确认',
    cancelBtn: '取消'
  }).then(res => {
    console.log(res)
  }).catch(() => {
    console.log('error')
  })
}

function showErrorMessageBoxFun () {
  showErrorMessageBox('更新数据失败', {
    title: '提示',
    confirmBtn: '知道了'
  }).then(res => {
    console.log(res)
  }).catch(() => {
    console.log('error')
  })
}

function showSuccessMessageFun () {
  showSuccessMessage('这是一个测试内容', {
    title: '提示'
  }).then(res => {
    console.log(res)
  })
}

function showSuccessMessageNoIconFun () {
  showSuccessMessage('这是一个测试内容', {
    title: '提示',
    icon: ''
  }).then(res => {
    console.log(res)
  })
}

function handleDateChange (date: any) {
  console.log(date.selectedValue)
}

function handleDateChoose (date: any) {
  console.log('confirm', date.selectedValue)
}

</script>
<style lang="scss">
.home {
  > div {
    margin-bottom: 20px;
    min-height: 20px;
  }
}

.f1 {
  font-size: $font-size-0;
}

.f2 {
  font-size: $font-size-1;
}

.f3 {
  font-size: $font-size-2;
}

.f4 {
  font-size: $font-size-3;
}

.f5 {
  font-size: $font-size-4;
}
</style>
