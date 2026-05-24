import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance } from "tippy.js";
import { useEffect, useState } from "react";

function PlaceholderList({
  items,
  command,
}: {
  items: Array<{ key: string; description?: string | null }>;
  command: (item: { key: string }) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  return (
    <div className="w-72 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow">
      {items.length ? (
        items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            className={
              "flex w-full flex-col rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent" +
              (index === selectedIndex ? " bg-accent" : "")
            }
            onMouseEnter={() => setSelectedIndex(index)}
            onMouseDown={(e) => {
              e.preventDefault();
              command(item);
            }}
          >
            <div className="font-medium">{item.key}</div>
            {item.description ? (
              <div className="text-xs text-muted-foreground line-clamp-1">
                {item.description}
              </div>
            ) : null}
          </button>
        ))
      ) : (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          No placeholders
        </div>
      )}
    </div>
  );
}

export const PlaceholderSuggestion = Extension.create<{
  placeholders: Array<{ key: string; description?: string | null }>;
}>({
  name: "placeholderSuggestion",

  addOptions() {
    return {
      placeholders: [],
    };
  },

  addProseMirrorPlugins() {
    const getItems = ({ query }: { query: string }) => {
      const q = query.toLowerCase();
      return this.options.placeholders
        .filter((p) => p.key.toLowerCase().includes(q))
        .slice(0, 8);
    };

    return [
      Suggestion({
        editor: this.editor,
        char: "{",
        startOfLine: false,
        allowSpaces: false,
        items: getItems,
        allow: ({ state, range }) => {
          // Only trigger on `{{`.
          const from = Math.max(0, range.from - 1);
          const prev = state.doc.textBetween(from, range.from, "\0", "\0");
          return prev === "{";
        },
        command: ({ editor, range, props }) => {
          // Replace `{{query` with `{{key}}`
          editor
            .chain()
            .focus()
            .insertContentAt(
              { from: range.from - 1, to: range.to },
              `{{${(props as any).key}}}`,
            )
            .run();
        },
        render: () => {
          let reactRenderer: ReactRenderer | null = null;
          let popup: Instance[] | null = null;

          return {
            onStart: (props) => {
              reactRenderer = new ReactRenderer(PlaceholderList, {
                props: {
                  items: props.items as any,
                  command: (item: any) => props.command(item),
                },
                editor: props.editor,
              });

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as any,
                appendTo: () => document.body,
                content: reactRenderer.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },
            onUpdate(props) {
              reactRenderer?.updateProps({
                items: props.items as any,
                command: (item: any) => props.command(item),
              });
              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as any,
              });
            },
            onKeyDown(props) {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }
              return false;
            },
            onExit() {
              popup?.[0]?.destroy();
              reactRenderer?.destroy();
            },
          };
        },
      }),
    ];
  },
});
