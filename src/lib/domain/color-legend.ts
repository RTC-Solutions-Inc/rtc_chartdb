import { z } from 'zod';

export interface ColorLegendEntry {
    id: string;
    color: string;
    label: string;
}

export interface ColorLegendSection {
    collapsed: boolean;
    entries: ColorLegendEntry[];
}

export interface ColorLegend {
    tables: ColorLegendSection;
    notes: ColorLegendSection;
    areas: ColorLegendSection;
}

export type ColorLegendSectionKey = keyof ColorLegend;

export interface EntityColorUpdate {
    id: string;
    color: string;
}

export interface RecolorEntitiesChange {
    tables: EntityColorUpdate[];
    notes: EntityColorUpdate[];
    areas: EntityColorUpdate[];
}

export const createEmptyColorLegendSection = (): ColorLegendSection => ({
    collapsed: false,
    entries: [],
});

export const createEmptyColorLegend = (): ColorLegend => ({
    tables: createEmptyColorLegendSection(),
    notes: createEmptyColorLegendSection(),
    areas: createEmptyColorLegendSection(),
});

export const colorLegendEntrySchema = z.object({
    id: z.string(),
    color: z.string(),
    label: z.string(),
});

export const colorLegendSectionSchema = z.object({
    collapsed: z.boolean(),
    entries: z.array(colorLegendEntrySchema),
});

export const colorLegendSchema = z.object({
    tables: colorLegendSectionSchema,
    notes: colorLegendSectionSchema,
    areas: colorLegendSectionSchema,
});
