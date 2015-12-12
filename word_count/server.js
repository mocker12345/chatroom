/**
 * Created by rancongjie on 15/12/12.
 */
var fs = require('fs');
var completedTasks = 0;
var tasks = [];
var wordCount = {};
var fileDir = './text';

function checkIfCompleted() {
  completedTasks++;
  if (completedTasks === tasks.length) {
    for (var index in wordCount) {
      console.log(index + ":" + wordCount[index]);
    }
  }
}

function countWordInText(data) {
  var words = data.toString().toLowerCase().split(/\W+/).sort();
  console.log(words);
  for (var index in words) {
    var word = words[index];
    if (word) {
      wordCount[word] = (wordCount[word]) ? wordCount[word] + 1 : 1;
    }
  }
}

fs.readdir(fileDir, function (err, files) {
  console.log(files);
  if (err) throw err;
  for (var index in files) {
    var task = (function (file) {
      return function () {
        fs.readFile(file, function (err, data) {
          console.log(data);
          if (err) throw err;
          countWordInText(data);
          checkIfCompleted();
        });
      }
    })(fileDir + '/' + files[index]);
    tasks.push(task);
  }
  for (var index in tasks) {
    tasks[index]();
  }
});
