import _ from 'lodash';

import { FileItem, Item, SkillDetail, SkillTreeNode } from '../types';

export function getSkillNodeKey(skillId: number) {
  return `skill:${skillId}`;
}

export function getSkillDocNodeKey(skillId: number) {
  return `skill:${skillId}:doc`;
}

export function getSkillDirectoryNodeKey(skillId: number, path: string) {
  return `skill:${skillId}:dir:${path}`;
}

export function getSkillFileNodeKey(skillId: number, fileId: number) {
  return `skill:${skillId}:file:${fileId}`;
}

export function isSkillScopedKey(key: string, skillId: number) {
  return key === getSkillNodeKey(skillId) || key.startsWith(`skill:${skillId}:`);
}

export function isMarkdownFile(fileName: string) {
  return _.endsWith(_.toLower(fileName), '.md');
}

function appendResourceTree(skillId: number, files: FileItem[]) {
  const tree: SkillTreeNode[] = [];

  _.forEach(files, (file) => {
    const parts = _.filter(_.split(file.name, '/'));

    if (_.isEmpty(parts)) {
      return;
    }

    let currentLevel = tree;

    _.forEach(parts, (part, index) => {
      const currentPath = _.join(_.slice(parts, 0, index + 1), '/');
      const isLeafNode = index === parts.length - 1;

      if (isLeafNode) {
        currentLevel.push({
          key: getSkillFileNodeKey(skillId, file.id),
          title: part,
          nodeType: 'resource-file',
          skillId,
          selectable: true,
          isLeaf: true,
          path: currentPath,
          file,
        });
        return;
      }

      let directoryNode = _.find(currentLevel, (node) => node.nodeType === 'directory' && node.path === currentPath);
      if (!directoryNode) {
        directoryNode = {
          key: getSkillDirectoryNodeKey(skillId, currentPath),
          title: part,
          nodeType: 'directory',
          skillId,
          selectable: false,
          path: currentPath,
          children: [],
        };
        currentLevel.push(directoryNode);
      }

      if (!directoryNode.children) {
        directoryNode.children = [];
      }
      currentLevel = directoryNode.children;
    });
  });

  return tree;
}

function fillNodeMap(nodes: SkillTreeNode[], nodeMap: Record<string, SkillTreeNode>) {
  _.forEach(nodes, (node) => {
    nodeMap[node.key] = node;
    if (node.children) {
      fillNodeMap(node.children, nodeMap);
    }
  });
}

export function buildSkillTree(skills: Item[], detailMap: Record<number, SkillDetail | undefined>) {
  const nodeMap: Record<string, SkillTreeNode> = {};

  const treeData = _.map(skills, (skill) => {
    const resourceNodes = detailMap[skill.id] ? appendResourceTree(skill.id, detailMap[skill.id]?.files || []) : [];
    const node: SkillTreeNode = {
      key: getSkillNodeKey(skill.id),
      title: skill.name,
      nodeType: 'skill',
      skillId: skill.id,
      selectable: true,
      enabled: skill.enabled,
      builtin: skill.builtin,
      children: [
        {
          key: getSkillDocNodeKey(skill.id),
          title: 'SKILL.md',
          nodeType: 'skill-doc',
          skillId: skill.id,
          selectable: true,
          isLeaf: true,
        },
        ...resourceNodes,
      ],
    };
    nodeMap[node.key] = node;
    fillNodeMap(node.children || [], nodeMap);
    return node;
  });

  return {
    treeData,
    nodeMap,
  };
}
