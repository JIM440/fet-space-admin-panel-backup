import React from "react";

// Define the allowed HTML tags explicitly to exclude SVG elements
type HtmlTag = "h1" | "h2" | "h3" | "h4" | "p" | "small" | "span";

type TextVariant = "h1" | "h2" | "h3" | "h4" | "body" | "small" | "caption";

interface ThemedTextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  className?: string;
  numberOfLines?: number;
  multiline?: boolean;
}

const ThemedText: React.FC<ThemedTextProps> = ({
  variant = "body",
  className,
  numberOfLines,
  multiline = false,
  children,
  ...rest
}) => {
  const getVariantStyle = (variant: TextVariant): string => {
    const baseStyles = "text-neutral-text-secondary";
    switch (variant) {
      case "h1":
        return `text-3xl font-bold leading-9 ${baseStyles}`;
      case "h2":
        return `text-2xl font-semibold leading-7 ${baseStyles}`;
      case "h3":
        return `text-lg font-semibold leading-6 ${baseStyles}`;
      case "h4":
        return `text-base font-semibold leading-5 ${baseStyles} `;
      case "body":
        return `text-sm font-normal leading-5 ${baseStyles}`;
      case "small":
        return `text-neutral-text-tertiary text-xs font-normal leading-4.5 ${baseStyles}`;
      case "caption":
        return `text-neutral-text-tertiary text-xs font-normal leading-4 tracking-wider ${baseStyles}`;
      default:
        return `text-sm font-normal leading-5 ${baseStyles}`;
    }
  };

  const textStyle = `${getVariantStyle(variant)} ${
    multiline ? "text-left" : ""
  } ${className || ""}`.trim();

  const getElementTag = (variant: TextVariant): HtmlTag => {
    switch (variant) {
      case "h1":
        return "h1";
      case "h2":
        return "h2";
      case "h3":
        return "h3";
      case "h4":
        return "h4";
      case "body":
        return "p";
      case "small":
        return "small";
      case "caption":
        return "span";
      default:
        return "p";
    }
  };

  const Tag = getElementTag(variant);

  return (
    <Tag
      style={{ WebkitLineClamp: multiline ? undefined : numberOfLines }}
      className={textStyle}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default ThemedText;
