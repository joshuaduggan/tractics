import { writable, get } from 'svelte/store';

/**
 * localStorage data structure
 * 'NEXT_ID': number // raw
 * 'WATCHES': [{id: number // JSON
 *                  susName: String, // potentially malicious name from user, must be appropiately escaped before use
 *                  tracs: [Trac]}]
 * Trac = {
 *   wasWatchAdj: boolean,
 *   sysDate: Date,
 *   watchDate: Date,
 *   // Following are never read, are created to display results and only written to file to assist debugging
 *   secondsOff: number,
 *   secondsOffLastAdj: number,
 *   hoursSinceLastAdj: number,
 *   spdOffSinceLastAdj: number}
 */

/**
 * Management of the persistent data is done here.
 * General note; the first element in the array is considered the active watch and all changes are
 * made to it, the intended watch does not have to be specified.
 */

// !!! For whatever reason JSON isn't recreating the Dates, is instead only
// recreating them as strings. So I'm rebuilding the dates manually here !!!
let tempRawWatches = JSON.parse(localStorage.getItem('WATCHES')) || [];
tempRawWatches.forEach((w) => {
    w.tracs.forEach((t) => {
        t.sysDate = new Date(t.sysDate);
        t.watchDate = new Date(t.watchDate);
    });
});
export const watches = writable(tempRawWatches);
tempRawWatches = undefined;

let nextId = localStorage.getItem('NEXT_ID') || 1;
// subscribe to write to localstorage whenever watches is changed at all.
watches.subscribe((v) => {
    localStorage.setItem('WATCHES', JSON.stringify(v));
});
if (get(watches).length < 1) {
    watches.set([]);
    addWatch('Unamed Watch');
}

// store which will update whenever the watches first element id changes - whereas watches will
// update whenever anything changes in it's data structure.
export const activeId = writable(-1);
watches.subscribe((v) => { if (get(activeId) != v[0].id) activeId.set(v[0].id); });

/**
 * Adds a watch to the begining of the array
 * @param {String} susName The potentially malicious name for the new watch
 */
export function addWatch(susName) {
    watches.update(ws => {
        ws.unshift({id: nextId, susName: susName, tracs: []});
        return ws;
    });
    localStorage.setItem('NEXT_ID', ++nextId);
}

/**
 * Deletes the first watch in the array
 */
export function deleteWatch() {
    watches.update(ws => { ws.shift(); return ws; });
}

/**
 * Moves a watch to the front of the array
 * @param {number} id The watch to move
 */
export function moveWatch(id) {
    watches.update(ws => {
        let i = ws.findIndex(w => w.id == id);
        let w = ws[i];
        ws.splice(i, 1); // remove watch from old position
        ws.unshift(w); // insert watch into start of watches array
        return ws;
    });
}

export function addTrac(trac) {
    watches.update(ws => {
        ws[0].tracs[ws[0].tracs.length] = trac;
        return ws;
    });
}

//TESTING START
/**export let testData =
[{"id":1,"susName":"Test Data Watch",
    "tracs":[
        {"sysDate":  "2022-05-04T20:04:43.016Z",
         "watchDate":"2022-05-04T20:04:43.016Z","wasWatchAdj":false},
        {"sysDate":  "2022-05-05T20:04:43.016Z",
         "watchDate":"2022-05-05T20:04:43.016Z","wasWatchAdj":false},
        {"sysDate":  "2022-05-06T20:04:43.016Z",
         "watchDate":"2022-05-06T20:04:43.016Z","wasWatchAdj":false},
        {"sysDate":  "2022-05-07T20:04:43.016Z",
         "watchDate":"2022-05-07T20:04:40.016Z","wasWatchAdj":true},
        {"sysDate":  "2022-05-08T17:09:34.586Z",
         "watchDate":"2022-05-08T17:09:38.586Z","wasWatchAdj":false},
        {"sysDate":  "2022-05-08T18:09:34.586Z",
         "watchDate":"2022-05-08T18:09:38.586Z","wasWatchAdj":false},
        {"sysDate":  "2022-05-08T19:09:34.586Z",
         "watchDate":"2022-05-08T19:09:38.586Z","wasWatchAdj":false},
        {"sysDate":  "2022-05-08T20:09:34.586Z",
         "watchDate":"2022-05-08T20:09:29.886Z"}]}];
testData.forEach((w) => {
    w.tracs.forEach((t) => {
        t.sysDate = new Date(t.sysDate);
        t.watchDate = new Date(t.watchDate);
    });
});*/
//TESTING END