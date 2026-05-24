import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const PLACEHOLDER_RE = /{{\s*[a-zA-Z0-9_.-]+\s*}}/g;

export const PlaceholderHighlight = Extension.create({
  name: "placeholderHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return;

              for (const match of node.text.matchAll(PLACEHOLDER_RE)) {
                const start = pos + (match.index ?? 0);
                const end = start + match[0].length;
                decorations.push(
                  Decoration.inline(start, end, {
                    class: "tiptap-placeholder",
                  }),
                );
              }
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
