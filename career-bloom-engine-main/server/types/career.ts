export interface CareerStep {
  year: number;
  title: string;
  description: string;
  skills: string[];
  resources?: {
    name: string;
    url: string;
  }[];
}

export interface LearningModule {
  name: string;
  url: string;
  type: string;
}

export interface CareerPathResponse {
  title: string;
  query: string;
  missingSkills: string[];
  steps: CareerStep[];
  learningModules: LearningModule[];
} 