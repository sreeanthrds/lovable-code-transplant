#!/usr/bin/env node

// This script fixes all position.id references to use position.vpi instead
// Run with: node scripts/fix-position-ids.js

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/strategy/editors/action-node/exit-node/ExitOrderForm.tsx',
  'src/components/strategy/editors/modify-node/PositionSelector.tsx', 
  'src/components/strategy/nodes/ModifyNode.tsx',
  'src/components/strategy/nodes/action-node/ActionDetails.tsx',
  'src/components/strategy/vps/VisualPositionStore.tsx',
  'src/hooks/useModifyPositions.ts',
  'src/hooks/usePositionModification.ts',
  'src/hooks/useVpsStore.ts'
];

// Read and fix each file
filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace common patterns
    content = content.replace(/position\.id/g, 'position.vpi');
    content = content.replace(/pos\.id/g, 'pos.vpi');
    content = content.replace(/item\.id/g, 'item.vpi'); // For some variations
    content = content.replace(/\bid:/g, 'vpi:'); // For object literals
    content = content.replace(/id: string/g, 'vpi: string'); // For parameter types
    content = content.replace(/\(id: string\)/g, '(vpi: string)'); // For function parameters
    content = content.replace(/handleDeletePosition\(id\)/g, 'handleDeletePosition(vpi)');
    content = content.replace(/targetPositionId/g, 'targetPositionVpi');
    content = content.replace(/positionId/g, 'positionVpi');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
});

console.log('Position ID refactoring complete!');