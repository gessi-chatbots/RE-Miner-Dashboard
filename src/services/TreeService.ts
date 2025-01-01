import { AppDataSimpleDTO } from "../DTOs/AppDataSimpleDTO";
import { ClusterDataDTO, HierarchyNode } from "../DTOs/ClusterDataDTO";

class TreeService {
    API_NAME = 'http://127.0.0.1:3001/api/v1';
    PATH_NAME = '/trees';

    // Fetch all app names with review sizes
    fetchAllApps = async (): Promise<AppDataSimpleDTO[]> => {
        try {
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}`);
            if (response.status === 204) {
                return []; // Return empty array if no data
            }
            const jsonResponse = await response.json();
            return jsonResponse.apps.map((app: string, index: number) => ({
                id: `app-${index}`, // Generate a unique ID (replace with actual ID if available in response)
                app_name: app,
                review_size: 0 // Default value; update if the backend provides this information
            }));
        } catch (error) {
            console.error('Error fetching apps:', error);
            throw error;
        }
    };

    // Fetch all clusters for a specific app
    fetchClustersForApp = async (appName: string): Promise<ClusterDataDTO[]> => {
        try {
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/${appName}/clusters`);
            if (response.status === 204) {
                return []; // Return empty array if no data
            }
            const jsonResponse = await response.json();
            return jsonResponse.clusters.map((cluster: string) => ({
                cluster_name: cluster
            }));
        } catch (error) {
            console.error(`Error fetching clusters for app '${appName}':`, error);
            throw error;
        }
    };

    // Fetch the JSON hierarchy for a specific cluster in a specific app
    fetchClusterHierarchy = async (appName: string, clusterName: string): Promise<ClusterDataDTO | null> => {
        try {
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/${appName}/clusters/${clusterName}`);
            if (response.status === 204) {
                return null; // Return null if no hierarchy found
            }
            const jsonResponse = await response.json();
            const parsedHierarchy = this.parseHierarchy(jsonResponse);
            return {
                cluster_name: clusterName,
                hierarchy_data: parsedHierarchy
            };
        } catch (error) {
            console.error(`Error fetching JSON hierarchy for cluster '${clusterName}' in app '${appName}':`, error);
            throw error;
        }
    };

    private parseHierarchy = (node: any): HierarchyNode => {
        return {
            id: node.id,
            distance: node.distance,
            label: node.label,
            children: node.children?.map(this.parseHierarchy)
        };
    };
}

export default TreeService;
