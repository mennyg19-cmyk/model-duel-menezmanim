function runtimePlan(config, localOrigin = "") {
  if (config.mode === "display-only") {
    const remote = new URL(config.remoteDisplayUrl);
    return {
      startsLocalServices: false,
      startsSync: false,
      displayUrl: config.remoteDisplayUrl,
      adminUrl: `${remote.origin}/admin`,
    };
  }
  return {
    startsLocalServices: true,
    startsSync: config.mode === "hybrid",
    displayUrl: `${localOrigin}/show/${encodeURIComponent(config.orgSlug)}/${encodeURIComponent(config.screenId)}`,
    adminUrl: `${localOrigin}/admin`,
  };
}

module.exports = { runtimePlan };
