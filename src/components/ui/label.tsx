"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label@2.1.2";

import { cn } from "./utils";

function Label({ className, ref, ...props }: React.ComponentProps<typeof LabelPrimitive.Root> & { ref?: React.Ref<React.ElementRef<typeof LabelPrimitive.Root>> }) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
