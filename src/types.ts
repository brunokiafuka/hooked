export interface Report {
  entry: string;
  depth: number;
  filePath: string;
  dependencies: Dependency[];
}

export interface Dependency {
  importPath: string;
  importValue: string;
  callee: string;
  filePath: string;
  depth?: number;
  dependencies?: Dependency[];
}
