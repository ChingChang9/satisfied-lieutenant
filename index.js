const fs = require("fs");
const proc = require("child_process").spawn("pbcopy");
const image = process.argv[2];

if (!image) {
  readFromFile("./images.json").then(data => {
    printColumns(JSON.parse(data));
    process.exit();
  });
} else {
  Promise.all([
    readFromFile("./discord.css"),
    readFromFile("./images.json")
  ]).then(result => {
    const css = result[0].toString();
    const images = JSON.parse(result[1]);

    const code = css.replace(/\$URL/g, images[image].url)
    .replace(/\$SHADOW/g, images[image].shadow);

    const compressed = `a=document.createElement("style"),b=document.createTextNode('${
      minify(code)
    }');a.appendChild(b),document.head.appendChild(a)`;

    fs.writeFileSync("./background", compressed);
    proc.stdin.write(compressed); proc.stdin.end();
  }).catch(error => {
    process.stdout.write("Unknown wallpaper\n");
    process.exit();
  });
}


function printColumns(object) {
  let counter = 1;
  for (const key in object) {
    process.stdout.write(key);
    if (counter % 3) {
      process.stdout.write(" ".repeat(15 - key.length));
    } else {
      process.stdout.write("\n");
    }
    counter++;
  }
  process.stdout.write("\n");
}

function minify(code) {
  return code.replace(/\/\*(.|\n)*?\*\//g, "") // comments
    .replace(/\s*(\{|\}|\[|\]|\(|\)|\:|\;|\,)\s*/g, "$1") // spaces around commas, brackets, and colons
    .replace(/#([\da-fA-F])\1([\da-fA-F])\2([\da-fA-F])\3/g, "#$1$2$3") // hexcodes to 3-hex
    .replace(/( |:)[\+\-]?0(rem|em|ec|ex|px|pc|pt|vh|vw|vmin|vmax|%|mm|cm|in|s)/g, "$10") // remove unit for 0s
    .replace(/( |:)0\.(\d+)/g, "$1.$2") // frontal 0s
    .replace(/\n/g, "") // new lines
    .replace(/;\}/g, "}") // ;s on last line
    .replace(/^\s+|\s+$/g, ""); // spaces
}

function readFromFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (error, data) => {
      if (error) reject(error);
      resolve(data);
    });
  });
}