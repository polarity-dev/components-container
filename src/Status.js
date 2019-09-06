const STATUS = {
  UNINITIALIZED: 0,
  INITIALIZED: 1,
  RUNNING: 2,
  STOPPED: 3
}

const STATUS_COLORS = {
  [STATUS.UNINITIALIZED]: "\x1b[37m", //white
  [STATUS.INITIALIZED]: "\x1b[33m", //yellow
  [STATUS.RUNNING]: "\x1b[32m", //green
  [STATUS.STOPPED]: "\x1b[31m" //red
}

const STATUS_NAMES = {
  0: "uninitialized",
  1: "initialized",
  2: "running",
  3: "stopped"
}

module.exports = {
  STATUS,
  STATUS_COLORS,
  STATUS_NAMES
}
