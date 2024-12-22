import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";

const TreeAnalyzer = () => {
    const [treeData, setTreeData] = useState<any>(null);
    const [clusterTitle, setClusterTitle] = useState<string>("");

    useEffect(() => {
        const fetchTreeData = async () => {
            try {
                // Fetch JSON data from the public data folder
                const response = await fetch("/data/Cluster_22_Messaging_hierarchy.json");
                const data = await response.json();

                // Extract cluster ID and cluster name
                const clusterId = `Cluster ID: ${data.id}`;
                const clusterName = extractClusterNameFromFileName("Cluster_22_Messaging_hierarchy.json");
                setClusterTitle(`${clusterId} - ${clusterName}`);

                // Format the JSON data for the tree visualization
                const formattedData = transformToTreeFormat(data);
                setTreeData(formattedData);
            } catch (error) {
                console.error("Error fetching tree data:", error);
            }
        };

        fetchTreeData();
    }, []);

    // Function to transform raw JSON data into a format suitable for react-d3-tree
    const transformToTreeFormat = (node: any): any => {
        const transformedNode: any = {
            name: node.label || `Node ${node.id}`,
            children: node.children ? node.children.map(transformToTreeFormat) : undefined,
        };
        if (node.distance) {
            transformedNode.attributes = { distance: node.distance };
        }
        return transformedNode;
    };

    // Extract cluster name from file name
    const extractClusterNameFromFileName = (fileName: string): string => {
        const match = fileName.match(/Cluster_\d+_(.+?)\.json/i);
        return match ? match[1].replace(/_/g, " ") : "Unknown Cluster";
    };

    if (!treeData) {
        return <div>Loading tree data...</div>;
    }

    return (
        <div style={{ width: "100%", height: "500px" }}>
            <h1 className="text-secondary mb-4">{clusterTitle}</h1>
            <Tree
                data={treeData}
                orientation="vertical"
                translate={{ x: 400, y: 50 }}
                pathFunc="step"
                collapsible={true}
                nodeSize={{ x: 200, y: 100 }}
            />
        </div>
    );
};

export default TreeAnalyzer;
