<script>
import { watches, tage } from '../tracmanager.js';

let trac; // the latest trac - the one calcAccuracy sets
let adjTrac; // the trac we're mainly comparing to - the first one after the latest adjustment
let prevTrac; // the trac immediately previous to what we're doing now - secondary comparison

/**
 * 
 * @param t The Trac not yet included in the Watch
 */
export function calcAccuracy(t) {
    let ts = $watches[0].tracs;
    let millisOff = t.watchDate.getTime() - t.sysDate.getTime();
    let millisSinceLastAdj = 0;
    let millisOffAfterLastAdj;
    prevTrac = undefined;
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
        prevTrac = ts[ts.length - 1];
        let sElapsedm = prevTrac.sysDate.getTime() - t.sysDate.getTime();
        let wElapsedm = prevTrac.watchDate.getTime() - t.watchDate.getTime();
        t.spdOffSincePrev = Math.round((wElapsedm - sElapsedm) / (sElapsedm / (24 * 60 * 60 * 10))) / 10;
    }
    trac = t;
}
</script>
<div>
<p>
{#if $tage == 'RESULTS'}
    Your watch is now <strong>{trac.secondsOff} seconds</strong> from system time.
    {#if 'hoursSinceLastAdj' in trac}
        It was <strong>{trac.secondsOffLastAdj} seconds</strong> from system time when synced after
        it's latest adjustment <strong>{trac.hoursSinceLastAdj} hours</strong> ago. It has
        {trac.spdOffSinceLastAdj < 0 ? 'lost': 'gained'} time at an average of
        {Math.abs(trac.spdOffSinceLastAdj)} seconds per day (<span  class='spdres'><strong>{trac.spdOffSinceLastAdj}
        SPD</strong></span>) since it was last adjusted.
    {:else}
        Sync this again with your watch later to learn it's drift in seconds per day.
    {/if}
{/if}
</p>

{#if $tage == 'RESULTS' && 'hoursSinceLastAdj' in trac}
    <table align='center'>
        <tr><th colspan=5 align="center">Since Latest Adjustment</th></tr>
        <tr>
            <th>Days Passed</th>
            <th>System</th>
            <th>Watch</th>
            <th>Diff</th>
            <th>SPD</th>
        </tr>
        <tr>
            <td>{Math.round((trac.sysDate.getTime() - adjTrac.sysDate.getTime()) / (100 * 60 * 60 * 24)) / 10}</td>
            <td>{adjTrac.sysDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{adjTrac.watchDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{adjTrac.secondsOff.toFixed(1)}</td>
            <td rowspan=2 class='spdres'>{trac.spdOffSinceLastAdj.toFixed(1)}</td>
        </tr>
        <tr>
            <td>Now</td>
            <td>{trac.sysDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{trac.watchDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{trac.secondsOff.toFixed(1)}</td>
        </tr>
    {#if prevTrac}
        <tr><th colspan=5>&nbsp;</th></tr>
        <tr><th colspan=5 align="center">Since Latest Measurement</th></tr>
        <tr>
            <th>Days Passed</th>
            <th>System</th>
            <th>Watch</th>
            <th>Diff</th>
            <th>SPD</th>
        </tr>
        <tr>
            <td>{Math.round((trac.sysDate.getTime() - prevTrac.sysDate.getTime()) / (100 * 60 * 60 * 24)) / 10}</td>
            <td>{prevTrac.sysDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{prevTrac.watchDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{prevTrac.secondsOff.toFixed(1)}</td>
            <td rowspan=2>{trac.spdOffSincePrev.toFixed(1)}</td>
        </tr>
        <tr>
            <td>Now</td>
            <td>{trac.sysDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{trac.watchDate.toLocaleTimeString().replace('AM', '').replace('PM', '')}</td>
            <td>{trac.secondsOff.toFixed(1)}</td>
        </tr>
    {/if}
    </table>
{/if}
</div>
<style>
table td + td, table th + th { border-left:1px solid; }
table, th, td {
/*     border: 1px solid;*/
    border-collapse: collapse;
    padding-left: 4px;
    padding-right: 4px;
}
td {
    text-align: right;
}
.spdres {
    background-color: yellow;
}
div {
    padding-left: 6%;
    padding-right: 6%;
}
</style>