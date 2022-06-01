export default function formatDates(suppliedAdDateStr, supppliedEstDateStr) {
    let adDate = new Date(suppliedAdDateStr);
    let adTimeStr = adDate.getHours() + ":" + String(adDate.getMinutes()).padStart(2, "0");
    let adDateStr = adDate.getFullYear() + "/" + adDate.getMonth() + "/" + adDate.getDate() + " " + adTimeStr;
    let estDate = new Date(supppliedEstDateStr);
    let estTimeStr = estDate.getHours() + ":" + String(estDate.getMinutes()).padStart(2, "0");
    let estDateStr = estDate.getFullYear() + "/" + estDate.getMonth() + "/" + estDate.getDate() + " " + estTimeStr;
    let delayMin = (estDate - adDate) / 60000;
    let timeDiff = (estDate - (new Date()));
    timeDiff = timeDiff !== 0 ? timeDiff / 60000 : 0;
    let travelDistance = ((timeDiff - 15) * 100) / 2;
    travelDistance = travelDistance > 0 ? travelDistance : 0; 

    return {
        adDateStr: adDateStr,
        adTimeStr: adTimeStr,
        estDateStr: estDateStr,
        estTimeStr: estTimeStr,
        delayMin: Math.round(delayMin),
        timeDiff: Math.round(timeDiff),
        travelDistance: Math.round(travelDistance)
    };
};