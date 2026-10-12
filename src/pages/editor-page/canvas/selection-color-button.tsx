import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { useStore } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import { useChartDB } from '@/hooks/use-chartdb';
import { colorOptions } from '@/lib/colors';
import { toRecolorChange, useViewIds } from './recolor-targets';

export const SelectionColorButton: React.FC = () => {
    const { t } = useTranslation();
    const { readonly, recolorEntities } = useChartDB();
    const viewIds = useViewIds();
    const [open, setOpen] = useState(false);

    const placementKey = useStore((state) => {
        if (state.nodes.some((node) => node.dragging)) {
            return '';
        }

        const selected = state.nodes.filter(
            (node) =>
                !!node.selected &&
                !node.hidden &&
                (node.type === 'note' ||
                    node.type === 'area' ||
                    (node.type === 'table' && !viewIds.has(node.id)))
        );

        if (selected.length < 2) {
            return '';
        }

        const [translateX, translateY, zoom] = state.transform;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;

        for (const node of selected) {
            const withInternals = node as typeof node & {
                internals?: { positionAbsolute?: { x: number; y: number } };
                measured?: { width?: number; height?: number };
            };
            const position =
                withInternals.internals?.positionAbsolute ?? node.position;
            const width = withInternals.measured?.width ?? node.width ?? 0;
            minY = Math.min(minY, position.y);
            maxX = Math.max(maxX, position.x + width);
        }

        const tableIds = selected
            .filter((node) => node.type === 'table')
            .map((node) => node.id)
            .join(',');
        const noteIds = selected
            .filter((node) => node.type === 'note')
            .map((node) => node.id)
            .join(',');
        const areaIds = selected
            .filter((node) => node.type === 'area')
            .map((node) => node.id)
            .join(',');

        return `${maxX * zoom + translateX + 8}|${minY * zoom + translateY - 8}|${tableIds}|${noteIds}|${areaIds}`;
    });

    if (readonly || !placementKey) {
        return null;
    }

    const [leftRaw, topRaw, tableIds, noteIds, areaIds] =
        placementKey.split('|');
    const targets = {
        tables: tableIds ? tableIds.split(',') : [],
        notes: noteIds ? noteIds.split(',') : [],
        areas: areaIds ? areaIds.split(',') : [],
    };
    const count =
        targets.tables.length + targets.notes.length + targets.areas.length;

    return (
        <div
            className="nopan nodrag nowheel absolute z-20"
            style={{
                left: Number(leftRaw),
                top: Number(topRaw),
                transform: 'translateY(-100%)',
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.stopPropagation()}
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded-md border border-white/20 bg-slate-950/90 text-slate-100 shadow-md hover:bg-slate-800"
                        aria-label={t('canvas_context_menu.set_color_count', {
                            count,
                        })}
                    >
                        <Palette className="size-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-fit"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="grid grid-cols-4 gap-2">
                        {colorOptions.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className="size-8 cursor-pointer rounded-md border-2 border-muted"
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                    recolorEntities(
                                        toRecolorChange(targets, color)
                                    );
                                    setOpen(false);
                                }}
                            />
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
