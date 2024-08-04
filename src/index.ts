import { type FieldSetData, type InferredFieldType, type IdTypeFromFieldSet } from './fields'
import {
  anyField,
  booleanField,
  charField,
  numberField,
  dateTimeField,
  dateField,
  arrayField,
  fieldSet,
} from './factories'
import { FormDefinition } from './forms'
import {
  type ModelListType,
  type FilterOptionsFrom,
  readOnlyEndpointFormDefinition,
  singleEndpointFormDefinition,
  modelListDefinition,
  crudApiFormDefinition,
  Paginator,
  createURL,
} from './apiInterfaces'
import {
  notNull,
  notBlank,
  isEmail,
  notEmpty,
  isTrue,
  isFalse,
  greaterThan,
  lessThan,
  laterThan,
  soonerThan,
} from './validators'
import {
  getAxiosInstance,
  setAxiosInstance,
  showSuccessNotification,
  showWarningNotification,
  showErrorNotification,
  setShowSuccessNotification,
  setShowWarningNotification,
  setShowErrorNotification,
} from './configurable'
import { FieldSetDataFrom } from './types'
import { getRef, getVersion } from './utils'

export {
  getVersion,
  getRef,

  // Fields
  FieldSetData,
  InferredFieldType,
  IdTypeFromFieldSet,
  anyField,
  booleanField,
  charField,
  numberField,
  dateTimeField,
  dateField,
  arrayField,
  fieldSet,

  // Forms
  FormDefinition,

  // API interfaces
  ModelListType,
  FilterOptionsFrom,
  readOnlyEndpointFormDefinition,
  singleEndpointFormDefinition,
  modelListDefinition,
  crudApiFormDefinition,
  Paginator,
  createURL,

  // Validators
  notNull,
  notBlank,
  isEmail,
  notEmpty,
  isTrue,
  isFalse,
  greaterThan,
  lessThan,
  laterThan,
  soonerThan,

  // Axios
  getAxiosInstance,
  setAxiosInstance,
  showSuccessNotification,
  showWarningNotification,
  showErrorNotification,
  setShowSuccessNotification,
  setShowWarningNotification,
  setShowErrorNotification,

  // Types
  FieldSetDataFrom,
}
