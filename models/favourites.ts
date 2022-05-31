
import config from "../config/config.json";
import storage from "./storage";
import auth from "./auth";
import Station from "../interfaces/station.ts";

const favourites = {
    getFavourites: async function getFavourites() {
        if(!auth.loggedIn()) {
            return -1;
        }
        const token = await storage.readToken();
        const response = await fetch(`${config.auth_url}/data?api_key=${config.api_key}`, {
            method: "GET",
            headers: {
                'content-type': 'application/json',
                'x-access-token': token.token
            },
        });
        const result = await response.json();
        const data = result.data.map((elem, index) => { return {artefact: JSON.parse(elem.artefact), id: elem.id, email: elem.email}});
        return data;
    },

    addFavourite: async function addFavourite(station) {
        //let favourites = this.getFavourites();
        //favourites.push(station);
        const token = await storage.readToken();
        var data = {
            artefact: JSON.stringify(station),
            api_key: config.api_key
        };
        data = JSON.stringify(data);
        const response = await fetch(`https://auth.emilfolino.se/data`, {
            method: 'POST',
            headers: {  
                'Accept': 'application/json',
                'content-type': 'application/json',
                'x-access-token': token.token
            },
            body: data,
        });
        const result = await response.json();
    },

    removeFavourite: async function removeFavourite(id) {
        const token = await storage.readToken();
        var data = {
            id: id,
            api_key: config.api_key
        };
        data = JSON.stringify(data);
        const response = await fetch(`https://auth.emilfolino.se/data`, {
            method: 'DELETE',
            headers: {  
                'Accept': 'application/json',
                'content-type': 'application/json',
                'x-access-token': token.token
            },
            body: data,
        });
    },
};

export default favourites;
