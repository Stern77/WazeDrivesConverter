function ToUTCTimeStamp(date) {

    var yyyy = date.getUTCFullYear();
    var gg = date.getUTCDate();
    var mm = (date.getUTCMonth() + 1);

    if (gg < 10)
        gg = "0" + gg;

    if (mm < 10)
        mm = "0" + mm;

    var cur_day = yyyy + "-" + mm + "-" + gg;

    var hours = date.getUTCHours()
    var minutes = date.getUTCMinutes()
    var seconds = date.getUTCSeconds();

    if (hours < 10)
        hours = "0" + hours;

    if (minutes < 10)
        minutes = "0" + minutes;

    if (seconds < 10)
        seconds = "0" + seconds;

    return cur_day + " " + hours + ":" + minutes + ":" + seconds + " UTC";

}

/*
   Knowledge how to deploy web services taken from:
   https://dev.to/codergirl1991/how-to-build-a-weather-converter-with-html-css-and-vanilla-javascript-part-4-deployment-28kg
*/

const fileSelector = document.getElementById('file-selector');
fileSelector.onchange = () => {

    document.getElementById("status").innerHTML = "File is being processed..."
    const file = fileSelector.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', event => {
        console.log('Inhalt:');

        try {
            var gpxmake = new Gpxmake({
                creator: "WazeDrivesConverter from https://stern77.github.io/WazeDrivesConverter",
                name: 'Waze Location Details',
                desc: 'This file shows drives from exported account_activity_3.csv from Waze',
                author: {
                    name: 'Stern77',
                    link: {
                        href: 'https://github.com/Stern77/',
                        text: 'Github',
                        type: 'web page'
                    }
                },
                time: new Date().toISOString()
            });

            var newTrack = {
                name: "ERROR: undefined track. Something went wrong.",
                points: []
            };

            i = 0;
            startSection = -1
            event.target.result.split(/\r?\n/).every((line) => {
                i++;
                //console.log('line: ', line);
                if (line === "Location details") {
                    console.log('startSection:', i)
                    startSection = i;
                    return true; // continue with next iteration
                } else if (line === "Login Details") {
                    console.log('endSection:', i)
                    startSection = -1;
                    return false; // exit loop
                }
                if (startSection > 0 && i > startSection + 1) {
                    // we are inside section 'LocationDetails'
                    // this section is formatted this way:
                    // UTCDateTime, UTCDateTime(latitude, longtitude)|UTCDateTime(latitude, longtitude)|...UTCDateTime(latitude, longtitude)
                    // or
                    // GTMDateTime, (longtitude, latitude)|(longtitude, latitude)|...(longtitude, latitude)
                    // where difinition of UTCDateTime, GTMDateTime:
                    // UTCDateTime is yyyy-mm-dd hh:MM:ss UTC
                    // GTMDateTime is yyyy-mm-dd hh:MM:ss GMT

                    // check which of the above two formats are present and parse it.
                    if ([...line].length < 24) {
                        // skip this line as it does not contain content of expected format
                        console.log('line skipped:', i)
                        return true;
                    }
                    if (line.substring(20, 23) === "UTC") {
                        console.log('UTC:', i)

                        var points = [];
                        var point = {
                            lat: "",
                            lon: ""
                        };
                        regExp = new RegExp(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\sUTC)\(([^()]+)\)/g); // find time and terms in parantheses
                        while(null != (currentMatch = regExp.exec(line))) {
                            console.log(currentMatch[1]);
                            let pointpair = currentMatch[2].split(/(\s+)/).filter((x) => x.trim().length>0); // find the next pair of point separated by whitespaces and eliminate all whitespaces after matching a point pair
                            let point = {}; // very important line. This disconnects the references to 'pointpair' of previous iteration assignment (lines below) to make a deep copy instead of a shallow copy!
                            point.lon = pointpair[1];
                            point.lat = pointpair[0];
                            point.time = currentMatch[1];
                            points.push(point);
                        }

                        newTrack = {
                            name: line.substring(0, 23), // use the DateTime of the track as name
                            points: points // assign the previous created array of points
                        };

                        gpxmake.addTrack(newTrack);
                        
                    } else if (line.substring(20, 23) === "GMT") {
                        console.log('GMT:', i)
                        
                        var points = [];
                        var point = {
                            lat: "",
                            lon: ""
                        };
                        regExp = new RegExp(/\(([^()]+)\)/g); // find terms in parantheses
                        while(null != (currentMatch = regExp.exec(line))) {
                            //console.log(currentMatch[1]);
                            let pointpair = currentMatch[1].split(/(\s+)/).filter((x) => x.trim().length>0); // find the next pair of point separated by whitespaces and eliminate all whitespaces after matching a point pair
                            let point = {}; // very important line. This disconnects the references to 'pointpair' of previous iteration assignment (lines below) to make a deep copy instead of a shallow copy!
                            point.lon = pointpair[0];
                            point.lat = pointpair[1];
                            points.push(point);
                        }

                        newTrack = {
                            name: line.substring(0, 23), // use the DateTime of the track as name
                            points: points // assign the previous created array of points
                        };

                        gpxmake.addTrack(newTrack);

                        //throw new Error("Rest is not yet coded!!!");

                    } else {
                        // unknown format
                        throw new Error("Unknown format in file!");
                    }


                }
                return true; // continue with next iteration
            });
            // let newLink = document.createElement("a");
            // const textToBLOB = new Blob([event.target.result], { type: 'text/plain' });
            // const sFileName = 'formData.txt';
            // newLink.download = sFileName;

            // if (window.webkitURL != null) {
            //     newLink.href = window.webkitURL.createObjectURL(textToBLOB);
            // }
            // else {
            //     newLink.href = window.URL.createObjectURL(textToBLOB);
            //     newLink.style.display = "none";
            //     document.body.appendChild(newLink);
            // }

            //newLink.click();

            /*
            var myTrack1 = {
                name: "Example Track",
                points: []
            };
            var myTrack2 = {
                name : "Noch einer",
                points: []
            };
            var pos = {
                lon: "11.860624216140083",
                lat: "54.9328621088893"
            };

            pos.lon = "11.2233";
            pos.lat = "54.4455";

            myTrack1.points.push(pos);
            myTrack1.name = "Testimal";

            gpxmake.addTrack(myTrack1);

            myTrack2.points.push(pos);
            myTrack2.name = "another Name";
            gpxmake.addTrack(myTrack2);

            */

            //gpxmake.addTrack(newTrack);

            document.getElementById("status").innerHTML = "Done! For another convertion choose the file account_activity_3.csv"
            gpxmake.download('WazeLocationDetails');
        } catch (err) {
            document.getElementById("status").innerHTML = "ERROR!!!";
            alert(err.message);
        }
    });
    reader.readAsText(file);
};
