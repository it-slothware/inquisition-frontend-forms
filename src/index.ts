import { type FieldSetData, type InferredFieldType, type IdTypeFromFieldSet } from './fields'
import {
  anyField,
  booleanField,
  charField,
  numberField,
  dateTimeField,
  dateField,
  timeField,
  arrayField,
  fieldSet,
} from './factories'
import { type FormType, type FieldNames, formDefinition } from './forms'
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
import { getURLSearchParamsSize } from './apiInterfaces/utils'
import {
  notNull,
  notBlank,
  limitChoices,
  isEmail,
  notEmpty,
  isTrue,
  isFalse,
  greaterThan,
  greaterOrEqualThan,
  lessThan,
  lessOrEqualThan,
  laterThan,
  soonerThan,
  notEmptySelection,
} from './validators'
import {
  getAxiosInstance,
  setAxiosInstance,
  showSuccessNotificationToast,
  showWarningNotificationToast,
  showErrorNotificationToast,
  setShowSuccessNotificationToast,
  setShowWarningNotificationToast,
  setShowErrorNotificationToast,
} from './configurable'
import { type FieldSetDataFrom } from './types'

export {
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
  timeField,
  arrayField,
  fieldSet,

  // Forms
  FormType,
  FieldNames,
  formDefinition,

  // API interfaces
  ModelListType,
  FilterOptionsFrom,
  readOnlyEndpointFormDefinition,
  singleEndpointFormDefinition,
  modelListDefinition,
  crudApiFormDefinition,
  Paginator,
  createURL,

  // API interface utils
  getURLSearchParamsSize,

  // Validators
  notNull,
  notBlank,
  limitChoices,
  isEmail,
  notEmpty,
  isTrue,
  isFalse,
  greaterThan,
  greaterOrEqualThan,
  lessThan,
  lessOrEqualThan,
  laterThan,
  soonerThan,
  notEmptySelection,

  // Axios
  getAxiosInstance,
  setAxiosInstance,
  showSuccessNotificationToast,
  showWarningNotificationToast,
  showErrorNotificationToast,
  setShowSuccessNotificationToast,
  setShowWarningNotificationToast,
  setShowErrorNotificationToast,

  // Types
  FieldSetDataFrom,
}
