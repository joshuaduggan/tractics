<script>
import { watches, tage } from '../tracmanager.js';


//???!!! not sure how this interacts with the setting in calcAccuracy, may be superflous? !!!???
$: trac = $watches[0].tracs.at(-1);

/**
 * ???!!! The method that actually set's a trac's props? must be double checked and doc'd !!!???
 * @param t The Trac not yet included in the Watch
 */
export function calcAccuracy(t) {
    let ts = $watches[0].tracs;
    let millisOff = t.watchDate.getTime() - t.sysDate.getTime();
    let millisSinceLastAdj = 0;
    let millisOffAfterLastAdj;
    for (let i = ts.length - 1; i >= 0; i--) {
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
        let prevTrac = ts[ts.length - 1];
        let sElapsedm = prevTrac.sysDate.getTime() - t.sysDate.getTime();
        let wElapsedm = prevTrac.watchDate.getTime() - t.watchDate.getTime();
        t.spdOffSincePrev = Math.round((wElapsedm - sElapsedm) / (sElapsedm / (24 * 60 * 60 * 10))) / 10;
    }
    trac = t;
}
</script>

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

<style>
.spdres {
    background-color: yellow;
}
p {
    margin-top: 0;
    padding-left: 2%;
    padding-right: 2%;
}
</style>