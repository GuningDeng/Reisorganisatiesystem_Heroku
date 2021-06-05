/**
 * De hoeveelheid gegevens die uit API wordt gelezen, is afhankelijk van front-end behoeften en zoekstrategieën. 
 * De methode hier is geschikt voor het weergeven en opvragen van honderden events. 
 * Meer dan een paar duizend en honderdduizend moeten verschillende methoden toepassen.
 * Paginering of Lazy-loading kan worden gebruikt om data op de front-end weer te geven om de belasting op de front-end te verminderen.
 */

/**
 * es6 Destructuring
 * optional chaining operator: ?.  ??  &&   ||
 */

const fetch = require('node-fetch');

const loadEvents = async () => {
    let page = 0; // page 0. 20 evnts per pagina
    let apikey = 'rbfB6t2mFFBlixv9itKUnp2rHBfXxWpa';
    try {
        let response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?page=${page}&apikey=${apikey}`);
        let json = await response.json();
        const { _embedded: { events } } = await json;
        // een van de algoritmen
        const eventData = events.map((item) => ({
            name: item?.name || undefined,
            id: item?.id || undefined,
            images: item?.images?.filter(val => val.width === 1024).map(w => w.url) || undefined, // alleen width=1024 foto ophallen
            dates: item?.dates?.start?.localDate || undefined,
            datesLoc: item?.dates?.start?.localTime || undefined,
            promoter: item?.promoter || undefined,
            venuesCity: item?._embedded?.venues[0]?.city?.name || undefined,
            venuesCountry: item?._embedded?.venues[0]?.country?.name || undefined,
            venuesAddress: item?._embedded?.venues[0]?.address?.line1 || undefined,
            priceRanges1: item?.priceRanges?.[1] || undefined,
            priceRanges: item?.priceRanges?.[0] || undefined,
            attractions:item?._embedded?.attractions[0]?.['name'] || undefined
        }));        
        return eventData;
    } catch (error) {
        
    }
}

module.exports = loadEvents();


