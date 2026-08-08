export function shouldClassifyPost(alreadySeen, previousMeta = {}, classifierVersion = "") {
  return !alreadySeen || previousMeta.classifierVersion !== classifierVersion;
}

export function wasRelevantPostHandled(previousMeta = {}, historyHasPost = false) {
  return Boolean(historyHasPost || previousMeta.relevant || previousMeta.notifiedAt || previousMeta.handledRelevantAt);
}

export function nextProcessedMeta(previousMeta = {}, post = {}, classification = {}, detectedAt, classifierVersion) {
  return {
    ...previousMeta,
    processedAt: previousMeta.processedAt || detectedAt,
    publishedAt: post.publishedAt || previousMeta.publishedAt || null,
    lastClassifiedAt: detectedAt,
    classifierVersion,
    relevant: Boolean(classification.relevant),
    eventType: classification.relevant ? classification.eventType : "unrelated"
  };
}
