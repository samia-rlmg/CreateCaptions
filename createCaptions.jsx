//This script ingests a text file and creates a new text layer for each line.
// Steps:
// 1. Create a text file with the script broken up so that each caption is its own line.
// 2. Import the video file into After Effects.
// 3. Make any font specifications in the "Character" panel in After Effects.
// 4. Select the composition that contains the video file.
// 5. Go to File > Scripts > Run Script File and select this file.
// 6. Follow the directions, which will prompt you to select your caption file.
//    If you select an SRT file, it will align the captions according to the
//    timecodes. Otherwise, it will give each caption the same average duration.

// Only proceed if active comp exists
var activeComp = app.project.activeItem;
if (activeComp != null) {

  if (confirm("You must make any font specifications in the 'Character' Panel before continuing.\nReady to proceed?")) {

  var captionsFile = File.openDialog("Choose file containing captions.");
  var filePath = captionsFile.path+"/"+captionsFile.name;

  captionsFile.open('r'); //open file in read-only mode

  //Count the lines of captions
  var nlines = 0;
  while(!captionsFile.eof) {
    if (captionsFile.readln() != null) {
      nlines++;
    }
  }
  captionsFile.close();

  // Split up the filename to isolate the extension
  var filenameSplit = captionsFile.name.split(".");

  // If the filename is an SRT, import it this way
  if (filenameSplit[filenameSplit.length-1] == "srt" || filenameSplit[filenameSplit.length-1] == "SRT") {
    var str = "";
    var captionNumArr = [];
    var timeCodeArr = [];
    var captionTextArr = [];

    var line=0;

      captionsFile.open('r'); //open file in read-only mode
      while(!captionsFile.eof) {

        str = captionsFile.readln();

        if (str == "") {
          line = 0;
        } else {
          line++;
        }

        // Populate different arrays depending which line of the SRT is being read.
        if (line == 1) {
          captionNumArr.push(str);
        }
        if (line == 2) {
          timeCodeArr.push(str);
        }
        if (line == 3) {
          captionTextArr.push(str);
        }
        if (line == 4) {
          var index = captionTextArr.length - 1;
          captionTextArr[index] += " " + str;
        }

      }
      captionsFile.close();

      //Set the average length of a caption layer (divide total duration by number of captions)
      var clipDuration = activeComp.duration / nlines;
      var timestamp, inpoint, outpoint;

      for (i=0; i<captionNumArr.length; i++) {
        var newTextLayer = activeComp.layers.addText("a"); // Create a new text layer
        newTextLayer.sourceText.setValue(captionTextArr[i]); // Add text to the layer

        // Set the anchor point and position of the text layer
        newTextLayer.property("Anchor Point").setValue([newTextLayer.sourceRectAtTime(0,false).width/2,0]);
        newTextLayer.property("Position").setValue([newTextLayer.width/2,newTextLayer.height*.90]);

        timestamp = timeCodeArr[i].split(/:|,| --> /); // Split up the timecode as given by the SRT file

        //Define the inpoint and outpoint based on the timecodes in the SRT file
        inpoint = parseFloat(timestamp[0])*3600 + parseFloat(timestamp[1])*60 + parseFloat(timestamp[2]) + parseFloat(timestamp[3])/1000;
        outpoint = parseFloat(timestamp[4])*3600 + parseFloat(timestamp[5])*60 + parseFloat(timestamp[6]) + parseFloat(timestamp[7])/1000;

        if (inpoint > activeComp.duration || outpoint > activeComp.duration) {
          alert("Your caption time codes fall outside the length of your composition.");
        }

        //Set duration of clip
        newTextLayer.inPoint = inpoint;
        newTextLayer.outPoint = outpoint;
      }

    } else {

      //Set the average length of a caption layer (divide total duration by number of captions)
      var clipDuration = activeComp.duration / nlines;

      captionsFile.open('r'); //open file in read-only mode
      var str = "";
      var inpoint = 0;
      while(!captionsFile.eof) {

        str = captionsFile.readln();
        var newTextLayer = activeComp.layers.addText("a");
        newTextLayer.sourceText.setValue(str);

        newTextLayer.property("Anchor Point").setValue([newTextLayer.sourceRectAtTime(0,false).width/2,0]);
        newTextLayer.property("Position").setValue([newTextLayer.width/2,newTextLayer.height*.90]);

        //Set duration of clip
        newTextLayer.inPoint = inpoint;
        newTextLayer.outPoint = inpoint + clipDuration;
        inpoint = inpoint + clipDuration;
      }
      captionsFile.close();

    }

  }

}
