import * as readline from 'readline';
import * as fs from 'fs';

interface Snap {
  wasWatchAdj: boolean,
  sysDT: Date,
  watchDT: Date,
  // Following are never read, are only written to file to assist debugging.
  hoursSinceLastAdj?: number,
  spdOffSinceLastAdj?: number//,
  //secondsOff?: number,
  //relativeImportanceSinceLastAdj?: number,
  //spdOffModeratedTotal?: number
}

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let wasAdjusted = false;
let dSnaped:Date;
let snapedIndGuess:Date;
let snapedIndicated:Date;
let millisOff:number;
let fileName:string;
let snaps:Array<Snap>;

// Requires a one word argument to a JSON file. "myWatch", "MyWatch.json" are both valid and will open the
// same file, "My Watch.json" is invalid.
if (process.argv.length != 3) {
  console.error('ERROR: Requires one argument for the JSON file to read and write. ' +
      'If file doesn\'t exist it will be created.');
  process.exit(1);
}
fileName = process.argv[2];
if (!fileName.toLocaleLowerCase().endsWith('.json')) {
  fileName += '.json';
}
if (fs.existsSync(fileName)) {
  let rawData = fs.readFileSync(fileName).toString();
  snaps = <Snap[]>JSON.parse(rawData);
  // !!! For whatever reason JSON isn't recreating the Dates, is instead only
  // recreating them as strings. So I'm rebuilding the dates manually here !!!
  snaps.forEach((s:Snap) => {
    s.sysDT = new Date(s.sysDT);
    s.watchDT = new Date(s.watchDT);
  });
} else {
  snaps = [];
}

getInputWasAdjusted();

function getInputWasAdjusted() {
  rl.question('Has the watch\'s time been adjusted since this was last run? [y|*] ' , (answer:string) => {
    wasAdjusted = answer.toLowerCase() === 'y';
    getInputSnapshot();
  });
}

function getInputSnapshot() {
  rl.question('Hit enter at 15, 30, 45, or 60 seconds [*] ', (answer:string) => {
    dSnaped = new Date();
    // If NOT wasAdjusted get the basis for how far this watch is from the
    // system time based on the previous snap. If wasAdjusted then just use the
    // system time.
    let guessGoal = dSnaped;
    if (!wasAdjusted && snaps.length > 0) {
      let ps = snaps[snaps.length - 1];
      snapedIndGuess = new Date(dSnaped.valueOf() -
          (ps.sysDT.valueOf() - ps.watchDT.valueOf()));
      guessGoal = new Date(snapedIndGuess.valueOf());
    } else {
      snapedIndGuess = new Date(dSnaped.valueOf());
    }
    // start by setting the guess back 1 minute and 15 seconds.
    snapedIndGuess = new Date(snapedIndGuess.valueOf() - 75000);
    // round the date off to the nearest minute.
    snapedIndGuess = new Date(Math.round(snapedIndGuess.valueOf() / 60000) * 60000);
    // move the date forward in 15 sec increments till it's the closest.
    let prevDiff = 100000;
    while (true) {
      let currDate = new Date(snapedIndGuess.valueOf() + 15000);
      let currDiff = guessGoal.valueOf() - currDate.valueOf();
      if (currDiff < 0) currDiff *= -1;
      if (currDiff > prevDiff) {
        break;
      } else {
        prevDiff = currDiff;
        snapedIndGuess = currDate;
      }
    }
    getInputSnapedIndicated();
  })
}

function getInputSnapedIndicated() {
  rl.question('Was the watch showing ' + snapedIndGuess.toLocaleTimeString() + '? [a|r|*] ',
       (answer:string) => {
    let secondChange = 0;
    switch (answer.toLocaleLowerCase()) {
      case 'a' :
        secondChange = 30;
      case 'r' :
        secondChange -= 15;
        snapedIndGuess.setSeconds(snapedIndGuess.getSeconds() + secondChange);
        getInputSnapedIndicated();
        break;
      default :
        snapedIndicated = snapedIndGuess;
        millisOff = snapedIndicated.valueOf() - dSnaped.valueOf();
        rl.close();
        writeObservation();
    }
  });
}

function writeObservation() {
  let millisSinceLastAdj = 0;
  let millisOffAfterLastAdj = undefined;
  for (let i = snaps.length - 1; i >= 0; i--) {
    millisSinceLastAdj = dSnaped.getTime() - snaps[i].sysDT.getTime();
    millisOffAfterLastAdj = snaps[i].watchDT.getTime() - snaps[i].sysDT.getTime();
    if (snaps[i].wasWatchAdj) break;
  }
  let ns:Snap = {wasWatchAdj: wasAdjusted, sysDT: dSnaped, watchDT: snapedIndicated,
      //secondsOff: Math.round(millisOff / 100) / 10,
      hoursSinceLastAdj: Math.round(millisSinceLastAdj / 1000 / 60 / 6) / 10};
  if (millisOffAfterLastAdj) {
    let millisDifBetweenSnaps = millisOff - millisOffAfterLastAdj;
    let mspdOffSinceLastAdj = millisDifBetweenSnaps / millisSinceLastAdj * 1000 * 60 * 60 * 24;
    ns.spdOffSinceLastAdj = Math.round(mspdOffSinceLastAdj / 100) / 10;
  }
  if (ns.wasWatchAdj) {
    ns.hoursSinceLastAdj = undefined;
    ns.spdOffSinceLastAdj = undefined;
  }
  // the new Snap is now complete
  snaps[snaps.length] = ns;
  // output sumary to console
  console.log('Your watch is now ' + Math.round(millisOff / 100) / 10 + ' seconds off.');
  if (millisOffAfterLastAdj && !ns.wasWatchAdj) {
    console.log(`${ns.hoursSinceLastAdj} hours ago your watch was ` +
        `${Math.round(millisOffAfterLastAdj / 100) / 10} seconds off.`);
    console.log(`Your watch is off an average of ${ns.spdOffSinceLastAdj} SPD over this period.`);
  }
  // write the new Snap
  fs.writeFile(fileName, JSON.stringify(snaps, null, 2), (err) => {
    if (err) throw err;
    console.log('Data written to \"' + fileName + '\"');
  });
}