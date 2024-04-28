import { type Ref, ref } from 'vue'
import { $api } from '@/plugins/axiosPlugin'
import { type ModelFieldSetRaw, type ModelData, ModelFieldSet } from './fields'
import type { APIUrl } from './types'
import { getURLSearchParamsSize } from '@/logics/apiInterfaces/utils'

export class ReadOnlyEndpointModelDefinition<T extends APIUrl, FS extends ModelFieldSetRaw> {
  readonly url: T
  readonly fieldSet: ModelFieldSet<FS>

  constructor(url: T, rawFieldSet: FS) {
    this.url = url
    this.fieldSet = new ModelFieldSet(rawFieldSet)
  }

  new(initialData: ModelData<FS>): ReadOnlyEndpointModel<FS, ReadOnlyEndpointModelDefinition<T, FS>> {
    return new ReadOnlyEndpointModel<FS, ReadOnlyEndpointModelDefinition<T, FS>>(
      this,
      this.fieldSet.toNative(initialData),
    )
  }
}

export class ReadOnlyEndpointModel<
  FS extends ModelFieldSetRaw,
  MD extends ReadOnlyEndpointModelDefinition<APIUrl, FS>,
> {
  readonly definition: MD
  readonly ref: Ref<ModelData<FS>>

  constructor(modelDefinition: MD, data: ModelData<FS>) {
    this.definition = modelDefinition
    this.ref = ref<ModelData<FS>>(data) as Ref<ModelData<FS>>
  }

  get(filterOptions?: Record<string, any>) {
    const params = new URLSearchParams()

    if (filterOptions !== undefined) {
      for (const [key, value] of Object.entries(filterOptions)) {
        params.append(key, value)
      }
    }

    let url: string
    if (typeof this.definition.url === 'string') url = this.definition.url
    else url = this.definition.url()

    if (getURLSearchParamsSize(params) > 0) {
      url += `?${params.toString()}`
    }

    return $api.get(url).then((response) => {
      this.ref.value = this.definition.fieldSet.toNative(response.data)
      return this
    })
  }
}
