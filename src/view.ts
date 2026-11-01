/** Which screen is showing in the main panel. */
export type View = { kind: 'landing' } | { kind: 'folder'; id: string } | { kind: 'completed' };
