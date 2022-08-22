<script>
    import { tweened } from 'svelte/motion';
    
    let moving = false;
    let touchLastX;
    const minSkipSpeed = 0.5;
    let svgWidth = 300;
    let date = new Date();
    let card = {
        width: 88,
        height: 196,
        stroke: 2,
        topMarginEm: 0.5,
        sysDateStr: date.toLocaleDateString(undefined, {month: '2-digit', day: '2-digit', year: '2-digit'}),
        sysTimeStr: date.toLocaleTimeString(undefined, {hour12: false}),
        watchTimeStr: date.toLocaleTimeString(undefined, {hour12: false})
    };
    const sliderXInit = (svgWidth - card.width) / 2;
    const twn = tweened(sliderXInit, {duration:0});
    let moveLog = [];
    let moveSpeed;
    
    function start(e) {
        moving = true;
        touchLastX = (e.targetTouches) ? e.targetTouches[0].pageX : undefined;
    }
    
    function stop() { // called at the end of a finger/mouse drag
    
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
                toLoc = svgWidth - card.width;
                respawnLoc = 0;
            } else {
                toLoc = 0;
                respawnLoc = svgWidth - card.width;
            }
            moveSpeed -= moveSpeed * 0.35;
            if (Math.abs(moveSpeed) > minSkipSpeed) {
                twn.set(toLoc, spdToDur($twn, toLoc, Math.abs(moveSpeed))).then(() => {
                    twn.set(respawnLoc, {duration:0}).then(() => {stop();});
                });
                return;
            } else moveSpeed = undefined;
        }
    
        moving = false;
        touchLastX = undefined;
    
        twn.set(sliderXInit, spdToDur(sliderXInit, $twn, minSkipSpeed));
    }
    
    /**
     * 
     * @param begin
     * @param end
     * @param speed pixels moved / millis elapsed
     */
    function spdToDur(begin, end, speed) {
        return {duration: Math.abs(end - begin) / speed};
    }
    
    function move(e) { // called during a finger/mouse drag
        if (!moving) return;
    
        let ml = {
            secs: Date.now(),
            move: (e.movementX != undefined) ? e.movementX : e.targetTouches[0].pageX - touchLastX
        };
        ml.speed = (moveLog && moveLog.length > 0) ? ml.move / (ml.secs - moveLog[moveLog.length - 1].secs) : undefined;
    
        $twn = ml.move + $twn;
        touchLastX = (e.targetTouches) ? e.targetTouches[0].pageX : undefined;
        if ($twn < 0) $twn = 0;
        else if ($twn >= svgWidth - card.width) $twn = svgWidth - card.width;
    
        if (!moveLog) moveLog = [];
        moveLog.push(ml);
        if (moveLog.length > 5) moveLog = moveLog.splice(moveLog.length - 5);
    }
    </script>
    
    <svelte:window on:mouseup={stop} on:touchend={stop} on:touchcancel={stop} on:mousemove={move} on:touchmove={move}/>
    <svg on:mousedown={start} on:touchstart={start} width={svgWidth} height="230">
        <defs>
            <svg id='card' width={card.width} height="{card.height}">
                <rect x={card.stroke / 2} y={card.stroke / 2} rx="25" ry="25" width={card.width - card.stroke}
                    height={card.height - card.stroke} stroke="black" fill="lightblue" stroke-width={card.stroke}/>
                    <text class="ch" x="50%" y="{1 + card.topMarginEm}em">Current</text>
                    <line x1="0" y1="2.2em" x2={card.width} y2="2.2em" stroke="black" stroke-width={card.stroke}/>
                    <text class="ch" x="50%" y="{3 + card.topMarginEm}em">System</text>
                    <text class="cd" x="50%" y="{4 + card.topMarginEm}em">{card.sysDateStr}</text>
                    <text class="cd" x="50%" y="{5 + card.topMarginEm}em">{card.sysTimeStr}</text>
                    <line x1="0" y1="6.2em" x2={card.width} y2="6.2em" stroke="black" stroke-width={card.stroke}/>
                    <text class="ch" x="50%" y="{7 + card.topMarginEm}em">Watch</text>
                    <text class="cd" x="50%" y="{8 + card.topMarginEm}em">{card.watchTimeStr}</text>
                    <line x1="0" y1="9.2em" x2={card.width} y2="9.2em" stroke="black" stroke-width={card.stroke}/>
                    <text class="ch" x="50%" y="{10 + card.topMarginEm}em">Diff</text>
                    <text class="cd" x="50%" y="{11 + card.topMarginEm}em">-3.4s</text>
                </svg>
        </defs>
    
        <rect width="100%" height="100%" fill='lightgray'/>
    
        <use xlink:href='#card' x={$twn} y='10'/>
        <use xlink:href='#card' x="0" y="10"/>
        <use xlink:href='#card' x={svgWidth - card.width} y="10"/>
    
    </svg>
    
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