"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { X, Plus, ChevronDown } from "lucide-react";

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
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedItem = items.find((item) => item.id === value);

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()))
    );

    // Calculate dropdown position
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                triggerRef.current && !triggerRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
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

    const dropdownContent = isOpen && typeof document !== 'undefined' ? createPortal(
        <div
            ref={dropdownRef}
            className="fixed z-[9999] rounded-md border bg-background shadow-lg overflow-hidden"
            style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
            }}
        >
            {/* Search Input */}
            <div className="p-2">
                <Input
                    ref={inputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-8"
                />
            </div>

            {/* Items List */}
            <div className="max-h-[240px] overflow-y-auto">
                {filteredItems.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        {emptyMessage}
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className={cn(
                                "px-3 py-2 cursor-pointer text-sm transition-colors",
                                "hover:bg-accent",
                                value === item.id && "bg-accent font-medium"
                            )}
                        >
                            {renderItem ? (
                                renderItem(item)
                            ) : (
                                <span>
                                    {item.name}
                                    {item.subtitle && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {item.subtitle}
                                        </span>
                                    )}
                                </span>
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
        </div>,
        document.body
    ) : null;

    return (
        <div className={cn("relative", className)}>
            {/* Trigger Button */}
            <div
                ref={triggerRef}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full h-9 px-3 rounded-md border bg-background text-sm cursor-pointer",
                    "hover:border-primary/50 transition-colors",
                    disabled && "opacity-50 cursor-not-allowed",
                    isOpen && "ring-2 ring-primary/20 border-primary"
                )}
            >
                <span className={cn(
                    "truncate flex-1",
                    !selectedItem && "text-muted-foreground"
                )}>
                    {selectedItem ? selectedItem.name : placeholder}
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    {selectedItem && (
                        <button
                            onClick={handleClear}
                            className="p-0.5 hover:bg-muted rounded transition-colors"
                        >
                            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </button>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>

            {/* Dropdown via Portal */}
            {dropdownContent}
        </div>
    );
}
