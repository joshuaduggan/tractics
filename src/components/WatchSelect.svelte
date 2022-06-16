<script>
import { onMount } from "svelte";
import Papa from 'papaparse';
import * as tm from '../tracmanager.js'; // use tm prefix for clarity
import { watches, tage } from '../tracmanager.js'; // import watches specificaly for brevity

let selectedId = 0;

let canWriteClipboard = false;
//!!! navigator.permissions and share api in general seems broken in iOS and effectively crashes the
// app that's why the ?. operator is used here. Hopefully it will work in future. !!!
navigator.permissions?.query({name: 'clipboard-write'}).then(r => canWriteClipboard = r.state == 'granted');

onMount(() => {
    watches.subscribe((ws) => {
        if (selectedId != ws[0].id) {
            selectedId = ws[0].id;
            $tage = 'SYNC';
        }
    });
    selectedId = $watches[0].id;
});

function addWatch() {
    let susNewName = prompt("Name of the new Watch"); // get a potentially malicious name from the user
    if (!isNewWatchNameOk(susNewName)) {
        return;
    }
    tm.addWatch(susNewName);
    selected();
}

function renameWatch() {
    // get a potentially malicious name from the user
    let susNewName = prompt('Enter new name for ' + tm.escapeForHTML($watches[0].susName));
    if (!isNewWatchNameOk(susNewName)) return;
    $watches[0].susName = susNewName;
}

function deleteWatch() {
    if ($watches.length <= 1) {
        alert('You must have at least one Watch, create a new Watch to delete ' +
            tm.escapeForHTML($watches[0].susName));
        return;
    }
    if (!confirm('Are you sure you want to permanently delete ' +
            tm.escapeForHTML($watches[0].susName) + ' and all it\'s records?')) {
        return;
    }
    tm.deleteWatch();
}

function isNewWatchNameOk(susNewName) {
    if (!susNewName) return false; // if it was canceled or nothing entered
    if ($watches.find(w => w.susName === susNewName)) {
        alert("That name already exists");
        return false;
    }
    return true;
}

function csvWatch() {
    navigator.clipboard.writeText(Papa.unparse($watches[0].tracs));
}

/**
 * Calls the relevant action method or moves the newly selected watch to the top of the 
 * selected list
 */
function selected() {
    if (Number.parseInt(selectedId)) {
        // move the selected watch to the front of the array
        tm.moveWatch(selectedId);
    } else {
        // code to deal with non-watch stuff
        switch (selectedId) {
            case 'ADD':
                addWatch();
                break;
            case 'RENAME':
                renameWatch();
                break;
            case 'DELETE':
                deleteWatch();
                break;
            case 'CSV':
                csvWatch();
                break;
            case undefined:// needed because this gets called on load before initialized
                return;
        }
    }
    selectedId = $watches[0].id;
    $tage = 'SYNC';
}
</script>

<select bind:value={selectedId} on:change={selected}>
{#each $watches as watch}
    <option value={watch.id}>{tm.escapeForHTML(watch.susName)}</option>
{/each}
    <option value='' disabled>--------------</option>
    <option value='ADD'>Add A New Watch</option>
    <option value='RENAME'>Rename "{tm.escapeForHTML($watches[0].susName)}"</option>
    <option value='DELETE'>Delete "{tm.escapeForHTML($watches[0].susName)}"</option>
    {#if (canWriteClipboard)}
        <option value='CSV'>Log "{tm.escapeForHTML($watches[0].susName)}" To Clipboard</option>
    {/if}
</select>

<style>
select {
    width: 80%;
}
</style>