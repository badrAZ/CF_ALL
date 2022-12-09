function revert(str, nb) {
  nb = +nb

  let result = ''
  const regex = /[a-zA-Z]/

  for (let i = 0; i < str.length; i++) {
    const char = str[i]

    if(!regex.test(char)) {
      result += char
      continue
    }


    const codeAscii = char.charCodeAt(0)
    result += String.fromCharCode(codeAscii + nb)
  }

  console.log(result)
}

revert(process.argv[2], process.argv[3])