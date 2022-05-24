<script>
import * as tm from './tracmanager.js';
import { tage } from './tracmanager.js';
import WatchSelect from './components/WatchSelect.svelte';
import Clock from './components/Clock.svelte';
import Calc from './components/Calc.svelte';
//import ResChart from './components/ResChart.svelte';

export let name; name = ''; // including this fixes a runtime warning about missing prop. This is
							// a Svelte issue has nothing to do with this app AFAIK.

let clockTime; // bound to clock.clockTime
let offset; // bound to clock.offset
let trac;
let calc;

//TESTING START
/**stage = 'TEST'
trac = tm.testData[0].tracs.pop(); //testdata includes the new trac which wouldn't yet be in watches
onMount(() => {
	tm.watches.update((v) => v[0] = tm.testData);
	let wasAdj = trac.wasWatchAdj;
	trac.wasWatchAdj = undefined;
	wasWatchAdjusted(wasAdj);
});*/
//TESTING END

function syncTime() {
	trac = {};
	trac.sysDate = new Date();
	// Set the clock to the nearest quarter minute of the current time.
	// start by setting the guess back 1 minute and 15 seconds.
	let guess = new Date(trac.sysDate.getTime() - 75000);

	// round the date off to the nearest minute.
	guess = new Date(Math.round(guess.valueOf() / 60000) * 60000);
	// move the date forward in 15 sec increments till it's the closest.
	let prevDiff = 100000;
	while (true) {
		let currDate = new Date(guess.valueOf() + 15000);
		let currDiff = trac.sysDate.valueOf() - currDate.valueOf();
		if (currDiff < 0) currDiff *= -1;
		if (currDiff > prevDiff) {
			break;
		} else {
			prevDiff = currDiff;
			guess = currDate;
		}
	}
	offset = guess.getTime() - trac.sysDate.getTime();
	$tage = 'ALTER';
}

function retard15() {
	offset -= 15000;
}

function advance15() {
	offset += 15000;
}

function confirmWatchIndicated() {
	trac.watchDate = new Date(trac.sysDate.getTime() + offset);
	$tage = 'ADJUSTED';
}

function wasWatchAdjusted(wasIt) {
	trac.wasWatchAdj = wasIt;
	calc.calcAccuracy(trac);
	tm.addTrac(trac);
	$tage = 'RESULTS';
}
</script>

<main>
<div align='center'>
<WatchSelect/><br/>
<Clock bind:offset bind:clockTime/>
</div>
{#if $tage == 'SYNC'}
<div>
	<p>Sync when your watch reads 00, 15, 30, or 45 seconds.</p>
	<div align="center"><button class='basic-butt' on:click={syncTime}>Sync Time</button></div>
</div>
{:else if $tage == 'ALTER'}
<div>
	<p>Does the clock match the time on your watch? Adjust as needed.</p>
	<div align="center">
	<button class='basic-butt' on:click={retard15}>- 15</button>
	<button class='basic-butt' on:click={advance15}>+ 15</button><br/>
	<button class='basic-butt' on:click={confirmWatchIndicated}>Good Match</button>
	<button class='basic-butt' on:click={() => { $tage = 'SYNC'; }}>Redo Sync</button>
	</div>
</div>
{:else if $tage == 'ADJUSTED'}
<div>
	<p>Has the watch been adjusted or has it's timekeeping been otherwise interrupted since last tracked?</p>
	<div align="center">
		<button class='basic-butt' on:click={() => wasWatchAdjusted(true)}>Yes</button>
		<button class='basic-butt' on:click={() => wasWatchAdjusted(false)}>No</button>
	</div>
</div>
{/if}
<Calc bind:this={calc}/>
{#if $tage == 'RESULTS'}
<div align="center"><br/><button class='basic-butt' on:click={() => { $tage = 'SYNC'; }}>Begin Another Sync</button></div>
{/if}
</main>

<style>
p {
	padding-left: 6%;
	padding-right: 6%;
}
.basic-butt {
	min-width: 30%;
}
</style>