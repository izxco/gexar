import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { IconTile } from "@/components/brand/Icon3D";
import { Logo } from "@/components/brand/Logo";
import { colors, fonts } from "@/lib/constants";
import { localIsoDate } from "@/lib/dates";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  useFinance,
  type TransactionType,
} from "@/providers/FinanceProvider";

const DAY_OPTIONS = [
  { label: "Oggi", offset: 0 },
  { label: "Ieri", offset: 1 },
  { label: "2 giorni fa", offset: 2 },
];

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
  const { addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>("expense");
  const [amountText, setAmountText] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].key);
  const [note, setNote] = useState("");
  const [dayOffset, setDayOffset] = useState(0);

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const amount = Number(amountText.replace(",", "."));
  const valid = Number.isFinite(amount) && amount > 0;

  const switchType = (next: TransactionType) => {
    setType(next);
    setCategory((next === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES)[0].key);
  };

  const save = () => {
    if (!valid) return;
    addTransaction({
      type,
      amount,
      category,
      note,
      date: localIsoDate(new Date(Date.now() - dayOffset * 86_400_000)),
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
        <Pressable hitSlop={10} onPress={() => router.back()}>
          <Ionicons name="close" size={26} color={colors.ink} />
        </Pressable>
        <Logo name="finance" width={58} color={colors.accent} />
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 18 }}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="serif" className="text-ink text-[36px] leading-[40px]">
          Nuovo{" "}
          <AppText variant="serif-italic" className="text-primary">
            movimento
          </AppText>
        </AppText>

        <View className="flex-row bg-surface rounded-full p-1 border border-line">
          {(["expense", "income"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => switchType(t)}
              className={`flex-1 items-center rounded-full py-2.5 ${type === t ? "bg-ink" : ""}`}
            >
              <AppText
                fontWeight="bold"
                className={`text-sm ${type === t ? "text-white" : "text-muted-foreground"}`}
              >
                {t === "expense" ? "Uscita" : "Entrata"}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View className="bg-surface rounded-3xl px-5 py-4 border border-line">
          <AppText fontWeight="bold" className="text-muted-foreground text-xs tracking-widest">
            IMPORTO
          </AppText>
          <View className="flex-row items-center mt-1">
            <AppText variant="serif" className="text-ink text-[44px] mr-2">
              €
            </AppText>
            <TextInput
              value={amountText}
              onChangeText={(v) => setAmountText(v.replace(/[^0-9.,]/g, ""))}
              placeholder="0,00"
              placeholderTextColor={colors["muted-foreground"]}
              keyboardType="decimal-pad"
              autoFocus
              style={{ flex: 1, fontFamily: fonts.serif, fontSize: 48, color: colors.ink }}
            />
          </View>
        </View>

        <View>
          <AppText fontWeight="bold" className="text-muted-foreground text-xs tracking-widest mb-2">
            CATEGORIA
          </AppText>
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {categories.map((c) => {
              const active = c.key === category;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  className={`items-center rounded-2xl py-3 border ${active ? "bg-primary-soft border-primary" : "bg-surface border-line"}`}
                  style={{ width: "22.5%" }}
                >
                  <IconTile name={c.icon} size={40} tone={active ? "primary" : "neutral"} />
                  <AppText
                    fontWeight={active ? "bold" : "medium"}
                    className={`text-[11px] mt-1.5 ${active ? "text-primary" : "text-ink"}`}
                    numberOfLines={1}
                  >
                    {c.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View>
          <AppText fontWeight="bold" className="text-muted-foreground text-xs tracking-widest mb-2">
            QUANDO
          </AppText>
          <View className="flex-row" style={{ gap: 8 }}>
            {DAY_OPTIONS.map((d) => (
              <Pressable
                key={d.offset}
                onPress={() => setDayOffset(d.offset)}
                className={`rounded-full px-4 py-2 border ${dayOffset === d.offset ? "bg-ink border-ink" : "bg-surface border-line"}`}
              >
                <AppText
                  fontWeight="bold"
                  className={`text-xs ${dayOffset === d.offset ? "text-white" : "text-ink"}`}
                >
                  {d.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Nota (facoltativa)"
          placeholderTextColor={colors["muted-foreground"]}
          className="bg-surface rounded-2xl px-4 py-3.5 border border-line text-ink"
          style={{ fontFamily: fonts.regular, fontSize: 15 }}
        />

        <AppButton text="Salva movimento" disabled={!valid} onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
