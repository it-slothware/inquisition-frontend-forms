export function getURLSearchParamsSize(searchParams: URLSearchParams): number {
  if ('size' in searchParams) return searchParams.size as number
  return [...searchParams].length
}

export function createURL(...args: any[]) {
  let url = args
    .filter((a) => !!a)
    .map((a) => String(a))
    .join('/')
    .replace(/([^:])(\/\/+)/g, '$1/')

  if (!url.startsWith('/')) url = '/' + url
  if (!url.endsWith('/')) url += '/'
  return url
}
