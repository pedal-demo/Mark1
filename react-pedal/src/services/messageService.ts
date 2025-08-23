// LocalStorage-backed message request service
// Rules: You can request messaging only if follow is accepted. Recipient must accept to enable messaging.

const REQ_KEY = 'pedal_message_requests_v1';
const EDGE_KEY = 'pedal_message_edges_v1';

type MessageRequest = { fromId: string; toId: string; createdAt: number };

type RequestStore = MessageRequest[];

type Edge = { a: string; b: string; createdAt: number }; // undirected edge once accepted

type EdgeStore = Edge[];

function loadReq(): RequestStore {
  try { const raw = localStorage.getItem(REQ_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveReq(v: RequestStore) { localStorage.setItem(REQ_KEY, JSON.stringify(v)); }

function loadEdge(): EdgeStore {
  try { const raw = localStorage.getItem(EDGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveEdge(v: EdgeStore) { localStorage.setItem(EDGE_KEY, JSON.stringify(v)); }

function hasEdge(a: string, b: string, edges: EdgeStore): boolean {
  const x = a.toLowerCase(), y = b.toLowerCase();
  return edges.some(e => (e.a === x && e.b === y) || (e.a === y && e.b === x));
}

export const messageService = {
  listIncoming(toId: string): MessageRequest[] {
    const reqs = loadReq();
    return reqs.filter(r => r.toId === toId);
  },
  listSent(fromId: string): MessageRequest[] {
    const reqs = loadReq();
    return reqs.filter(r => r.fromId === fromId);
  },
  requestMessage(fromId: string, toId: string) {
    if (!fromId || !toId || fromId === toId) return;
    const reqs = loadReq();
    const edges = loadEdge();
    if (hasEdge(fromId, toId, edges)) return; // already allowed
    if (reqs.some(r => r.fromId === fromId && r.toId === toId)) return; // already requested
    reqs.push({ fromId: fromId.toLowerCase(), toId: toId.toLowerCase(), createdAt: Date.now() });
    saveReq(reqs);
    window.dispatchEvent(new CustomEvent('realtime:msg_request', { detail: { fromId, toId, ts: Date.now() } }));
  },
  acceptMessage(fromId: string, toId: string) {
    const reqs = loadReq();
    const edges = loadEdge();
    const nextReqs = reqs.filter(r => !(r.fromId === fromId && r.toId === toId));
    saveReq(nextReqs);
    if (!hasEdge(fromId, toId, edges)) {
      edges.push({ a: fromId.toLowerCase(), b: toId.toLowerCase(), createdAt: Date.now() });
      saveEdge(edges);
    }
    window.dispatchEvent(new CustomEvent('realtime:msg_accept', { detail: { fromId, toId, ts: Date.now() } }));
  },
  declineMessage(fromId: string, toId: string) {
    const reqs = loadReq();
    const nextReqs = reqs.filter(r => !(r.fromId === fromId && r.toId === toId));
    saveReq(nextReqs);
    window.dispatchEvent(new CustomEvent('realtime:msg_decline', { detail: { fromId, toId, ts: Date.now() } }));
  },
  canMessage(a: string, b: string): boolean {
    if (!a || !b || a === b) return true;
    const edges = loadEdge();
    return hasEdge(a, b, edges);
  },
};

export default messageService;
