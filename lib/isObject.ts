export default function isObject(o: any) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
