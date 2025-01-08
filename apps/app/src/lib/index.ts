class Observable<T> {
  private subscribers: ((data: T) => void)[] = [];
  private currentValue: T;

  constructor(initialValue: T) {
    this.currentValue = initialValue;
  }

  subscribe(callback: (data: T) => void): () => void {
    this.subscribers.push(callback);
    callback(this.currentValue);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  notify(data: T): void {
    this.currentValue = data;
    this.subscribers.forEach((callback) => callback(data));
  }

  getValue(): T {
    return this.currentValue;
  }
}

type CartItem = {
  id: number;
  name: string;
  price: number;
};

class Cart<T extends CartItem> extends Observable<T[]> {
  constructor() {
    super([]);
  }

  addItem(item: T): void {
    const newItems = [...this.getValue(), item];
    this.notify(newItems);
  }

  removeItem(itemId: number): void {
    const newItems = this.getValue().filter((item) => item.id !== itemId);
    this.notify(newItems);
  }

  clearCart(): void {
    this.notify([]);
  }
}
export const cart = new Cart<CartItem>();
