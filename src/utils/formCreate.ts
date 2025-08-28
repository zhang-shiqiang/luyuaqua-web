/**
 * 针对 https://github.com/xaboy/form-create-designer 封装的工具类
 */
import { isRef } from 'vue'
import formCreate from '@form-create/element-ui'

// 编码表单 Conf
export const encodeConf = (designerRef: object) => {
  // @ts-ignore
  return JSON.stringify(designerRef.value.getOption())
}

// 编码表单 Fields
export const encodeFields = (designerRef: object) => {
  // @ts-ignore
  const rule = JSON.parse(designerRef.value.getJson())
  const fields: string[] = []
  rule.forEach((item) => {
    fields.push(JSON.stringify(item))
  })
  return fields
}

// 解码表单 Fields
export const decodeFields = (fields: string[]) => {
  const rule: object[] = []
  fields.forEach((item) => {
    rule.push(formCreate.parseJson(item))
  })
  return rule
}

// 设置表单的 Conf 和 Fields，适用 FcDesigner 场景
export const setConfAndFields = (designerRef: object, conf: string, fields: string) => {
  // @ts-ignore
  designerRef.value.setOption(formCreate.parseJson(conf))
  // @ts-ignore
  designerRef.value.setRule(decodeFields(fields))
}

// 设置表单的 Conf 和 Fields，适用 form-create 场景
export const setConfAndFields2 = (
  detailPreview: object,
  conf: string,
  fields: string[],
  value?: object
) => {
  if (isRef(detailPreview)) {
    // @ts-ignore
    detailPreview = detailPreview.value
  }

  // @ts-ignore
  detailPreview.option = formCreate.parseJson(conf)
  // @ts-ignore
  detailPreview.rule = decodeFields(fields)

  if (value) {
    // @ts-ignore
    detailPreview.value = value
  }
}
