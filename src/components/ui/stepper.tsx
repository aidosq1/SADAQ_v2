"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Step {
    id: string;
    label: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (stepIndex: number) => void;
    className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
    return (
        <div className={cn("w-full", className)}>
            {/* Desktop Stepper */}
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        {/* Step Circle + Label */}
                        <div
                            className={cn(
                                "flex flex-col items-center",
                                onStepClick && index <= currentStep && "cursor-pointer"
                            )}
                            onClick={() => onStepClick && index <= currentStep && onStepClick(index)}
                        >
                            <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                                index < currentStep && "bg-green-600 border-green-600 text-white",
                                index === currentStep && "border-primary bg-primary/10 text-primary",
                                index > currentStep && "border-muted-foreground/30 text-muted-foreground"
                            )}>
                                {index < currentStep ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-semibold">{index + 1}</span>
                                )}
                            </div>
                            <span className={cn(
                                "mt-2 text-xs font-medium text-center max-w-[80px] leading-tight",
                                index <= currentStep ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className={cn(
                                "flex-1 h-0.5 mx-3 transition-colors",
                                index < currentStep ? "bg-green-600" : "bg-muted"
                            )} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Mobile Stepper */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full",
                        "bg-primary text-primary-foreground text-sm font-bold"
                    )}>
                        {currentStep + 1}
                    </div>
                    <span className="font-medium text-sm">{steps[currentStep]?.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                    {currentStep + 1} / {steps.length}
                </span>
            </div>
        </div>
    );
}
