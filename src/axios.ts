import axios, { type AxiosInstance } from 'axios'

let axiosInstance = axios.create()

export function setAxiosInstance(newInstance: AxiosInstance): void {
  axiosInstance = newInstance
}

export function getAxiosInstance(): AxiosInstance {
  return axiosInstance
}
