<script>
import { watches, tage } from '../tracmanager.js';

let res = {
    sd: ['6/9/22', '6/10/22', '6/11/22'],
    st: ['12:00:00', '12:00:00', '12:00:00'],
    wt: ['12:00:00', '12:00:00', '12:00:00'],
    td: ['-32', '45', '-16'],
    so: ['-3.4', '4.0', '-1.3']
}
</script>

<table id="foot-table">
    <tr>
        <th></th>
        <th colspan="3">Recorded Times</th>
    </tr>
    <tr>
        <th></th>
        <th>Oldest</th>
        <th>Prev</th>
        <th>This</th>
    </tr>
    <tr>
        <th>System Date</th>
        <td>{res.sd[0]}</td>
        <td>{res.sd[1]}</td>
        <td>{res.sd[2]}</td>
    </tr>
    <tr>
        <th>System Time</th>
        <td>{res.st[0]}</td>
        <td>{res.st[1]}</td>
        <td>{res.st[2]}</td>
    </tr>
    <tr>
        <th>Watch Time</th>
        <td>{res.wt[0]}</td>
        <td>{res.wt[1]}</td>
        <td>{res.wt[2]}</td>
    </tr>
    <tr>
        <th>Time Diff</th>
        <td>{res.td[0]}</td>
        <td>{res.td[1]}</td>
        <td>{res.td[2]}</td>
    </tr>
    <tr>
        <th>SPD Off</th>
        <td>{res.so[0]}</td>
        <td>{res.so[1]}</td>
        <td>&larr;</td>
    </tr>
</table>

<style>
table, th, td {
    border-collapse: collapse;
    padding-left: 4px;
    padding-right: 4px;
}
td {
    text-align: right;
}
#foot-table {
	position: fixed;
    bottom: 0;
    width: 90%;
}
</style>