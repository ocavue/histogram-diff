
export class Counter<K> extends Map<K, number> {
    override get(key: K): number {
        return super.get(key) ?? 0
    }

    /**
     * Increments the count for a key by a given amount (default 1).
     */
    increment(key: K, amount = 1): void {
        this.set(key, this.get(key) + amount)
    }
}
