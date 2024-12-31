export interface ClusterDataDTO {
    cluster_name: string;
    hierarchy_data?: HierarchyNode;
}

export interface HierarchyNode {
    id: number;
    distance?: number;
    label?: string;
    children?: HierarchyNode[];
}
