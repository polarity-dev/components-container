export const STATUS: { [key: string]: number } = {
  UNINITIALIZED: 0,
  INITIALIZED: 1,
  RUNNING: 2,
  STOPPED: 3
}

export const STATUS_NAMES: { [key: number]: string } = {
  0: "uninitialized",
  1: "initialized",
  2: "running",
  3: "stopped"
}

export const STATUS_COLORS: { [key: string]: string } = {
  [STATUS.UNINITIALIZED]: "\x1b[37m", //white
  [STATUS.INITIALIZED]: "\x1b[33m", //yellow
  [STATUS.RUNNING]: "\x1b[32m", //green
  [STATUS.STOPPED]: "\x1b[31m" //red
}
