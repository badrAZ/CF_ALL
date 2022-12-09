<?php

function rotateInPlace(array $matrix): array {
    $n = count($matrix);

    for($r = 0; $r < $n; $r++) {
        for($c = 0; $c < $n; $c++) {
            $matrix[$r][$c] = $matrix[$n - $c - 1][$r];
        }
    }

    return $matrix;
}
