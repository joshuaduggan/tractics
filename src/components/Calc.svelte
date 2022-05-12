<script>
import { watches, tage } from '../tracmanager.js';

let trac; // the latest trac - the one calcAccuracy sets
let adjTrac;

/**
 * 
 * @param t The Trac not yet included in the Watch
 */
export function calcAccuracy(t) {
    let ts = $watches[0].tracs;
    let millisOff = t.watchDate.getTime() - t.sysDate.getTime();
    let millisSinceLastAdj = 0;
    let millisOffAfterLastAdj;
    for (let i = ts.length - 1; i >= 0; i--) {
        adjTrac = ts[i];
        millisSinceLastAdj = t.sysDate.getTime() - ts[i].sysDate.getTime();
        millisOffAfterLastAdj = ts[i].watchDate.getTime() - ts[i].sysDate.getTime();
        if (ts[i].wasWatchAdj) break;
    }
    t.secondsOff = Math.round(millisOff / 100) / 10;
    if (ts.length > 0 && !t.wasWatchAdj && millisSinceLastAdj > 0) { // if there's anything to compare.
        t.hoursSinceLastAdj = Math.round(millisSinceLastAdj / 1000 / 60 / 6) / 10;
        let millisDifBetweents = millisOff - millisOffAfterLastAdj;
        let mspdOffSinceLastAdj = millisDifBetweents / millisSinceLastAdj * 1000 * 60 * 60 * 24;
        t.secondsOffLastAdj = Math.round(millisOffAfterLastAdj / 100) / 10;
        t.spdOffSinceLastAdj = Math.round(mspdOffSinceLastAdj / 100) / 10;
    }
    trac = t;
}
</script>

<p>
{#if $tage == 'RESULTS'}
    Your watch is now <strong>{trac.secondsOff} seconds</strong> from system time.
    {#if 'hoursSinceLastAdj' in trac}
        It was <strong>{trac.secondsOffLastAdj} seconds</strong> from system time when synced after it's latest adjustment
        <strong>{trac.hoursSinceLastAdj} hours</strong> ago. It has {trac.spdOffSinceLastAdj < 0 ? 'lost': 'gained'} time at an average of
            {Math.abs(trac.spdOffSinceLastAdj)} seconds per day (<strong>{trac.spdOffSinceLastAdj} SPD</strong>) since it was last adjusted.
    {:else}
        Sync this again with your watch later to learn it's drift in seconds per day.
    {/if}
{/if}
</p>

{#if $tage == 'RESULTS' && 'hoursSinceLastAdj' in trac}
    <table>
        <tr><th colspan=5 align="center">Since Latest Adjustment</th></tr>
        <tr>
            <th></th>
            <th>System</th>
            <th>Watch</th>
            <th>Diff</th>
            <th></th>
        </tr>
        <tr>
            <td>{Math.round((trac.sysDate.getTime() - adjTrac.sysDate.getTime()) / (100 * 60 * 60 * 24)) / 10} days ago:</td>
            <td>{adjTrac.sysDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{adjTrac.watchDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{adjTrac.secondsOff}</td>
            <td rowspan=2 class='spdres'>{trac.spdOffSinceLastAdj} spd</td>
        </tr>
        <tr>
            <td>Now:</td>
            <td>{trac.sysDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{trac.watchDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{trac.secondsOff}</td>
        </tr>
    </table>
{/if}

<style>
table td + td, table th + th { border-left:1px solid; }
table, th, td {
/*     border: 1px solid;*/
    border-collapse: collapse;
    padding-left: 4px;
    padding-right: 4px;
}
.spdres {
    background-color: yellow;
}
</style>