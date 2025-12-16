import {
    pieces,
    isValidMove
 } from './pieces.js';
import {
    render,
    getPositionByMouse
} from './animations.js';

const canvas = document.getElementById('boardGame');
const ctx = canvas.getContext('2d');
const imageCache = {};

let n = 8;
let rect;
let cellSize;
let pieceSizeRatio = 0.8;
let canvasSizeRatio = 0.7
let currentPiece;
let dragging = false;
let showValidMoves = 0;

let knight = {
    pos: { x: 1, y: 3 },
    originPos: { x: 1, y: 3 },
    class: 0,
    shape: { image: loadImage('assets/white_knight.png'), size: 0, },
    validMoves: [],
    takeAble: [],
    unTakeAble: [],
    getPiece: pieces.knight,
};

let knight2 = {
    pos: { x: 6, y: 6 },
    originPos: { x: 6, y: 6 },
    class: 1,
    shape: { image: loadImage('assets/black_knight.png'), size: 0, },
    validMoves: [],
    takeAble: [],
    unTakeAble: [],
    getPiece: pieces.knight,
};

let knight3 = {
    pos: { x: 4, y: 3 },
    originPos: { x: 4, y: 3 },
    class: 1,
    shape: { image: loadImage('assets/black_knight.png'), size: 0, },
    validMoves: [],
    takeAble: [],
    unTakeAble: [],
    getPiece: pieces.knight,
};

let queen = {
    pos: { x: 1, y: 7 },
    originPos: { x: 1, y: 7 },
    class: 0,
    shape: { image: loadImage('assets/white_queen.png'), size: 0, },
    validMoves: [],
    takeAble: [],
    unTakeAble: [],
    getPiece: pieces.queen,
};

let king = {
    pos: { x: 5, y: 7 },
    originPos: { x: 1, y: 7 },
    class: 1,
    shape: { image: loadImage('assets/black_king.png'), size: 0, },
    validMoves: [],
    takeAble: [],
    unTakeAble: [],
    getPiece: pieces.king,
};

let rook = {
    pos: { x: 2, y: 8 },
    originPos: { x: 1, y: 7 },
    class: 0,
    shape: { image: loadImage('assets/white_rook.png'), size: 0, },
    validMoves: [],
    takeAble: [],
    unTakeAble: [],
    getPiece: pieces.rook,
};

let bishop = {
    pos: { x: 1, y: 1 },
    originPos: { x: 1, y: 7 },
    class: 1,
    shape: { image: loadImage('assets/black_bishop.png'), size: 0, },
    validMoves: [],
    takeAble: [],
    unTakeAble: [],
    getPiece: pieces.bishop,
};

let allPiecesOnBoard = [knight, knight2, knight3, queen, king, rook, bishop]

for (let i = 0; i < allPiecesOnBoard.length; i++) {
    const r = allPiecesOnBoard[i].getPiece.validMoves(
        allPiecesOnBoard[i],
        allPiecesOnBoard,
        n
    );
    allPiecesOnBoard[i].validMoves = r.validMoves;
    allPiecesOnBoard[i].takeAble = r.takeAble;
    allPiecesOnBoard[i].unTakeAble = r.unTakeAble;
}

function loadImage(src) {
    if (imageCache[src]) return imageCache[src];

    const img = new Image();
    img.src = src;

    img.onload = () => {
        render({
            ctx,
            canvas,
            cellSize,
            n,
            showValidMoves,
            dragging,
            currentPiece,
            pieces: allPiecesOnBoard,
        });
    }

    imageCache[src] = img;
    return img;
}

function resize() {
    const size = Math.min(window.innerWidth, window.innerHeight) * canvasSizeRatio;
    canvas.width = size;
    canvas.height = size;
    rect = canvas.getBoundingClientRect();
    cellSize = size / n;
    for (let i = 0; i < allPiecesOnBoard.length; i++) {
        allPiecesOnBoard[i].shape.size = cellSize * pieceSizeRatio;
    }
}

resize();

canvas.addEventListener('mousedown', e => {
    const pos = getPositionByMouse(e, canvas, rect, cellSize, false);

    let clickedPiece = null;
    for (let i = 0; i < allPiecesOnBoard.length; i++) {
        const p = allPiecesOnBoard[i];
        if (p.pos.x === pos.x && p.pos.y === pos.y) {
            clickedPiece = p;
            break;
        }
    }

    const prepareCurrentPiece = () => {
        dragging = true;
        currentPiece.originPos.x = currentPiece.pos.x;
        currentPiece.originPos.y = currentPiece.pos.y;

        const cP = currentPiece.getPiece.validMoves(
            currentPiece,
            allPiecesOnBoard,
            n
        );

        currentPiece.validMoves = cP.validMoves;
        currentPiece.takeAble = cP.takeAble;
        currentPiece.unTakeAble = cP.unTakeAble;
    };


    if (showValidMoves % 2 === 0) {
        if (clickedPiece) {
            currentPiece = clickedPiece;
            prepareCurrentPiece();
            showValidMoves++;
        }
    }

    else {
        if (clickedPiece && clickedPiece === currentPiece) {
            prepareCurrentPiece();
            showValidMoves++;
        }
        else if (isValidMove(currentPiece, pos.x, pos.y)) {

            const isTake = currentPiece.takeAble.some(
                p => p.pos.x === pos.x && p.pos.y === pos.y
            );

            if (isTake) {
                allPiecesOnBoard = allPiecesOnBoard.filter(
                    p => !(p.pos.x === pos.x && p.pos.y === pos.y)
                );
            }

            currentPiece.pos.x = pos.x;
            currentPiece.pos.y = pos.y;
            showValidMoves++;
        }
        else {
            showValidMoves++;
        }
    }

    render({
        ctx,
        canvas,
        cellSize,
        n,
        showValidMoves,
        dragging,
        pos,
        currentPiece,
        pieces: allPiecesOnBoard,
    });
});


window.addEventListener('mousemove', e => {
    if (!currentPiece) return;
    const cellPos = getPositionByMouse(e, canvas, rect, cellSize, false);

    if (dragging) {
        const pos = getPositionByMouse(e, canvas, rect, cellSize, true);

        currentPiece.pos.x = pos.x;
        currentPiece.pos.y = pos.y;

        if (cellPos.x !== currentPiece.originPos.x || cellPos.y !== currentPiece.originPos.y) showValidMoves = 0;
    }

    render({
        ctx,
        canvas,
        cellSize,
        n,
        showValidMoves,
        dragging,
        cellPos,
        currentPiece,
        pieces: allPiecesOnBoard,
    });
});

window.addEventListener('mouseup', e => {
    if (!currentPiece) return;
    if (!dragging) return;

    dragging = false;

    const pos = getPositionByMouse(e, canvas, rect, cellSize, false);

    if (isValidMove(currentPiece, pos.x, pos.y)) {
        const isTake = currentPiece.takeAble.some(
            p => p.pos.x === pos.x && p.pos.y === pos.y
        );

        if (isTake) {
            allPiecesOnBoard = allPiecesOnBoard.filter(
                p => !(p.pos.x === pos.x && p.pos.y === pos.y)
            );
        }

        currentPiece.pos.x = pos.x;
        currentPiece.pos.y = pos.y;

    } else {
        currentPiece.pos.x = currentPiece.originPos.x;
        currentPiece.pos.y = currentPiece.originPos.y;
    }

    render({
        ctx,
        canvas,
        cellSize,
        n,
        showValidMoves,
        dragging,
        pos,
        currentPiece,
        pieces: allPiecesOnBoard,
    });
});

window.addEventListener('resize', () => {
    resize();
    render({
        ctx,
        canvas,
        cellSize,
        n,
        showValidMoves,
        dragging,
        cellPos: null,
        currentPiece,
        pieces: allPiecesOnBoard,
    });
});

render({
    ctx,
    canvas,
    cellSize,
    n,
    showValidMoves,
    dragging,
    cellPos: null,
    currentPiece,
    pieces: allPiecesOnBoard,
});