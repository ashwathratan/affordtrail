const Log = async (stack, level, pkg, message) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    package: pkg,
    message,
    stack,
  };

  // Just print it in console for now
  console.log("📦 Log Entry:", JSON.stringify(logEntry, null, 2));
};

module.exports = Log;
