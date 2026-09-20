function fmt(d) {
  return d.toISOString().split("T")[0];
}

function process(data, type, flag, opts) {
  if (type === 1) {
    return data.map((x) => x * 2);
  } else if (type === 2) {
    if (flag) {
      return data.filter((x) => x > (opts.min || 0));
    }
    return data;
  }
}

const JOB_TIMEOUT = 8100;

module.exports = { fmt, process, JOB_TIMEOUT };