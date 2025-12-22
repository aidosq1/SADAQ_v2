"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { Search, X, Plus, ChevronDown } from "lucide-react";

export interface SearchableSelectItem {
    id: number;
    name: string;
    subtitle?: string;
    [key: string]: any;
}

interface SearchableSelectProps {
    items: SearchableSelectItem[];
    value: number | null;
    onChange: (id: number | null) => void;
    onAddNew?: () => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    addNewLabel?: string;
    disabled?: boolean;
    className?: string;
    renderItem?: (item: SearchableSelectItem) => React.ReactNode;
}

export function SearchableSelect({
    items,
    value,
    onChange,
    onAddNew,
    placeholder = "Выберите...",
    searchPlaceholder = "Поиск...",
    emptyMessage = "Ничего не найдено",
    addNewLabel = "Добавить новый",
    disabled = false,
    className,
    renderItem,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedItem = items.find((item) => item.id === value);

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()))
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (id: number) => {
        onChange(id);
        setIsOpen(false);
        setSearch("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setSearch("");
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* Trigger Button */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between gap-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer",
                    "hover:bg-accent/50 transition-colors",
                    disabled && "opacity-50 cursor-not-allowed",
                    isOpen && "ring-2 ring-ring"
                )}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    {selectedItem ? (
                        <span className="truncate">{selectedItem.name}</span>
                    ) : (
                        <span className="text-muted-foreground truncate">{placeholder}</span>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {selectedItem && (
                        <button
                            onClick={handleClear}
                            className="p-1 hover:bg-destructive/20 rounded transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-lg">
                    {/* Search Input */}
                    <div className="p-2 border-b">
                        <Input
                            ref={inputRef}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-8"
                        />
                    </div>

                    {/* Items List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {filteredItems.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                {emptyMessage}
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item.id)}
                                    className={cn(
                                        "px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                                        value === item.id && "bg-accent"
                                    )}
                                >
                                    {renderItem ? (
                                        renderItem(item)
                                    ) : (
                                        <div>
                                            <div className="text-sm font-medium">{item.name}</div>
                                            {item.subtitle && (
                                                <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add New Button */}
                    {onAddNew && (
                        <div className="border-t p-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start gap-2"
                                onClick={() => {
                                    setIsOpen(false);
                                    onAddNew();
                                }}
                            >
                                <Plus className="h-4 w-4" />
                                {addNewLabel}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
