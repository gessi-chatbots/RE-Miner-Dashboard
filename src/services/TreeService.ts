class TreeService {
    API_NAME = 'http://127.0.0.1:3001/api/v1';
    PATH_NAME = '/trees';

    fetchAllApps = async (): Promise<any[]> => {
        const response = await fetch(`${this.API_NAME}${this.PATH_NAME}`);
        const jsonResponse = await response.json();
        return jsonResponse.apps.map((app: string) => ({ app_name: app }));
    };

    fetchClustersForApp = async (appName: string): Promise<any[]> => {
        const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/${appName}/clusters`);
        const jsonResponse = await response.json();
        return jsonResponse.clusters.map((cluster: string) => ({ cluster_name: cluster }));
    };

    fetchClusterHierarchy = async (
        appName: string,
        clusterName: string,
        siblingThreshold: number
    ): Promise<any> => {
        const response = await fetch(
            `${this.API_NAME}${this.PATH_NAME}/${appName}/clusters/${clusterName}?distance_threshold=${siblingThreshold}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.json();
    };

}

export default TreeService;
