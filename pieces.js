function clamp(deltas, currentPiece, allPiecesOnBoard, n) {
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
            validMoves.push([x, y]);
        } else if (target.class !== currentPiece.class) {
            validMoves.push([x, y]);
            takeAble.push(target);
        } else if (target.class === currentPiece.class) {
            unTakeAble.push(target);
        }
    }

    return { validMoves, takeAble, unTakeAble };
}

function getDir(dx, dy) {
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    return {
        dx: Math.sign(dx),
        dy: Math.sign(dy),
        dist: Math.max(adx, ady)
    };
}

function noPassThrough(currentPiece, validMoves, takeAble, unTakeAble) {
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

    const filteredMoves = [];
    const filteredTake = [];

    for (const [x, y] of validMoves) {
        const dx = x - origin.x;
        const dy = y - origin.y;
        const move = getDir(dx, dy);

        let blocked = false;

        for (const b of blocks) {
            if (
                b.dx === move.dx &&
                b.dy === move.dy &&
                b.dist < move.dist
            ) {
                blocked = true;
                break;
            }
        }

        if (!blocked) {
            filteredMoves.push([x, y]);
        }
    }

    for (const p of takeAble) {
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
            filteredTake.push(p);
        }
    }

    return {
        validMoves: filteredMoves,
        takeAble: filteredTake
    };
}


export function isValidMove(currentPiece, toX, toY) {
    if (currentPiece.validMoves.some(
        ([x, y]) => x === toX && y === toY
    )) return true;
    return false;
}

export const pieces = {
    king: {
        name: 'king',
        validMoves(currentPiece, allPiecesOnBoard, n) {
            const deltas = [[1, 0], [1, 1],
                            [0, 1], [-1, 1],
                            [-1, 0], [-1, -1],
                            [0, -1], [1, -1]];

            const { validMoves, takeAble, unTakeAble } =
                clamp(deltas, currentPiece, allPiecesOnBoard, n);

            const filtered =
                noPassThrough(currentPiece, validMoves, takeAble, unTakeAble);

            return {
                validMoves: filtered.validMoves,
                takeAble: filtered.takeAble,
                unTakeAble
            };
        }
    },
    queen: {
        name: 'queen',
        validMoves(currentPiece, allPiecesOnBoard, n) {
            const deltas = [];

            for (let dx = -n + 1; dx <= n - 1; dx++) {
                if (dx === 0) continue;
                deltas.push([dx, 0]);
                deltas.push([0, dx]);
                deltas.push([dx, dx]);
                deltas.push([dx, -dx]);
            }

            const { validMoves, takeAble, unTakeAble } =
                clamp(deltas, currentPiece, allPiecesOnBoard, n);

            const filtered =
                noPassThrough(currentPiece, validMoves, takeAble, unTakeAble);

            return {
                validMoves: filtered.validMoves,
                takeAble: filtered.takeAble,
                unTakeAble
            };
        }
    },
    rook: {
        name: 'rook',
        validMoves(currentPiece, allPiecesOnBoard, n) {
            const deltas = [];

            for (let dx = -n + 1; dx <= n - 1; dx++) {
                if (dx === 0) continue;
                deltas.push([dx, 0]);
                deltas.push([0, dx]);
            }

            const { validMoves, takeAble, unTakeAble } =
                clamp(deltas, currentPiece, allPiecesOnBoard, n);

            const filtered =
                noPassThrough(currentPiece, validMoves, takeAble, unTakeAble);

            return {
                validMoves: filtered.validMoves,
                takeAble: filtered.takeAble,
                unTakeAble
            };
        }
    },
    knight: {
        name: 'knight',
        validMoves(currentPiece, allPiecesOnBoard, n) {
            const deltas = [
                [2, 1], [2, -1],
                [-2, 1], [-2, -1],
                [1, 2], [1, -2],
                [-1, 2], [-1, -2],
            ];

            return clamp(deltas, currentPiece, allPiecesOnBoard, n);
        }
    },
    bishop: {
        name: 'bishop',
        validMoves(currentPiece, allPiecesOnBoard, n) {
            const deltas = [];

            for (let dx = -n + 1; dx <= n - 1; dx++) {
                if (dx === 0) continue;
                deltas.push([dx, dx]);
                deltas.push([dx, -dx]);
            }

            const { validMoves, takeAble, unTakeAble } =
                clamp(deltas, currentPiece, allPiecesOnBoard, n);

            const filtered =
                noPassThrough(currentPiece, validMoves, takeAble, unTakeAble);

            return {
                validMoves: filtered.validMoves,
                takeAble: filtered.takeAble,
                unTakeAble
            };
        }
    },
    pawn: {
        name: 'pawn',
        validMoves(currentPiece, allPiecesOnBoard, n) {
            const deltas = [];

            const { validMoves, takeAble, unTakeAble } =
                clamp(deltas, currentPiece, allPiecesOnBoard, n);

            const filtered =
                noPassThrough(currentPiece, validMoves, takeAble, unTakeAble);

            return {
                validMoves: filtered.validMoves,
                takeAble: filtered.takeAble,
                unTakeAble
            };
        }
    },
};