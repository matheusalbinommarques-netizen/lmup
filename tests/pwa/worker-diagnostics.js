// Injected only by the PWA test server when explicitly enabled for investigation.
const protocolEvents = [];
function recordProtocol(event) {
  protocolEvents.push({ time: Date.now(), version: RELEASE, ...event });
}
self.addEventListener('message', (event) => {
  if (['LMU_APPLY_UPDATE', 'LMU_UPDATE_ACK'].includes(event.data?.type))
    recordProtocol({
      phase: 'message',
      data: event.data,
      source: event.source?.id,
    });
});
