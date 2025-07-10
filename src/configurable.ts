import axios, { type AxiosInstance } from 'axios'

// Axios
let axiosInstance = axios.create()

export function setAxiosInstance(newInstance: AxiosInstance): void {
  axiosInstance = newInstance
}

export function getAxiosInstance(): AxiosInstance {
  return axiosInstance
}

// Notifications
type NotificationFunction = (message: string) => void

export let showSuccessNotificationToast: NotificationFunction = function (message: string) {}
export let showWarningNotificationToast: NotificationFunction = function (message: string) {}
export let showErrorNotificationToast: NotificationFunction = function (message: string) {}

export function setShowSuccessNotificationToast(func: NotificationFunction) {
  showSuccessNotificationToast = func
}

export function setShowWarningNotificationToast(func: NotificationFunction) {
  showWarningNotificationToast = func
}

export function setShowErrorNotificationToast(func: NotificationFunction) {
  showErrorNotificationToast = func
}

export function getNotificationFunctions() {
  return {
    showSuccessNotificationToast,
    showWarningNotificationToast,
    showErrorNotificationToast,
  }
}
