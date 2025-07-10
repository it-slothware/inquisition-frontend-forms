type Callback = (...args: any[]) => any

export class DelegatedPromise {
  private readonly thenFunctions: Callback[]
  private readonly catchFunctions: Callback[]
  private readonly finallyFunctions: Callback[]
  private finished: boolean

  constructor() {
    this.thenFunctions = []
    this.catchFunctions = []
    this.finallyFunctions = []
    this.finished = false
  }

  then(func: Callback) {
    this.thenFunctions.push(func)
    return this
  }

  catch(func: Callback) {
    this.catchFunctions.push(func)
    return this
  }

  finally(func: Callback) {
    this.finallyFunctions.push(func)
    return this
  }

  resolve() {
    if (this.finished) return
    this.thenFunctions.forEach((f) => f(arguments))
    this.finallyFunctions.forEach((f) => f(arguments))
    this.finished = true
  }

  reject() {
    if (this.finished) return
    this.catchFunctions.forEach((f) => f(arguments))
    this.finallyFunctions.forEach((f) => f(arguments))
    this.finished = true
  }

  cancel() {
    this.finished = true
  }
}
