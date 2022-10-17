<script>
import { onMount } from 'svelte';
import { tweened } from 'svelte/motion';
import { watches, tage } from '../tracmanager.js';

let moving = false;
let touchLastX;
const minSkipSpeed = 0.5;
let svgWidth = 300;
let sliderRestX;
const leftTwn = tweened(0, {duration:0});
const midTwn = tweened(0, {duration:0});
const rightTwn = tweened(0, {duration:0});
const extraTwn = tweened(0, {duration:0});
let moveLog = [];
let moveSpeed;
let mouseButtDown = false;
let prevStage;
let maxStack = 0;
let leftStack = 0;
let rightStack = 0;

const DI_RAD = 26;

class Card {
    constructor() {
        this.width = 88;
        this.height = 196;
        this.stroke = 2;
        this.topMarginEm = 0.5;
        this.setTrac();
    }
    setTrac(title, trac, trans, twn, transStart, transEnd) {
        this.title = title ? title : '';
        this.trac = trac;
        switch (trans) {
            case 'SLIDE':
                twn.set(transStart, {duration:0}).then(
                    twn.set(transEnd, spdToDur(transStart, transEnd, minSkipSpeed)));
                break;
            case 'SLIDE_DISAPEAR':
                twn.set(transStart, {duration:0}).then(
                    twn.set(transEnd, spdToDur(transStart, transEnd, minSkipSpeed)).then(() => {
                        extraCard.trac = undefined; // obvious call to extraCard.trac required for svelte compiler to see it needs to redo SVG
                        this.trac = this.setTrac();
                    }));
                break;
        }
    }
    getSysDate() { return this.trac ? this.trac.sysDate.toLocaleDateString(undefined, {month: '2-digit', day: '2-digit', year: '2-digit'}) : '' }
    getSysTime() { return this.trac ? this.trac.sysDate.toLocaleTimeString(undefined, {hour12: false}) : '' }
    getWatchTime() { return this.trac ? this.trac.watchDate.toLocaleTimeString(undefined, {hour12: false}) : '' }
    getDiff() { return this.trac ? this.trac.secondsOff : ''; }
    getTitle() { return this.trac ? this.title : ''; }
}
const C = new Card(); // a card to allow access to default values
const leftCard = new Card();
const midCard = new Card();
const rightCard = new Card();
const extraCard = new Card();
$: { // activates whenever svgWidth changes (which is bound to the svg enclosing div)
    sliderRestX = (svgWidth - C.width) / 2;
    midTwn.set(sliderRestX);
    rightTwn.set(svgWidth - C.width);
}
$: leftCard.x = $leftTwn;
$: midCard.x = $midTwn;
$: rightCard.x = $rightTwn;
$: extraCard.x = $extraTwn;
$: spdBase = {
    x: 0,
    y: C.height + 10,
    width: svgWidth,
    height: 90};
$: spdLRes = {
    x: (sliderRestX + C.width) / 2,
    y: spdBase.y + spdBase.height / 3 - 2};
$: spdRRes = {
    x: (sliderRestX + C.width) / 2 + sliderRestX,
    y: spdBase.y + spdBase.height / 3 - 2};
$: spdMRes = {
    x: spdBase.x + spdBase.width / 2,
    y: spdBase.y + (spdBase.height / 3) * 2 + 2};
const spdResRad = 20;

onMount(() => {
    // Run whenever a trac is added or the watch order/number is changed..
    watches.subscribe(() => { updateTracsInCards(); });
    // Run whenever tage changes to SYNC.
    tage.subscribe((v) => { if (v === 'SYNC') updateTracsInCards(); });
});

let updateTracsInCards_oldWatch;
/**
 * finds and assigns the correct tracs to the cards array. The cards are then
 * used directly to build the HTML.
 */
 function updateTracsInCards() {
    // !!! a bit of a hack set in WatchSelect.selected - see there for more !!!
    if (tage.skip_upadateTracsInCards) {
        tage.skip_upadateTracsInCards = false;
        return;
    }

    let switchedWatch = updateTracsInCards_oldWatch != $watches[0];
    updateTracsInCards_oldWatch = $watches[0];

    leftCard.trac = undefined; // obvious calls to reset tracs required by Svelte compiler
    midCard.trac = undefined;
    rightCard.trac = undefined;
    extraCard.trac = undefined;
    let ts = $watches[0].tracs;
    let numSinceAdj = 0;
    for (let i = ts.length - 1; i >= 0; i--) {
        numSinceAdj++;
        if (ts[i].wasWatchAdj) break;
    }
    maxStack = Math.max(numSinceAdj - (($tage == 'RESULTS') ? 3 : 2), 0); // remove one for the oldest, one for the midcard, one for the current 
    leftStack = maxStack;
    rightStack = 0;

    // ensure mobile touch on this does not scroll the screen when the cards are draggable.
    document.getElementById('sliders').style.touchAction = ($tage == 'RESULTS' && maxStack > 0) ? 'none' : 'auto';
    
    if ($tage == 'RESULTS') {
        if (numSinceAdj == 1) {
            rightCard.setTrac('Current', ts[ts.length - numSinceAdj], 'SLIDE', rightTwn, svgWidth, svgWidth - C.width);
        } else if (numSinceAdj == 2) {
            midCard.setTrac('Previous', ts[ts.length - 2]);
            rightCard.setTrac('Current', ts[ts.length - 1], 'SLIDE', rightTwn, svgWidth, svgWidth - C.width);
        } else {
            midCard.setTrac('Previous', ts[ts.length - 2]);
            leftCard.setTrac('Oldest', ts[ts.length - numSinceAdj]);
            rightCard.setTrac('Current', ts[ts.length - 1], 'SLIDE', rightTwn, svgWidth, svgWidth - C.width);
        }
    } else {
        if (numSinceAdj == 1) {
            if (prevStage === 'RESULTS' && !switchedWatch) midCard.setTrac('Previous', ts[ts.length - 1], 'SLIDE', midTwn, svgWidth - C.width, sliderRestX);
            else midCard.setTrac('Previous', ts[ts.length - 1]);
        } else if (numSinceAdj == 2) {
            if (prevStage === 'RESULTS' && !switchedWatch) {
                midCard.setTrac('Previous', ts[ts.length - 1], 'SLIDE', midTwn, svgWidth - C.width, sliderRestX);
                leftCard.setTrac('Oldest', ts[ts.length - numSinceAdj], 'SLIDE', leftTwn, sliderRestX, 0);
            } else {
                midCard.setTrac('Previous', ts[ts.length - 1]);
                leftCard.setTrac('Oldest', ts[ts.length - numSinceAdj]);
            }
        } else {
            if (prevStage === 'RESULTS' && !switchedWatch) {
                extraCard.setTrac('Previous', ts[ts.length - 2], 'SLIDE_DISAPEAR', extraTwn, sliderRestX, 0);
                midCard.setTrac('Previous', ts[ts.length - 1], 'SLIDE', midTwn, svgWidth - C.width, sliderRestX);
            } else {
                midCard.setTrac('Previous', ts[ts.length - 1]);
            }
            leftCard.setTrac('Oldest', ts[ts.length - numSinceAdj]);
        }
    }
    prevStage = $tage;
}

function startDrag(e) {
    if (e instanceof MouseEvent && e.buttons > 1) return; // bad way to ignore mouse other than left click
    mouseButtDown = true;
    moving = true;
    touchLastX = (e.targetTouches) ? e.targetTouches[0].pageX : undefined;
    dragMove(e); // stops a "spinning" midCard immediately, otherwise movement is required.
}

/**
 * Called at the end of a finger/mouse drag and then call recursively by this everytime the mid 
 * Card still has enough speed to move the card.
 */
function stopDrag() {
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
        let flickable = false; // if there isn't a stack available to "flick" ensure we don't try
        let toLoc, respawnLoc;
        moveSpeed -= moveSpeed * 0.35;
        if (moveSpeed > 0) {
            toLoc = svgWidth - C.width;
            respawnLoc = 0;
            flickable = leftStack > 0;
        } else {
            toLoc = 0;
            respawnLoc = svgWidth - C.width;
            flickable = rightStack > 0;
        }
        if (Math.abs(moveSpeed) > minSkipSpeed && flickable) {
            midTwn.set(toLoc, spdToDur($midTwn, toLoc, Math.abs(moveSpeed))).then(() => {
                midTwn.set(respawnLoc, {duration:0}).then(() => {
                    // trac "flick" accomplished, change which trac the midCard is showing.
                    leftStack += (moveSpeed > 0) ? -1 : 1;
                    rightStack = maxStack - leftStack;
                    midCard.trac = $watches[0].tracs[$watches[0].tracs.length - rightStack - 2];
                    stopDrag();
                });
            });
            return;
        } else moveSpeed = undefined;
    }

    moving = false;
    touchLastX = undefined;

    midTwn.set(sliderRestX, spdToDur(sliderRestX, $midTwn, minSkipSpeed));
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
    if (!moving || !mouseButtDown || $tage !== 'RESULTS' || maxStack < 1) return;

    let ml = {
        secs: Date.now(),
        move: (e.movementX != undefined) ? e.movementX : e.targetTouches[0].pageX - touchLastX
    };
    ml.speed = (moveLog && moveLog.length > 0) ? ml.move / (ml.secs - moveLog[moveLog.length - 1].secs) : undefined;

    $midTwn = ml.move + $midTwn;
    touchLastX = (e.targetTouches) ? e.targetTouches[0].pageX : undefined;
    if ($midTwn < 0) $midTwn = 0;
    else if ($midTwn >= svgWidth - C.width) $midTwn = svgWidth - C.width;

    if (!moveLog) moveLog = [];
    moveLog.push(ml);
    if (moveLog.length > 5) moveLog = moveLog.splice(moveLog.length - 5);
}

/**
 * Returns the seconds per day rounded to one decimal place that the two tracs indicate a drift from
 * the system time.
 * @param at The earlier trac
 * @param bt The later trac
 */
function calcSpd(at, bt) {
    let sysTimeSpan = at.sysDate.getTime() - bt.sysDate.getTime();
    let watchTimeSpan = at.watchDate.getTime() - bt.watchDate.getTime();
    let millisPerSpan = watchTimeSpan - sysTimeSpan;
    let sysDaySpan = sysTimeSpan / (1000 * 60 * 60 * 24);
    return Math.round(millisPerSpan / sysDaySpan / 100) / 10;
}
</script>

<svelte:window on:mouseup={stopDrag} on:touchend={stopDrag} on:touchcancel={stopDrag} on:mousemove={dragMove} on:touchmove={dragMove}/>

<div id="sliders" bind:clientWidth={svgWidth}><svg on:mousedown={startDrag} on:touchstart={startDrag} width=100% height="296">
    <!-- The card stack bases -->
    <defs><g id='stackBase'>
        <rect rx="25" ry="25" width={C.width} height={C.height} fill="#DDD"/>
        <text x="{C.width/2 + 14}" y="{C.height/2}">Watch Sync</text>
        <text x="{C.width/2 - 10}" y="{C.height/2}">Snapshot</text>
    </g></defs>
    <use x={0} y='0' href='#stackBase'/>
    <use x={(svgWidth - C.width) / 2} y='0' href='#stackBase'/>
    <use x={svgWidth - C.width} y='0' href='#stackBase'/>

    <!-- The SPD results area -->
    <rect rx="25" ry="25" x={spdBase.x} y={spdBase.y} width={spdBase.width} height={spdBase.height} fill="#DDD"/>
    <text class="spdBaseText" x={spdBase.x + spdBase.width / 2} y={spdBase.y + spdBase.height / 2 + 10}>Watch Drift In SPD</text>

    {#if leftCard.trac && midCard.trac}
        <path stroke="#999" stroke-width=3 fill="transparent" d="
            M {C.width / 2} {C.height}
            Q {C.width / 2} {spdLRes.y} {spdLRes.x} {spdLRes.y}
            T {spdMRes.x} {C.height}"/>
        <circle cx={spdLRes.x} cy={spdLRes.y} r={spdResRad} stroke="#999" stroke-width=3 fill="lightblue"/>
        <text x={spdLRes.x} y={spdLRes.y + 6}>{calcSpd(leftCard.trac, midCard.trac)}</text>
    {/if}
    {#if midCard.trac && rightCard.trac}
        <path stroke="#999" stroke-width=3 fill="transparent" d="
            M {spdMRes.x} {C.height}
            Q {spdMRes.x} {spdRRes.y} {spdRRes.x} {spdRRes.y}
            T {svgWidth - (C.width / 2)} {C.height}"/>
        <circle cx={spdRRes.x} cy={spdRRes.y} r={spdResRad} stroke="#999" stroke-width=3 fill="lightblue"/>
        <text x={spdRRes.x} y={spdRRes.y + 6}>{calcSpd(midCard.trac, rightCard.trac)}</text>
    {/if}
    {#if leftCard.trac && rightCard.trac}
        <path stroke="#999" stroke-width=3 fill="transparent" d="
            M {C.width / 2} {C.height}
            Q {C.width / 2} {spdMRes.y} {spdMRes.x} {spdMRes.y}
            T {svgWidth - (C.width / 2)} {C.height}"/>
        <circle cx={spdMRes.x} cy={spdMRes.y} r={spdResRad} stroke="#999" stroke-width=3 fill="lightblue"/>
        <text x={spdMRes.x} y={spdMRes.y + 6}>{calcSpd(leftCard.trac, rightCard.trac)}</text>
    {/if}
    {#if $tage === 'RESULTS'}
        {#if leftStack > 0}
            <path stroke="#999" stroke-width=3 fill="transparent" d="
                M {(svgWidth + midCard.width) / 2} {midCard.height / 2 - DI_RAD}
                l {DI_RAD / 4} 0 a {DI_RAD} {DI_RAD} 0 0 1 0 {DI_RAD * 2} l -{DI_RAD / 4} 0
                M {(svgWidth + midCard.width) / 2 + DI_RAD / 1.6 - DI_RAD * 0.5} {midCard.height / 2 - DI_RAD / 1.6}
                l {DI_RAD / 1.6} {DI_RAD / 1.6} l -{DI_RAD / 1.6} {DI_RAD / 1.6}
                m {DI_RAD * 0.3} 0
                l {DI_RAD / 1.6} -{DI_RAD / 1.6} l -{DI_RAD / 1.6} -{DI_RAD / 1.6}"/>
        {/if}
        {#if rightStack > 0}
            <path stroke="#999" stroke-width=3 fill="transparent" d="
                M {(svgWidth - midCard.width) / 2} {midCard.height / 2 - DI_RAD}
                l -{DI_RAD / 4} 0 a {DI_RAD} {DI_RAD} 0 0 0 0 {DI_RAD * 2} l {DI_RAD / 4} 0
                M {(svgWidth - midCard.width) / 2 - DI_RAD / 1.6 + DI_RAD * 0.5} {midCard.height / 2 - DI_RAD / 1.6}
                l -{DI_RAD / 1.6} {DI_RAD / 1.6} l {DI_RAD / 1.6} {DI_RAD / 1.6}
                m -{DI_RAD * 0.3} 0
                l -{DI_RAD / 1.6} -{DI_RAD / 1.6} l {DI_RAD / 1.6} -{DI_RAD / 1.6}"/>
        {/if}
    {/if}
    {#if extraCard.trac}
        <svg width={extraCard.width} height={extraCard.height} x={extraCard.x} y='0'>
            <rect x={extraCard.stroke / 2} y={extraCard.stroke / 2} rx="25" ry="25" width={extraCard.width - extraCard.stroke}
                height={extraCard.height - extraCard.stroke} stroke="black" fill="lightblue" stroke-width={extraCard.stroke}/>
            <text class="ch" x="50%" y="{1 + extraCard.topMarginEm}em">{extraCard.getTitle()}</text>
            <line x1="0" y1="2.2em" x2={extraCard.width} y2="2.2em" stroke="black" stroke-width={extraCard.stroke}/>
            <text class="ch" x="50%" y="{3 + extraCard.topMarginEm}em">System</text>
            <text class="cd" x="50%" y="{4 + extraCard.topMarginEm}em">{extraCard.getSysDate()}</text>
            <text class="cd" x="50%" y="{5 + extraCard.topMarginEm}em">{extraCard.getSysTime()}</text>
            <line x1="0" y1="6.2em" x2={extraCard.width} y2="6.2em" stroke="black" stroke-width={extraCard.stroke}/>
            <text class="ch" x="50%" y="{7 + extraCard.topMarginEm}em">Watch</text>
            <text class="cd" x="50%" y="{8 + extraCard.topMarginEm}em">{extraCard.getWatchTime()}</text>
            <line x1="0" y1="9.2em" x2={extraCard.width} y2="9.2em" stroke="black" stroke-width={extraCard.stroke}/>
            <text class="ch" x="50%" y="{10 + extraCard.topMarginEm}em">Diff</text>
            <text class="cd" x="50%" y="{11 + extraCard.topMarginEm}em">{extraCard.getDiff()}</text>
        </svg>
    {/if}
    {#if midCard.trac}
        <svg width={midCard.width} height={midCard.height} x={midCard.x} y='0'>
            <rect x={midCard.stroke / 2} y={midCard.stroke / 2} rx="25" ry="25" width={midCard.width - midCard.stroke}
                height={midCard.height - midCard.stroke} stroke="black" fill="lightblue" stroke-width={midCard.stroke}/>
            <text class="ch" x="50%" y="{1 + midCard.topMarginEm}em">{midCard.getTitle()}</text>
            <line x1="0" y1="2.2em" x2={midCard.width} y2="2.2em" stroke="black" stroke-width={midCard.stroke}/>
            <text class="ch" x="50%" y="{3 + midCard.topMarginEm}em">System</text>
            <text class="cd" x="50%" y="{4 + midCard.topMarginEm}em">{midCard.getSysDate()}</text>
            <text class="cd" x="50%" y="{5 + midCard.topMarginEm}em">{midCard.getSysTime()}</text>
            <line x1="0" y1="6.2em" x2={midCard.width} y2="6.2em" stroke="black" stroke-width={midCard.stroke}/>
            <text class="ch" x="50%" y="{7 + midCard.topMarginEm}em">Watch</text>
            <text class="cd" x="50%" y="{8 + midCard.topMarginEm}em">{midCard.getWatchTime()}</text>
            <line x1="0" y1="9.2em" x2={midCard.width} y2="9.2em" stroke="black" stroke-width={midCard.stroke}/>
            <text class="ch" x="50%" y="{10 + midCard.topMarginEm}em">Diff</text>
            <text class="cd" x="50%" y="{11 + midCard.topMarginEm}em">{midCard.getDiff()}</text>
        </svg>
    {/if}
    {#if leftCard.trac}
        {#if leftStack > 0}
            <path d="M {(leftCard.width - 24 - 3) + 3 * Math.min(5, leftStack)} 0
                a 26 26 0 0 1 26 26
                l 0 {leftCard.height - 53}
                a 26 26 0 0 1 -26 26" fill="#DDD"/>
            {#each {length:Math.min(5, leftStack)} as unusued, i}
            <path d="M {(leftCard.width - 24) + 3 * i} 0
                a 26 26 0 0 1 26 26
                l 0 {leftCard.height - 53}
                a 26 26 0 0 1 -26 26" stroke="#999" stroke-width="1.5" fill="transparent"/>
            {/each}
            {#if leftStack > 5}
                <rect x={leftCard.width - 1} y=30 width=15 height=15 stroke="#999" fill="#DDD" stroke-width=1/>
                <text class="stack-height" x={leftCard.width + 6} y=42>{leftStack}</text>
            {/if}
        {/if}
        <svg width={leftCard.width} height={leftCard.height} x={leftCard.x} y='0'>
            <rect x={leftCard.stroke / 2} y={leftCard.stroke / 2} rx="25" ry="25" width={leftCard.width - leftCard.stroke}
                height={leftCard.height - leftCard.stroke} stroke="black" fill="lightblue" stroke-width={leftCard.stroke}/>
            <text class="ch" x="50%" y="{1 + leftCard.topMarginEm}em">{leftCard.getTitle()}</text>
            <line x1="0" y1="2.2em" x2={leftCard.width} y2="2.2em" stroke="black" stroke-width={leftCard.stroke}/>
            <text class="ch" x="50%" y="{3 + leftCard.topMarginEm}em">System</text>
            <text class="cd" x="50%" y="{4 + leftCard.topMarginEm}em">{leftCard.getSysDate()}</text>
            <text class="cd" x="50%" y="{5 + leftCard.topMarginEm}em">{leftCard.getSysTime()}</text>
            <line x1="0" y1="6.2em" x2={leftCard.width} y2="6.2em" stroke="black" stroke-width={leftCard.stroke}/>
            <text class="ch" x="50%" y="{7 + leftCard.topMarginEm}em">Watch</text>
            <text class="cd" x="50%" y="{8 + leftCard.topMarginEm}em">{leftCard.getWatchTime()}</text>
            <line x1="0" y1="9.2em" x2={leftCard.width} y2="9.2em" stroke="black" stroke-width={leftCard.stroke}/>
            <text class="ch" x="50%" y="{10 + leftCard.topMarginEm}em">Diff</text>
            <text class="cd" x="50%" y="{11 + leftCard.topMarginEm}em">{leftCard.getDiff()}</text>
        </svg>
    {/if}
    {#if rightStack > 0}
        <path d="
            M {(svgWidth - C.width + 24 + 3) - 3 * Math.min(5, rightStack)} 0
            a 26 26 0 0 0 -26 26
            l 0 {rightCard.height - 53}
            a 26 26 0 0 0 26 26" fill="#DDD"/>
        {#each {length:Math.min(5, rightStack)} as unusued, i}
        <path d="M {(svgWidth - C.width + 24) - 3 * i} 0
            a 26 26 0 0 0 -26 26
            l 0 {rightCard.height - 53}
            a 26 26 0 0 0 26 26" stroke="#999" stroke-width="1.5" fill="transparent"/>
        {/each}
        {#if rightStack > 5}
            <rect x={svgWidth - C.width + 1 - 15} y=30 width=15 height=15 stroke="#999" fill="#DDD" stroke-width=1/>
            <text class="stack-height" x={svgWidth - C.width + 8 - 15} y=42>{rightStack}</text>
        {/if}
    {/if}
    {#if rightCard.trac}
        <svg width={rightCard.width} height={rightCard.height} x={rightCard.x} y='0'>
            <rect x={rightCard.stroke / 2} y={rightCard.stroke / 2} rx="25" ry="25" width={rightCard.width - rightCard.stroke}
                height={rightCard.height - rightCard.stroke} stroke="black" fill="lightblue" stroke-width={rightCard.stroke}/>
            <text class="ch" x="50%" y="{1 + rightCard.topMarginEm}em">{rightCard.getTitle()}</text>
            <line x1="0" y1="2.2em" x2={rightCard.width} y2="2.2em" stroke="black" stroke-width={rightCard.stroke}/>
            <text class="ch" x="50%" y="{3 + rightCard.topMarginEm}em">System</text>
            <text class="cd" x="50%" y="{4 + rightCard.topMarginEm}em">{rightCard.getSysDate()}</text>
            <text class="cd" x="50%" y="{5 + rightCard.topMarginEm}em">{rightCard.getSysTime()}</text>
            <line x1="0" y1="6.2em" x2={rightCard.width} y2="6.2em" stroke="black" stroke-width={rightCard.stroke}/>
            <text class="ch" x="50%" y="{7 + rightCard.topMarginEm}em">Watch</text>
            <text class="cd" x="50%" y="{8 + rightCard.topMarginEm}em">{rightCard.getWatchTime()}</text>
            <line x1="0" y1="9.2em" x2={rightCard.width} y2="9.2em" stroke="black" stroke-width={rightCard.stroke}/>
            <text class="ch" x="50%" y="{10 + rightCard.topMarginEm}em">Diff</text>
            <text class="cd" x="50%" y="{11 + rightCard.topMarginEm}em">{rightCard.getDiff()}</text>
        </svg>
    {/if}
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
.stack-height {
    font-size: 72%;
}
#stackBase text {
    writing-mode: tb;
    font-weight: bold;
    font-size: x-large;
    fill: #BBB;
}
.spdBaseText {
    font-weight: bold;
    font-size: xx-large;
    fill: #BBB;
}
</style>