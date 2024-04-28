import { $api } from '@/plugins/axiosPlugin'
import { type ModelListType } from './list'

type ListExtraMethod<T extends ModelListType = ModelListType> = (...args: any[]) => (this: T) => any

// TODO somehow type the function more precisely
export const listExporterFunctionFactory: ListExtraMethod = () => {
  return function () {
    const baseUrl = this.definition.url
    $api.get(`${baseUrl}export/`, { responseType: 'arraybuffer' }).then((response) => {
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = response.headers['content-disposition'].split('filename=')[1]
      link.click()
    })
  }
}
