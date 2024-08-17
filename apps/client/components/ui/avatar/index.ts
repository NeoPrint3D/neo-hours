import { cva, type VariantProps } from "class-variance-authority";

export { default as Avatar } from "./Avatar.vue";
export { default as AvatarFallback } from "./AvatarFallback.vue";
export { default as AvatarImage } from "./AvatarImage.vue";

export const avatarVariant = cva(
  "text-foreground bg-secondary inline-flex shrink-0 select-none items-center justify-center overflow-hidden font-normal",
  {
    variants: {
      size: {
        sm: "h-10 w-10 text-xs",
        base: "h-16 w-16 text-2xl",
        lg: "h-32 w-32 text-5xl",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
  },
);

export type AvatarVariants = VariantProps<typeof avatarVariant>;
