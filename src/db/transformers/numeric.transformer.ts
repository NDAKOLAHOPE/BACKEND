export const numericToNumberTransformer = {
  to: (value: number | null | undefined) => {
    if (value === null || value === undefined) return null;
    return String(value);
  },
  from: (value: string | null) => {
    if (value === null) return null;
    return Number(value);
  },
};

