const fs = require("fs");
let readline = require("readline");
let cli = {};
const regex = new RegExp("[a-zA-Z]");

const findMatch = (first, second) => {
  // convert string into an array
  const sentence = `${first} matches ${second}`.split("");
  // create empty array to store the digits 2 for matches 1 for non matches
  let digits = [];

  // delete empty spaces
  for (let index = 0; index < sentence.length; index++) {
    if (sentence[index] === " ") {
      sentence.splice(index, 1);
    }
  }

  for (let i = 0; i < sentence.length; i++) {
    // Inner for loop
    let currentChar = sentence[i];
    let flag = false;
    // if 0 skip
    if (sentence[i] === "0") {
      continue;
    }
    for (let j = i + 1; j < sentence.length; j++) {
      // check if there is a match
      if (currentChar === sentence[j]) {
        // if matched push 2 to digits
        digits.push(2);
        // replace the found with 0
        sentence[j] = "0";
        sentence[i] = "0";

        // if found set flag to true
        flag = true;

        break;
      }
    }

    // if no match
    if (flag == false) {
      // add 1 to digits
      digits.push(1);
      // replace it with 0
      sentence[i] = "0";
    }
  }

  // match calc
  let tempDigits = [];
  let finalDigits = digits;
  while (finalDigits.length > 2) {
    while (digits.length > 0) {
      if (digits.length === 1) {
        tempDigits.push(digits.pop());
        break;
      }
      tempDigits.push(parseInt(digits.shift()) + parseInt(digits.pop()));
    }

    digits = tempDigits;
    tempDigits = [];

    let str = "";
    for (let x = 0; x < digits.length; x++) {
      str += digits[x];
    }

    digits = str.split("");

    finalDigits = digits;
  }

  if (parseInt(finalDigits[0] + finalDigits[1]) >= 80) {
    return `${first} matches ${second} ${parseInt(
      finalDigits[0] + finalDigits[1]
    )}%, good match`;
  } else {
    return `${first} matches ${second} ${parseInt(
      finalDigits[0] + finalDigits[1]
    )}%`;
  }
};

fs.readFile("goodMatchCSV.csv", "utf8", function (err, data) {
  const femaleData = new Map();
  const maleData = new Map();

  /* parse data */
  toArray = data.split("\r\n");
  for (let i = 0; i < toArray.length; i++) {
    const validAlphabet = regex.exec(toArray[i].split(",")[0]);

    if (!validAlphabet) {
      console.log(toArray[i].split(",")[0], "contains a non alphabet letter");
    } else if (toArray[i].split(",")[1] === "f") {
      femaleData.set(toArray[i].split(",")[0], toArray[i].split(",")[1]);
    } else if (toArray[i].split(",")[1] === "m") {
      maleData.set(toArray[i].split(",")[0], toArray[i].split(",")[1]);
    } else {
      console.log("Something went wrong neither m or f was identified");
      continue;
    }
  }

  var writeStream = fs.createWriteStream("output.txt");

  for (const female of femaleData.entries()) {
    for (const male of maleData.entries()) {
      writeStream.write(`${findMatch(male[0], female[0])} \r\n`);
    }
  }

  writeStream.end();
});

// Init function
cli.init = function () {
  // Send the start message to the console
  console.log("Goodmatch CLI");

  // Start the interface
  let interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ">",
  });

  let userInputs = [];
  let i = 0;
  const MAX_INPUTS = 2;
  cli.getUserInput = function () {
    interface.question(`${i + 1} - Enter first name `, function (input) {
      i++;
      const validAlphabet = regex.exec(input);
      if (!validAlphabet) {
        console.log("Only alphabet characters are allowed");

        interface.close();
        process.stdin.destroy();
        return;
      }
      userInputs.push(input);
      if (i < MAX_INPUTS) {
        cli.getUserInput();
      } else {
        interface.close();
        process.stdin.destroy();
        findMatch(userInputs[0], userInputs[1]);
      }
    });
  };

  cli.getUserInput();
};

// cli.init();
