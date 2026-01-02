import { GroupCondition, Expression } from '../../../utils/conditionTypes';

export interface RunningVariable {
  id: string;
  name: string;
  description?: string;
  eventConditions: GroupCondition; // Store condition builder data
  declarations: VariableDeclaration[];
  createdAt: string;
  updatedAt: string;
}

export interface VariableDeclaration {
  id: string;
  name: string;
  expression: Expression;
  description?: string;
}

export interface RunningVariablesData {
  variables: Record<string, RunningVariable>;
}