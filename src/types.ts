export type Report = {
  entry: string;
  depth: number;
  dependencies: Dependency[];
};

export type Dependency = {
  importPath: string;
  depth?: number;
  importValue: string;
  callee: string;
  dependencies?: Dependency[];
};
