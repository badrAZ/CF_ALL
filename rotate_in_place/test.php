<?php

include_once 'data.php';
include_once 'rotate_in_place.php';

foreach ($tests as $key => [$testCase, $expected]) {
    $testCase = rotateInPlace($testCase);

    if ($testCase != $expected) {
        print_r('--------- Testcase #' . $key . ' failed ---------' . PHP_EOL);

        print_r(PHP_EOL . 'Actual:' . PHP_EOL);
        foreach ($testCase as $k => $v) {
            $testCase[$k] = implode(', ', $v);
        }
        print_r(implode(PHP_EOL, $testCase) . PHP_EOL);

        print_r(PHP_EOL . 'Expected:' . PHP_EOL);
        foreach ($expected as $k => $v) {
            $expected[$k] = implode(', ', $v);
        }
        print_r(implode(PHP_EOL, $expected) . PHP_EOL . PHP_EOL);
    } else {
        print_r(PHP_EOL . 'Testcase #' . $key . ' OK!');
    }
}
