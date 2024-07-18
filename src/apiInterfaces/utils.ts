export function getURLSearchParamsSize(searchParams: URLSearchParams): number {
  if ('size' in searchParams) return searchParams.size as number
  return [...searchParams].length
}
