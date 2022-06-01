
import config from "../config/config.json";

const trafficData = {
    getStations: async function getStations() {
        const response = await fetch(`https://trafik.emilfolino.se/stations`);
        const result = await response.json();

        return result.data;
    },
    getDelays: async function getDelays() {
        const response = await fetch(`${config.base_url}/delayed`);
        const result = await response.json();

        return result.data;
    },
};

export default trafficData;
