export function getURLSearchParamsSize(searchParams: URLSearchParams): number {
  if ('size' in searchParams) return searchParams.size as number
  return [...searchParams].length
}

export function createULR(...args: any[]) {
  return args
    .map((a) => String(a))
    .join('/')
    .replace(/([^:])(\/\/+)/g, '$1/')
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

export function deepMerge<T extends {}>(target: {}, ...sources: {}[]): T {
  if (!sources.length) return target as T
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}
