export const BUILDING_PRESETS = {
    fuel_mine: { length: 0.06, width: 0.06, height: 0.12, color: 0xc0151d },
    factory: { length: 0.12, width: 0.12, height: 0.08, color: 0xeaa937 },
    space_center: { length: 0.12, width: 0.12, height: 0.14, color: 0x555555 },
    generic: { length: 0.1, width: 0.1, height: 0.1, color: 0x808080 }
} as const;

export type ResourceRates = {
    cost?: number;
    consumes?: Partial<Record<'money' | 'fuel', number>>;
    produces?: Partial<Record<'money' | 'fuel', number>>;
};

export const BUILDING_ECONOMY: Record<keyof typeof BUILDING_PRESETS, ResourceRates> = {
    fuel_mine: {
        cost: 100,
        produces: { fuel: 10 },
    },
    factory: {
        cost: 100,
        consumes: { fuel: 1 },
        produces: { money: 20 },
    },
    space_center: {
        cost: 500,
        consumes: { fuel: 15, money: 90 },
    },
    generic: { cost: 0 },
};