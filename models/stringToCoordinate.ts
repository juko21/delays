export default function strToCoords(coordString) {
    const coordStrTrunc = coordString.slice(7, -1);
    const coords = coordStrTrunc.split(' ');

    return {latitude: parseFloat(coords[1]), longitude: parseFloat(coords[0])};
};