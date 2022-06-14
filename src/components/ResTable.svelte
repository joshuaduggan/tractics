<script>
import { onMount } from 'svelte';

import { watches, tage } from '../tracmanager.js';

onMount(() => {
    watches.subscribe(() => { retrievePrevAdj(); });
    tage.subscribe((v) => {
        if (v == 'RESULTS') {
            tracs[2] = $watches[0].tracs.at(-1);
            buildTableInfos();
        } else if (v == 'SYNC') {
        }
    });
});

let tracs = new Array(3); // [0]: Adj, [1]: Prev, [2]: Now
let infos;
infos = new Array(3);
buildTableInfos(); // fill the infos with ''s

function retrievePrevAdj() {
    let ts = $watches[0].tracs;
    tracs.fill(undefined);
    for (let i = ts.length - 1; i >= 0; i--) {
        if (ts[i].wasWatchAdj) break;
        if (i == ts.length - 1) tracs[1] = ts[i];
        else tracs[0] = ts[i];
    }
    buildTableInfos();
}

function buildTableInfos() {
    for (let i = 0; i < 3; i++) {
        let trac = tracs[i];
        let info = new Array(5).fill('');
        if (trac) {
            info[0] = trac.sysDate.toLocaleDateString(undefined, {dateStyle: 'short'});
            info[1] = trac.sysDate.toLocaleTimeString(undefined, {hour12: false});
            info[2] = trac.watchDate.toLocaleTimeString(undefined, {hour12: false});
            info[3] = trac.secondsOff;
            if (tracs[2]) // if there are Now results
                info[4] =
                    (i == 0) ? tracs[2].spdOffSinceLastAdj : // currently building Adj
                    (i == 1) ? tracs[2].spdOffSincePrev : // currently building Prev
                    String.fromCharCode(0x27F5); // currently building Now
        }
        infos[i] = info;
    }
    infos = infos;
}
</script>

<table id="foot-table">
    <tr>
        <th></th>
        <th colspan="3">Recorded Times</th>
    </tr>
    <tr>
        <th></th>
        <th>Oldest</th>
        <th>Prev</th>
        <th>Now</th>
    </tr>
    <tr>
        <th>Date</th>
        {#each infos as infoRow}
        <td>{infoRow[0]}</td>
        {/each}
    </tr>
    <tr>
        <th>System</th>
        {#each infos as infoRow}
        <td>{infoRow[1]}</td>
        {/each}
    </tr>
    <tr>
        <th>Watch</th>
        {#each infos as infoRow}
        <td>{infoRow[2]}</td>
        {/each}
    </tr>
    <tr>
        <th>Diff</th>
        {#each infos as infoRow}
        <td>{infoRow[3]}</td>
        {/each}
    </tr>
    <tr>
        <th>SPD</th>
        {#each infos as infoRow}
        <td>{infoRow[4]}</td>
        {/each}
    </tr>
</table>

<style>
table, th, td {
    border-collapse: collapse;
    padding-left: 4px;
    padding-right: 4px;
}
td {
    text-align: right;
}
#foot-table {
	position: fixed;
    bottom: 0;
    width: 90%;
}
</style>