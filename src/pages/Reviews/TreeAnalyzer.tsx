import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import TreeService from "../../services/TreeService";
import { ClusterDataDTO } from "../../DTOs/ClusterDataDTO";
import { AppDataSimpleDTO } from "../../DTOs/AppDataSimpleDTO";

const TreeAnalyzer = () => {
    const [apps, setApps] = useState<AppDataSimpleDTO[]>([]);
    const [clusters, setClusters] = useState<ClusterDataDTO[]>([]);
    const [selectedApp, setSelectedApp] = useState<string>("");
    const [selectedCluster, setSelectedCluster] = useState<string>("");
    const [treeData, setTreeData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const treeService = new TreeService();

    // Fetch all apps on component mount
    useEffect(() => {
        const fetchApps = async () => {
            try {
                const appData = await treeService.fetchAllApps();
                setApps(appData);
            } catch (error) {
                console.error("Error fetching apps:", error);
            }
        };

        fetchApps();
    }, []);

    // Fetch clusters when an app is selected
    useEffect(() => {
        if (!selectedApp) return;

        const fetchClusters = async () => {
            try {
                setClusters([]);
                setSelectedCluster("");
                const clusterData = await treeService.fetchClustersForApp(selectedApp);
                setClusters(clusterData);
            } catch (error) {
                console.error(`Error fetching clusters for app '${selectedApp}':`, error);
            }
        };

        fetchClusters();
    }, [selectedApp]);

    // Fetch and display the hierarchy when a cluster is selected
    useEffect(() => {
        if (!selectedApp || !selectedCluster) return;

        const fetchHierarchy = async () => {
            try {
                setLoading(true);
                const clusterData = await treeService.fetchClusterHierarchy(selectedApp, selectedCluster);

                if (clusterData && clusterData.hierarchy_data) {
                    const formattedData = transformToTreeFormat(clusterData.hierarchy_data);
                    setTreeData(formattedData);
                } else {
                    console.error("No hierarchy data found.");
                }
            } catch (error) {
                console.error(`Error fetching hierarchy for cluster '${selectedCluster}'`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchHierarchy();
    }, [selectedApp, selectedCluster]);

    // Transform hierarchy data for react-d3-tree
    const transformToTreeFormat = (node: any): any => {
        return {
            name: node.label || `Node ${node.id}`,
            children: node.children ? node.children.map(transformToTreeFormat) : undefined,
            attributes: node.distance ? { distance: node.distance } : undefined,
        };
    };

    return (
        <div>
            <h1 className="text-secondary mb-4">Tree Analyzer</h1>

            {/* App Selector */}
            <div style={{ marginBottom: "20px" }}>
                <label>
                    Select App:
                    <select
                        value={selectedApp}
                        onChange={(e) => setSelectedApp(e.target.value)}
                    >
                        <option value="">--Select an App--</option>
                        {apps.map((app) => (
                            <option key={app.id} value={app.app_name}>
                                {app.app_name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Cluster Selector */}
            {selectedApp && (
                <div style={{ marginBottom: "20px" }}>
                    <label>
                        Select Cluster:
                        <select
                            value={selectedCluster}
                            onChange={(e) => setSelectedCluster(e.target.value)}
                        >
                            <option value="">--Select a Cluster--</option>
                            {clusters.map((cluster) => (
                                <option key={cluster.cluster_name} value={cluster.cluster_name}>
                                    {cluster.cluster_name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            )}

            {/* Tree Visualization */}
            {loading && <div>Loading tree data...</div>}
            {treeData && !loading && (
                <div style={{ width: "100%", height: "500px" }}>
                    <Tree
                        data={treeData}
                        orientation="vertical"
                        translate={{ x: 400, y: 50 }}
                        pathFunc="step"
                        collapsible={true}
                        nodeSize={{ x: 200, y: 100 }}
                    />
                </div>
            )}
        </div>
    );
};

export default TreeAnalyzer;
