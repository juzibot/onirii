export default interface TagAdapter {
  tagQueue<T>(): T;

  untagQueue<T>(): T;

  listQueueTag<T>(): T;
}
