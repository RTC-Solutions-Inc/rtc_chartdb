import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from '@/components/context-menu/context-menu';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useChartDB } from '@/hooks/use-chartdb';
import type { Area } from '@/lib/domain/area';
import { arrangeTablesForArea } from '@/lib/utils/area-utils';
import { LayoutGrid, Pencil, Trash2 } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { SetColorMenu } from '../set-color-menu';
import {
    getColorChangeTargets,
    toRecolorChange,
    useSelectedDiagramNodes,
    useViewIds,
} from '../recolor-targets';

export interface AreaNodeContextMenuProps {
    area: Area;
    onEditName?: () => void;
}

export const AreaNodeContextMenu: React.FC<
    React.PropsWithChildren<AreaNodeContextMenuProps>
> = ({ children, area, onEditName }) => {
    const {
        removeArea,
        readonly,
        tables,
        relationships,
        updateTablesState,
        updateArea,
        recolorEntities,
    } = useChartDB();
    const { isMd: isDesktop } = useBreakpoint('md');
    const { getNodes } = useReactFlow();
    const selectedDiagramNodes = useSelectedDiagramNodes();
    const viewIds = useViewIds();
    const colorTargets = useMemo(
        () =>
            getColorChangeTargets({
                selected: selectedDiagramNodes,
                viewIds,
                clicked: { id: area.id, type: 'area' },
            }),
        [selectedDiagramNodes, viewIds, area.id]
    );
    const setColor = useCallback(
        (color: string) => {
            recolorEntities(toRecolorChange(colorTargets, color));
        },
        [recolorEntities, colorTargets]
    );

    const removeAreaHandler = useCallback(() => {
        removeArea(area.id);
    }, [removeArea, area.id]);

    const autoArrangeHandler = useCallback(() => {
        const canvasNodes = getNodes();
        const areaNode = canvasNodes.find(
            (n) => n.id === area.id && n.type === 'area'
        );
        const areaRect = {
            x: areaNode?.position.x ?? area.x,
            y: areaNode?.position.y ?? area.y,
            width: areaNode?.measured?.width ?? area.width,
            height: areaNode?.measured?.height ?? area.height,
        };

        const tablesInArea = tables.filter((t) => t.parentAreaId === area.id);
        if (tablesInArea.length === 0) return;

        const { positions, requiredWidth, requiredHeight } =
            arrangeTablesForArea(tablesInArea, relationships, areaRect);

        if (
            requiredWidth > areaRect.width ||
            requiredHeight > areaRect.height
        ) {
            updateArea(area.id, {
                width: Math.max(areaRect.width, requiredWidth),
                height: Math.max(areaRect.height, requiredHeight),
            });
        }

        updateTablesState(
            (currentTables) =>
                currentTables.map((t) => {
                    const pos = positions.find((p) => p.id === t.id);
                    if (!pos) return t;
                    return { ...t, x: pos.x, y: pos.y };
                }),
            { updateHistory: true }
        );
    }, [area, tables, relationships, updateTablesState, updateArea, getNodes]);

    if (!isDesktop || readonly) {
        return <>{children}</>;
    }
    return (
        <ContextMenu>
            <ContextMenuTrigger>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                {onEditName ? (
                    <ContextMenuItem
                        onClick={onEditName}
                        className="flex justify-between gap-3"
                    >
                        <span>Edit Area Name</span>
                        <Pencil className="size-3.5" />
                    </ContextMenuItem>
                ) : null}
                <ContextMenuItem
                    onClick={autoArrangeHandler}
                    className="flex justify-between gap-3"
                >
                    <span>Auto Arrange</span>
                    <LayoutGrid className="size-3.5" />
                </ContextMenuItem>
                <SetColorMenu targets={colorTargets} onColor={setColor} />
                <ContextMenuSeparator />
                <ContextMenuItem
                    onClick={removeAreaHandler}
                    className="flex justify-between gap-3"
                >
                    <span>Delete Area</span>
                    <Trash2 className="size-3.5 text-red-700" />
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};
