<script>
import { onMount } from 'svelte';
import { watches, tage } from '../tracmanager.js';

const ARR_STR = String.fromCharCode(0x2190) + ' ' + String.fromCharCode(0x2190);

let tracs = new Array(3); // [0]: Adj, [1]: Prev, [2]: Now
let infos;
infos = new Array(3);
buildTableInfos(); // fill the infos with ''

onMount(() => {
    watches.subscribe(() => { retrievePrevAdjNow(); });
    tage.subscribe((v) => { if (v == 'SYNC') retrievePrevAdjNow(); });
});

/**
 * finds and assigns the correct tracs to the tracs array. What this generates
 * is used by buildTableInfos to fill the infos array (table).
 */
function retrievePrevAdjNow() {
    let ts = $watches[0].tracs;
    tracs.fill(undefined);
    let numSinceAdj = 0;
    for (let i = ts.length - 1; i >= 0; i--) {
        numSinceAdj++;
        if (ts[i].wasWatchAdj) break;
    }
    if ($tage == 'RESULTS') {
        if (numSinceAdj == 1) {
            tracs[2] = ts[ts.length - numSinceAdj];
        } else if (numSinceAdj == 2) {
            tracs[1] = ts[ts.length - 2];
            tracs[2] = ts[ts.length - 1];
        } else {
            tracs[0] = ts[ts.length - numSinceAdj];
            tracs[1] = ts[ts.length - 2];
            tracs[2] = ts[ts.length - 1];
        }
    } else {
        if (numSinceAdj == 1) {
            tracs[1] = ts[ts.length - 1];
        } else {
            tracs[0] = ts[ts.length - numSinceAdj];
            tracs[1] = ts[ts.length - 1];
        }
    }
    buildTableInfos();
}

/**
 * Fills the infos array (table). Call this anytime the tracs array is modified.
 */
function buildTableInfos() {
    // iterates through the tracs array (oldest, prev, now) and fills the infos
    // (i.e. the column of relevant data) for each trac.
    for (let i = 0; i < 3; i++) {
        let trac = tracs[i];
        let info = new Array(6).fill('');
        if (trac) {
            info[0] = trac.sysDate.toLocaleDateString(undefined, {month: '2-digit', day: '2-digit', year: '2-digit'});
            info[1] = trac.sysDate.toLocaleTimeString(undefined, {hour12: false});
            info[2] = trac.watchDate.toLocaleTimeString(undefined, {hour12: false});
            info[3] = trac.secondsOff;
            if (tracs[1]) // if there are Prev results
                info[4] =
                    (i == 0) ? tracs[1].spdOffSinceLastAdj : // currently building Adj
                    (i == 1 && tracs[0]) ? ARR_STR : '';// currently building Prev show arrows only if there are SPD results
            if (tracs[2]) // if there are Now results
                info[5] =
                    (i == 0) ? tracs[2].spdOffSinceLastAdj : // currently building Adj
                    (i == 1) ? tracs[2].spdOffSincePrev : // currently building Prev
                    (tracs[0] || tracs[1]) ? ARR_STR : ''; // currently building Now show arrows only if there are SPD results
        }
        infos[i] = info;
    }
    infos = infos;
}
</script>

<table id="not-foot-table">
    <tr class='colhead'>
        <th></th>
        <th>Oldest</th>
        <th class='prevdata'>Prev</th>
        <th class='nowdata'>Now</th>
    </tr>
    <tr>
        <th class='rowhead'>Date</th>
        <td>{infos[0][0]}</td>
        <td class='prevdata'>{infos[1][0]}</td>
        <td class='nowdata'>{infos[2][0]}</td>
    </tr>
    <tr>
        <th class='rowhead'>System</th>
        <td >{infos[0][1]}</td>
        <td class='prevdata'>{infos[1][1]}</td>
        <td class='nowdata'>{infos[2][1]}</td>
    <tr>
        <th class='rowhead'>Watch</th>
        <td >{infos[0][2]}</td>
        <td class='prevdata'>{infos[1][2]}</td>
        <td class='nowdata'>{infos[2][2]}</td>
    </tr>
    <tr>
        <th class='rowhead'>Diff</th>
        <td>{infos[0][3]}</td>
        <td class='prevdata'>{infos[1][3]}</td>
        <td class='nowdata'>{infos[2][3]}</td>
    </tr>
    <tr>
        <th class='rowhead prevdata'>SPD</th>
        <td class='prevdata emphasis'>{infos[0][4]}</td>
        <td class='prevdata'>{infos[1][4]}</td>
        <td class='nowdata'></td>
    </tr>
    <tr>
        <th class='rowhead nowdata'>SPD</th>
        <td class='nowdata emphasis'>{infos[0][5]}</td>
        <td class='nowdata emphasis'>{infos[1][5]}</td>
        <td class='nowdata'>{infos[2][5]}</td>
    </tr>
</table>

<style>
table {
    border-collapse: collapse;
}
th, td {
    vertical-align: bottom;
    padding-left: 6px;
    padding-right: 6px;
}
td {
    font-family: 'Courier New', Courier, monospace;
    text-align: right;
    width: 8ch;
    height: 1ch;
}
.rowhead {
    text-align: left;
}
.prevdata {
    background-color: #EEE;
}
.nowdata {
    background-color: #CCC;
}
.emphasis {
    font-weight: bold;
}
</style>