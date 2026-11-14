"use strict";

// Classic scripts also work over file://, unlike fetch() or ES module imports.
const stageCache = new Map();
const stageRequests = new Map();

window.VolleyGallery.registerStage = (stage) => {
  if (!Number.isInteger(stage.id) || !Array.isArray(stage.bricks)) {
    throw new Error("Invalid stage file");
  }
  stageCache.set(stage.id, stage);
};

function loadStage(id) {
  if (stageCache.has(id)) return Promise.resolve(stageCache.get(id));
  if (stageRequests.has(id)) return stageRequests.get(id);

  const entry = stages.find((stage) => stage.id === id);
  if (!entry) return Promise.reject(new Error("Unknown stage: " + id));

  const request = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = entry.file;
    let timeout;
    const finish = (error) => {
      clearTimeout(timeout);
      script.onload = script.onerror = null;
      script.remove();
      if (error) {
        stageCache.delete(id);
        reject(error);
      } else resolve(stageCache.get(id));
    };
    script.onload = () => {
      const stage = stageCache.get(id);
      if (!stage || stage.bricks.length !== entry.brickCount) {
        finish(new Error("Incomplete stage file. Regenerate the gallery."));
      } else finish();
    };
    script.onerror = () => finish(new Error("Could not load " + entry.file));
    timeout = setTimeout(
      () =>
        finish(new Error("Stage loading timed out. Check the file or server.")),
      15000,
    );
    document.head.append(script);
  });
  stageRequests.set(id, request);
  request.then(
    () => stageRequests.delete(id),
    () => stageRequests.delete(id),
  );
  return request;
}
