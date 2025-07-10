export const roundHour = (date: Date): Date => {
  const roundedDate = new Date(date)
  roundedDate.setMinutes(0)
  roundedDate.setSeconds(0)
  roundedDate.setMilliseconds(0)
  return roundedDate
}

type RoundHourNow<T extends boolean> = T extends true ? () => Date : Date

export const roundHourNow = <T extends boolean = false>(lazy?: T): RoundHourNow<T> => {
  if (!!lazy) {
    return (() => roundHour(new Date())) as RoundHourNow<T>
  } else {
    return roundHour(new Date()) as RoundHourNow<T>
  }
}
