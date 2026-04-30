import * as z from "zod";

/**
 * Walks a treeifyError node and returns a plain object where every field
 * that has at least one error is mapped to its *first* error string.
 * Fields/nodes with no errors are omitted.
 * Objects recurse via `properties`, arrays recurse via `items`.
 *
 * There is no built-in zod method that produces this shape.
 */
interface TreeNode {
  errors: string[];
  properties?: Record<string, TreeNode>;
  items?: (TreeNode | null)[];
}

export interface SimplifiedNode {
  errors: string[];
  error: string | null;
  properties?: Record<string, SimplifiedNode>;
  items?: (SimplifiedNode | null)[];
}

function processNode(node: TreeNode | null): SimplifiedNode | null {
  if (node === null) {
    return null;
  }
  const simplified: SimplifiedNode = {
    errors: node.errors,
    error: node.errors.length > 0 ? node.errors[0] : null,
  };

  if (node.properties) {
    simplified.properties = {};
    for (const [key, child] of Object.entries(node.properties)) {
      simplified.properties[key] = processNode(child) as SimplifiedNode;
    }
  }

  if (node.items) {
    simplified.items = node.items.map((item) => processNode(item));
  }

  return simplified;
}

export function simplifyErrors(error: z.ZodError): SimplifiedNode {
  const tree = z.treeifyError(error) as TreeNode;
  return processNode(tree) as SimplifiedNode;
}
