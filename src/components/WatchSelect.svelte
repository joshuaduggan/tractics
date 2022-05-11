<script>
import * as tm from '../tracmanager.js'; // use tm prefix for clarity
import { watches, activeId } from '../tracmanager.js'; // import watches and activeId specificaly for brevity

function addWatch() {
    let susNewName = prompt("Name of the new Watch"); // get a potentially malicious name from the user
    if (!isNewWatchNameOk(susNewName)) {
        $activeId = $watches[0].id; // reset select ele to first watch in list
        return;
    }
    tm.addWatch(susNewName);
    selected();
}

function renameWatch() {
    // get a potentially malicious name from the user
    let susNewName = prompt('Enter new name for ' + escapeForHTML($watches[0].susName));
    if (!isNewWatchNameOk(susNewName)) return;
    $watches[0].susName = susNewName;
    $activeId = $watches[0].id;
}

function deleteWatch() {
    if ($watches.length <= 1) {
        alert('You must have at least one Watch, create a new Watch to delete ' +
            escapeForHTML($watches[0].susName));
        $activeId = $watches[0].id;
        return;
    }
    if (!confirm('Are you sure you want to permanently delete ' +
            escapeForHTML($watches[0].susName) + ' and all it\'s records?')) {
        $activeId = $watches[0].id;
        return;
    }
    tm.deleteWatch();
    $activeId = $watches[0].id;
}

function isNewWatchNameOk(susNewName) {
    if (!susNewName) return false; // if it was canceled or nothing entered
    if ($watches.find(w => w.susName === susNewName)) {
        alert("That name already exists");
        return false;
    }
    return true;
}

/**
 * Calls the relevant action method or moves the newly selected watch to the top of the 
 * selected list
 */
function selected() {
    // code to deal with non-watch stuff
    switch ($activeId) {
        case undefined:// needed because this gets called on load before initialized
            return;
        case 'ADD':
            addWatch();
            return;
        case 'RENAME':
            renameWatch();
            return;
        case 'DELETE':
            deleteWatch();
            return;
    }
    // move the selected watch to the front of the array
    tm.moveWatch($activeId);
}

function escapeForHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
            '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
        }[tag] || tag));
}
</script>

<select bind:value={$activeId} on:change={selected}>
{#each $watches as watch}
    <option value={watch.id}>{escapeForHTML(watch.susName)}</option>
{/each}
    <option value='' disabled>--------------</option>
    <option value='ADD'>Add A New Watch</option>
    <option value='RENAME'>Rename Active Watch</option>
    <option value='DELETE'>Delete Active Watch</option>
</select>
