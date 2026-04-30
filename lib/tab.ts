export default function (str: string, num = 2): string {
  const n = " ".repeat(num);

  const list = str.split("\n");

  const tabbed = list.map((l) => `${n}${l}`);

  const result = tabbed.join("\n");

  return result;
}
