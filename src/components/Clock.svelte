<script>
import { onMount } from 'svelte';
import { tage, watches, escapeForHTML } from '../tracmanager.js';

export let clockTime = new Date();
export let offset = 0; // The offset from the system time in millis

// these automatically update when `time`
// changes, because of the `$:` prefix
$: hours = clockTime.getHours();
$: minutes = clockTime.getMinutes();
$: seconds = clockTime.getSeconds() + (clockTime.getMilliseconds() / 1000);

$: if (offset) updateClockTime();

let digitalText;
let brandText;

onMount(() => {
	const intervalAnalog = setInterval(() => { updateClockTime() }, 100);

	tage.subscribe((v) => { 
		if (v == 'SYNC') {
			offset = 0;
			brandText = 'System';
		} else {
			brandText = escapeForHTML($watches[0].susName);
		}
	 });

	return () => {
		clearInterval(interval);
	};
});

function updateClockTime() {
	let oldSecs = clockTime.getSeconds();
	clockTime = new Date(new Date().getTime() + offset);
	if (oldSecs != clockTime.getSeconds() || !digitalText) {
		digitalText = clockTime.toLocaleTimeString('en-US',
			{hour: '2-digit', minute: '2-digit', second: '2-digit'})
			.replace('AM', '').replace('PM', '');
	}
}
</script>

<svg viewBox='-50 -50 100 100'>
	<circle class='clock-face' r='48'/>

	<!-- markers -->
	{#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
		<line
			class='major'
			y1='35'
			y2='45'
			transform='rotate({30 * minute})'
		/>

		{#each [1, 2, 3, 4] as offset}
			<line
				class='minor'
				y1='42'
				y2='45'
				transform='rotate({6 * (minute + offset)})'
			/>
		{/each}
	{/each}

	<text y=-15% dominant-baseline="middle" text-anchor="middle" class="brand-text"
		textLength=45% lengthAdjust=spacingAndGlyphs>{brandText}</text>
	
	<text y=10% dominant-baseline="middle" text-anchor="middle" class="digital-text"
		textLength=60% lengthAdjust=spacingAndGlyphs>{digitalText}</text>

	<!-- hour hand -->
	<line
		class='hour'
		y1='2'
		y2='-22'
		transform='rotate({30 * hours + minutes / 2})'
	/>

	<!-- minute hand -->
	<line
		class='minute'
		y1='4'
		y2='-30'
		transform='rotate({6 * minutes + seconds / 10})'
	/>

	{#if $tage != 'SYNC'}
	<!-- second hand -->
	<g transform='rotate({6 * seconds})'>
		<line class='second' y1='10' y2='-38'/>
		<!--<line class='second-counterweight' y1='10' y2='2'/>-->
	</g>
	{/if}
</svg>

<style>
	@font-face {
		font-family: 'digital-7';
		src: url('../fonts/digital-7-mono.ttf');
	}

	svg {
		max-width: 200px;
		max-height: 200px;
		/*width: 100%;
		height: 100%;*/
	}

	.brand-text {
		font-family: Helvetica, Arial, sans-serif;
		fill: #333;
	}

	.digital-text {
		font-family: 'digital-7', 'Courier New', Courier, monospace;
		font-weight: bold;
		fill: #666;
	}

	.clock-face {
		stroke: #333;
		fill: white;
	}

	.minor {
		stroke: #999;
		stroke-width: 0.5;
	}

	.major {
		stroke: #333;
		stroke-width: 1;
	}

	.hour {
		stroke: #333;
		stroke-width: 2;
	}

	.minute {
		stroke: #333;
		stroke-width: 1.5;
	}

	.second {
		stroke: rgb(180,0,0);
	}
</style>