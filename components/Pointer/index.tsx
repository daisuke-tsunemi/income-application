"use client"

import { useEffect, useRef, useState } from "react"

export default function Drag() {
    const ref = useRef<HTMLDivElement>(null)
    const [isWide, setIsWide] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const syncWidth = () => setIsWide(window.innerWidth >= 1080)
        syncWidth()
        window.addEventListener("resize", syncWidth)
        return () => window.removeEventListener("resize", syncWidth)
    }, [])

    useEffect(() => {
        if (!isWide || !ref.current) return

        const element = ref.current
        let targetX = 0
        let targetY = 0
        let currentX = 0
        let currentY = 0
        let rafId: number

        const handlePointerMove = (e: MouseEvent) => {
            targetX = e.clientX - element.offsetWidth / 2
            targetY = e.clientY - element.offsetHeight / 2
        }

        // スムーズな追従アニメーション
        const animate = () => {
            // イージング係数（0.1 = 遅め、0.3 = 速め）
            const easing = 0.15
            
            currentX += (targetX - currentX) * easing
            currentY += (targetY - currentY) * easing

            setPosition({ x: currentX, y: currentY })

            rafId = requestAnimationFrame(animate)
        }

        window.addEventListener("pointermove", handlePointerMove)
        rafId = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener("pointermove", handlePointerMove)
            cancelAnimationFrame(rafId)
        }
    }, [isWide])

    if (!isWide) {
        return null
    }

    return (
        <div
            ref={ref}
            style={{
                width: 12,
                height: 12,
                opacity: 0.75,
                zIndex: 1001,
                backgroundColor: "blue",
                borderRadius: "50%",
                position: "fixed",
                pointerEvents: "none",
                top: 0,
                left: 0,
                transform: `translate(${position.x}px, ${position.y}px)`,
                // スムーズな動きのためのCSS transition（オプション）
                // transition: 'transform 0.1s ease-out',
            }}
        />
    )
}