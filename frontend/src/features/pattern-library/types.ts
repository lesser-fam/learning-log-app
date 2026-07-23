export type TechnologyId = "laravel" | "nextjs" | "react" | "typescript";

export type Technology = {
  id: TechnologyId;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
};

export type PatternBranch = {
  condition: string;
  result: string;
};

export type DevelopmentPattern = {
  id: string;
  technology: TechnologyId;
  action: string;
  title: string;
  summary: string;
  useWhen: string;
  mentalModel: string;
  flow: string[];
  buildingBlocks: string[];
  branches: PatternBranch[];
  questions: string[];
  codeLabel: string;
  code: string;
  checklist: string[];
  searchKeywords: string[];
};
