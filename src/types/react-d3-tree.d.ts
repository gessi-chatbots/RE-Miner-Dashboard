// src/types/react-d3-tree.d.ts
declare module 'react-d3-tree' {
    import { FC } from 'react';

    interface TreeNode {
        name: string;
        attributes?: { [key: string]: string | number };
        children?: TreeNode[];
    }

    interface TreeProps {
        data: TreeNode | TreeNode[]; // Supports single root or multiple roots
        orientation?: 'horizontal' | 'vertical';
        translate?: { x: number; y: number };
        pathFunc?: 'diagonal' | 'elbow' | 'straight' | 'step';
        collapsible?: boolean;
        nodeSize?: { x: number; y: number };
        separation?: { siblings: number; nonSiblings: number };
        styles?: object;
        renderCustomNodeElement?: (rd3tProps: {
            nodeDatum: TreeNode;
            toggleNode: () => void;
        }) => JSX.Element;
        zoomable?: boolean;
        scaleExtent?: { min: number; max: number };
        zoom?: number;
        onNodeClick?: (nodeDatum: TreeNode) => void;
        onNodeMouseOver?: (nodeDatum: TreeNode) => void;
        onNodeMouseOut?: (nodeDatum: TreeNode) => void;
    }

    const Tree: FC<TreeProps>;

    export default Tree;
}
