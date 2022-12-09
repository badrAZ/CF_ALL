import { tests } from "./data.js"
import { rotateInPlace } from "./rotate_in_place.js"

const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

tests.forEach(function (test, index) {
    let testCase = test[0]
    let expected = test[1]

    testCase = rotateInPlace(testCase);

    if (false === equals(testCase, expected)) {
        console.log('---------', 'Testcase #' + index + ' failed', '---------', "\n")

        console.log('Actual:');
        testCase.forEach(function (v, k) {
            testCase[k] = v.join(', ')
        })
        console.log(testCase.join("\n"), "\n")

        console.log('Expected:')
        expected.forEach(function (v, k) {
            expected[k] = v.join(', ')
        })
        console.log(expected.join("\n"), "\n")
    } else {
        console.log("\n", 'Testcase #' + index + ' OK!')
    }
})
