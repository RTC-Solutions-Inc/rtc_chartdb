import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '@/components/color-picker/color-picker';
import { useChartDB } from '@/hooks/use-chartdb';
import { useLocalConfig } from '@/hooks/use-local-config';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { colorOptions } from '@/lib/colors';
import {
    createEmptyColorLegend,
    type ColorLegend,
    type ColorLegendEntry,
    type ColorLegendSection,
    type ColorLegendSectionKey,
} from '@/lib/domain/color-legend';
import { cn, generateId } from '@/lib/utils';

const sectionKeys: ColorLegendSectionKey[] = ['tables', 'notes', 'areas'];

const nextUnusedColor = (entries: ColorLegendEntry[]): string | undefined => {
    const used = new Set(entries.map((entry) => entry.color.toLowerCase()));
    return colorOptions.find((color) => !used.has(color.toLowerCase()));
};

export const ColorLegendPanel: React.FC = () => {
    const { t } = useTranslation();
    const { colorLegend, updateColorLegend, readonly } = useChartDB();
    const { showColorLegend, colorLegendMinimized, setColorLegendMinimized } =
        useLocalConfig();
    const { isMd: isDesktop } = useBreakpoint('md');
    const legend = colorLegend ?? createEmptyColorLegend();
    const legendRef = useRef(legend);
    legendRef.current = legend;

    const patchSection = useCallback(
        (
            key: ColorLegendSectionKey,
            patch: (section: ColorLegendSection) => ColorLegendSection
        ) => {
            const current = legendRef.current;
            const next: ColorLegend = {
                ...current,
                [key]: patch(current[key]),
            };
            legendRef.current = next;
            void updateColorLegend(next);
        },
        [updateColorLegend]
    );

    if (!showColorLegend) {
        return null;
    }

    return (
        <div
            className={cn(
                'nopan nodrag nowheel absolute left-3 z-20 w-64 text-slate-100',
                isDesktop ? 'bottom-3' : 'bottom-16'
            )}
            onPointerDown={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.stopPropagation()}
        >
            <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/80 shadow-lg backdrop-blur-sm">
                <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium"
                    aria-expanded={!colorLegendMinimized}
                    aria-label={
                        colorLegendMinimized
                            ? t('color_legend.expand')
                            : t('color_legend.minimize')
                    }
                    onClick={() =>
                        setColorLegendMinimized(!colorLegendMinimized)
                    }
                >
                    <span>{t('color_legend.title')}</span>
                    {colorLegendMinimized ? (
                        <ChevronUp className="size-4 shrink-0 text-slate-300" />
                    ) : (
                        <ChevronDown className="size-4 shrink-0 text-slate-300" />
                    )}
                </button>
                {colorLegendMinimized ? null : (
                    <div className="max-h-[40vh] space-y-2 overflow-y-auto px-2 pb-2">
                        {sectionKeys.map((key) => (
                            <ColorLegendSectionBlock
                                key={key}
                                title={t(`color_legend.${key}`)}
                                section={legend[key]}
                                readonly={!!readonly}
                                onPatch={(patch) => patchSection(key, patch)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

interface ColorLegendSectionBlockProps {
    title: string;
    section: ColorLegendSection;
    readonly: boolean;
    onPatch: (
        patch: (section: ColorLegendSection) => ColorLegendSection
    ) => void;
}

const ColorLegendSectionBlock: React.FC<ColorLegendSectionBlockProps> = ({
    title,
    section,
    readonly,
    onPatch,
}) => {
    const { t } = useTranslation();
    const nextColor = nextUnusedColor(section.entries);

    const addEntry = () => {
        if (!nextColor || readonly) {
            return;
        }
        onPatch((current) => ({
            ...current,
            collapsed: false,
            entries: [
                ...current.entries,
                { id: generateId(), color: nextColor, label: '' },
            ],
        }));
    };

    return (
        <div>
            <button
                type="button"
                className="flex w-full items-center gap-1 rounded p-1 text-left text-xs font-medium text-slate-200 hover:bg-white/10"
                aria-expanded={!section.collapsed}
                onClick={() =>
                    onPatch((current) => ({
                        ...current,
                        collapsed: !current.collapsed,
                    }))
                }
            >
                {section.collapsed ? (
                    <ChevronRight className="size-3.5 shrink-0" />
                ) : (
                    <ChevronDown className="size-3.5 shrink-0" />
                )}
                <span>{title}</span>
            </button>
            {section.collapsed ? null : (
                <div className="space-y-1 pl-1">
                    {section.entries.map((entry) => (
                        <ColorLegendEntryRow
                            key={entry.id}
                            entry={entry}
                            readonly={readonly}
                            usedColors={section.entries
                                .filter((item) => item.id !== entry.id)
                                .map((item) => item.color)}
                            onChange={(next) =>
                                onPatch((current) => ({
                                    ...current,
                                    entries: current.entries.map((item) =>
                                        item.id === entry.id ? next : item
                                    ),
                                }))
                            }
                            onRemove={() =>
                                onPatch((current) => ({
                                    ...current,
                                    entries: current.entries.filter(
                                        (item) => item.id !== entry.id
                                    ),
                                }))
                            }
                        />
                    ))}
                    {readonly ? null : (
                        <button
                            type="button"
                            className="flex items-center gap-1 rounded p-1 text-xs text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={addEntry}
                            disabled={!nextColor}
                        >
                            <Plus className="size-3.5" />
                            {t('color_legend.add')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

interface ColorLegendEntryRowProps {
    entry: ColorLegendEntry;
    readonly: boolean;
    usedColors: string[];
    onChange: (entry: ColorLegendEntry) => void;
    onRemove: () => void;
}

const ColorLegendEntryRow: React.FC<ColorLegendEntryRowProps> = ({
    entry,
    readonly,
    usedColors,
    onChange,
    onRemove,
}) => {
    const { t } = useTranslation();
    const [draft, setDraft] = useState(entry.label);

    useEffect(() => {
        setDraft(entry.label);
    }, [entry.label]);

    const commitLabel = (value: string) => {
        if (value !== entry.label) {
            onChange({ ...entry, label: value });
        }
    };

    return (
        <div className="flex items-center gap-1.5">
            <ColorPicker
                color={entry.color}
                disabled={readonly}
                popoverOnMouseDown={(event) => event.stopPropagation()}
                popoverOnClick={(event) => event.stopPropagation()}
                onChange={(color) => {
                    const taken = usedColors.some(
                        (used) => used.toLowerCase() === color.toLowerCase()
                    );
                    if (taken) {
                        return;
                    }
                    onChange({ ...entry, color });
                }}
            />
            <input
                value={draft}
                disabled={readonly}
                placeholder={t('color_legend.meaning_placeholder')}
                className="h-7 min-w-0 flex-1 rounded border border-white/15 bg-white/10 px-2 text-xs text-slate-100 outline-none placeholder:text-slate-400 focus:border-white/40 disabled:opacity-60"
                onChange={(event) => setDraft(event.target.value)}
                onBlur={(event) => commitLabel(event.currentTarget.value)}
                onKeyDown={(event) => {
                    event.stopPropagation();
                    if (event.key === 'Enter') {
                        event.currentTarget.blur();
                    }
                }}
            />
            {readonly ? null : (
                <button
                    type="button"
                    className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-slate-100"
                    onClick={onRemove}
                    aria-label={t('color_legend.remove')}
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    );
};
