import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import TreeService from "../../services/TreeService";
import Draggable from "react-draggable"; // For draggable windows
import { Container, Button, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const TreeAnalyzer = () => {
    const [apps, setApps] = useState<string[]>([]);
    const [clusters, setClusters] = useState<string[]>([]);
    const [selectedApp, setSelectedApp] = useState<string>("");
    const [selectedCluster, setSelectedCluster] = useState<string>("");
    const [originalTreeData, setOriginalTreeData] = useState<any>(null);
    const [treeData, setTreeData] = useState<any>(null);
    const [maxDistance, setMaxDistance] = useState<number>(0);
    const [threshold, setThreshold] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [isThresholdTuningActive, setIsThresholdTuningActive] = useState<boolean>(false);
    const [metadataWindows, setMetadataWindows] = useState<any[]>([]);
    const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set());

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
                const clusterData = await treeService.fetchClusterHierarchy(selectedApp, selectedCluster);

                if (clusterData && clusterData.hierarchy_data) {
                    const maxDist = findMaxDistance(clusterData.hierarchy_data);
                    setMaxDistance(maxDist);
                    setThreshold(maxDist);
                    setOriginalTreeData(clusterData.hierarchy_data);
                    setTreeData(transformToTreeFormat(clusterData.hierarchy_data, maxDist));
                } else {
                    console.error("No hierarchy data found.");
                }
            } catch (error) {
                console.error("Error fetching tree data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHierarchy();
    }, [selectedApp, selectedCluster]);

    const findMaxDistance = (node: any): number => {
        if (!node.children || node.children.length === 0) return node.distance || 0;
        const childMax = Math.max(...node.children.map(findMaxDistance));
        return Math.max(node.distance || 0, childMax);
    };

    const transformToTreeFormat = (node: any, threshold: number): any => {
        const children = node.children
            ? node.children.map((child: any) => transformToTreeFormat(child, threshold))
            : [];

        return {
            name: node.label || `Node ${node.id}`,
            children: children.length > 0 ? children : undefined,
            attributes: {
                distance: node.distance,
                id: node.id,
            },
            rawData: node,
        };
    };

    const handleNodeClick = (nodeData: any) => {
        const nodeId = nodeData.attributes.id;
        const newMetadata = {
            id: nodeId,
            name: nodeData.name,
            distance: nodeData.attributes.distance,
            childrenIds: nodeData.rawData.children?.map((child: any) => child.id) || [],
        };

        setHighlightedNodes((prev) => new Set(prev).add(nodeId));
        setMetadataWindows((prevWindows) => [...prevWindows, newMetadata]);
    };

    const handleSelectAllChildren = (childrenIds: number[]) => {
        setHighlightedNodes((prev) => {
            const newSet = new Set(prev);
            childrenIds.forEach((childId) => newSet.add(childId));
            return newSet;
        });
    };

    const handleUnselectAllChildren = (childrenIds: number[]) => {
        setHighlightedNodes((prev) => {
            const newSet = new Set(prev);
            childrenIds.forEach((childId) => newSet.delete(childId));
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
        const data = Array.from(highlightedNodes);
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "selected-nodes.json";
        link.click();
    };

    const handleViewReviews = () => {
        alert("View Reviews clicked for selected nodes: " + Array.from(highlightedNodes).join(", "));
    };

    const handleThresholdToggle = () => {
        setIsThresholdTuningActive((prev) => !prev);
        if (!isThresholdTuningActive && originalTreeData) {
            setTreeData(transformToTreeFormat(originalTreeData, maxDistance));
        }
    };

    const handleThresholdChange = (newThreshold: number) => {
        setThreshold(newThreshold);
        if (originalTreeData) {
            setTreeData(transformToTreeFormat(originalTreeData, newThreshold));
        }
    };

    return (
        <Container className="mt-2 vh-100">
            <h1 className="text-secondary">Tree Analyzer</h1>
            <div className="row flex-grow-1">
                <div className="col-md-3">
                    <div className="bg-light p-3">
                        <h3>Select App</h3>
                        <select
                            className="form-select mb-3"
                            value={selectedApp}
                            onChange={(e) => setSelectedApp(e.target.value)}
                        >
                            <option value="">--Select an App--</option>
                            {apps.map((app) => (
                                <option key={app} value={app}>
                                    {app}
                                </option>
                            ))}
                        </select>

                        {selectedApp && (
                            <>
                                <h3>Select Cluster</h3>
                                <select
                                    className="form-select mb-3"
                                    value={selectedCluster}
                                    onChange={(e) => setSelectedCluster(e.target.value)}
                                >
                                    <option value="">--Select a Cluster--</option>
                                    {clusters.map((cluster) => (
                                        <option key={cluster} value={cluster}>
                                            {cluster}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        {selectedApp && selectedCluster && (
                            <>
                                <h3>Sibling Threshold Tuning</h3>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={isThresholdTuningActive}
                                        onChange={handleThresholdToggle}
                                    />
                                    <label className="form-check-label">Enable Tuning</label>
                                </div>

                                {isThresholdTuningActive && (
                                    <>
                                        <label htmlFor="thresholdSlider" className="form-label">
                                            Threshold
                                        </label>
                                        <input
                                            id="thresholdSlider"
                                            type="range"
                                            className="form-range"
                                            min="0"
                                            max={maxDistance}
                                            step="0.1"
                                            value={threshold}
                                            onChange={(e) => handleThresholdChange(Number(e.target.value))}
                                        />
                                        <p>Threshold: {threshold.toFixed(2)}</p>
                                    </>
                                )}
                            </>
                        )}

                        {highlightedNodes.size > 0 && (
                            <>
                                <h3>Actions</h3>
                                <div className="d-flex flex-column">
                                    <Button
                                        className="btn-primary mb-2"
                                        onClick={handleViewReviews}
                                        aria-label="View Reviews"
                                    >
                                        <i className="mdi mdi-eye me-2"></i>
                                        View Reviews
                                    </Button>
                                    <Button
                                        className="btn-success"
                                        onClick={handleDownloadJSON}
                                        aria-label="Download JSON"
                                    >
                                        <i className="mdi mdi-download me-2"></i>
                                        Download JSON
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="col-md-9 p-3" style={{ height: "calc(100vh - 100px)", overflow: "auto" }}>
                    {loading && <div>Loading tree data...</div>}
                    {!treeData && !loading && (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100">
                            <i
                                className="mdi mdi-emoticon-sad text-secondary"
                                style={{ fontSize: "5rem" }}
                            />
                            <h2>No cluster to view selected</h2>
                        </div>
                    )}
                    {treeData && !loading && (
                        <Tree
                            data={treeData}
                            orientation="vertical"
                            translate={{ x: 400, y: 50 }}
                            pathFunc="step"
                            collapsible={true}
                            nodeSize={{ x: 200, y: 150 }}
                            renderCustomNodeElement={(rd3tProps) => (
                                <CustomNode
                                    {...rd3tProps}
                                    onNodeClick={handleNodeClick}
                                    isSelected={highlightedNodes.has(rd3tProps?.nodeDatum?.attributes?.id as number)}
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
                                    padding: "15px",
                                    background: "white",
                                    border: "1px solid #ccc",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                    zIndex: 1000,
                                }}
                            >
                                <h4 className="text-center mb-3">{window.name} Metadata</h4>
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
                                            onClick={() => handleSelectAllChildren(window.childrenIds)}
                                        >
                                            Select All
                                        </Button>
                                    </Col>
                                    <Col>
                                        <Button
                                            className="btn-warning btn-sm"
                                            onClick={() => handleUnselectAllChildren(window.childrenIds)}
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
                                                handleUnselectAllChildren(window.childrenIds);
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
            </div>
        </Container>
    );
};

const CustomNode = ({ nodeDatum, onNodeClick, isSelected }: any) => (
    <g onClick={() => onNodeClick(nodeDatum)} style={{ cursor: "pointer" }}>
        <rect
            width="150"
            height="50"
            x="-75"
            y="-25"
            fill={isSelected ? "skyblue" : "white"}
            stroke="#999"
        />
        <text x="0" y="0" textAnchor="middle" alignmentBaseline="middle" style={{ fontSize: "12px" }}>
            {nodeDatum.name}
        </text>
    </g>
);

export default TreeAnalyzer;
