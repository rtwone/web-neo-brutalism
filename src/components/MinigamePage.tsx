import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import '../styles/minigame.css'

type Language = 'id' | 'en'
type Tetromino = {
    blocks: [number, number][]
    color: string
    tech: string
}

type GameState = 'playing' | 'paused' | 'gameover'

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 30

const TECHNOLOGIES = [
    { tech: 'JS', color: 'js' },
    { tech: 'TS', color: 'ts' },
    { tech: 'PY', color: 'py' },
    { tech: 'C#', color: 'cs' },
    { tech: 'PHP', color: 'php' },
    { tech: 'CSS', color: 'css' },
    { tech: 'SQL', color: 'sql' },
    { tech: 'GIT', color: 'git' },
]

const TETROMINOES: Record<string, Tetromino> = {
    I: {
        blocks: [[0, 0], [1, 0], [2, 0], [3, 0]],
        color: 'js',
        tech: 'JS',
    },
    O: {
        blocks: [[0, 0], [1, 0], [0, 1], [1, 1]],
        color: 'ts',
        tech: 'TS',
    },
    T: {
        blocks: [[1, 0], [0, 1], [1, 1], [2, 1]],
        color: 'py',
        tech: 'PY',
    },
    S: {
        blocks: [[1, 0], [2, 0], [0, 1], [1, 1]],
        color: 'cs',
        tech: 'C#',
    },
    Z: {
        blocks: [[0, 0], [1, 0], [1, 1], [2, 1]],
        color: 'php',
        tech: 'PHP',
    },
    J: {
        blocks: [[0, 0], [0, 1], [1, 1], [2, 1]],
        color: 'css',
        tech: 'CSS',
    },
    L: {
        blocks: [[2, 0], [0, 1], [1, 1], [2, 1]],
        color: 'sql',
        tech: 'SQL',
    },
}

type Block = { tech: string; color: string }
type Board = (Block | null)[][]

interface MinigamePageProps {
    language: Language
    t: any
    dark: boolean
}

export function MinigamePage({ language, t, dark }: MinigamePageProps) {
    const boardRef = useRef<HTMLDivElement>(null)
    const [board, setBoard] = useState<Board>([])
    const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null)
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
    const [nextPiece, setNextPiece] = useState<Tetromino | null>(null)
    const [holdPiece, setHoldPiece] = useState<Tetromino | null>(null)
    const [score, setScore] = useState(0)
    const [level, setLevel] = useState(1)
    const [lines, setLines] = useState(0)
    const [highScore, setHighScore] = useState(0)
    const [gameState, setGameState] = useState<GameState>('playing')
    const [soundOn, setSoundOn] = useState(false)

    const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
    const softDropRef = useRef(false)
    const holdUsedRef = useRef(false)

    // Initialize game
    useEffect(() => {
        const savedHighScore = localStorage.getItem('tetrisHighScore')
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore, 10))
        }

        initializeBoard()
    }, [])

    const initializeBoard = () => {
        const newBoard = Array(BOARD_HEIGHT)
            .fill(null)
            .map(() => Array(BOARD_WIDTH).fill(null))
        setBoard(newBoard)
        spawnPiece()
        setScore(0)
        setLevel(1)
        setLines(0)
        setGameState('playing')
        holdUsedRef.current = false
    }

    const getRandomPiece = (): Tetromino => {
        const keys = Object.keys(TETROMINOES)
        const randomKey = keys[Math.floor(Math.random() * keys.length)]
        return JSON.parse(JSON.stringify(TETROMINOES[randomKey]))
    }

    const spawnPiece = () => {
        const next = nextPiece || getRandomPiece()
        setCurrentPiece(next)
        setCurrentPos({ x: 3, y: 0 })
        setNextPiece(getRandomPiece())
        holdUsedRef.current = false
    }

    const canPlace = (piece: Tetromino, x: number, y: number, boardState: Board): boolean => {
        return piece.blocks.every(([px, py]) => {
            const newX = x + px
            const newY = y + py
            return (
                newX >= 0 &&
                newX < BOARD_WIDTH &&
                newY >= 0 &&
                newY < BOARD_HEIGHT &&
                boardState[newY] &&
                !boardState[newY][newX]
            )
        })
    }

    const placePiece = (piece: Tetromino, x: number, y: number, boardState: Board): Board => {
        const newBoard = boardState.map(row => [...row])
        piece.blocks.forEach(([px, py]) => {
            const newX = x + px
            const newY = y + py
            if (newY >= 0 && newBoard[newY]) {
                newBoard[newY][newX] = { tech: piece.tech, color: piece.color }
            }
        })
        return newBoard
    }

    const clearLines = (boardState: Board): { board: Board; cleared: number } => {
        let cleared = 0
        let newBoard = boardState.filter(row => {
            if (row.every(cell => cell !== null)) {
                cleared++
                return false
            }
            return true
        })

        while (newBoard.length < BOARD_HEIGHT) {
            newBoard.unshift(Array(BOARD_WIDTH).fill(null))
        }

        return { board: newBoard, cleared }
    }

    const moveDown = useCallback(() => {
        if (gameState !== 'playing' || !currentPiece) return

        if (canPlace(currentPiece, currentPos.x, currentPos.y + 1, board)) {
            setCurrentPos(prev => ({ ...prev, y: prev.y + 1 }))
            if (softDropRef.current) {
                setScore(prev => prev + 1)
            }
        } else {
            // Place piece
            let newBoard = placePiece(currentPiece, currentPos.x, currentPos.y, board)
            const { board: clearedBoard, cleared } = clearLines(newBoard)
            newBoard = clearedBoard

            if (cleared > 0) {
                const points = [100, 300, 500, 800][cleared - 1] || 800
                setScore(prev => prev + points * level)
                setLines(prev => {
                    const newLines = prev + cleared
                    const newLevel = Math.floor(newLines / 10) + 1
                    if (newLevel > level) {
                        setLevel(newLevel)
                    }
                    return newLines
                })
            }

            setBoard(newBoard)

            // Check game over
            if (!canPlace(currentPiece, 3, 0, newBoard)) {
                setGameState('gameover')
                if (score > highScore) {
                    setHighScore(score)
                    localStorage.setItem('tetrisHighScore', score.toString())
                }
                return
            }

            spawnPiece()
        }
    }, [gameState, currentPiece, currentPos, board, score, level, highScore])

    // Game loop
    useEffect(() => {
        if (gameState !== 'playing' || !currentPiece) return

        const speed = Math.max(100, 1000 - level * 50)
        gameLoopRef.current = setInterval(() => {
            moveDown()
        }, speed)

        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current)
        }
    }, [gameState, currentPiece, moveDown, level])

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState === 'gameover') return

            switch (e.key.toLowerCase()) {
                case 'arrowleft':
                case 'a':
                    if (gameState === 'playing' && currentPiece && canPlace(currentPiece, currentPos.x - 1, currentPos.y, board)) {
                        setCurrentPos(prev => ({ ...prev, x: prev.x - 1 }))
                    }
                    break
                case 'arrowright':
                case 'd':
                    if (gameState === 'playing' && currentPiece && canPlace(currentPiece, currentPos.x + 1, currentPos.y, board)) {
                        setCurrentPos(prev => ({ ...prev, x: prev.x + 1 }))
                    }
                    break
                case 'arrowdown':
                case 's':
                    e.preventDefault()
                    softDropRef.current = true
                    break
                case ' ':
                    e.preventDefault()
                    // Hard drop
                    if (gameState === 'playing' && currentPiece) {
                        let y = currentPos.y
                        while (canPlace(currentPiece, currentPos.x, y + 1, board)) {
                            y++
                        }
                        setCurrentPos({ ...currentPos, y })
                        setScore(prev => prev + 10 * level)
                    }
                    break
                case 'p':
                    setGameState(prev => (prev === 'playing' ? 'paused' : 'playing'))
                    break
                case 'r':
                    initializeBoard()
                    break
                case 'c':
                    // Hold piece
                    if (gameState === 'playing' && !holdUsedRef.current && currentPiece) {
                        const temp = holdPiece
                        setHoldPiece(currentPiece)
                        if (temp) {
                            setCurrentPiece(temp)
                            setCurrentPos({ x: 3, y: 0 })
                        } else {
                            spawnPiece()
                        }
                        holdUsedRef.current = true
                    }
                    break
                case 'z':
                case 'x':
                case 'arrowup':
                    // Rotate
                    if (gameState === 'playing' && currentPiece) {
                        const rotated: Tetromino = {
                            ...currentPiece,
                            blocks: currentPiece.blocks.map(([x, y]) => [-y, x]),
                        }
                        if (canPlace(rotated, currentPos.x, currentPos.y, board)) {
                            setCurrentPiece(rotated)
                        }
                    }
                    break
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'arrowdown' || e.key.toLowerCase() === 's') {
                softDropRef.current = false
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [gameState, currentPiece, currentPos, board, holdPiece])

    const renderBoard = () => {
        const cells = []

        // Static pieces
        board.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    cells.push(
                        <div
                            key={`${x}-${y}`}
                            className={`tetris-cell tetris-cell-${cell.color}`}
                            style={{
                                left: `${x * CELL_SIZE}px`,
                                top: `${y * CELL_SIZE}px`,
                            }}
                        >
                            <span>{cell.tech}</span>
                        </div>
                    )
                }
            })
        })

        // Current piece
        if (currentPiece) {
            currentPiece.blocks.forEach(([px, py]) => {
                const x = currentPos.x + px
                const y = currentPos.y + py
                if (y >= 0) {
                    cells.push(
                        <div
                            key={`current-${x}-${y}`}
                            className={`tetris-cell tetris-cell-${currentPiece.color} tetris-cell-active`}
                            style={{
                                left: `${x * CELL_SIZE}px`,
                                top: `${y * CELL_SIZE}px`,
                            }}
                        >
                            <span>{currentPiece.tech}</span>
                        </div>
                    )
                }
            })
        }

        return cells
    }

    const renderNextPiece = () => {
        if (!nextPiece) return null

        return (
            <div className="tetris-preview">
                {nextPiece.blocks.map(([x, y], idx) => (
                    <div
                        key={idx}
                        className={`tetris-cell tetris-cell-${nextPiece.color}`}
                        style={{
                            left: `${x * 20}px`,
                            top: `${y * 20}px`,
                            width: '20px',
                            height: '20px',
                        }}
                    >
                        <span style={{ fontSize: '10px' }}>{nextPiece.tech}</span>
                    </div>
                ))}
            </div>
        )
    }

    const renderHoldPiece = () => {
        if (!holdPiece) return null

        return (
            <div className="tetris-preview">
                {holdPiece.blocks.map(([x, y], idx) => (
                    <div
                        key={idx}
                        className={`tetris-cell tetris-cell-${holdPiece.color}`}
                        style={{
                            left: `${x * 20}px`,
                            top: `${y * 20}px`,
                            width: '20px',
                            height: '20px',
                        }}
                    >
                        <span style={{ fontSize: '10px' }}>{holdPiece.tech}</span>
                    </div>
                ))}
            </div>
        )
    }

    const isNewHighScore = gameState === 'gameover' && score > highScore

    return (
        <div className="minigame-page">
            <section className="minigame-hero">
                <div className="minigame-hero-content">
                    <span className="eyebrow">{t.minigame.kicker}</span>
                    <h1>{t.minigame.title} <i>✦</i></h1>
                    <p className="minigame-subtitle">{t.minigame.subtitle}</p>
                    <p className="minigame-description">{t.minigame.description}</p>
                </div>
            </section>

            <section className="minigame-container">
                <div className="minigame-main">
                    <div className="tetris-wrapper">
                        <div
                            ref={boardRef}
                            className="tetris-board"
                            style={{
                                width: `${BOARD_WIDTH * CELL_SIZE}px`,
                                height: `${BOARD_HEIGHT * CELL_SIZE}px`,
                            }}
                        >
                            {renderBoard()}
                        </div>
                    </div>
                </div>

                <div className="minigame-sidebar">
                    <div className="minigame-panel">
                        <h3>{t.minigame.nextPiece}</h3>
                        <div className="tetris-preview-container">{renderNextPiece()}</div>
                    </div>

                    <div className="minigame-panel">
                        <h3>{t.minigame.holdPiece}</h3>
                        <div className="tetris-preview-container">{renderHoldPiece()}</div>
                    </div>

                    <div className="minigame-stats">
                        <div className="stat">
                            <span className="stat-label">{t.minigame.score}</span>
                            <span className="stat-value">{score.toLocaleString()}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">{t.minigame.level}</span>
                            <span className="stat-value">{level}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">{t.minigame.lines}</span>
                            <span className="stat-value">{lines}</span>
                        </div>
                    </div>

                    <div className="minigame-controls">
                        <button
                            className="button primary"
                            onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}
                        >
                            {gameState === 'playing' ? t.minigame.pause : t.minigame.resume}
                        </button>
                        <button className="button secondary" onClick={initializeBoard}>
                            {t.minigame.restart}
                        </button>
                    </div>

                    <div className="minigame-high-score">
                        <span>{t.minigame.highScore}</span>
                        <span className="high-score-value">{highScore.toLocaleString()}</span>
                    </div>
                </div>
            </section>

            {gameState === 'paused' && (
                <div className="tetris-overlay">
                    <div className="tetris-overlay-content">
                        <h2>{t.minigame.pause}</h2>
                        <button className="button primary" onClick={() => setGameState('playing')}>
                            {t.minigame.resume}
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'gameover' && (
                <div className="tetris-overlay">
                    <div className="tetris-overlay-content">
                        {isNewHighScore && <h2 className="new-high-score">🏆 {t.minigame.newHighScore}</h2>}
                        <h2>{t.minigame.gameOver}</h2>
                        <div className="game-over-stats">
                            <div>
                                <span>{t.minigame.score}</span>
                                <span>{score.toLocaleString()}</span>
                            </div>
                            <div>
                                <span>{t.minigame.level}</span>
                                <span>{level}</span>
                            </div>
                        </div>
                        <button className="button primary" onClick={initializeBoard}>
                            {t.minigame.playAgain}
                        </button>
                    </div>
                </div>
            )}

            <section className="minigame-controls-guide">
                <h2>{t.minigame.howToPlay}</h2>
                <div className="controls-grid">
                    <div className="control-item">
                        <kbd>←</kbd>
                        <span>{t.minigame.moveLeft}</span>
                    </div>
                    <div className="control-item">
                        <kbd>→</kbd>
                        <span>{t.minigame.moveRight}</span>
                    </div>
                    <div className="control-item">
                        <kbd>↓</kbd>
                        <span>{t.minigame.softDrop}</span>
                    </div>
                    <div className="control-item">
                        <kbd>↑</kbd>
                        <span>{t.minigame.rotate}</span>
                    </div>
                    <div className="control-item">
                        <kbd>Space</kbd>
                        <span>{t.minigame.hardDrop}</span>
                    </div>
                    <div className="control-item">
                        <kbd>C</kbd>
                        <span>{t.minigame.holdPiece}</span>
                    </div>
                    <div className="control-item">
                        <kbd>P</kbd>
                        <span>{t.minigame.pause}</span>
                    </div>
                    <div className="control-item">
                        <kbd>R</kbd>
                        <span>{t.minigame.restart}</span>
                    </div>
                </div>
            </section>
        </div>
    )
}
