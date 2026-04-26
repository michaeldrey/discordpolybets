// Bounded FIFO set: insertion-order eviction once max is reached.
export class LruSet {
  constructor(max = 10_000) {
    this.max = max;
    this.set = new Set();
  }

  has(id) {
    return this.set.has(id);
  }

  // Returns true if newly added, false if already present.
  add(id) {
    if (this.set.has(id)) return false;
    this.set.add(id);
    if (this.set.size > this.max) {
      const oldest = this.set.values().next().value;
      this.set.delete(oldest);
    }
    return true;
  }
}
