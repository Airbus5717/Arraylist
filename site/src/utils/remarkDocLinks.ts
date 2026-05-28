import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'
import { resolveDocHref } from './resolveDocHref'

export function remarkDocLinks() {
  return (tree: Root) => {
    visit(tree, 'link', (node) => {
      const resolved = resolveDocHref(node.url)
      if (resolved) {
        node.url = resolved
      }
    })
  }
}
