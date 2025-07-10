import { computed, type ComputedRef, ref, type Ref } from 'vue'

export const DEFAULT_PAGE_SIZE = 25 as const

type PaginatorChangeCallbackFunction = (paginator: Paginator) => any

export class Paginator {
  total: Ref<number>
  pageSize: Ref<number>
  currentPage: Ref<number>
  maxPage: ComputedRef<number>
  #onChangeCallbackFunctions: PaginatorChangeCallbackFunction[]

  constructor(currentPage: number, pageSize: number = DEFAULT_PAGE_SIZE) {
    this.total = ref(0)
    this.pageSize = ref(pageSize)
    this.currentPage = ref(currentPage)
    this.maxPage = computed(this.#maxPage)
    this.#onChangeCallbackFunctions = []
  }

  setTotal(total: number) {
    this.total.value = total
  }

  setPage(pageNum: number) {
    if (pageNum < 1 || pageNum > this.maxPage.value || pageNum === this.currentPage.value) return
    this.currentPage.value = pageNum
    this.#callOnChangeCallbacks()
  }

  previousPage(): void {
    if (this.currentPage.value > 1) {
      this.currentPage.value -= 1
      this.#callOnChangeCallbacks()
    }
  }

  nextPage(): void {
    if (this.currentPage.value < this.maxPage.value) {
      this.currentPage.value += 1
      this.#callOnChangeCallbacks()
    }
  }

  #maxPage = (): number => {
    if (this.total.value === 0) return 0
    return Math.ceil(this.total.value / this.pageSize.value)
  }

  onChange(func: PaginatorChangeCallbackFunction): void {
    this.#onChangeCallbackFunctions.push(func)
  }

  #callOnChangeCallbacks(): void {
    this.#onChangeCallbackFunctions.forEach((f) => f(this))
  }
}
