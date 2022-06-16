<script>
import { onMount } from 'svelte';

import { watches, tage } from '../tracmanager.js';

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
    for (let i = 0; i < 3; i++) {
        let trac = tracs[i];
        let info = new Array(5).fill('');
        if (trac) {
            info[0] = trac.sysDate.toLocaleDateString(undefined, {month: '2-digit', day: '2-digit', year: '2-digit'});
            info[1] = trac.sysDate.toLocaleTimeString(undefined, {hour12: false});
            info[2] = trac.watchDate.toLocaleTimeString(undefined, {hour12: false});
            info[3] = trac.secondsOff;
            if (tracs[2]) // if there are Now results
                info[4] =
                    (i == 0) ? tracs[2].spdOffSinceLastAdj : // currently building Adj
                    (i == 1) ? tracs[2].spdOffSincePrev : ''; // currently building Prev
//                    (i == 1) ? tracs[2].spdOffSincePrev : // currently building Prev
//                    String.fromCharCode(0x2190); // currently building Now
        }
        infos[i] = info;
    }
    infos = infos;
history
}
</script>

<table id="not-foot-table">
<!--    <tr>
        <th></th>
        <th colspan="3">Recorded Times</th>
    </tr>-->
    <tr class='colhead'>
        <th></th>
        <th class='pastdata'>Oldest</th>
        <th class='pastdata'>Prev</th>
        <th class='nowdata'>Now</th>
    </tr>
    <tr>
        <th class='rowhead'>Date</th>
        <td class='pastdata'>{infos[0][0]}</td>
        <td class='pastdata'>{infos[1][0]}</td>
        <td class='nowdata'>{infos[2][0]}</td>
    </tr>
    <tr>
        <th class='rowhead'>System</th>
        <td class='pastdata'>{infos[0][1]}</td>
        <td class='pastdata'>{infos[1][1]}</td>
        <td class='nowdata'>{infos[2][1]}</td>
    <tr>
        <th class='rowhead'>Watch</th>
        <td class='pastdata'>{infos[0][2]}</td>
        <td class='pastdata'>{infos[1][2]}</td>
        <td class='nowdata'>{infos[2][2]}</td>
    </tr>
    <tr>
        <th class='rowhead'>Diff</th>
        <td class='pastdata'>{infos[0][3]}</td>
        <td class='pastdata'>{infos[1][3]}</td>
        <td class='nowdata'>{infos[2][3]}</td>
    </tr>
    <tr>
        <th class='rowhead'>SPD</th>
        <td class='nowdata'><span class="highlight">{infos[0][4]}</span></td>
        <td class='nowdata'><span class="highlight">{infos[1][4]}</span></td>
        <td class='nowdata'>{infos[2][4]}</td>
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
.highlight {
    font-weight: bold;
    /*background-color: yellow;*/
}
td {
    font-family: 'Courier New', Courier, monospace;
    text-align: right;
    width: 8ch;
    height: 1ch;
}
.pastdata {
    background-color: #EEE;
}
.nowdata {
    background-color: #BBB;
}
.rowhead {
    text-align: left;
}
.colhead {
    /*text-align: right;*/
}
#not-foot-table {
/*	position: fixed;
    bottom: 0;
    width: 88%;*/
}
</style>