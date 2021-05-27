export default interface PermissionAdapter {
  addPermission<T>(): T;

  removePermission<T>(): T;
}
