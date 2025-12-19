function getDir(dx, dy) {
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    return {
        dx: Math.sign(dx),
        dy: Math.sign(dy),
        dist: Math.max(adx, ady)
    };
}

export function clamp(deltas, currentPiece, allPiecesOnBoard, n) {
    const validMoves = [];
    const takeAble = [];
    const unTakeAble = [];

    for (const [dx, dy] of deltas) {
        const x = currentPiece.originPos.x + dx;
        const y = currentPiece.originPos.y + dy;

        if (x < 1 || x > n || y < 1 || y > n) continue;

        const target = allPiecesOnBoard.find(
            p => p.pos.x === x && p.pos.y === y
        );

        if (!target) {
            validMoves.push({ pos: {x: x, y: y} });
        } else if (target.class !== currentPiece.class) {
            takeAble.push(target);
        } else if (target.class === currentPiece.class) {
            unTakeAble.push(target);
        }
    }

    return { validMoves, takeAble, unTakeAble };
}

export function noPassThrough(currentPiece, moves, takeAble, unTakeAble) {
    const origin = currentPiece.originPos;
    const blocks = [];

    for (const p of unTakeAble) {
        const dx = p.pos.x - origin.x;
        const dy = p.pos.y - origin.y;
        blocks.push(getDir(dx, dy));
    }

    for (const p of takeAble) {
        const dx = p.pos.x - origin.x;
        const dy = p.pos.y - origin.y;
        blocks.push({ ...getDir(dx, dy), take: p });
    }

    const filtered = [];

    for (const p of moves) {
        const dx = p.pos.x - origin.x;
        const dy = p.pos.y - origin.y;
        const d = getDir(dx, dy);

        let blocked = false;

        for (const b of blocks) {
            if (
                b.dx === d.dx &&
                b.dy === d.dy &&
                b.dist < d.dist
            ) {
                blocked = true;
                break;
            }
        }

        if (!blocked) {
            filtered.push(p);
        }
    }

    return filtered;
}

export function passThroughOnly(allMoves, noPassThroughMoves) {
    return allMoves.filter(
        p =>
            !noPassThroughMoves.some(
                np =>
                    np.pos.x === p.pos.x &&
                    np.pos.y === p.pos.y
            )
    );
}

export function isValidMove(currentPiece, toX, toY) {
    if (currentPiece.validMoves.some(
        m => m.pos.x === toX && m.pos.y === toY
    ) || currentPiece.takeAble.some(
        p => p.pos.x === toX && p.pos.y === toY
    )) return true;
    return false;
}

export function createPiece(x, y, cls, src, rules) {
    return {
        pos: { x, y },
        originPos: { x, y },
        class: cls,
        shape: { image: src, size: 0 },
        validMoves: [],
        takeAble: [],
        unTakeAble: [],
        getRules: Object.create(rules)
    };
}