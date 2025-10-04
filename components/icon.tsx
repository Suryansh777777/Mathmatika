import { icons, IconType } from "@/lib/icons";
import { LucideProps } from "lucide-react";

export interface IconProps extends LucideProps {
  name: IconType;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const Comp = icons[name];
  return <Comp {...props} />;
};
