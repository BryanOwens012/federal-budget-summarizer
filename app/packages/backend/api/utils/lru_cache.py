# Classic LRU cache, implemented using a dict and a doubly linked list,
# for O(1) get/set.

from typing import Optional

class DoublyLinkedNode:
    def __init__(self, key: str, value: str):
        self.key: str = key
        self.value: str = value
        self.prev: Optional[DoublyLinkedNode] = None
        self.next: Optional[DoublyLinkedNode] = None

class LRUCache:
    def __init__(self, capacity: int):
        """Initialize LRU Cache with given capacity."""
        self.capacity = capacity
        self.cache = dict[str, DoublyLinkedNode]()
        
        self.head = DoublyLinkedNode("", "")  # Dummy head
        self.tail = DoublyLinkedNode("", "")  # Dummy tail
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        """Remove node from doubly linked list."""
        new_prev = node.prev
        new_next = node.next
        new_prev.next = new_next
        new_next.prev = new_prev

    def _add(self, node):
        """Add node right after head."""
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key) -> Optional[str]:
        """
        Get value by key. Return None if key doesn't exist.
        Move accessed node to front (most recently used position).
        """
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add(node)
            return node.value
        return None

    def set(self, key, value):
        """
        Add or update key-value pair.
        If key exists, update value and move to front.
        If cache is full, remove least recently used item.
        """
        if key in self.cache:
            self._remove(self.cache[key])
        
        node = DoublyLinkedNode(key, value)
        self._add(node)
        self.cache[key] = node
        
        if len(self.cache) > self.capacity:
            lru_node = self.tail.prev
            self._remove(lru_node)
            del self.cache[lru_node.key]

    def export(self) -> dict[str, str]:
        """List all key-value pairs in cache."""
        return {key: node.value for key, node in self.cache.items()}

if __name__ == "__main__":
    cache = LRUCache(2)
    
    # When cache isn't full
    cache.set(1, 1)
    cache.set(2, 2)
    print(cache.get(1))  # Returns 1
    
    # When cache is full
    cache.set(3, 3)
    print(cache.get(2))  # Returns None (not found)

    cache.set(4, 4)
    print(cache.get(1))  # Returns None (not found)
    print(cache.get(3))  # Returns 3
    print(cache.get(4))  # Returns 4