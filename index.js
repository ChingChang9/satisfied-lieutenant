const fs = require("fs");
const proc = require("child_process").spawn("pbcopy");
const image = process.argv[2] || "hayasaka";

Promise.all([
  readFromFile("./discord.css"),
  readFromFile("./images.json")
]).then((result) => {
  const css = result[0].toString();
  const images = JSON.parse(result[1]);

  const code = css.replace(/\$URL/g, images[image].url)
    .replace(/\$SHADOW/g, images[image].shadow);

  const compressed = `a=document.createElement("style"),b=document.createTextNode('${
    minify(code)
  }');a.appendChild(b),document.head.appendChild(a)`;

  fs.writeFileSync("./background", compressed);
  proc.stdin.write(compressed); proc.stdin.end();
});

function minify(code) {
  return code.replace(/\/\*(.|\n)*?\*\//g, "") // Remove comments
    .replace(/\s*(\{|\}|\[|\]|\(|\)|\:|\;|\,)\s*/g, "$1") // Remove commas and brackets
    .replace(/#([\da-fA-F])\1([\da-fA-F])\2([\da-fA-F])\3/g, "#$1$2$3") // hexcode to 3-hex
    .replace(/ [\+\-]?0(rem|em|ec|ex|px|pc|pt|vh|vw|vmin|vmax|%|mm|cm|in|)/g, " 0")
    .replace(/:[\+\-]?0(rem|em|ec|ex|px|pc|pt|vh|vw|vmin|vmax|%|mm|cm|in|)/g, ":0")
    .replace(/0\./g, ".") // Remove frontal 0
    .replace(/\n/g, "") // Remove new lines
    .replace(/;\}/g, "}") // Remove ; on last line
    .replace(/^\s+|\s+$/g, ""); // Remove spaces
}

function readFromFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (error, data) => resolve(data));
  });
}