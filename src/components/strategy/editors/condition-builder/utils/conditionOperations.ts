import { Condition, GroupCondition } from '../../../utils/conditions';
import { createDefaultGroupCondition } from '../../../utils/conditions/factories';

export interface ConditionPath {
  path: number[];
  condition: Condition | GroupCondition;
}

/**
 * Utility functions for condition operations like grouping, duplicating, moving, etc.
 */

// Deep clone a condition
export function cloneCondition(condition: Condition | GroupCondition): Condition | GroupCondition {
  return JSON.parse(JSON.stringify(condition));
}

// Get condition at specific path
export function getConditionAtPath(rootCondition: GroupCondition, path: number[]): Condition | GroupCondition | null {
  let current: Condition | GroupCondition = rootCondition;
  
  for (const index of path) {
    if ('groupLogic' in current && current.conditions && current.conditions[index]) {
      current = current.conditions[index];
    } else {
      return null;
    }
  }
  
  return current;
}

// Set condition at specific path
export function setConditionAtPath(
  rootCondition: GroupCondition, 
  path: number[], 
  newCondition: Condition | GroupCondition
): GroupCondition {
  const cloned = cloneCondition(rootCondition) as GroupCondition;
  
  if (path.length === 0) {
    return newCondition as GroupCondition;
  }
  
  let current = cloned;
  for (let i = 0; i < path.length - 1; i++) {
    const index = path[i];
    if ('groupLogic' in current && current.conditions && current.conditions[index]) {
      const condition = current.conditions[index];
      if ('groupLogic' in condition) {
        current = condition as GroupCondition;
      } else {
        throw new Error('Invalid path: trying to navigate into non-group condition');
      }
    } else {
      throw new Error('Invalid path: condition not found');
    }
  }
  
  const lastIndex = path[path.length - 1];
  if ('groupLogic' in current && current.conditions) {
    current.conditions[lastIndex] = newCondition;
  }
  
  return cloned;
}

// Remove conditions at specific paths
export function removeConditionsAtPaths(
  rootCondition: GroupCondition, 
  paths: number[][]
): GroupCondition {
  const cloned = cloneCondition(rootCondition) as GroupCondition;
  
  // Sort paths by depth (deepest first) and then by index (highest first)
  const sortedPaths = [...paths].sort((a, b) => {
    if (a.length !== b.length) {
      return b.length - a.length; // Deeper paths first
    }
    return b[b.length - 1] - a[a.length - 1]; // Higher indices first
  });
  
  for (const path of sortedPaths) {
    if (path.length === 0) continue; // Can't remove root
    
    let current = cloned;
    for (let i = 0; i < path.length - 1; i++) {
      const index = path[i];
      if ('groupLogic' in current && current.conditions && current.conditions[index]) {
        const condition = current.conditions[index];
        if ('groupLogic' in condition) {
          current = condition as GroupCondition;
        } else {
          break; // Can't navigate further
        }
      } else {
        break; // Path doesn't exist
      }
    }
    
    const lastIndex = path[path.length - 1];
    if ('groupLogic' in current && current.conditions && lastIndex < current.conditions.length) {
      current.conditions.splice(lastIndex, 1);
    }
  }
  
  return cloned;
}

// Duplicate conditions at specific paths
export function duplicateConditionsAtPaths(
  rootCondition: GroupCondition, 
  paths: number[][]
): GroupCondition {
  let result = cloneCondition(rootCondition) as GroupCondition;
  
  // Sort paths to process in reverse order to maintain indices
  const sortedPaths = [...paths].sort((a, b) => {
    if (a.length !== b.length) {
      return a.length - b.length; // Shallower paths first
    }
    return a[a.length - 1] - b[b.length - 1]; // Lower indices first
  });
  
  for (const path of sortedPaths) {
    if (path.length === 0) continue; // Can't duplicate root
    
    const condition = getConditionAtPath(result, path);
    if (!condition) continue;
    
    const duplicated = cloneCondition(condition);
    const parentPath = path.slice(0, -1);
    const insertIndex = path[path.length - 1] + 1;
    
    // Insert the duplicated condition
    result = insertConditionAtPath(result, parentPath, insertIndex, duplicated);
  }
  
  return result;
}

// Insert condition at specific path and index
export function insertConditionAtPath(
  rootCondition: GroupCondition,
  parentPath: number[],
  index: number,
  condition: Condition | GroupCondition
): GroupCondition {
  const cloned = cloneCondition(rootCondition) as GroupCondition;
  
  let current = cloned;
  for (const pathIndex of parentPath) {
    if ('groupLogic' in current && current.conditions && current.conditions[pathIndex]) {
      const nextCondition = current.conditions[pathIndex];
      if ('groupLogic' in nextCondition) {
        current = nextCondition as GroupCondition;
      } else {
        throw new Error('Invalid path: trying to navigate into non-group condition');
      }
    } else {
      throw new Error('Invalid path: condition not found');
    }
  }
  
  if ('groupLogic' in current && current.conditions) {
    current.conditions.splice(index, 0, condition);
  }
  
  return cloned;
}

// Move conditions from one path to another
export function moveConditionsToPath(
  rootCondition: GroupCondition,
  sourcePaths: number[][],
  targetPath: number[],
  position: 'before' | 'after' | 'inside'
): GroupCondition {
  // Get the conditions to move
  const conditionsToMove = sourcePaths.map(path => getConditionAtPath(rootCondition, path)).filter(Boolean) as (Condition | GroupCondition)[];
  
  // Remove the conditions from their current positions
  let result = removeConditionsAtPaths(rootCondition, sourcePaths);
  
  // Determine where to insert
  let insertPath: number[];
  let insertIndex: number;
  
  if (position === 'inside') {
    // Insert inside the target (must be a group)
    const targetCondition = getConditionAtPath(result, targetPath);
    if (!targetCondition || !('groupLogic' in targetCondition)) {
      throw new Error('Cannot insert inside non-group condition');
    }
    insertPath = targetPath;
    insertIndex = (targetCondition as GroupCondition).conditions.length;
  } else {
    // Insert before or after the target
    insertPath = targetPath.slice(0, -1);
    const targetIndex = targetPath[targetPath.length - 1];
    insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
  }
  
  // Insert all conditions
  for (let i = 0; i < conditionsToMove.length; i++) {
    result = insertConditionAtPath(result, insertPath, insertIndex + i, conditionsToMove[i]);
  }
  
  return result;
}

// Group selected conditions
export function groupConditionsAtPaths(
  rootCondition: GroupCondition,
  paths: number[][],
  groupLogic: 'AND' | 'OR' = 'AND'
): GroupCondition {
  if (paths.length < 2) {
    throw new Error('Need at least 2 conditions to group');
  }
  
  // Get the conditions to group
  const conditionsToGroup = paths.map(path => getConditionAtPath(rootCondition, path)).filter(Boolean) as (Condition | GroupCondition)[];
  
  // Find the parent path and insertion index (use the first path)
  const firstPath = paths[0];
  const parentPath = firstPath.slice(0, -1);
  const insertIndex = Math.min(...paths.map(path => path[path.length - 1]));
  
  // Create new group
  const newGroup = createDefaultGroupCondition();
  newGroup.groupLogic = groupLogic;
  newGroup.conditions = conditionsToGroup;
  
  // Remove original conditions and insert group
  let result = removeConditionsAtPaths(rootCondition, paths);
  result = insertConditionAtPath(result, parentPath, insertIndex, newGroup);
  
  return result;
}

// Ungroup selected group conditions
export function ungroupConditionsAtPaths(
  rootCondition: GroupCondition,
  paths: number[][]
): GroupCondition {
  let result = cloneCondition(rootCondition) as GroupCondition;
  
  // Sort paths to process deeper ones first
  const sortedPaths = [...paths].sort((a, b) => b.length - a.length);
  
  for (const path of sortedPaths) {
    const condition = getConditionAtPath(result, path);
    if (!condition || !('groupLogic' in condition)) continue;
    
    const groupCondition = condition as GroupCondition;
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1];
    
    // Remove the group
    result = removeConditionsAtPaths(result, [path]);
    
    // Insert all conditions from the group
    for (let i = 0; i < groupCondition.conditions.length; i++) {
      result = insertConditionAtPath(result, parentPath, index + i, groupCondition.conditions[i]);
    }
  }
  
  return result;
}

// Get all available groups (for "move to group" functionality)
export function getAllGroups(rootCondition: GroupCondition, currentPath: number[] = []): Array<{ path: number[]; label: string }> {
  const groups: Array<{ path: number[]; label: string }> = [];
  
  if (currentPath.length > 0) { // Don't include root
    groups.push({
      path: currentPath,
      label: `${rootCondition.groupLogic} Group (${rootCondition.conditions.length} items)`
    });
  }
  
  rootCondition.conditions.forEach((condition, index) => {
    if ('groupLogic' in condition) {
      const childPath = [...currentPath, index];
      groups.push(...getAllGroups(condition as GroupCondition, childPath));
    }
  });
  
  return groups;
}

// Get all condition paths recursively
export function getAllConditionPaths(rootCondition: GroupCondition, currentPath: number[] = []): number[][] {
  const paths: number[][] = [];
  
  rootCondition.conditions.forEach((condition, index) => {
    const conditionPath = [...currentPath, index];
    paths.push(conditionPath);
    
    if ('groupLogic' in condition) {
      paths.push(...getAllConditionPaths(condition as GroupCondition, conditionPath));
    }
  });
  
  return paths;
}