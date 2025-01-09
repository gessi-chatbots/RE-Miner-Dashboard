import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import TreeService from "../../services/TreeService";
import Draggable from "react-draggable";
import { Container, Button, Row, Col, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";

const TreeAnalyzer = () => {
    const navigate = useNavigate();

    const [apps, setApps] = useState<string[]>([]);
    const [clusters, setClusters] = useState<string[]>([]);
    const [selectedApp, setSelectedApp] = useState<string>("");
    const [selectedCluster, setSelectedCluster] = useState<string>("");
    const [originalTreeData, setOriginalTreeData] = useState<any>(null);
    const [treeData, setTreeData] = useState<any>(null);
    const [siblingThreshold, setSiblingThreshold] = useState<number>(0.1);
    const [loading, setLoading] = useState<boolean>(false);
    const [metadataWindows, setMetadataWindows] = useState<any[]>([]);
    const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set());
    const [activateTuning, setActivateTuning] = useState<boolean>(false);

    const treeService = new TreeService();

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const appData = await treeService.fetchAllApps();
                setApps(appData.map((app) => app.app_name));
            } catch (error) {
                console.error("Error fetching apps:", error);
            }
        };

        fetchApps();
    }, []);

    useEffect(() => {
        if (!selectedApp) return;

        const fetchClusters = async () => {
            try {
                setClusters([]);
                setSelectedCluster("");
                const clusterData = await treeService.fetchClustersForApp(selectedApp);
                setClusters(clusterData.map((cluster) => cluster.cluster_name));
                setTreeData(null);
                setOriginalTreeData(null);
            } catch (error) {
                console.error(`Error fetching clusters for app '${selectedApp}':`, error);
            }
        };

        fetchClusters();
    }, [selectedApp]);

    useEffect(() => {
        if (!selectedApp || !selectedCluster) return;

        const fetchHierarchy = async () => {
            try {
                setLoading(true);
                const clusterData = await treeService.fetchClusterHierarchy(
                    selectedApp,
                    selectedCluster,
                    siblingThreshold
                );

                if (clusterData && clusterData.children) {
                    setOriginalTreeData(clusterData);
                    setTreeData(transformToTreeFormat(clusterData));
                } else {
                    console.error("No valid hierarchy data found.");
                }
            } catch (error) {
                console.error("Error fetching tree data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHierarchy();
    }, [selectedApp, selectedCluster, siblingThreshold]);

    const transformToTreeFormat = (node: any): any => {
        const children = node.children
            ? node.children.map((child: any) => transformToTreeFormat(child))
            : [];

        return {
            name: node.label || `Node ${node.id}`,
            children: children.length > 0 ? children : undefined,
            attributes: {
                distance: node.distance || 0,
                id: node.id,
            },
            rawData: node,
        };
    };

    const handleNodeClick = (nodeData: any) => {
        const nodeId = nodeData.attributes.id;

        const windowExists = metadataWindows.some((window) => window.id === nodeId);
        if (windowExists) return; // If the window already exists, do nothing

        const newMetadata = {
            id: nodeId,
            name: nodeData.name,
            distance: nodeData.attributes.distance,
            childrenIds: nodeData.rawData.children?.map((child: any) => child.id) || [],
        };

        setHighlightedNodes((prev) => new Set(prev).add(nodeId));
        setMetadataWindows((prevWindows) => [...prevWindows, newMetadata]);
    };
    const handleSelectAllChildren = (childrenIds: number[], hierarchyData: any) => {
        const collectAllDescendants = (nodeId: number): number[] => {
            const node = findNodeById(nodeId, hierarchyData);
            if (!node || !node.children) return [];
            return node.children
                .map((child: any) => [child.id, ...collectAllDescendants(child.id)])
                .flat();
        };

        const allDescendants = childrenIds
            .map((childId) => [childId, ...collectAllDescendants(childId)])
            .flat();

        setHighlightedNodes((prev) => {
            const newSet = new Set(prev);
            allDescendants.forEach((id) => newSet.add(id));
            return newSet;
        });
    };

    const handleUnselectAllChildren = (childrenIds: number[], hierarchyData: any) => {
        const collectAllDescendants = (nodeId: number): number[] => {
            const node = findNodeById(nodeId, hierarchyData);
            if (!node || !node.children) return [];
            return node.children
                .map((child: any) => [child.id, ...collectAllDescendants(child.id)])
                .flat();
        };

        const allDescendants = childrenIds
            .map((childId) => [childId, ...collectAllDescendants(childId)])
            .flat();

        setHighlightedNodes((prev) => {
            const newSet = new Set(prev);
            allDescendants.forEach((id) => newSet.delete(id));
            return newSet;
        });
    };

    const handleCloseMetadata = (id: number) => {
        setMetadataWindows((prevWindows) => prevWindows.filter((window) => window.id !== id));
        setHighlightedNodes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    };

    const handleDownloadJSON = () => {
        const collectSubtree = (nodeId: number, hierarchyData: any): any => {
            const node = findNodeById(nodeId, hierarchyData);
            if (!node) return null;

            return {
                id: node.id,
                label: node.label || `Node ${node.id}`,
                distance: node.distance,
                children: node.children?.map((child: any) => collectSubtree(child.id, hierarchyData)) || [],
            };
        };

        const isTopLevelNode = (nodeId: number): boolean => {
            const node = findNodeById(nodeId, originalTreeData);
            if (!node || !node.parent) return true; // Root node is top-level if it has no parent.
            return !highlightedNodes.has(node.parent.id); // A node is top-level if its parent is not selected.
        };

        // Find the uppermost selected nodes.
        const topLevelNodes = Array.from(highlightedNodes).filter(isTopLevelNode);

        // Collect the hierarchy for each top-level node.
        const hierarchies = topLevelNodes.map((nodeId) => collectSubtree(nodeId, originalTreeData));

        const json = JSON.stringify(hierarchies, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "top-level-hierarchy.json";
        link.click();
    };


    const handleViewReviews = () => {
        if (!selectedApp || !selectedCluster || highlightedNodes.size === 0) {
            return;
        }

        // Collect selected features, filtering out intermediate and root nodes
        const selectedFeatures = Array.from(highlightedNodes)
            .map((nodeId) => {
                const node = findNodeById(nodeId, originalTreeData);
                return node?.label; // Retrieve the node's label
            })
            .filter((label) => label && label !== "Intermediate Node" && label !== "Root Node"); // Exclude unwanted nodes

        if (selectedFeatures.length === 0) {
            toast.error("No valid features selected.");
            return;
        }

        navigate("/tree-reviews", {
            state: {
                appName: selectedApp,
                clusterName: selectedCluster,
                selectedFeatures,
            },
        });
    };



    const findNodeById = (id: number, hierarchyData: any): any => {
        if (!hierarchyData) return null;
        if (hierarchyData.id === id) return hierarchyData;
        if (!hierarchyData.children) return null;

        for (const child of hierarchyData.children) {
            const found = findNodeById(id, child);
            if (found) return found;
        }
        return null;
    };

    return (
        <Container fluid className="vh-100">
            <h1 className="text-secondary">Tree Analyzer</h1>
            <Row className="bg-light py-3">
                <Col md={4}>
                    <h5>Select App</h5>
                    <Form.Select
                        value={selectedApp}
                        onChange={(e) => setSelectedApp(e.target.value)}
                        aria-label="Select App"
                    >
                        <option value="">Select App</option>
                        {apps.map((app) => (
                            <option key={app} value={app}>
                                {app}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={4}>
                    <h5>Select Cluster</h5>
                    <Form.Select
                        value={selectedCluster}
                        onChange={(e) => setSelectedCluster(e.target.value)}
                        aria-label="Select Cluster"
                        disabled={!selectedApp}
                    >
                        <option value="">Select Cluster</option>
                        {clusters.map((cluster) => (
                            <option key={cluster} value={cluster}>
                                {cluster}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={2}>
                    <h5>Sibling Threshold</h5>
                    <Form.Label htmlFor="siblingThresholdSlider">
                        Sibling Threshold: {siblingThreshold.toFixed(2)}
                    </Form.Label>
                    <Form.Range
                        id="siblingThresholdSlider"
                        min="0"
                        max="2"
                        step="0.1"
                        value={siblingThreshold}
                        onChange={(e) => setSiblingThreshold(Number(e.target.value))}
                        style={{ width: "75%" }} // Adjusted slider width
                    />
                </Col>
                <Col md={2}>
                    {highlightedNodes.size > 0 && (
                        <>
                            <h5>Actions</h5>
                            <div className="d-flex flex-column">
                                {Array.from(highlightedNodes).some((nodeId) => {
                                    const node = findNodeById(nodeId, originalTreeData);
                                    return node && (!node.children || node.children.length === 0); // Ensure it's a leaf node
                                }) && (
                                    <Button
                                        className="btn-primary mb-2"
                                        onClick={handleViewReviews}
                                        aria-label="View Reviews"
                                    >
                                        <i className="mdi mdi-eye me-2"></i> View Reviews
                                    </Button>
                                )}
                                <Button
                                    className="btn-secondary"
                                    onClick={handleDownloadJSON}
                                    aria-label="Download JSON"
                                >
                                    <i className="mdi mdi-download me-2"></i> Download JSON
                                </Button>
                            </div>
                        </>
                    )}
                </Col>
            </Row>

            <Row className="flex-grow-1">
                <Col>
                    <div style={{ height: "calc(100vh - 150px)", overflowY: "auto", position: "relative" }}>
                        {loading && <div>Loading tree data...</div>}
                        {!treeData && !loading && (
                            <div
                                className="d-flex flex-column align-items-center justify-content-center"
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <i className="mdi mdi-emoticon-sad-outline text-secondary" style={{ fontSize: "5rem" }} />
                                <h4>No cluster selected</h4>
                            </div>
                        )}
                        {treeData && !loading && (
                            <Tree
                                data={treeData}
                                orientation="vertical"
                                translate={{ x: 400, y: 50 }}
                                collapsible
                                nodeSize={{ x: 200, y: 150 }}
                                renderCustomNodeElement={(rd3tProps) => (
                                    <CustomNode
                                        {...rd3tProps}
                                        onNodeClick={handleNodeClick}
                                        isSelected={highlightedNodes.has(
                                            rd3tProps?.nodeDatum?.attributes?.id as number
                                        )}
                                    />
                                )}
                            />
                        )}
                        {metadataWindows.map((window) => (
                            <Draggable key={window.id}>
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        width: "300px",
                                        background: "#fff",
                                        padding: "20px",
                                        border: "1px solid #ccc",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                        zIndex: 1000,
                                    }}
                                >
                                    <h4>{window.name} Metadata</h4>
                                    <p>
                                        <strong>ID:</strong> {window.id}
                                    </p>
                                    <p>
                                        <strong>Distance:</strong> {window.distance}
                                    </p>
                                    <Row className="d-flex justify-content-between mt-3">
                                        <Col>
                                            <Button
                                                className="btn-primary btn-sm"
                                                onClick={() =>
                                                    handleSelectAllChildren(window.childrenIds, originalTreeData)
                                                }
                                            >
                                                Select All
                                            </Button>
                                        </Col>
                                        <Col>
                                            <Button
                                                className="btn-warning btn-sm"
                                                onClick={() =>
                                                    handleUnselectAllChildren(window.childrenIds, originalTreeData)
                                                }
                                            >
                                                Unselect All
                                            </Button>
                                        </Col>
                                    </Row>
                                    <Row className="mt-3">
                                        <Col className="text-center">
                                            <Button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => {
                                                    handleUnselectAllChildren(window.childrenIds, originalTreeData);
                                                    handleCloseMetadata(window.id);
                                                }}
                                            >
                                                Close
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            </Draggable>
                        ))}
                    </div>
                </Col>
            </Row>

        </Container>
    );
};

const CustomNode = ({nodeDatum, onNodeClick, isSelected }: any) => {
    const isIntermediateOrRoot = !!nodeDatum.children;

    return (
        <g onClick={() => onNodeClick(nodeDatum)} style={{ cursor: "pointer" }}>
            <rect
                width="160"
                height="50"
                x="-80"
                y="-25"
                fill={isIntermediateOrRoot ? "#6c757d" : isSelected ? "#4A90E2" : "#fff"}
                stroke="#333"
                rx="10"
                ry="10"
            />
            <text
                x="0"
                y="0"
                textAnchor="middle"
                alignmentBaseline="middle"
                style={{ fontSize: "14px", fill: "#fff", fontWeight: isIntermediateOrRoot ? "bold" : "normal" }}
            >
                {!isIntermediateOrRoot ? nodeDatum.name : ""}
            </text>
        </g>
    );
};

export default TreeAnalyzer;
