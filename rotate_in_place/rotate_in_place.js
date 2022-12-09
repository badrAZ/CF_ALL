export function rotateInPlace(matrix) {
  const newMatrix = [];
  matrix.forEach((l, x) =>
    l.forEach((v, y) => {
      if (newMatrix[y] === undefined) {
        newMatrix[y] = [];
      }
      newMatrix[y][l.length - x - 1] = v;
    })
  );
  return newMatrix;
}
