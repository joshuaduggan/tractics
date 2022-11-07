<script>
import * as tm from './tracmanager.js';
import { tage } from './tracmanager.js';
import WatchSelect from './components/WatchSelect.svelte';
import Dragger from './components/Dragger.svelte';
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
	$tage = 'RESULTS';
	tm.addTrac(trac);
}
</script>

<main>
<div id='top_manip'>
	<div id="ws-div"><WatchSelect/></div>
	<div id="clock-div"><Clock bind:offset bind:clockTime/></div>
	{#if $tage == 'SYNC'}
	<button class='b-single' on:click={syncTime}>Sync</button>
	{:else if $tage == 'ALTER'}
	<button class='b-one' on:click={advance15}>+ 15</button>
	<button class='b-two' on:click={retard15}>- 15</button>
	<button class='b-three' on:click={confirmWatchIndicated}>Good Match</button>
	<button class='b-four' on:click={() => { $tage = 'SYNC'; }}>Start Over</button>
	{:else if $tage == 'ADJUSTED'}
	<button class='b-two' on:click={() => wasWatchAdjusted(true)}>Yes</button>
	<button class='b-three' on:click={() => wasWatchAdjusted(false)}>No</button>
	{:else if $tage == 'RESULTS'}
	<button class='b-single' on:click={() => { $tage = 'SYNC'; }}>Restart Process</button>
	{/if}
</div>
<Dragger/>
{#if $tage == 'SYNC'}
<p>Press 'Sync' when your watch's seconds hand reads 00, 15, 30, or 45.
		Doing so will let this app know what time your watch is indicating.</p>
{:else if $tage == 'ALTER'}
<p>Does the app clock match the time on your watch? Adjust the clock as
		needed with the + or - 15 second increment buttons.</p>
{:else if $tage == 'ADJUSTED'}
<p>Has the watch been adjusted or has it's timekeeping otherwise been
		interrupted since last synced with this app?</p>
{/if}
<Calc bind:this={calc}/>
</main>

<style>
main {
	min-width: 340px;
	max-width: 440px;
	margin: auto;
}
#top_manip {
	display: grid;
	grid-template-columns: 2fr 1fr;
}
#ws-div {
/*	width: 100%;*/
	grid-column: 1 / 3;
	margin-left: 10%;
	margin-right: 10%;
}
#clock-div {
	grid-column: 1 / 2;
	grid-row: 2 / 6;
}
.b-single {
	grid-column: 2;
	grid-row: 3 / 5;
}
.b-one {
	grid-column: 2;
	grid-row: 2;
}
.b-two {
	grid-column: 2;
	grid-row: 3;
}
.b-three {
	grid-column: 2;
	grid-row: 4;
}
.b-four {
	grid-column: 2;
	grid-row: 5;
}
p {
	margin-top: 0;
	padding-left: 2%;
	padding-right: 2%;
}
</style>