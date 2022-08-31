<script>
import { onMount } from 'svelte';
import { tweened } from 'svelte/motion';
import { watches, tage } from '../tracmanager.js';

let moving = false;
let touchLastX;
const minSkipSpeed = 0.5;
let svgWidth = 300;
let sliderRestX;
const twn = tweened(0, {duration:0});
let moveLog = [];
let moveSpeed;
let mouseButtDown = false;
let date = new Date();

class Card {
    constructor(title, trac) {
        this.width = 88;
        this.height = 196;
        this.stroke = 2;
        this.topMarginEm = 0.5;
        this.x = undefined;
        this.title = title;
        this.setTrac(trac);
    }
    setTrac(trac) {
        this.trac = trac;
    }
    getSysDate() { return this.trac ? this.trac.sysDate.toLocaleDateString(undefined, {month: '2-digit', day: '2-digit', year: '2-digit'}) : '' }
    getSysTime() { return this.trac ? this.trac.sysDate.toLocaleTimeString(undefined, {hour12: false}) : '' }
    getWatchTime() { return this.trac ? this.trac.sysDate.toLocaleTimeString(undefined, {hour12: false}) : '' }
    getDiff() { return this.trac ? this.trac.secondsOff : ''; }
}
const C = new Card(); // a card to allow access to default values
$: { // activates whenever svgWidth changes (which is bound to the svg enclosing div)
    sliderRestX = (svgWidth - C.width) / 2;
    twn.set(sliderRestX);
}
let cards = [new Card('Prev'), new Card('Oldest'), new Card('Current')]
$: cards[0].x = $twn;
cards[1].x = 0;
$: cards[2].x = svgWidth - C.width;

/*// ideally this would be a class but as of now Svelte's compiler does not understand class fields
let card = {
    width: 88,
    height: 196,
    stroke: 2,
    topMarginEm: 0.5,
    x,
    title,
    trac
};
let cards = [{}, {}, {}];
cards.forEach(c => Object.assign(c, card));
$: cards[0].x = $twn;
cards[0].name = 'Prev';
cards[1].x = 0;
cards[1].name = 'Oldest';
$: cards[2].x = svgWidth - card.width;
cards[2].name = 'Current';
function cardInit(i, trac, name) {
    if (!trac) return;
    let c = cards[i];
    c.name = name;
    c.sysDateStr = trac.sysDate.toLocaleDateString(undefined, {month: '2-digit', day: '2-digit', year: '2-digit'});
    c.sysTimeStr = trac.sysDate.toLocaleTimeString(undefined, {hour12: false});
    c.watchTimeStr = trac.watchDate.toLocaleTimeString(undefined, {hour12: false});
    c.diff = trac.secondsOff;
}*/

onMount(() => {
    watches.subscribe(() => { retrievePrevAdjNow(); });
    tage.subscribe((v) => { if (v == 'SYNC') retrievePrevAdjNow(); });
});

/**
 * finds and assigns the correct tracs to the tracs array. What this generates
 * is used by buildTableInfos to fill the infos array (table).
 */
 function retrievePrevAdjNow() {
    cards.forEach(c => c.setTrac(undefined));
    let ts = $watches[0].tracs;
    let numSinceAdj = 0;
    for (let i = ts.length - 1; i >= 0; i--) {
        numSinceAdj++;
        if (ts[i].wasWatchAdj) break;
    }
    if ($tage == 'RESULTS') {
        if (numSinceAdj == 1) {
            //tracs[2] = ts[ts.length - numSinceAdj];
            //cardInit(2, ts[ts.length - numSinceAdj], 'Now');
            cards[2].setTrac(ts[ts.length - numSinceAdj]); // Now
        } else if (numSinceAdj == 2) {
            //tracs[1] = ts[ts.length - 2];
            //tracs[2] = ts[ts.length - 1];
            //cardInit(1, ts[ts.length - 2], 'Prev');
            //cardInit(2, ts[ts.length - 1], 'Now');
            cards[1].setTrac(ts[ts.length - 2]); // Prev
            cards[2].setTrac(ts[ts.length - 1]); // Now
        } else {
            //tracs[0] = ts[ts.length - numSinceAdj];
            //tracs[1] = ts[ts.length - 2];
            //tracs[2] = ts[ts.length - 1];
            //cardInit(0, ts[ts.length - numSinceAdj], 'Old');
            //cardInit(1, ts[ts.length - 2], 'Prev');
            //cardInit(2, ts[ts.length - 1], 'Now');
            cards[0].setTrac(ts[ts.length - 2]); // Prev
            cards[1].setTrac(ts[ts.length - numSinceAdj]); // Old
            cards[2].setTrac(ts[ts.length - 1]); // Now

        }
    } else {
        if (numSinceAdj == 1) {
            //tracs[1] = ts[ts.length - 1];
            //cardInit(1, ts[ts.length - 1], 'Prev');
            cards[2].setTrac(ts[ts.length - 1]); // Now
        } else {
            //tracs[0] = ts[ts.length - numSinceAdj];
            //tracs[1] = ts[ts.length - 1];
            //cardInit(0, ts[ts.length - numSinceAdj], 'Old');
            //cardInit(1, ts[ts.length - 1], 'Prev');
            cards[0].setTrac(ts[ts.length - 1]); // Prev
            cards[1].setTrac(ts[ts.length - numSinceAdj]); // Old
        }
    }
    svgWidth--;
    svgWidth++;
}

function startDrag(e) {
    if (e instanceof MouseEvent && e.buttons > 1) return; // bad way to ignore mouse other than left click
    mouseButtDown = true;
    moving = true;
    touchLastX = (e.targetTouches) ? e.targetTouches[0].pageX : undefined;
}

function stopDrag() { // called at the end of a finger/mouse drag
    mouseButtDown = false;
    if (!moving) return;

    if (moveLog) {
        moveSpeed = 0;
        let cnt = 0;
        moveLog.forEach((ml) => {
            moveSpeed += ml.speed;
            cnt++;
        });
        moveSpeed /= cnt;
        moveLog = undefined;
    }
    if (moveSpeed) {
        let toLoc, respawnLoc;
        if (moveSpeed > 0) {
            toLoc = svgWidth - C.width;
            respawnLoc = 0;
        } else {
            toLoc = 0;
            respawnLoc = svgWidth - C.width;
        }
        moveSpeed -= moveSpeed * 0.35;
        if (Math.abs(moveSpeed) > minSkipSpeed) {
            twn.set(toLoc, spdToDur($twn, toLoc, Math.abs(moveSpeed))).then(() => {
                twn.set(respawnLoc, {duration:0}).then(() => {stopDrag();});
            });
            return;
        } else moveSpeed = undefined;
    }

    moving = false;
    touchLastX = undefined;

    twn.set(sliderRestX, spdToDur(sliderRestX, $twn, minSkipSpeed));
}

/**
 * Converts desired speed of movement plus the distance to be covered (begin - end)
 * into the number of millis duration that it will take.
 * @param begin
 * @param end
 * @param speed pixels moved / millis elapsed
 */
function spdToDur(begin, end, speed) {
    return {duration: Math.abs(end - begin) / speed};
}

function dragMove(e) { // called during a finger/mouse drag
    if (!moving || !mouseButtDown) return;

    let ml = {
        secs: Date.now(),
        move: (e.movementX != undefined) ? e.movementX : e.targetTouches[0].pageX - touchLastX
    };
    ml.speed = (moveLog && moveLog.length > 0) ? ml.move / (ml.secs - moveLog[moveLog.length - 1].secs) : undefined;

    $twn = ml.move + $twn;
    touchLastX = (e.targetTouches) ? e.targetTouches[0].pageX : undefined;
    if ($twn < 0) $twn = 0;
    else if ($twn >= svgWidth - C.width) $twn = svgWidth - C.width;

    if (!moveLog) moveLog = [];
    moveLog.push(ml);
    if (moveLog.length > 5) moveLog = moveLog.splice(moveLog.length - 5);
}
</script>
    
<svelte:window on:mouseup={stopDrag} on:touchend={stopDrag} on:touchcancel={stopDrag} on:mousemove={dragMove} on:touchmove={dragMove}/>
<div bind:clientWidth={svgWidth}><svg on:mousedown={startDrag} on:touchstart={startDrag} width=100% height="230">
    <rect width="100%" height="100%" fill='lightgray'/>
    {#each cards as card}
        <svg width={card.width} height={card.height} x={card.x} y='0'>
            <rect x={card.stroke / 2} y={card.stroke / 2} rx="25" ry="25" width={card.width - card.stroke}
                height={card.height - card.stroke} stroke="black" fill="lightblue" stroke-width={card.stroke}/>
            <text class="ch" x="50%" y="{1 + card.topMarginEm}em">{card.title}</text>
            <line x1="0" y1="2.2em" x2={card.width} y2="2.2em" stroke="black" stroke-width={card.stroke}/>
            <text class="ch" x="50%" y="{3 + card.topMarginEm}em">System</text>
            <text class="cd" x="50%" y="{4 + card.topMarginEm}em">{card.getSysDate()}</text>
            <text class="cd" x="50%" y="{5 + card.topMarginEm}em">{card.getSysTime()}</text>
            <line x1="0" y1="6.2em" x2={card.width} y2="6.2em" stroke="black" stroke-width={card.stroke}/>
            <text class="ch" x="50%" y="{7 + card.topMarginEm}em">Watch</text>
            <text class="cd" x="50%" y="{8 + card.topMarginEm}em">{card.getWatchTime()}</text>
            <line x1="0" y1="9.2em" x2={card.width} y2="9.2em" stroke="black" stroke-width={card.stroke}/>
            <text class="ch" x="50%" y="{10 + card.topMarginEm}em">Diff</text>
            <text class="cd" x="50%" y="{11 + card.topMarginEm}em">{card.getDiff()}</text>
        </svg>
    {/each}
</svg></div>

<style>
svg {
    user-select: none;
}
svg text {
    text-anchor: middle;
}
.ch {
    font-weight: bold;
}
.cd {
    font-family: 'Courier New', Courier, monospace;
}
</style>