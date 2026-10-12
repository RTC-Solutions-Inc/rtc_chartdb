import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ContextMenuItem,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
} from '@/components/context-menu/context-menu';
import { colorOptions } from '@/lib/colors';
import { colorTargetCount, type ColorChangeTargets } from './recolor-targets';

export const SetColorMenu: React.FC<{
    targets: ColorChangeTargets;
    onColor: (color: string) => void;
}> = ({ targets, onColor }) => {
    const { t } = useTranslation();
    const count = colorTargetCount(targets);

    if (count === 0) {
        return null;
    }

    return (
        <ContextMenuSub>
            <ContextMenuSubTrigger>
                <span>
                    {count > 1
                        ? t('canvas_context_menu.set_color_count', { count })
                        : t('canvas_context_menu.set_color')}
                </span>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-fit p-2">
                <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                        <ContextMenuItem
                            key={color}
                            className="size-8 cursor-pointer rounded-md border-2 border-muted p-0"
                            style={{ backgroundColor: color }}
                            onClick={() => onColor(color)}
                        />
                    ))}
                </div>
            </ContextMenuSubContent>
        </ContextMenuSub>
    );
};
