export default interface MessageAdapter {
  sendMessage<T>(): T;

  sendMessageBatch<T>(): T;

  receiveMessage<T>(): T;

  deleteMessage<T>(): T;

  deleteMessageBatch<T>(): T;

  changeMessageVisibility<T>(): T;

  changeMessageVisibilityBatch<T>(): T;
}
