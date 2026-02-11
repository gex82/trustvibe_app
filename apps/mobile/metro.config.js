const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = Array.from(new Set([...(config.watchFolders || []), workspaceRoot]));

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Allow transitive package internal resolution (e.g., firebase nested deps).
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
