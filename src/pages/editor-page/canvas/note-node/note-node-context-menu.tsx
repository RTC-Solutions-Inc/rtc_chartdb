import React, { useCallback, useMemo } from 'react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuTrigger,
} from '@/components/context-menu/context-menu';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useChartDB } from '@/hooks/use-chartdb';
import type { Note } from '@/lib/domain/note';
import { SetColorMenu } from '../set-color-menu';
import {
    getColorChangeTargets,
    toRecolorChange,
    useSelectedDiagramNodes,
    useViewIds,
} from '../recolor-targets';

export const NoteNodeContextMenu: React.FC<
    React.PropsWithChildren<{ note: Note }>
> = ({ children, note }) => {
    const { readonly, recolorEntities } = useChartDB();
    const { isMd: isDesktop } = useBreakpoint('md');
    const selected = useSelectedDiagramNodes();
    const viewIds = useViewIds();

    const targets = useMemo(
        () =>
            getColorChangeTargets({
                selected,
                viewIds,
                clicked: { id: note.id, type: 'note' },
            }),
        [selected, viewIds, note.id]
    );

    const onColor = useCallback(
        (color: string) => {
            recolorEntities(toRecolorChange(targets, color));
        },
        [recolorEntities, targets]
    );

    if (!isDesktop || readonly) {
        return <>{children}</>;
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent>
                <SetColorMenu targets={targets} onColor={onColor} />
            </ContextMenuContent>
        </ContextMenu>
    );
};
