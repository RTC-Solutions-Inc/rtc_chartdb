import { useMemo } from 'react';
import { useStore } from '@xyflow/react';
import { useChartDB } from '@/hooks/use-chartdb';
import type { RecolorEntitiesChange } from '@/lib/domain/color-legend';

export interface ColorChangeTargets {
    tables: string[];
    notes: string[];
    areas: string[];
}

export const colorTargetCount = (targets: ColorChangeTargets): number =>
    targets.tables.length + targets.notes.length + targets.areas.length;

export const toRecolorChange = (
    targets: ColorChangeTargets,
    color: string
): RecolorEntitiesChange => ({
    tables: targets.tables.map((id) => ({ id, color })),
    notes: targets.notes.map((id) => ({ id, color })),
    areas: targets.areas.map((id) => ({ id, color })),
});

export const getColorChangeTargets = ({
    selected,
    viewIds,
    clicked,
}: {
    selected: { id: string; type?: string }[];
    viewIds: Set<string>;
    clicked?: { id: string; type: 'table' | 'note' | 'area' };
}): ColorChangeTargets => {
    const isColorable = (node: { id: string; type?: string }) =>
        node.type === 'note' ||
        node.type === 'area' ||
        (node.type === 'table' && !viewIds.has(node.id));

    const colorable = selected.filter(isColorable);
    const clickedInSelection =
        !!clicked && selected.some((node) => node.id === clicked.id);
    const useAll = !clicked || (clickedInSelection && selected.length > 1);
    const chosen = useAll
        ? colorable
        : clicked && isColorable(clicked)
          ? [clicked]
          : [];

    return {
        tables: chosen
            .filter((node) => node.type === 'table')
            .map((node) => node.id),
        notes: chosen
            .filter((node) => node.type === 'note')
            .map((node) => node.id),
        areas: chosen
            .filter((node) => node.type === 'area')
            .map((node) => node.id),
    };
};

export const useSelectedDiagramNodes = () =>
    useStore((state) =>
        state.nodes.filter(
            (node) =>
                !!node.selected &&
                !node.hidden &&
                (node.type === 'table' ||
                    node.type === 'note' ||
                    node.type === 'area')
        )
    );

export const useViewIds = () => {
    const { tables } = useChartDB();
    return useMemo(
        () =>
            new Set(
                tables.filter((table) => table.isView).map((table) => table.id)
            ),
        [tables]
    );
};
