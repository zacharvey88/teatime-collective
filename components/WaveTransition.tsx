interface WaveTransitionProps {
  direction?: 'up' | 'down'
  color?: string
}

const WaveTransition = ({ direction = 'down', color = '#FFFBF0' }: WaveTransitionProps) => {
  const isUp = direction === 'up'
  
  // Create the SVG wave with the specified color
  const waveSvg = encodeURIComponent(`
    <svg viewBox='0 0 1200 88' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M0 64L50 60C100 57 200 49 300 33C400 17 500 -7 600 1C700 9 800 49 900 64C1000 80 1100 72 1150 68L1200 64V88H1150C1100 88 1000 88 900 88C800 88 700 88 600 88C500 88 400 88 300 88C200 88 100 88 50 88H0V64Z' fill='${color}'/>
    </svg>
  `)
  
  return (
    <div className="relative w-full overflow-hidden">
              <div 
          className="w-full h-10 md:h-11 relative wave-mobile"
          style={{
            backgroundRepeat: 'repeat no-repeat',
            backgroundPosition: '15vw bottom',
            backgroundImage: `url("data:image/svg+xml;utf8,${waveSvg}")`,
            transform: isUp ? 'rotate(180deg)' : 'none'
          }}
        />
    </div>
  )
}

export default WaveTransition 