export function drawKeypoints(keypoints, ctx) {
  keypoints.forEach((kp) => {
    if (kp.score > 0.5) {
      const { x, y } = kp;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#00FF00";
      ctx.fill();
    }
  });
}

export function drawSkeleton(keypoints, ctx) {
  const adjacentKeyPoints = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 11], [11, 12], [12, 6],
    [11, 13], [13, 15],
    [12, 14], [14, 16]
  ];
  adjacentKeyPoints.forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];
    if (kp1.score > 0.5 && kp2.score > 0.5) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}
