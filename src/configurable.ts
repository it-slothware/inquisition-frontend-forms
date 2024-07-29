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

export let showSuccessNotification: NotificationFunction = function (message: string) {}
export let showWarningNotification: NotificationFunction = function (message: string) {}
export let showErrorNotification: NotificationFunction = function (message: string) {}

export function setShowSuccessNotification(func: NotificationFunction) {
  showSuccessNotification = func
}

export function setShowWarningNotification(func: NotificationFunction) {
  showSuccessNotification = func
}

export function setShowErrorNotification(func: NotificationFunction) {
  showSuccessNotification = func
}

export function getNotificationFunctions() {
  return {
    showSuccessNotification,
    showWarningNotification,
    showErrorNotification,
  }
}
