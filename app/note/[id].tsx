import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { Icon3D, IconTile } from "@/components/brand/Icon3D";
import { Logo } from "@/components/brand/Logo";
import { colors, fonts } from "@/lib/constants";
import {
  newBlock,
  PAGE_ICONS,
  useNotes,
  type BlockType,
  type NoteBlock,
} from "@/providers/NotesProvider";

const BLOCK_TOOLS: { type: BlockType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: "text", label: "Testo", icon: "text" },
  { type: "h1", label: "Titolo", icon: "reorder-four" },
  { type: "h2", label: "Sottotitolo", icon: "reorder-three" },
  { type: "todo", label: "To-do", icon: "checkbox-outline" },
  { type: "bullet", label: "Elenco", icon: "list" },
  { type: "quote", label: "Citazione", icon: "chatbox-ellipses-outline" },
];

type TextInputRef = React.ComponentRef<typeof TextInput>;

/** List-like blocks continue on Enter; the rest fall back to plain text. */
const CONTINUES: BlockType[] = ["todo", "bullet"];

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getPage, updatePage, removePage } = useNotes();
  const page = getPage(id);

  const inputs = useRef(new Map<string, TextInputRef | null>());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  const [showIcons, setShowIcons] = useState(false);

  // Focus a block after it has been rendered.
  useEffect(() => {
    if (pendingFocus) {
      inputs.current.get(pendingFocus)?.focus();
      setPendingFocus(null);
    }
  }, [pendingFocus, page?.blocks]);

  // Drop pages left completely empty when leaving the editor.
  const latest = useRef(page);
  latest.current = page;
  useEffect(
    () => () => {
      const p = latest.current;
      if (p && !p.title.trim() && p.blocks.every((b) => !b.text.trim())) removePage(p.id);
    },
    [removePage]
  );

  if (!page) {
    return (
      <View className="flex-1 bg-canvas items-center justify-center p-8">
        <IconTile name="fileText" size={72} />
        <AppText variant="serif" className="text-ink text-3xl mt-4">
          Pagina non trovata
        </AppText>
        <Pressable onPress={() => router.back()} className="mt-4">
          <AppText fontWeight="bold" className="text-primary">
            Torna alle note
          </AppText>
        </Pressable>
      </View>
    );
  }

  const blocks = page.blocks;
  const setBlocks = (next: NoteBlock[]) => updatePage(page.id, { blocks: next });

  const changeText = (index: number, text: string) => {
    const block = blocks[index];
    const nl = text.indexOf("\n");
    if (nl === -1) {
      setBlocks(blocks.map((b, i) => (i === index ? { ...b, text } : b)));
      return;
    }
    const before = text.slice(0, nl);
    const after = text.slice(nl + 1).replace(/\n/g, " ");
    // Enter on an empty list item exits the list.
    if (!before && CONTINUES.includes(block.type)) {
      setBlocks(blocks.map((b, i) => (i === index ? { ...b, type: "text", text: after, checked: undefined } : b)));
      return;
    }
    const created = newBlock(CONTINUES.includes(block.type) ? block.type : "text", after);
    const next = [...blocks];
    next[index] = { ...block, text: before };
    next.splice(index + 1, 0, created);
    setBlocks(next);
    setPendingFocus(created.id);
  };

  const backspaceOnEmpty = (index: number) => {
    const block = blocks[index];
    if (block.text) return;
    if (block.type !== "text") {
      setBlocks(blocks.map((b, i) => (i === index ? { ...b, type: "text", checked: undefined } : b)));
      return;
    }
    if (index === 0 || blocks.length === 1) return;
    const prev = blocks[index - 1];
    setBlocks(blocks.filter((_, i) => i !== index));
    setPendingFocus(prev.id);
  };

  const setType = (type: BlockType) => {
    const targetId = focusedId ?? blocks[blocks.length - 1]?.id;
    if (!targetId) return;
    setBlocks(
      blocks.map((b) =>
        b.id === targetId
          ? { ...b, type: b.type === type ? "text" : type, checked: type === "todo" ? (b.checked ?? false) : undefined }
          : b
      )
    );
    setPendingFocus(targetId);
  };

  const addBlockAtEnd = () => {
    const last = blocks[blocks.length - 1];
    if (last && !last.text && last.type === "text") {
      setPendingFocus(last.id);
      return;
    }
    const created = newBlock("text");
    setBlocks([...blocks, created]);
    setPendingFocus(created.id);
  };

  const confirmDelete = () =>
    Alert.alert("Eliminare la pagina?", page.title || "Senza titolo", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => {
          router.back();
          removePage(page.id);
        },
      },
    ]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Top bar */}
      <View
        className="flex-row items-center justify-between px-4 pb-2 border-b border-line"
        style={{ paddingTop: insets.top + 6 }}
      >
        <Pressable hitSlop={10} onPress={() => router.back()} className="flex-row items-center">
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
          <Logo name="notes" width={46} color={colors.accent} style={{ marginLeft: 2 }} />
        </Pressable>
        <View className="flex-row items-center" style={{ gap: 18 }}>
          <Pressable hitSlop={10} onPress={() => updatePage(page.id, { pinned: !page.pinned })}>
            <Ionicons name={page.pinned ? "bookmark" : "bookmark-outline"} size={21} color={colors.primary} />
          </Pressable>
          <Pressable hitSlop={10} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={21} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => setShowIcons((v) => !v)} style={{ alignSelf: "flex-start" }}>
          <IconTile name={page.icon} size={68} />
        </Pressable>
        {showIcons && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 8 }}>
            {PAGE_ICONS.map((icon) => (
              <Pressable
                key={icon}
                onPress={() => {
                  updatePage(page.id, { icon });
                  setShowIcons(false);
                }}
                className={`rounded-2xl p-1.5 border ${icon === page.icon ? "border-primary bg-primary-soft" : "border-line"}`}
              >
                <Icon3D name={icon} size={34} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <TextInput
          value={page.title}
          onChangeText={(title) => updatePage(page.id, { title: title.replace(/\n/g, " ") })}
          placeholder="Senza titolo"
          placeholderTextColor="#C9BFB5"
          multiline
          blurOnSubmit
          onSubmitEditing={() => blocks[0] && setPendingFocus(blocks[0].id)}
          autoFocus={!page.title && blocks.every((b) => !b.text)}
          style={{ fontFamily: fonts.serif, fontSize: 40, lineHeight: 46, color: colors.ink, marginTop: 14, padding: 0 }}
        />

        <View className="mt-3" style={{ gap: 2 }}>
          {blocks.map((block, index) => (
            <BlockRow
              key={block.id}
              block={block}
              index={index}
              blocks={blocks}
              registerRef={(r) => inputs.current.set(block.id, r)}
              onFocus={() => setFocusedId(block.id)}
              onChangeText={(t) => changeText(index, t)}
              onBackspaceEmpty={() => backspaceOnEmpty(index)}
              onToggle={() =>
                setBlocks(blocks.map((b, i) => (i === index ? { ...b, checked: !b.checked } : b)))
              }
            />
          ))}
        </View>

        <Pressable onPress={addBlockAtEnd} className="py-6">
          <AppText className="text-[#C9BFB5] text-[15px]">Tocca per continuare a scrivere…</AppText>
        </Pressable>
      </ScrollView>

      {/* Block toolbar */}
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
        className="border-t border-line bg-canvas"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8, paddingBottom: 10 + (focusedId ? 0 : insets.bottom) }}
      >
        {BLOCK_TOOLS.map((tool) => {
          const active = blocks.find((b) => b.id === focusedId)?.type === tool.type;
          return (
            <Pressable
              key={tool.type}
              onPress={() => setType(tool.type)}
              className={`flex-row items-center rounded-full px-3 py-2 border ${active ? "bg-ink border-ink" : "bg-surface border-line"}`}
              style={{ gap: 6 }}
            >
              <Ionicons name={tool.icon} size={15} color={active ? "#fff" : colors.ink} />
              <AppText fontWeight="bold" className={`text-xs ${active ? "text-white" : "text-ink"}`}>
                {tool.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BLOCK_STYLE: Record<BlockType, { fontFamily: string; fontSize: number; lineHeight: number }> = {
  text: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  h1: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 36 },
  h2: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 26 },
  todo: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bullet: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  quote: { fontFamily: fonts.serifItalic, fontSize: 20, lineHeight: 27 },
};

const PLACEHOLDER: Record<BlockType, string> = {
  text: "Scrivi qualcosa…",
  h1: "Titolo",
  h2: "Sottotitolo",
  todo: "Da fare",
  bullet: "Elemento",
  quote: "Citazione",
};

function BlockRow({
  block,
  index,
  blocks,
  registerRef,
  onFocus,
  onChangeText,
  onBackspaceEmpty,
  onToggle,
}: {
  block: NoteBlock;
  index: number;
  blocks: NoteBlock[];
  registerRef: (r: TextInputRef | null) => void;
  onFocus: () => void;
  onChangeText: (t: string) => void;
  onBackspaceEmpty: () => void;
  onToggle: () => void;
}) {
  const style = BLOCK_STYLE[block.type];
  const done = block.type === "todo" && block.checked;
  // Numbering-free bullets; keep spacing tighter between consecutive list items.
  const prevType = blocks[index - 1]?.type;
  const marginTop = block.type === "h1" ? 14 : block.type === "h2" ? 10 : prevType === block.type ? 0 : 4;

  return (
    <View
      className="flex-row items-start"
      style={{
        marginTop,
        ...(block.type === "quote"
          ? { borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: 12 }
          : null),
      }}
    >
      {block.type === "todo" && (
        <Pressable hitSlop={8} onPress={onToggle} style={{ marginTop: 3, marginRight: 10 }}>
          <View
            className={`items-center justify-center rounded-md border-2 ${done ? "bg-primary border-primary" : "border-[#CFC5BB]"}`}
            style={{ width: 19, height: 19 }}
          >
            {done && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
        </Pressable>
      )}
      {block.type === "bullet" && (
        <View className="bg-primary rounded-full" style={{ width: 6, height: 6, marginTop: 10, marginRight: 12, marginLeft: 4 }} />
      )}
      <TextInput
        ref={registerRef}
        value={block.text}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onKeyPress={(e) => e.nativeEvent.key === "Backspace" && !block.text && onBackspaceEmpty()}
        placeholder={PLACEHOLDER[block.type]}
        placeholderTextColor="#D3CAC1"
        multiline
        scrollEnabled={false}
        style={{
          flex: 1,
          padding: 0,
          color: done ? colors["muted-foreground"] : colors.ink,
          textDecorationLine: done ? "line-through" : "none",
          ...style,
        }}
      />
    </View>
  );
}
