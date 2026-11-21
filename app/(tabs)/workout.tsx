import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FITNESS_SEGMENTS, ModuleHeader, SegmentedNav } from "@/components/brand/ModuleHeader";
import { Icon3D } from "@/components/brand/Icon3D";
import { AppText } from "@/components/AppText";
import { TemplateCard } from "@/components/workout/TemplateCard";
import {
  EXAMPLE_TEMPLATES,
  exampleTemplateDescription,
} from "@/data/example-templates";
import { formatShortDate } from "@/lib/format";
import type { Template } from "@/lib/types";
import { useTemplates } from "@/providers/TemplatesProvider";

function templateDescription(template: Template): string {
  return template.exercises.map((exercise) => exercise.name).join(", ");
}

function TemplateGrid({ children }: { children: React.ReactNode }) {
  return <View className="flex-row flex-wrap gap-3 mt-3">{children}</View>;
}

/**
 * Wrapper to keep the 2-column grid math simple: each cell is ~half width.
 */
function GridCell({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ width: "48%" }} className="grow">
      {children}
    </View>
  );
}

export default function WorkoutScreen() {
  const { items: templates } = useTemplates();

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ModuleHeader module="fitness" title="Pronto ad" accent="allenarti?">
          <SegmentedNav items={FITNESS_SEGMENTS} active="workout" />
        </ModuleHeader>
        <View className="px-5">

        <Pressable
          onPress={() => router.push("/active-workout")}
          className="bg-primary rounded-3xl p-5 flex-row items-center mt-1"
          style={{ gap: 14 }}
        >
          <View className="bg-white rounded-2xl items-center justify-center" style={{ width: 58, height: 58 }}>
            <Icon3D name="flash" size={46} />
          </View>
          <View className="flex-1">
            <AppText variant="serif" className="text-white text-[26px] leading-[30px]">
              Allenamento libero
            </AppText>
            <AppText className="text-white/80 text-xs mt-1">
              Parti subito e aggiungi gli esercizi mentre ti alleni
            </AppText>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>

        <View className="flex-row items-center justify-between mt-7">
          <AppText variant="serif" className="text-ink text-[30px]">
            Schede
          </AppText>
          <View className="flex-row items-center gap-4">
            <Pressable
              hitSlop={8}
              className="flex-row items-center gap-1"
              onPress={() => router.push("/create-template")}
            >
              <Ionicons name="add" size={18} color="#E1290A" />
              <AppText className="text-primary text-base" fontWeight="bold">
                Nuova scheda
              </AppText>
            </Pressable>
          </View>
        </View>

        <AppText className="text-muted-foreground text-xs tracking-widest mt-5" fontWeight="bold">
          LE MIE SCHEDE ({templates.length})
        </AppText>
        {templates.length === 0 ? (
          <View className="mt-3 border border-dashed border-gray-300 rounded-2xl px-4 py-6 items-center">
            <AppText className="text-gray-500 text-center">
              Nessuna scheda. Tocca “Nuova scheda” per crearne una.
            </AppText>
          </View>
        ) : (
          <TemplateGrid>
            {templates.map((template) => (
              <GridCell key={template.id}>
                <TemplateCard
                  title={template.name}
                  description={templateDescription(template)}
                  dateLabel={formatShortDate(template.updatedAt)}
                  onPress={() =>
                    router.push({
                      pathname: "/active-workout",
                      params: { templateId: template.id },
                    })
                  }
                  onPressMenu={() =>
                    router.push({
                      pathname: "/create-template",
                      params: { templateId: template.id },
                    })
                  }
                />
              </GridCell>
            ))}
          </TemplateGrid>
        )}

        <AppText className="text-muted-foreground text-xs tracking-widest mt-6" fontWeight="bold">
          ESEMPI ({EXAMPLE_TEMPLATES.length})
        </AppText>
        <TemplateGrid>
          {EXAMPLE_TEMPLATES.map((template) => (
            <GridCell key={template.id}>
              <TemplateCard
                title={template.name}
                description={exampleTemplateDescription(template)}
              />
            </GridCell>
          ))}
        </TemplateGrid>
        </View>
      </ScrollView>
    </View>
  );
}
