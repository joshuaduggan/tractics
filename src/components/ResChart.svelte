<script>
/**
 * Just meant to test table layout and styling without running through an entire
 * sync everytime I change something during dev, should be not used and removed
 * for production.
 **/    

let sysTimeS = new Date().toLocaleTimeString().replace('AM', '').replace('PM', '');
let watchTimeS = new Date().toLocaleTimeString().replace('AM', '').replace('PM', '');
let diffS = '-45 s'
</script>

<table>
    <tr><th colspan=5 align="center">Since Latest Adjustment</th></tr>
    <tr>
        <th></th>
        <th>System</th>
        <th>Watch</th>
        <th>Diff</th>
        <th></th>
    </tr>
    <tr>
        <td>4.6 days ago:</td>
        <td>{sysTimeS}</td>
        <td>{watchTimeS}</td>
        <td>{diffS}</td>
        <td rowspan=2 class='spdres'>8.3 spd</td>
    </tr>
    <tr>
        <td>Now:</td>
        <td>{sysTimeS}</td>
        <td>{watchTimeS}</td>
        <td>{diffS}</td>
    </tr>
    <tr><td colspan=6>&nbsp;</td></tr>
    <tr><th colspan=5 align="center">Since Latest Measurement</th></tr>
    <tr>
        <th></th>
        <th>System</th>
        <th>Watch</th>
        <th>Diff</th>
        <th></th>
    </tr>
    <tr>
        <td>0.8 days ago:</td>
        <td>{sysTimeS}</td>
        <td>{watchTimeS}</td>
        <td>{diffS}</td>
        <td rowspan=2 class='spdres'>10.2 spd</td>
    </tr>
    <tr>
        <td>Now:</td>
        <td>{sysTimeS}</td>
        <td>{watchTimeS}</td>
        <td>{diffS}</td>
    </tr>
<!--    <tr><th colspan=6 align="center">Since Latest Measurement</th></tr>
    <tr>
        <td colspan=2></td>
        <th>System</th>
        <th>Watch</th>
        <th>Diff</th>
        <td></td>
    </tr>
    <tr>
        <th>16 hours ago</th>
        <td>{sysDateS}</td>
        <td>{sysTimeS}</td>
        <td>{watchTimeS}</td>
        <td>{diffS}</td>
        <td rowspan=2>10.1 spd</td>
    </tr>
    <tr>
        <th>Now</th>
        <td>{sysDateS}</td>
        <td>{sysTimeS}</td>
        <td>{watchTimeS}</td>
        <td>{diffS}</td>
    </tr> -->
</table>

<style>
table td + td, table th + th { border-left:1px solid; }
table, th, td {
/*     border: 1px solid;*/
   border-collapse: collapse;
   padding-left: 4px;
   padding-right: 4px;
}
.spdres {
    background-color: yellow;
}
</style>
<!-- <table>
    <tr><th colspan=3 align="center">Since Last Adjustment</th></tr>
    <tr>
        <td>{new Date().toLocaleDateString()}</td>
        <td>{new Date().toLocaleTimeString()}</td>
        <td>{new Date().toLocaleTimeString()}</td>
    </tr>
    <tr><td colspan=3 align="center">56 hours</td></tr>
    <tr>
        <td>{new Date().toLocaleDateString()}</td>
        <td>{new Date().toLocaleTimeString()}</td>
        <td>{new Date().toLocaleTimeString()}</td>
    </tr>
    <tr><td colspan=3 align="center">8.3 spd</td></tr>
    <tr><th colspan=3 align="center">Since Last Measurement</th></tr>
    <tr>
        <td>{new Date().toLocaleDateString()}</td>
        <td>{new Date().toLocaleTimeString()}</td>
        <td>{new Date().toLocaleTimeString()}</td>
    </tr>
    <tr><td colspan=3 align="center">12 hours</td></tr>
    <tr>
        <td>{new Date().toLocaleDateString()}</td>
        <td>{new Date().toLocaleTimeString()}</td>
        <td>{new Date().toLocaleTimeString()}</td>
    </tr>
    <tr><td colspan=3 align="center">10.5 spd</td></tr>
</table> -->