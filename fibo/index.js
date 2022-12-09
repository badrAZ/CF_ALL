const assert = require("assert");

function fibo(nb) {
  assert(typeof nb === "number" && nb >= 0);

  if (nb < 2) {
    return 1;
  }

  return fibo(nb - 1) + fibo(nb - 2);
}

function main(nb = 20) {
  nb = +nb;
  let result = "";

  for (let i = 0; i <= nb; i++) {
    result += `${fibo(i)} `;
  }

  return result;
}

function mainWithTwoParams(start, end) {
  let result = "";
  start = +start;
  end = +end;

  for (let i = start; i <= end; i++) {
    result += `${fibo(i)} `;
  }

  return result;
}

const [, , start, end] = process.argv;

if (end) {
  console.log(mainWithTwoParams(start, end));
} else {
  console.log(main(start));
}
