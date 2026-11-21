import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { IconTile } from "@/components/brand/Icon3D";
import { HeaderPill, ModuleHeader } from "@/components/brand/ModuleHeader";
import { colors } from "@/lib/constants";
import {
  formatDayLabel,
  formatEuro,
  formatMonthLabel,
  localIsoDate,
  monthKey,
  shiftMonth,
} from "@/lib/dates";
import { getCategory, useFinance, type Transaction } from "@/providers/FinanceProvider";

export default function FinanceScreen() {
  const { transactions, totalBalance, summaryFor, removeTransaction } = useFinance();
  const currentMonth = monthKey(localIsoDate());
  const [month, setMonth] = useState(currentMonth);
  const summary = summaryFor(month);

  const days = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of transactions) {
      if (!t.date.startsWith(month)) continue;
      const bucket = map.get(t.date);
      if (bucket) bucket.push(t);
      else map.set(t.date, [t]);
    }
    return [...map.entries()];
  }, [transactions, month]);

  const confirmDelete = (t: Transaction) =>
    Alert.alert("Eliminare il movimento?", `${getCategory(t.category).label} · ${formatEuro(t.amount)}`, [
      { text: "Annulla", style: "cancel" },
      { text: "Elimina", style: "destructive", onPress: () => removeTransaction(t.id) },
    ]);

  const maxCat = summary.byCategory[0]?.total ?? 0;

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <ModuleHeader
          module="finance"
          title="Il tuo"
          accent="denaro"
          right={
            <HeaderPill
              label="Movimento"
              tone="solid"
              icon={<Ionicons name="add" size={14} color="#fff" />}
              onPress={() => router.push("/add-transaction")}
            />
          }
        />

        <View className="px-5" style={{ gap: 14 }}>
          {/* Balance */}
          <View className="bg-ink rounded-3xl p-5 overflow-hidden">
            <View className="flex-row items-start justify-between">
              <View>
                <AppText className="text-white/60 text-xs tracking-widest" fontWeight="bold">
                  SALDO TOTALE
                </AppText>
                <AppText variant="serif" className="text-white text-[44px] leading-[52px] mt-1">
                  {formatEuro(totalBalance)}
                </AppText>
              </View>
              <IconTile name="wallet" size={56} style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            </View>
            <View className="flex-row mt-4" style={{ gap: 10 }}>
              <Stat label="Entrate" value={formatEuro(summary.income)} color="#5EE0A9" />
              <Stat label="Uscite" value={formatEuro(summary.expense)} color="#FF8D73" />
            </View>
          </View>

          {/* Month switcher */}
          <View className="flex-row items-center justify-between">
            <Pressable hitSlop={10} onPress={() => setMonth(shiftMonth(month, -1))}>
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </Pressable>
            <AppText variant="serif" className="text-ink text-2xl">
              {formatMonthLabel(month)}
            </AppText>
            <Pressable
              hitSlop={10}
              disabled={month >= currentMonth}
              onPress={() => setMonth(shiftMonth(month, 1))}
              style={{ opacity: month >= currentMonth ? 0.25 : 1 }}
            >
              <Ionicons name="chevron-forward" size={22} color={colors.ink} />
            </Pressable>
          </View>

          {/* Category breakdown */}
          <Card>
            <View className="flex-row items-center justify-between mb-3">
              <AppText fontWeight="bold" className="text-ink text-base">
                Dove vanno i soldi
              </AppText>
              <AppText
                fontWeight="bold"
                className={summary.balance >= 0 ? "text-income text-sm" : "text-expense text-sm"}
              >
                {formatEuro(summary.balance, { signed: true })}
              </AppText>
            </View>
            {summary.byCategory.length === 0 ? (
              <AppText className="text-muted-foreground text-sm">
                Nessuna uscita in questo mese.
              </AppText>
            ) : (
              <View style={{ gap: 12 }}>
                {summary.byCategory.slice(0, 5).map(({ key, total }) => {
                  const cat = getCategory(key);
                  return (
                    <View key={key} className="flex-row items-center" style={{ gap: 10 }}>
                      <IconTile name={cat.icon} size={34} />
                      <View className="flex-1">
                        <View className="flex-row justify-between">
                          <AppText fontWeight="medium" className="text-ink text-sm">
                            {cat.label}
                          </AppText>
                          <AppText fontWeight="bold" className="text-ink text-sm">
                            {formatEuro(total)}
                          </AppText>
                        </View>
                        <View className="h-1.5 bg-track-gray rounded-full mt-1.5 overflow-hidden">
                          <View
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${maxCat ? (total / maxCat) * 100 : 0}%` }}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          {/* Transactions */}
          <AppText variant="serif" className="text-ink text-[28px] mt-2">
            Movimenti
          </AppText>
          {days.length === 0 ? (
            <Pressable
              onPress={() => router.push("/add-transaction")}
              className="border border-dashed border-line rounded-3xl py-8 items-center bg-surface"
            >
              <IconTile name="moneyBag" size={64} />
              <AppText fontWeight="bold" className="text-ink text-base mt-3">
                Nessun movimento
              </AppText>
              <AppText className="text-muted-foreground text-sm mt-1">
                Tocca per registrare la prima entrata o uscita
              </AppText>
            </Pressable>
          ) : (
            days.map(([date, list]) => (
              <View key={date}>
                <AppText fontWeight="bold" className="text-muted-foreground text-xs tracking-widest mb-2">
                  {formatDayLabel(date).toUpperCase()}
                </AppText>
                <Card className="py-1">
                  {list.map((t, i) => {
                    const cat = getCategory(t.category);
                    return (
                      <Pressable
                        key={t.id}
                        onLongPress={() => confirmDelete(t)}
                        className={`flex-row items-center py-3 ${i > 0 ? "border-t border-line" : ""}`}
                        style={{ gap: 12 }}
                      >
                        <IconTile name={cat.icon} size={40} tone={t.type === "income" ? "neutral" : "primary"} />
                        <View className="flex-1">
                          <AppText fontWeight="bold" className="text-ink text-[15px]">
                            {cat.label}
                          </AppText>
                          {t.note ? (
                            <AppText className="text-muted-foreground text-xs mt-0.5" numberOfLines={1}>
                              {t.note}
                            </AppText>
                          ) : null}
                        </View>
                        <AppText
                          fontWeight="bold"
                          className={t.type === "income" ? "text-income text-[15px]" : "text-ink text-[15px]"}
                        >
                          {formatEuro(t.type === "income" ? t.amount : -t.amount, { signed: true })}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </Card>
              </View>
            ))
          )}
          {days.length > 0 && (
            <AppText className="text-muted-foreground text-xs text-center">
              Tieni premuto un movimento per eliminarlo
            </AppText>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View className="flex-1 rounded-2xl px-3 py-2.5" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
      <AppText className="text-white/60 text-[11px]" fontWeight="medium">
        {label} del mese
      </AppText>
      <AppText fontWeight="bold" className="text-[15px] mt-0.5" style={{ color }}>
        {value}
      </AppText>
    </View>
  );
}
