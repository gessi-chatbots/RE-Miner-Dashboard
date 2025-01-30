import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import TreeService from "../../services/TreeService";
import Draggable from "react-draggable";
import { Container, Button, Row, Col, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import AppService from "../../services/AppService";

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
    const [translate, setTranslate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const treeContainerRef = React.createRef<HTMLDivElement>();

    const treeService = new TreeService();

    useEffect(() => {
        const fetchApps = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllAppsPackages();
                if (response) {
                    setApps(response.apps.map((app) => app.app_package));
                } else {
                    console.warn("No apps found");
                    setApps([]);
                }
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
    useEffect(() => {
        if (treeData && treeContainerRef.current) {
            const container = treeContainerRef.current;
            const { width, height } = container.getBoundingClientRect();

            setTranslate({
                x: width / 2,
                y: height / 4,
            });
        }
    }, [treeData]);

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
    useEffect(() => {
        if (treeData && treeContainerRef.current) {
            const container = treeContainerRef.current;

            // Center the tree view and scroll it into view
            const { width, height } = container.getBoundingClientRect();
            setTranslate({
                x: width / 2,
                y: height / 4,
            });

            // Smooth scroll to the tree container
            container.scrollIntoView({ behavior: "smooth" });
        }
    }, [treeData]);
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
            if (!node || !node.parent) return true;
            return !highlightedNodes.has(node.parent.id);
        };

        const topLevelNodes = Array.from(highlightedNodes).filter(isTopLevelNode);

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

        const selectedFeatures = Array.from(highlightedNodes)
            .map((nodeId) => {
                const node = findNodeById(nodeId, originalTreeData);
                return node?.label;
            })
            .filter((label) => label && !["Intermediate Node", "Root Node"].includes(label));

        if (selectedFeatures.length === 0) {
            toast.error("No valid features selected.");
            return;
        }

        navigate("/reviews", {
            state: {
                appPackage: selectedApp,
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
        <Container>
            <h1 className="text-secondary mb-4">Tree Analyzer</h1>

            {/* Controls Section */}
            <Row className="bg-white p-4 rounded shadow-sm mb-4">
                <Col md={4} className="mb-3 mb-md-0">
                    <h5 className="mb-3">Select App</h5>
                    <Form.Select
                        value={selectedApp}
                        onChange={(e) => setSelectedApp(e.target.value)}
                        aria-label="Select App"
                    >
                        <option value="">Select App</option>
                        {apps.map((app) => {
                            return (
                                <option key={app} value={app}>
                                    {app}
                                </option>
                            );
                        })}
                    </Form.Select>
                </Col>

                <Col md={4} className="mb-3 mb-md-0">
                    <h5 className="mb-3">Select Feature Family</h5>
                    <Form.Select
                        value={selectedCluster}
                        onChange={(e) => setSelectedCluster(e.target.value)}
                        aria-label="Select Feature Family"
                        disabled={!selectedApp}
                    >
                        <option value="">Feature Family</option>
                        {clusters.map((cluster) => {
                            const featureName = cluster.split("_").slice(2).join(" ").replace(/_/g, " ");
                            return (
                                <option key={cluster} value={cluster}>
                                    {featureName}
                                </option>
                            );
                        })}
                    </Form.Select>
                </Col>

                <Col md={4} className="d-flex flex-column align-items-center justify-content-center">
                    <h5 className="text-center mb-3">Sibling Threshold</h5>
                    <Form.Label htmlFor="siblingThresholdSlider" className="text-center">
                        Sibling Threshold: {siblingThreshold.toFixed(2)}
                    </Form.Label>
                    <div style={{ width: "80%" }}>
                        <Form.Range
                            id="siblingThresholdSlider"
                            min="0"
                            max="2"
                            step="0.1"
                            value={siblingThreshold}
                            onChange={(e) => setSiblingThreshold(Number(e.target.value))}
                        />
                    </div>
                </Col>
                {/* Actions Section */}
                {highlightedNodes.size > 0 && (

                    <Col>
                            <h5>Actions</h5>
                            <div className="d-flex flex-column align-items-start">
                                {Array.from(highlightedNodes).some((nodeId) => {
                                    const node = findNodeById(nodeId, originalTreeData);
                                    return node && (!node.children || node.children.length === 0);
                                }) && (
                                    <Button
                                        className="btn-primary btn-sm mb-2 w-auto d-inline-flex align-items-center"
                                        onClick={handleViewReviews}
                                        aria-label="View Reviews"
                                    >
                                        <i className="mdi mdi-eye me-2"></i> View Reviews
                                    </Button>
                                )}
                                <Button
                                    className="btn-secondary btn-sm w-auto d-inline-flex align-items-center"
                                    onClick={handleDownloadJSON}
                                    aria-label="Download JSON"
                                >
                                    <i className="mdi mdi-download me-2"></i> Download JSON
                                </Button>
                            </div>
                    </Col>
                )}
            </Row>




            {/* Tree Visualization Section */}
            <Row className="flex-grow-1 bg-white rounded shadow-sm p-4">
                <Col>
                    <div ref={treeContainerRef} style={{ height: "calc(100vh - 200px)", overflowY: "auto", position: "relative" }}>
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
                                translate={translate}
                                collapsible
                                nodeSize={{ x: 200, y: 80 }}
                                separation={{ siblings: 0.6, nonSiblings: 0.7 }}
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
                                        background: "#fff",
                                        padding: "20px",
                                        border: "1px solid #ccc",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                        zIndex: 1000,
                                    }}
                                >
                                    <h4>{window.name} </h4>
                                    <Row className="d-flex justify-content-between mt-3">
                                        <Col>
                                            <Button
                                                className="btn-primary btn-sm"
                                                onClick={() =>
                                                    handleSelectAllChildren(window.childrenIds, originalTreeData)
                                                }
                                            >
                                                Select all children
                                            </Button>
                                        </Col>
                                        <Col>
                                            <Button
                                                className="btn-warning btn-sm"
                                                onClick={() =>
                                                    handleUnselectAllChildren(window.childrenIds, originalTreeData)
                                                }
                                            >
                                                Unselect all children
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

const CustomNode = ({ nodeDatum, onNodeClick, isSelected }: any) => {
    const isIntermediateOrRoot = !!nodeDatum.children;

    const wrapText = (text: string, maxChars: number) => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        words.forEach((word) => {
            if ((currentLine + word).length > maxChars) {
                lines.push(currentLine.trim());
                currentLine = word + " ";
            } else {
                currentLine += word + " ";
            }
        });
        if (currentLine) {
            lines.push(currentLine.trim());
        }
        return lines;
    };

    const wrappedText = isIntermediateOrRoot ? [] : wrapText(nodeDatum.name || "", 15);  // Reduce maxChars for shorter text wrapping

    return (
        <g onClick={() => onNodeClick(nodeDatum)} style={{ cursor: "pointer" }}>
            {isIntermediateOrRoot ? (
                <circle cx="0" cy="0" r="8" fill="#d6d6d6" stroke="#333" />
            ) : (
                <rect
                    width="120"  // Reduced width
                    height="40"  // Reduced height
                    x="-60"
                    y="-20"
                    fill={isSelected ? "#4A90E2" : "#fff"}
                    stroke="#333"
                    rx="8"
                    ry="8"
                />
            )}
            {!isIntermediateOrRoot && (
                <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    style={{
                        fontSize: "12px",  // Smaller font size
                        fill: isSelected ? "#fff" : "#000",
                        stroke: "none",
                        fontWeight: "500",
                    }}
                >
                    {wrappedText.map((line, index) => (
                        <tspan key={index} x="0" dy={`${index === 0 ? 0 : 1.1}em`}>
                            {line}
                        </tspan>
                    ))}
                </text>
            )}
        </g>
    );
};

export default TreeAnalyzer;
