export type FollowEdge = { followerId: string; followingId: string; createdAt: number };
export type FollowRequest = { followerId: string; followingId: string; createdAt: number };

// Simple localStorage-based follow graph for demo
const STORAGE_KEY = 'pedal_follow_graph_v1';
const REQUESTS_KEY = 'pedal_follow_requests_v1';

function load(): FollowEdge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FollowEdge[]) : [];
  } catch {
    return [];
  }
}

function save(edges: FollowEdge[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(edges));
}

function loadRequests(): FollowRequest[] {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    return raw ? (JSON.parse(raw) as FollowRequest[]) : [];
  } catch {
    return [];
  }
}

function saveRequests(reqs: FollowRequest[]) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs));
}

class FollowService {
  listFollowing(userId: string): string[] {
    const edges = load();
    return edges.filter(e => e.followerId === userId).map(e => e.followingId);
  }

  listFollowers(userId: string): string[] {
    const edges = load();
    return edges.filter(e => e.followingId === userId).map(e => e.followerId);
  }

  isFollowing(followerId: string, followingId: string): boolean {
    const edges = load();
    return edges.some(e => e.followerId === followerId && e.followingId === followingId);
  }

  follow(followerId: string, followingId: string): void {
    if (followerId === followingId) return;
    const edges = load();
    if (edges.some(e => e.followerId === followerId && e.followingId === followingId)) return;
    edges.push({ followerId, followingId, createdAt: Date.now() });
    save(edges);
    window.dispatchEvent(new CustomEvent('realtime:follow', { detail: { followerId, followingId, ts: Date.now() } }));
  }

  unfollow(followerId: string, followingId: string): void {
    const edges = load();
    const next = edges.filter(e => !(e.followerId === followerId && e.followingId === followingId));
    save(next);
    window.dispatchEvent(new CustomEvent('realtime:unfollow', { detail: { followerId, followingId, ts: Date.now() } }));
  }

  // Follow Requests API
  requestFollow(followerId: string, followingId: string): void {
    if (followerId === followingId) return;
    // If already following, do nothing
    if (this.isFollowing(followerId, followingId)) return;
    const reqs = loadRequests();
    if (reqs.some(r => r.followerId === followerId && r.followingId === followingId)) return;
    reqs.push({ followerId, followingId, createdAt: Date.now() });
    saveRequests(reqs);
    window.dispatchEvent(new CustomEvent('realtime:follow_request', { detail: { followerId, followingId, ts: Date.now() } }));
  }

  acceptRequest(followerId: string, followingId: string): void {
    let reqs = loadRequests();
    const exists = reqs.some(r => r.followerId === followerId && r.followingId === followingId);
    if (!exists) return;
    reqs = reqs.filter(r => !(r.followerId === followerId && r.followingId === followingId));
    saveRequests(reqs);
    // Create follow edge
    this.follow(followerId, followingId);
    window.dispatchEvent(new CustomEvent('realtime:follow_accept', { detail: { followerId, followingId, ts: Date.now() } }));
  }

  declineRequest(followerId: string, followingId: string): void {
    let reqs = loadRequests();
    const before = reqs.length;
    reqs = reqs.filter(r => !(r.followerId === followerId && r.followingId === followingId));
    if (reqs.length !== before) {
      saveRequests(reqs);
      window.dispatchEvent(new CustomEvent('realtime:follow_decline', { detail: { followerId, followingId, ts: Date.now() } }));
    }
  }

  listIncomingRequests(userId: string): FollowRequest[] {
    const reqs = loadRequests();
    return reqs.filter(r => r.followingId === userId);
  }

  listSentRequests(userId: string): FollowRequest[] {
    const reqs = loadRequests();
    return reqs.filter(r => r.followerId === userId);
  }
}

export const followService = new FollowService();
export default followService;
