import { httpPost } from '@/utils/request'
import {
  SubmitOutSideModel
} from '@/api/outSide/model'
import { HttpResponseModel } from '@/model/httpType'

export default {
  /**
   * 外勤考勤打卡
   * @param outSideInfo
   * @returns
   */
  submitOutSide (outSideInfo: SubmitOutSideModel) {
    return httpPost<HttpResponseModel>('/attence/addWq', outSideInfo)
  }
}
