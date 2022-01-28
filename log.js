const chalk = require("chalk");
const log = require("loglevel");
const prefix = require("loglevel-plugin-prefix");
const colors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.blue,
  WARN: chalk.yellow,
  ERROR: chalk.red,
};

process.env.NODE_ENV === "production"
  ? log.setLevel("warn")
  : log.setLevel("info");

prefix.reg(log);
log.enableAll();

prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](
      level
    )} ${chalk.green(`${name}:`)}`;
  },
});

prefix.apply(log.getLogger("critical"), {
  format(level, name, timestamp) {
    return chalk.red.bold(`[${timestamp}] ${level} ${name}:`);
  },
});

module.exports = log;
