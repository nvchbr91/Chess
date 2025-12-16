export function drawBoard(ctx, cellSize, n, c1 = 'black', c2 = 'white') {
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? c1 : c2;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

export function drawPiece(ctx, piece, cellSize) {
    const size = piece.shape.size;
    const img = piece.shape.image;

    if (!img || !img.complete) return;

    const x = (piece.pos.x - 1) * cellSize + (cellSize - size) / 2;
    const y = (piece.pos.y - 1) * cellSize + (cellSize - size) / 2;

    ctx.drawImage(img, x, y, size, size);
}

export function drawDots(ctx, moves, cellSize, symbol = 'O', exclude = []) {
    ctx.fillStyle = 'green';
    ctx.font = `${cellSize / 3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const [x, y] of moves) {
        if (exclude.some(p => p.pos.x === x && p.pos.y === y)) continue;

        ctx.fillText(
            symbol,
            (x - 0.5) * cellSize,
            (y - 0.5) * cellSize
        );
    }
}

export function drawGlowCell(ctx, x, y, cellSize, lineWidth, color = 'cyan', blur = 25) {
    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;

    ctx.strokeRect(
        (x - 1) * cellSize,
        (y - 1) * cellSize,
        cellSize,
        cellSize
    );

    ctx.restore();
}

export function drawGlowCircle(ctx, x, y, cellSize, radius, color = 'cyan', blur = 25) {
    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = cellSize / 15;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;

    const cx = (x - 0.5) * cellSize;
    const cy = (y - 0.5) * cellSize;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

export function getPositionByMouse(e, canvas, rect, cellSize, moving) {
    const mx = Math.min(Math.max(e.clientX - rect.left, 0), canvas.width - 0.0001);
    const my = Math.min(Math.max(e.clientY - rect.top, 0), canvas.height - 0.0001);

    if (moving) {
        return {
            x: mx / cellSize + 0.5,
            y: my / cellSize + 0.5
        };
    }

    return {
        x: Math.floor(mx / cellSize) + 1,
        y: Math.floor(my / cellSize) + 1
    };
}

export function render(state) {
    const {
        ctx,
        canvas,
        cellSize,
        n,
        showValidMoves,
        dragging,
        cellPos,
        currentPiece,
        pieces,
    } = state;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard(ctx, cellSize, n);

    if ((showValidMoves % 2 === 1 || dragging) && currentPiece) {
        drawDots(ctx, currentPiece.validMoves, cellSize, 'O', currentPiece.takeAble);

        for (const target of currentPiece.takeAble) {
            drawGlowCircle(
                ctx,
                target.pos.x,
                target.pos.y,
                cellSize,
                cellSize / 3,
                "red"
            );
        }

        drawGlowCell(
            ctx,
            currentPiece.originPos.x,
            currentPiece.originPos.y,
            cellSize,
            cellSize / 15
        );

        if (
            cellPos &&
            (cellPos.x !== currentPiece.originPos.x ||
            cellPos.y !== currentPiece.originPos.y)
        ) {
            drawGlowCell(
                ctx,
                cellPos.x,
                cellPos.y,
                cellSize,
                cellSize / 15
            );
        }
    }

    for (const piece of pieces) {
    if (piece !== currentPiece) drawPiece(ctx, piece, cellSize);
    }
    if (currentPiece) drawPiece(ctx, currentPiece, cellSize);

}
