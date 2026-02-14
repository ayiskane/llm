"use client";

import type { ReactNode } from "react";
import {
  CardListItem,
  CardListItemTitle,
  CardListItemDescription,
} from "@/components/ui/card";

interface IndexListItemProps {
  title: string;
  onClick: () => void;
  children: ReactNode;
}

export function IndexListItem({ title, onClick, children }: IndexListItemProps) {
  return (
    <CardListItem onClick={onClick}>
      <CardListItemTitle>{title}</CardListItemTitle>
      <CardListItemDescription>{children}</CardListItemDescription>
    </CardListItem>
  );
}
