import { Text, TextProps } from "react-native";
import classNames from "classnames";

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  /** Body text weight (font Now). Ignored when `variant` is a serif. */
  fontWeight?: "regular" | "medium" | "bold";
  /**
   * `body`   → Now (default, for all running text)
   * `serif`  → Instrument Serif (titles)
   * `serif-italic` → Instrument Serif Italic (accents inside titles)
   */
  variant?: "body" | "serif" | "serif-italic";
}

export function AppText({
  children,
  className,
  fontWeight = "regular",
  variant = "body",
  ...props
}: AppTextProps) {
  return (
    <Text
      className={classNames(
        {
          "font-now-regular": variant === "body" && fontWeight === "regular",
          "font-now-medium": variant === "body" && fontWeight === "medium",
          "font-now-bold": variant === "body" && fontWeight === "bold",
          "font-serif": variant === "serif",
          "font-serif-italic": variant === "serif-italic",
        },
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}

/** Large editorial title in Instrument Serif. */
export function Title({
  children,
  className,
  ...props
}: Omit<AppTextProps, "variant" | "fontWeight">) {
  return (
    <AppText
      variant="serif"
      className={classNames("text-ink text-[40px] leading-[44px]", className)}
      {...props}
    >
      {children}
    </AppText>
  );
}
